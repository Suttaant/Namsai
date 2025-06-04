import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import AnalyticsPage from './components/AnalyticsPage';
import ConfigPage from './components/ConfigPage';
import WaterPointForm from './components/WaterPointForm';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleFormSuccess = () => {
    setShowAddForm(false);
  };
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        
        <div className="flex flex-1">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            setShowAddForm={setShowAddForm}
          />
          
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="container mx-auto max-w-6xl">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/config" element={<ConfigPage />} />
              </Routes>
            </div>
          </main>
        </div>
        
        {showAddForm && (
          <WaterPointForm 
            onClose={() => setShowAddForm(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </Router>
  );
}

export default App;