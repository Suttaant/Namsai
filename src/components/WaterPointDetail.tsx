import React, { useState } from 'react';
import { 
  Droplet, 
  Building, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Edit, 
  Video, 
  ExternalLink, 
  Image as ImageIcon
} from 'lucide-react';
import { WaterPoint } from '../types/waterPoint';

interface WaterPointDetailProps {
  waterPoint: WaterPoint;
  onBack: () => void;
  onEdit: () => void;
}

const WaterPointDetail: React.FC<WaterPointDetailProps> = ({ 
  waterPoint, 
  onBack,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'images' | 'videos'>('info');
  const [activeImage, setActiveImage] = useState<string | null>(
    waterPoint.images && waterPoint.images.length > 0 ? waterPoint.images[0] : null
  );
  const [activeVideo, setActiveVideo] = useState<string | null>(
    waterPoint.videos && waterPoint.videos.length > 0 ? waterPoint.videos[0] : null
  );
  
  const hasImages = waterPoint.images && waterPoint.images.length > 0;
  const hasVideos = waterPoint.videos && waterPoint.videos.length > 0;
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-primary-700 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">{waterPoint.name}</h2>
          <button
            onClick={onEdit}
            className="p-2 rounded-full hover:bg-primary-700 transition-colors"
            aria-label="Edit"
          >
            <Edit size={20} />
          </button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'info'
              ? 'text-primary-700 border-b-2 border-primary-500'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          Information
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'images'
              ? 'text-primary-700 border-b-2 border-primary-500'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          Images {hasImages && `(${waterPoint.images.length})`}
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'videos'
              ? 'text-primary-700 border-b-2 border-primary-500'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          Videos {hasVideos && `(${waterPoint.videos.length})`}
        </button>
      </div>
      
      {/* Content Area */}
      <div className="p-4">
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={<Building size={20} className="text-gray-400" />}
                label="Office"
                value={waterPoint.office}
              />
              <InfoItem
                icon={<Building size={20} className="text-gray-400" />}
                label="Department"
                value={waterPoint.department}
              />
              <InfoItem
                icon={<Droplet size={20} className="text-gray-400" />}
                label="Water Containers"
                value={waterPoint.waterContainers.toString()}
              />
              <InfoItem
                icon={<Calendar size={20} className="text-gray-400" />}
                label="Date Recorded"
                value={new Date(waterPoint.timestamp).toLocaleDateString()}
              />
            </div>
            
            {/* Location */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
              
              {waterPoint.location.address && (
                <div className="flex items-start mb-3">
                  <MapPin size={20} className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                  <p className="text-gray-700">{waterPoint.location.address}</p>
                </div>
              )}
              
              {waterPoint.location.mapUrl && (
                <a
                  href={waterPoint.location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink size={18} className="mr-2" />
                  Open in Google Maps
                </a>
              )}
            </div>
            
            {/* Notes */}
            {waterPoint.notes && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700 whitespace-pre-line">{waterPoint.notes}</p>
              </div>
            )}
            
            {/* Additional Details */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={<div className="w-5 h-5 flex items-center justify-center text-gray-400">
                    <span className="text-xs">km</span>
                  </div>}
                  label="Distance"
                  value={`${waterPoint.distance || 0} km`}
                />
                <InfoItem
                  icon={<Building size={20} className="text-gray-400" />}
                  label="Location Type"
                  value={waterPoint.isExternal ? 'External' : 'University'}
                />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'images' && (
          <div className="space-y-4">
            {hasImages ? (
              <>
                {/* Active Image */}
                <div className="w-full h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden">
                  {activeImage ? (
                    <img
                      src={activeImage}
                      alt={waterPoint.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={48} className="text-gray-300" />
                      <p className="text-gray-500 ml-2">No image selected</p>
                    </div>
                  )}
                </div>
                
                {/* Image Thumbnails */}
                <div className="flex flex-wrap gap-2">
                  {waterPoint.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                        activeImage === img ? 'border-primary-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ImageIcon size={48} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Images Available</h3>
                <p className="text-gray-500 max-w-md">
                  No images have been uploaded for this water delivery point.
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'videos' && (
          <div className="space-y-4">
            {hasVideos ? (
              <>
                {/* Active Video */}
                <div className="w-full h-64 md:h-80 bg-black rounded-lg overflow-hidden">
                  {activeVideo ? (
                    <video
                      src={activeVideo}
                      controls
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video size={48} className="text-gray-300" />
                      <p className="text-gray-500 ml-2">No video selected</p>
                    </div>
                  )}
                </div>
                
                {/* Video Thumbnails */}
                <div className="flex flex-wrap gap-2">
                  {waterPoint.videos.map((vid, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveVideo(vid)}
                      className={`w-24 h-16 rounded-md overflow-hidden border-2 flex items-center justify-center bg-gray-100 ${
                        activeVideo === vid ? 'border-primary-500' : 'border-transparent'
                      }`}
                    >
                      <Video size={20} className="text-gray-500 mr-1" />
                      <span className="text-xs">Video {index + 1}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Video size={48} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Videos Available</h3>
                <p className="text-gray-500 max-w-md">
                  No videos have been uploaded for this water delivery point.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-start">
      <div className="mr-3 mt-1">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default WaterPointDetail;