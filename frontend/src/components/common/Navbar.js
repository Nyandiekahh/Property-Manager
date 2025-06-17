import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Key,
  ChevronDown,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const handlePasswordReset = () => {
    // This would typically open a password reset modal or navigate to a reset page
    toast.info('Password reset functionality coming soon');
    setShowUserMenu(false);
  };

  const handleSettings = () => {
    // Navigate to settings page or open settings modal
    toast.info('Settings page coming soon');
    setShowUserMenu(false);
  };

  const handleSupport = () => {
    // Open support modal or navigate to help page
    toast.info('Support center coming soon');
    setShowUserMenu(false);
  };

  // Mock notifications - in real app, these would come from your backend
  const notifications = [
    {
      id: 1,
      title: 'New payment received',
      message: 'KES 25,000 from John Doe',
      time: '2 minutes ago',
      unread: true,
      type: 'payment'
    },
    {
      id: 2,
      title: 'Rent reminder sent',
      message: 'Reminder sent to 3 tenants',
      time: '1 hour ago',
      unread: true,
      type: 'reminder'
    },
    {
      id: 3,
      title: 'New tenant registered',
      message: 'Sarah Wanjiku added to Kileleshwa Apartments',
      time: '3 hours ago',
      unread: false,
      type: 'tenant'
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  const formatEmail = (email) => {
    if (!email) return 'User';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        {/* Left Side - Page Context (optional breadcrumbs could go here) */}
        <div className="flex-1">
          <div className="text-sm text-gray-500">
            Welcome back, <span className="font-medium text-gray-900">{formatEmail(currentUser?.email)}</span>
          </div>
        </div>

        {/* Right Side - User Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <p className="text-sm text-gray-500">{unreadCount} unread notifications</p>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border-t border-gray-100">
                    <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm">
                  {getInitials(currentUser?.email)}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-gray-900 font-medium text-sm">
                  {formatEmail(currentUser?.email)}
                </p>
                <p className="text-gray-500 text-xs">{currentUser?.email}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                showUserMenu ? 'rotate-180' : ''
              }`} />
            </motion.button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">
                          {getInitials(currentUser?.email)}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold">{formatEmail(currentUser?.email)}</p>
                        <p className="text-gray-500 text-sm">{currentUser?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button 
                      onClick={handleSettings}
                      className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm font-medium">Account Settings</span>
                    </button>
                    
                    <button 
                      onClick={handlePasswordReset}
                      className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <Key className="w-4 h-4" />
                      <span className="text-sm font-medium">Change Password</span>
                    </button>
                    
                    <button 
                      onClick={handleSupport}
                      className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Help & Support</span>
                    </button>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                  
                  <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Shield className="w-3 h-3" />
                      <span>Your data is secure and encrypted</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </motion.nav>
  );
};

export default Navbar;