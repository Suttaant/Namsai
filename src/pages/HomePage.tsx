import React, { useState } from 'react';
import WaterPointList from '../components/WaterPointList';
import WaterPointForm from '../components/WaterPointForm';
import WaterPointDetail from '../components/WaterPointDetail';
import { WaterPoint } from '../types/waterPoint';
import { Search } from 'lucide-react';

const HomePage: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editWaterPoint, setEditWaterPoint] = useState<WaterPoint | null>(null);
  const [viewWaterPoint, setViewWaterPoint] = useState<WaterPoint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleEdit = (waterPoint: WaterPoint) => {
    setEditWaterPoint(waterPoint);
    setShowAddForm(true);
  };
  
  const handleView = (waterPoint: WaterPoint) => {
    setViewWaterPoint(waterPoint);
  };
  
  const handleFormSuccess = () => {
    setEditWaterPoint(null);
  };
  
  const handleFormClose = () => {
    setShowAddForm(false);
    setEditWaterPoint(null);
  };
  
  const handleBackFromDetail = () => {
    setViewWaterPoint(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Search Bar (visible on medium and larger screens) */}
      <div className="relative md:block">
        <div className="flex">
          <div className="relative flex-grow">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search water points..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      {viewWaterPoint ? (
        <WaterPointDetail 
          waterPoint={viewWaterPoint} 
          onBack={handleBackFromDetail}
          onEdit={() => handleEdit(viewWaterPoint)}
        />
      ) : (
        <WaterPointList 
          onEdit={handleEdit} 
          onView={handleView}
          searchQuery={searchQuery}
        />
      )}
      
      {showAddForm && (
        <WaterPointForm 
          waterPoint={editWaterPoint || undefined} 
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default HomePage;