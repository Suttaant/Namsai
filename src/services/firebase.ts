import { WaterPoint, CustomerGroup, AppConfig } from '../types/waterPoint';

// Declare firebase as a global variable since it's loaded via CDN
declare global {
  interface Window {
    firebase: any;
  }
}

// Shorthand references to Firebase services
const db = window.firebase.firestore();
const storage = window.firebase.storage();
const rtdb = window.firebase.database();

// Collections references
const waterPointsCollection = db.collection('waterPoints');
const configCollection = db.collection('appConfig');

// Helper function to convert Firestore document to WaterPoint
const convertToWaterPoint = (doc: any): WaterPoint => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    office: data.office || '',
    department: data.department || '',
    isExternal: data.isExternal || false,
    waterContainers: data.waterContainers || 0,
    location: data.location || {},
    images: data.images || [],
    videos: data.videos || [],
    timestamp: data.timestamp || Date.now(),
    distance: data.distance || 0,
    notes: data.notes || '',
  };
};

// Get all water points
export const getWaterPoints = async (): Promise<WaterPoint[]> => {
  try {
    const snapshot = await waterPointsCollection.orderBy('timestamp', 'desc').get();
    return snapshot.docs.map(convertToWaterPoint);
  } catch (error) {
    console.error("Error getting water points:", error);
    return [];
  }
};

// Get a single water point by ID
export const getWaterPointById = async (id: string): Promise<WaterPoint | null> => {
  try {
    const doc = await waterPointsCollection.doc(id).get();
    if (!doc.exists) return null;
    return convertToWaterPoint(doc);
  } catch (error) {
    console.error("Error getting water point:", error);
    return null;
  }
};

// Add a new water point
export const addWaterPoint = async (waterPoint: Omit<WaterPoint, 'id'>): Promise<string> => {
  try {
    const docRef = await waterPointsCollection.add({
      ...waterPoint,
      timestamp: Date.now(),
    });
    
    // Also update real-time database for sync
    await rtdb.ref(`waterPoints/${docRef.id}`).set({
      name: waterPoint.name,
      timestamp: Date.now(),
      waterContainers: waterPoint.waterContainers,
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding water point:", error);
    throw error;
  }
};

// Update an existing water point
export const updateWaterPoint = async (id: string, waterPoint: Partial<WaterPoint>): Promise<void> => {
  try {
    await waterPointsCollection.doc(id).update({
      ...waterPoint,
      lastUpdated: Date.now(),
    });
    
    // Also update real-time database for sync
    if (waterPoint.name || waterPoint.waterContainers) {
      const updates: any = { lastUpdated: Date.now() };
      if (waterPoint.name) updates.name = waterPoint.name;
      if (waterPoint.waterContainers) updates.waterContainers = waterPoint.waterContainers;
      
      await rtdb.ref(`waterPoints/${id}`).update(updates);
    }
  } catch (error) {
    console.error("Error updating water point:", error);
    throw error;
  }
};

// Delete a water point
export const deleteWaterPoint = async (id: string): Promise<void> => {
  try {
    await waterPointsCollection.doc(id).delete();
    
    // Also delete from real-time database
    await rtdb.ref(`waterPoints/${id}`).remove();
  } catch (error) {
    console.error("Error deleting water point:", error);
    throw error;
  }
};

// Upload an image and get its URL
export const uploadImage = async (file: File, waterPointId: string): Promise<string> => {
  try {
    const timestamp = Date.now();
    const storageRef = storage.ref(`waterPoints/${waterPointId}/images/${timestamp}_${file.name}`);
    const snapshot = await storageRef.put(file);
    const downloadUrl = await snapshot.ref.getDownloadURL();
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Upload a video and get its URL
export const uploadVideo = async (file: File, waterPointId: string): Promise<string> => {
  try {
    const timestamp = Date.now();
    const storageRef = storage.ref(`waterPoints/${waterPointId}/videos/${timestamp}_${file.name}`);
    const snapshot = await storageRef.put(file);
    const downloadUrl = await snapshot.ref.getDownloadURL();
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading video:", error);
    throw error;
  }
};

// Get app configuration
export const getAppConfig = async (): Promise<AppConfig> => {
  try {
    const doc = await configCollection.doc('main').get();
    if (!doc.exists) {
      // Create default config if it doesn't exist
      const defaultConfig: AppConfig = {
        customerGroups: [],
        defaultViewMode: 'grid',
        analyticsTimeRange: 'month',
      };
      await configCollection.doc('main').set(defaultConfig);
      return defaultConfig;
    }
    return doc.data() as AppConfig;
  } catch (error) {
    console.error("Error getting app config:", error);
    return {
      customerGroups: [],
      defaultViewMode: 'grid',
      analyticsTimeRange: 'month',
    };
  }
};

// Update app configuration
export const updateAppConfig = async (config: Partial<AppConfig>): Promise<void> => {
  try {
    await configCollection.doc('main').update(config);
  } catch (error) {
    console.error("Error updating app config:", error);
    throw error;
  }
};

// Listen for real-time updates to water points
export const subscribeToWaterPoints = (callback: (waterPoints: WaterPoint[]) => void): (() => void) => {
  const unsubscribe = waterPointsCollection
    .orderBy('timestamp', 'desc')
    .onSnapshot((snapshot) => {
      const waterPoints = snapshot.docs.map(convertToWaterPoint);
      callback(waterPoints);
    }, (error) => {
      console.error("Error in water points subscription:", error);
    });
  
  return unsubscribe;
};

// Get analytics data (water containers delivered per day/week/month)
export const getAnalyticsData = async (timeRange: 'day' | 'week' | 'month' | 'year'): Promise<any> => {
  try {
    let startTime: number;
    const now = Date.now();
    
    switch(timeRange) {
      case 'day':
        startTime = now - (24 * 60 * 60 * 1000); // 1 day ago
        break;
      case 'week':
        startTime = now - (7 * 24 * 60 * 60 * 1000); // 7 days ago
        break;
      case 'month':
        startTime = now - (30 * 24 * 60 * 60 * 1000); // 30 days ago
        break;
      case 'year':
        startTime = now - (365 * 24 * 60 * 60 * 1000); // 365 days ago
        break;
      default:
        startTime = now - (30 * 24 * 60 * 60 * 1000); // Default to 30 days
    }
    
    const snapshot = await waterPointsCollection
      .where('timestamp', '>=', startTime)
      .orderBy('timestamp', 'asc')
      .get();
    
    const waterPoints = snapshot.docs.map(convertToWaterPoint);
    
    // Process data for analytics
    return processAnalyticsData(waterPoints, timeRange);
  } catch (error) {
    console.error("Error getting analytics data:", error);
    return {
      labels: [],
      waterContainers: [],
      distances: []
    };
  }
};

// Helper function to process analytics data
const processAnalyticsData = (waterPoints: WaterPoint[], timeRange: string) => {
  const result: {
    labels: string[];
    waterContainers: number[];
    distances: number[];
  } = {
    labels: [],
    waterContainers: [],
    distances: []
  };
  
  if (waterPoints.length === 0) return result;
  
  // Group data by day/week/month based on timeRange
  const groupedData: {[key: string]: {containers: number, distance: number}} = {};
  
  waterPoints.forEach(point => {
    let dateKey: string;
    const date = new Date(point.timestamp);
    
    switch(timeRange) {
      case 'day':
        dateKey = `${date.getHours()}:00`;
        break;
      case 'week':
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dateKey = days[date.getDay()];
        break;
      case 'month':
        dateKey = `${date.getDate()}/${date.getMonth() + 1}`;
        break;
      case 'year':
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        dateKey = months[date.getMonth()];
        break;
      default:
        dateKey = `${date.getDate()}/${date.getMonth() + 1}`;
    }
    
    if (!groupedData[dateKey]) {
      groupedData[dateKey] = {
        containers: 0,
        distance: 0
      };
    }
    
    groupedData[dateKey].containers += point.waterContainers;
    groupedData[dateKey].distance += point.distance || 0;
  });
  
  // Convert grouped data to arrays for charts
  result.labels = Object.keys(groupedData);
  result.waterContainers = result.labels.map(label => groupedData[label].containers);
  result.distances = result.labels.map(label => groupedData[label].distance);
  
  return result;
};