import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  InfoIcon, 
  AlertTriangle,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Trash2,
  Settings,
  Filter
} from 'lucide-react';
import { enhancedLandlordAPI } from '../../services/enhancedApiService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NotificationCenter = ({ isOpen, onClose, onNotificationClick }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadNotifications();
    }
  }, [isOpen, currentUser]);

  // Safe date handling function - matches PaymentHistory exactly
  const safeCreateDate = (dateValue) => {
    try {
      if (!dateValue) return new Date();
      
      if (dateValue.seconds) {
        return new Date(dateValue.seconds * 1000);
      } else if (dateValue._seconds) {
        return new Date(dateValue._seconds * 1000);
      } else if (typeof dateValue === 'string') {
        return new Date(dateValue);
      } else if (dateValue instanceof Date) {
        return dateValue;
      } else {
        console.warn('Unknown date format:', dateValue);
        return new Date();
      }
    } catch (error) {
      console.error('Error creating date from:', dateValue, error);
      return new Date();
    }
  };

  // Format date consistently
  const formatNotificationTime = (timestamp) => {
    try {
      const date = safeCreateDate(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Format currency consistently
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'KES 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Load notifications from API
  const loadNotifications = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await enhancedLandlordAPI.getNotifications();
      
      if (response.success) {
        const notificationsData = response.data || [];
        setNotifications(notificationsData);
      } else {
        console.error('Failed to load notifications:', response.error);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true, unread: false } 
            : notif
        )
      );

      // Then update backend
      const response = await enhancedLandlordAPI.markNotificationAsRead(notificationId);
      
      if (!response.success) {
        // Revert on failure
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: false, unread: true } 
              : notif
          )
        );
        console.error('Failed to mark notification as read:', response.error);
        toast.error('Failed to mark notification as read');
      }
    } catch (error) {
      // Revert on error
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: false, unread: true } 
            : notif
        )
      );
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead && n.unread);
      
      if (unreadNotifications.length === 0) {
        toast.info('All notifications are already read');
        return;
      }

      // Update local state immediately
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, unread: false }))
      );
      
      // Update backend
      await Promise.all(
        unreadNotifications.map(notif => 
          enhancedLandlordAPI.markNotificationAsRead(notif.id)
        )
      );
      
      toast.success('All notifications marked as read');
    } catch (error) {
      // Revert on error
      loadNotifications();
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      // Update local state immediately
      const originalNotifications = [...notifications];
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      // If API supports deletion, uncomment and implement
      // const response = await enhancedLandlordAPI.deleteNotification(notificationId);
      // if (!response.success) {
      //   setNotifications(originalNotifications);
      //   toast.error('Failed to delete notification');
      // } else {
        toast.success('Notification deleted');
      // }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
    toast.success('Notifications refreshed');
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'tenant':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'property':
        return <Building2 className="w-5 h-5 text-purple-600" />;
      case 'reminder':
        return <Calendar className="w-5 h-5 text-orange-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <InfoIcon className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment':
        return 'border-l-green-500 bg-green-50';
      case 'tenant':
        return 'border-l-blue-500 bg-blue-50';
      case 'property':
        return 'border-l-purple-500 bg-purple-50';
      case 'reminder':
        return 'border-l-orange-500 bg-orange-50';
      case 'warning':
        return 'border-l-red-500 bg-red-50';
      case 'info':
        return 'border-l-blue-400 bg-blue-50';
      case 'success':
        return 'border-l-green-400 bg-green-50';
      default:
        return 'border-l-gray-400 bg-gray-50';
    }
  };

  // Check if notification is unread - handle both formats
  const isNotificationUnread = (notification) => {
    return notification.unread === true || notification.isRead === false;
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return isNotificationUnread(notification);
      case 'payments':
        return notification.type === 'payment';
      case 'tenants':
        return notification.type === 'tenant';
      case 'properties':
        return notification.type === 'property';
      default:
        return true;
    }
  });

  // Handle notification click with proper navigation
  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (isNotificationUnread(notification)) {
      markAsRead(notification.id);
    }
    
    // Call the parent's click handler for navigation
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const unreadCount = notifications.filter(n => isNotificationUnread(n)).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Notifications</h2>
                  <p className="text-blue-100 text-sm">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark All Read</span>
                </button>
              )}
              <button
                onClick={refreshNotifications}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: refreshing ? Infinity : 0 }}
                >
                  <Settings className="w-4 h-4" />
                </motion.div>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex overflow-x-auto">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'payments', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
                { key: 'tenants', label: 'Tenants', count: notifications.filter(n => n.type === 'tenant').length },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      filter === tab.key
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Loading notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 px-6">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
                </h3>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? "You're all caught up! New notifications will appear here."
                    : `No ${filter} notifications at the moment.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-l-4 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      getNotificationColor(notification.type)
                    } ${isNotificationUnread(notification) ? 'ring-2 ring-blue-100' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              isNotificationUnread(notification) ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className={`text-sm mt-1 ${
                              isNotificationUnread(notification) ? 'text-gray-700' : 'text-gray-500'
                            }`}>
                              {notification.message}
                            </p>
                            
                            {/* Additional data based on type */}
                            {notification.data && (
                              <div className="mt-2 text-xs space-x-1">
                                {notification.type === 'payment' && notification.data.amount && (
                                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                    {formatCurrency(notification.data.amount)}
                                  </span>
                                )}
                                {notification.data.tenantName && (
                                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    {notification.data.tenantName}
                                  </span>
                                )}
                                {notification.data.propertyName && (
                                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                    {notification.data.propertyName}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {isNotificationUnread(notification) && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400">
                            {formatNotificationTime(notification.createdAt || notification.time)}
                          </p>
                          
                          {isNotificationUnread(notification) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Notifications are updated in real-time
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Last updated: {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationCenter;