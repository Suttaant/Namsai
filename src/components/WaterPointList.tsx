import React, { useState, useEffect } from 'react';
import { Droplet, MapPin, Building, Calendar, Edit, Trash2, ChevronRight } from 'lucide-react';
import { WaterPoint } from '../types/waterPoint';
import { subscribeToWaterPoints, deleteWaterPoint } from '../services/firebase';

interface WaterPointListProps {
  onEdit: (waterPoint: WaterPoint) => void;
  onView: (waterPoint: WaterPoint) => void;
  searchQuery: string;
}

const WaterPointList: React.FC<WaterPointListProps> = ({ onEdit, onView, searchQuery }) => {
  const [waterPoints, setWaterPoints] = useState<WaterPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToWaterPoints((points) => {
      setWaterPoints(points);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      try {
        await deleteWaterPoint(id);
        setConfirmDelete(null);
      } catch (error) {
        console.error("Error deleting water point:", error);
      }
    } else {
      setConfirmDelete(id);
    }
  };

  const filteredWaterPoints = waterPoints.filter(wp => 
    wp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wp.office.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <Droplet size={48} className="text-primary-300 mb-2" />
          <p className="text-gray-500">Loading water points...</p>
        </div>
      </div>
    );
  }

  if (waterPoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Droplet size={48} className="text-primary-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Water Points Found</h3>
        <p className="text-gray-500 max-w-md">
          Start by adding your first water delivery point using the "Add New Water Point" button.
        </p>
      </div>
    );
  }

  if (filteredWaterPoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <MapPin size={48} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Matching Results</h3>
        <p className="text-gray-500 max-w-md">
          No water points match your search query. Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Water Delivery Points
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({filteredWaterPoints.length})
          </span>
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
            aria-label="Grid view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
            aria-label="List view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWaterPoints.map((waterPoint) => (
            <WaterPointCard
              key={waterPoint.id}
              waterPoint={waterPoint}
              onEdit={() => onEdit(waterPoint)}
              onDelete={() => handleDelete(waterPoint.id)}
              onView={() => onView(waterPoint)}
              isConfirmingDelete={confirmDelete === waterPoint.id}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWaterPoints.map((waterPoint) => (
            <WaterPointListItem
              key={waterPoint.id}
              waterPoint={waterPoint}
              onEdit={() => onEdit(waterPoint)}
              onDelete={() => handleDelete(waterPoint.id)}
              onView={() => onView(waterPoint)}
              isConfirmingDelete={confirmDelete === waterPoint.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface WaterPointCardProps {
  waterPoint: WaterPoint;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  isConfirmingDelete: boolean;
}

const WaterPointCard: React.FC<WaterPointCardProps> = ({
  waterPoint,
  onEdit,
  onDelete,
  onView,
  isConfirmingDelete,
}) => {
  const hasImage = waterPoint.images && waterPoint.images.length > 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg animate-fade-in">
      <div className="relative">
        {hasImage ? (
          <img
            src={waterPoint.images[0]}
            alt={waterPoint.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center">
            <Droplet size={64} className="text-primary-300" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-xs font-medium shadow text-primary-700">
          {waterPoint.waterContainers} containers
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{waterPoint.name}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Building size={16} className="mr-2 text-gray-400" />
            <span>{waterPoint.office} - {waterPoint.department}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-2 text-gray-400" />
            <span>{waterPoint.location.address || 'Location available'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2 text-gray-400" />
            <span>{new Date(waterPoint.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {isConfirmingDelete ? (
            <>
              <button
                onClick={onDelete}
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '#';
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onView}
                className="flex-1 bg-primary-50 text-primary-700 py-2 rounded hover:bg-primary-100 transition-colors"
              >
                View
              </button>
              <button
                onClick={onEdit}
                className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                aria-label="Edit"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                aria-label="Delete"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface WaterPointListItemProps {
  waterPoint: WaterPoint;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  isConfirmingDelete: boolean;
}

const WaterPointListItem: React.FC<WaterPointListItemProps> = ({
  waterPoint,
  onEdit,
  onDelete,
  onView,
  isConfirmingDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 animate-fade-in hover:shadow-md transition-all">
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">
          {waterPoint.images && waterPoint.images.length > 0 ? (
            <img
              src={waterPoint.images[0]}
              alt={waterPoint.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
              <Droplet size={24} className="text-primary-500" />
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between">
            <h3 className="text-lg font-bold text-gray-800">{waterPoint.name}</h3>
            <span className="text-sm font-medium text-primary-700 bg-primary-50 px-2 py-1 rounded">
              {waterPoint.waterContainers} containers
            </span>
          </div>
          
          <div className="flex flex-wrap text-sm text-gray-600 mt-1">
            <div className="flex items-center mr-4">
              <Building size={14} className="mr-1 text-gray-400" />
              <span>{waterPoint.office}</span>
            </div>
            <div className="flex items-center mr-4">
              <MapPin size={14} className="mr-1 text-gray-400" />
              <span>{waterPoint.location.address || 'Location available'}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="mr-1 text-gray-400" />
              <span>{new Date(waterPoint.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-4 flex space-x-2">
          {isConfirmingDelete ? (
            <>
              <button
                onClick={onDelete}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '#';
                }}
                className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                aria-label="Edit"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                aria-label="Delete"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={onView}
                className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="View details"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterPointList;