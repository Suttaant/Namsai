export interface WaterPoint {
  id: string;
  name: string;         // Name of the water delivery point
  office: string;       // Office name
  department: string;   // Department name
  isExternal: boolean;  // Whether it's external to the university
  waterContainers: number; // Number of water containers delivered
  location: {
    coordinates?: {
      lat: number;
      lng: number;
    };
    mapUrl?: string;    // Google Maps URL
    address?: string;   // Text address
  };
  images: string[];     // Array of image URLs
  videos: string[];     // Array of video URLs
  timestamp: number;    // When this delivery was recorded
  distance?: number;    // Distance covered for this delivery
  notes?: string;       // Additional notes
}

export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  waterPoints: string[]; // Array of water point IDs in this group
}

export interface AppConfig {
  customerGroups: CustomerGroup[];
  defaultViewMode: 'list' | 'grid';
  analyticsTimeRange: 'day' | 'week' | 'month' | 'year';
}