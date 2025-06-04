import React, { useState, useEffect } from 'react';
import { Settings, Plus, Save, Trash, X } from 'lucide-react';
import { getAppConfig, updateAppConfig } from '../services/firebase';
import { AppConfig, CustomerGroup } from '../types/waterPoint';

const ConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AppConfig>({
    customerGroups: [],
    defaultViewMode: 'grid',
    analyticsTimeRange: 'month'
  });
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const appConfig = await getAppConfig();
        setConfig(appConfig);
      } catch (error) {
        console.error('Error fetching config:', error);
        setError('Failed to load configuration. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, []);
  
  const handleAddGroup = () => {
    if (!newGroup.name.trim()) {
      setError('Group name is required');
      return;
    }
    
    const updatedGroups = [
      ...config.customerGroups, 
      {
        id: `group-${Date.now()}`,
        name: newGroup.name,
        description: newGroup.description,
        waterPoints: []
      }
    ];
    
    setConfig({
      ...config,
      customerGroups: updatedGroups
    });
    
    setNewGroup({ name: '', description: '' });
    setError(null);
  };
  
  const handleDeleteGroup = (id: string) => {
    const updatedGroups = config.customerGroups.filter(group => group.id !== id);
    setConfig({
      ...config,
      customerGroups: updatedGroups
    });
  };
  
  const updateGroupField = (id: string, field: keyof CustomerGroup, value: string) => {
    const updatedGroups = config.customerGroups.map(group => {
      if (group.id === id) {
        return { ...group, [field]: value };
      }
      return group;
    });
    
    setConfig({
      ...config,
      customerGroups: updatedGroups
    });
  };
  
  const handleSaveConfig = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    
    try {
      await updateAppConfig(config);
      setSuccess('Configuration saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setError('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <Settings size={48} className="text-primary-300 mb-2" />
          <p className="text-gray-500">Loading configuration...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          <Settings size={24} className="inline mr-2 text-primary-600" />
          System Configuration
        </h2>
        
        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Save Configuration
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      <div className="space-y-8">
        {/* Display Settings */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default View Mode
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    checked={config.defaultViewMode === 'grid'}
                    onChange={() => setConfig({...config, defaultViewMode: 'grid'})}
                  />
                  <span className="ml-2">Grid View</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    checked={config.defaultViewMode === 'list'}
                    onChange={() => setConfig({...config, defaultViewMode: 'list'})}
                  />
                  <span className="ml-2">List View</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Analytics Time Range
              </label>
              <select
                value={config.analyticsTimeRange}
                onChange={(e) => setConfig({
                  ...config, 
                  analyticsTimeRange: e.target.value as 'day' | 'week' | 'month' | 'year'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
        </section>
        
        {/* Customer Groups */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Groups</h3>
          
          <div className="space-y-4 mb-6">
            {config.customerGroups.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-300 rounded-md">
                <p className="text-gray-500">
                  No customer groups configured yet. Add your first group below.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {config.customerGroups.map(group => (
                  <div key={group.id} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) => updateGroupField(group.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                          placeholder="Group name"
                        />
                        <textarea
                          value={group.description || ''}
                          onChange={(e) => updateGroupField(group.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Description (optional)"
                          rows={2}
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-full"
                        aria-label="Delete group"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                      {group.waterPoints.length === 0 ? (
                        <span>No water points assigned to this group</span>
                      ) : (
                        <span>{group.waterPoints.length} water point(s) assigned</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add New Group Form */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-3">Add New Customer Group</h4>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Group name"
                />
                
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Description (optional)"
                  rows={2}
                />
                
                <div className="flex justify-end">
                  <button
                    onClick={handleAddGroup}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} className="mr-1" />
                    Add Group
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ConfigPage;