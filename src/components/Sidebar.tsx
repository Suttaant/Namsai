import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Droplet, 
  BarChart3, 
  Settings, 
  X, 
  Search,
  PlusCircle
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  setShowAddForm: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, setShowAddForm }) => {
  const location = useLocation();
  const path = location.pathname;
  
  const handleAddNew = () => {
    setShowAddForm(true);
    onClose();
  };
  
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:z-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Droplet size={24} className="text-primary-600" />
              <h2 className="text-lg font-bold text-gray-800">Namsai Jaijing</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 md:hidden"
              aria-label="Close sidebar"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="p-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search water points..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Add New Button */}
          <div className="px-4 mb-4">
            <button
              onClick={handleAddNew}
              className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusCircle size={18} className="mr-2" />
              Add New Water Point
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-grow p-4 space-y-1">
            <SidebarLink to="/" icon={<Droplet size={20} />} label="Water Points" active={path === '/'} onClick={onClose} />
            <SidebarLink to="/analytics" icon={<BarChart3 size={20} />} label="Analytics" active={path === '/analytics'} onClick={onClose} />
            <SidebarLink to="/config" icon={<Settings size={20} />} label="Configuration" active={path === '/config'} onClick={onClose} />
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t text-xs text-gray-500">
            <p>© 2025 Namsai Jaijing</p>
            <p>Chiang Mai University</p>
          </div>
        </div>
      </aside>
    </>
  );
};

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active: boolean;
  onClick: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, to, active, onClick }) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        active 
          ? 'bg-primary-50 text-primary-700 font-medium' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <div className={`${active ? 'text-primary-600' : 'text-gray-500'}`}>
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
};

export default Sidebar;