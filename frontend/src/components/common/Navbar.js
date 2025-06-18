import React, { useState, useEffect } from 'react';
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
// CHANGED: Import API services instead of mock data
import { enhancedLandlordAPI } from '../../services/enhancedApiService';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  // CHANGED: Add state for real notifications from API
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // CHANGED: Load notifications from API on component mount
  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser]);

  // CHANGED: Load notifications from API
  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await enhancedLandlordAPI.getNotifications();
      
      if (response.success) {
        setNotifications(response.data || []);
      } else {
        console.error('Failed to load notifications:', response.error);
        // Fallback to empty array
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to mock notifications if API fails
      setNotifications([
        {
          id: 'mock-1',
          title: 'System Notification',
          message: 'API notifications temporarily unavailable',
          time: 'Just now',
          unread: false,
          type: 'system'
        }
      ]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // CHANGED: Mark notification as read via API
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await enhancedLandlordAPI.markNotificationAsRead(notificationId);
      
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, unread: false }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // CHANGED: Handle notification click
  const handleNotificationClick = (notification) => {
    if (notification.unread) {
      markNotificationAsRead(notification.id);
    }
    
    // Handle notification navigation based on type
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
        // No navigation for general notifications
        break;
    }
    
    setShowNotifications(false);
  };

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

  // CHANGED: Calculate unread count from API data
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

  // CHANGED: Format notification time
  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    try {
      const date = timestamp.seconds ? 
        new Date(timestamp.seconds * 1000) : 
        new Date(timestamp);
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown time';
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        {/* Left Side - Page Context */}
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
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && notifications.length === 0) {
                  loadNotifications();
                }
              }}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
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
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      {notificationsLoading && (
                        <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                            notification.unread ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatNotificationTime(notification.createdAt || notification.time)}
                              </p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/notifications');
                      }}
                      className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
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