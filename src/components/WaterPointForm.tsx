import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin, Camera, Video } from 'lucide-react';
import { WaterPoint } from '../types/waterPoint';
import { addWaterPoint, updateWaterPoint, uploadImage, uploadVideo } from '../services/firebase';

interface WaterPointFormProps {
  waterPoint?: WaterPoint;
  onClose: () => void;
  onSuccess: () => void;
}

const WaterPointForm: React.FC<WaterPointFormProps> = ({ 
  waterPoint,
  onClose, 
  onSuccess 
}) => {
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [office, setOffice] = useState('');
  const [department, setDepartment] = useState('');
  const [isExternal, setIsExternal] = useState(false);
  const [waterContainers, setWaterContainers] = useState(0);
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [distance, setDistance] = useState(0);
  
  // File uploads
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);
  
  // Initialize form data if editing existing water point
  useEffect(() => {
    if (waterPoint) {
      setIsEdit(true);
      setName(waterPoint.name);
      setOffice(waterPoint.office);
      setDepartment(waterPoint.department);
      setIsExternal(waterPoint.isExternal);
      setWaterContainers(waterPoint.waterContainers);
      setAddress(waterPoint.location.address || '');
      setMapUrl(waterPoint.location.mapUrl || '');
      setNotes(waterPoint.notes || '');
      setDistance(waterPoint.distance || 0);
      setExistingImages(waterPoint.images || []);
      setExistingVideos(waterPoint.videos || []);
    }
  }, [waterPoint]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setVideoFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeVideoFile = (index: number) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingVideo = (index: number) => {
    setExistingVideos(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Basic validation
      if (!name || !office || !department || waterContainers <= 0) {
        throw new Error('Please fill in all required fields.');
      }
      
      let uploadedImageUrls: string[] = [];
      let uploadedVideoUrls: string[] = [];
      
      if (isEdit && waterPoint) {
        // Upload new images and videos if any
        const imagePromises = imageFiles.map(file => uploadImage(file, waterPoint.id));
        const videoPromises = videoFiles.map(file => uploadVideo(file, waterPoint.id));
        
        if (imageFiles.length) uploadedImageUrls = await Promise.all(imagePromises);
        if (videoFiles.length) uploadedVideoUrls = await Promise.all(videoPromises);
        
        // Update the water point
        await updateWaterPoint(waterPoint.id, {
          name,
          office,
          department,
          isExternal,
          waterContainers,
          location: {
            address,
            mapUrl,
            // Keep existing coordinates if available
            coordinates: waterPoint.location.coordinates
          },
          // Combine existing (minus removed ones) and new uploads
          images: [...existingImages, ...uploadedImageUrls],
          videos: [...existingVideos, ...uploadedVideoUrls],
          notes,
          distance
        });
      } else {
        // Create a new water point
        const newWaterPointId = await addWaterPoint({
          name,
          office,
          department,
          isExternal,
          waterContainers,
          location: {
            address,
            mapUrl
          },
          images: [],
          videos: [],
          notes,
          distance,
          timestamp: Date.now()
        });
        
        // Upload images and videos if any
        if (imageFiles.length || videoFiles.length) {
          const imagePromises = imageFiles.map(file => uploadImage(file, newWaterPointId));
          const videoPromises = videoFiles.map(file => uploadVideo(file, newWaterPointId));
          
          if (imageFiles.length) uploadedImageUrls = await Promise.all(imagePromises);
          if (videoFiles.length) uploadedVideoUrls = await Promise.all(videoPromises);
          
          // Update the water point with the uploaded media URLs
          await updateWaterPoint(newWaterPointId, {
            images: uploadedImageUrls,
            videos: uploadedVideoUrls
          });
        }
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving water point:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between bg-primary-600 text-white px-6 py-4">
          <h2 className="text-xl font-bold">
            {isEdit ? 'Edit Water Point' : 'Add New Water Point'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-primary-700 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-72px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Water Point Name*
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Engineering Building"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Office Name*
                  </label>
                  <input
                    type="text"
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Admin Office"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department*
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isExternal"
                    checked={isExternal}
                    onChange={(e) => setIsExternal(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isExternal" className="ml-2 block text-sm text-gray-700">
                    External to University
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Water Containers*
                  </label>
                  <input
                    type="number"
                    value={waterContainers}
                    onChange={(e) => setWaterContainers(parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              {/* Location & Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Location & Notes</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Physical address of the water point"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Maps URL
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={mapUrl}
                      onChange={(e) => setMapUrl(e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://maps.google.com/?q=..."
                    />
                    <button
                      type="button"
                      className="bg-gray-100 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                      onClick={() => window.open(mapUrl, '_blank', 'noopener,noreferrer')}
                      disabled={!mapUrl}
                    >
                      <MapPin size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Any additional information about this water point"
                  />
                </div>
                
                {/* Media Uploads */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Images</h4>
                  
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {existingImages.map((url, index) => (
                        <div key={index} className="relative w-16 h-16 group">
                          <img 
                            src={url} 
                            alt={`Image ${index}`} 
                            className="w-full h-full object-cover rounded border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* New Image Uploads */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative w-16 h-16 group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Upload ${index}`} 
                          className="w-full h-full object-cover rounded border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageFile(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <label className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors">
                      <Camera size={18} className="mr-2 text-gray-600" />
                      <span className="text-sm">Add Images</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-700 mt-4">Videos</h4>
                  
                  {/* Existing Videos */}
                  {existingVideos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {existingVideos.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="w-20 h-12 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                            <Video size={20} className="text-gray-500" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingVideo(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove video"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* New Video Uploads */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {videoFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="w-20 h-12 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                          <Video size={20} className="text-gray-500" />
                          <span className="text-xs ml-1">{file.name.slice(0, 8)}...</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVideoFile(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove video"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <label className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors">
                      <Video size={18} className="mr-2 text-gray-600" />
                      <span className="text-sm">Add Videos</span>
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                      <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload size={18} className="mr-1" />
                    {isEdit ? 'Update' : 'Save'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WaterPointForm;