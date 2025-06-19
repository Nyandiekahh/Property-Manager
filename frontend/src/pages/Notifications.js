import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import NotificationCenter from '../components/notifications/NotificationCenter';

const Notifications = () => {
  const navigate = useNavigate();
  const [showNotificationCenter, setShowNotificationCenter] = useState(true);

  const handleNotificationClick = (notification) => {
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'payment':
        navigate('/payment-history');
        break;
      case 'tenant':
        navigate('/tenants');
        break;
      case 'property':
        navigate('/properties');
        break;
      default:
        // Stay on notifications page for general notifications
        break;
    }
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="hidden md:block h-6 w-px bg-gray-300" />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-600">Manage all your notifications</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative">
        <NotificationCenter
          isOpen={showNotificationCenter}
          onClose={handleClose}
          onNotificationClick={handleNotificationClick}
        />
      </div>
    </div>
  );
};

export default Notifications;