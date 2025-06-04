import React from 'react';
import { Droplet, Menu, BarChart3, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-primary-700 transition-colors md:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <Droplet size={28} className="text-white" />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">Namsai Jaijing</h1>
                <p className="text-xs text-primary-100">Water Delivery Monitoring</p>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-1">
            <NavLink to="/" active={path === '/'}>
              <Droplet size={18} className="mr-1" /> Water Points
            </NavLink>
            <NavLink to="/analytics" active={path === '/analytics'}>
              <BarChart3 size={18} className="mr-1" /> Analytics
            </NavLink>
            <NavLink to="/config" active={path === '/config'}>
              <Settings size={18} className="mr-1" /> Configuration
            </NavLink>
          </nav>
          
          <div className="md:hidden flex">
            <MobileNavIndicator pathname={path} />
          </div>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  children: React.ReactNode;
  to: string;
  active: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ children, to, active }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 rounded-full transition-colors ${
        active 
          ? 'bg-white text-primary-700 font-medium' 
          : 'text-white hover:bg-primary-700'
      }`}
    >
      {children}
    </Link>
  );
};

interface MobileNavIndicatorProps {
  pathname: string;
}

const MobileNavIndicator: React.FC<MobileNavIndicatorProps> = ({ pathname }) => {
  let title = '';
  let Icon = Droplet;
  
  switch (pathname) {
    case '/':
      title = 'Water Points';
      Icon = Droplet;
      break;
    case '/analytics':
      title = 'Analytics';
      Icon = BarChart3;
      break;
    case '/config':
      title = 'Configuration';
      Icon = Settings;
      break;
    default:
      title = 'Water Points';
      Icon = Droplet;
  }
  
  return (
    <div className="flex items-center text-sm font-medium text-white">
      <Icon size={16} className="mr-1" />
      <span>{title}</span>
    </div>
  );
};

export default Header;