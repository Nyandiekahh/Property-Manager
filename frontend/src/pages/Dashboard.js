// frontend/src/pages/Dashboard.js - FIXED VERSION

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyticsService, subscribeToPayments } from '../services/firestoreService';
import { formatCurrency, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentPayments, setRecentPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        const data = await analyticsService.getDashboardData(currentUser.uid);
        setDashboardData(data);
        setRecentPayments(data.recentPayments || []);
        setLoading(false);
        
        // Load notifications
        loadNotifications();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    const loadNotifications = async () => {
      // This would load notifications from the database
      // For now, we'll simulate based on data
      if (dashboardData) {
        const alerts = [];
        
        if (dashboardData.overduePayments > 0) {
          alerts.push({
            type: 'warning',
            title: 'Overdue Payments',
            message: `${dashboardData.overduePayments} tenant(s) have overdue payments`,
            priority: 'high'
          });
        }
        
        if (dashboardData.partialPayments > 0) {
          alerts.push({
            type: 'info',
            title: 'Partial Payments',
            message: `${dashboardData.partialPayments} tenant(s) have made partial payments`,
            priority: 'medium'
          });
        }
        
        setNotifications(alerts);
      }
    };

    loadDashboardData();

    // Subscribe to real-time payment updates
    const unsubscribe = subscribeToPayments(currentUser?.uid, (payments) => {
      setRecentPayments(payments.slice(0, 5));
      // Refresh dashboard data when payments change
      loadDashboardData();
    });

    return () => unsubscribe && unsubscribe();
  }, [currentUser]);

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">No data available</p>
      </div>
    );
  }

  // FIXED: Properly calculate stats
  const statCards = [
    {
      title: 'Total Properties',
      value: dashboardData.totalProperties,
      icon: Building2,
      color: 'from-blue-500 to-cyan-500',
      change: `${dashboardData.totalUnits} total units`,
      changeType: 'neutral'
    },
    {
      title: 'Active Tenants',
      value: dashboardData.totalTenants,
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      change: `${dashboardData.paidTenants} paid this month`,
      changeType: 'positive'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(dashboardData.monthlyRevenue),
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500',
      change: `${dashboardData.occupancyRate}% occupied`,
      changeType: 'positive'
    },
    {
      title: 'Collection Status',
      value: `${dashboardData.collectionRate}%`,
      icon: CreditCard,
      color: 'from-orange-500 to-red-500',
      change: `${dashboardData.pendingPayments} pending`,
      changeType: dashboardData.pendingPayments > 0 ? 'negative' : 'positive'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with Notifications */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's what's happening with your properties.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          {/* Notification Bell */}
          {notifications.length > 0 && (
            <div className="relative">
              <Bell className="w-6 h-6 text-orange-500" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length}
              </span>
            </div>
          )}
          <div className="glass px-4 py-2 rounded-xl">
            <p className="text-slate-600 text-sm">Today</p>
            <p className="text-slate-900 font-semibold">{formatDate(new Date(), 'EEEE, MMM dd')}</p>
          </div>
        </div>
      </motion.div>

      {/* Notifications Bar */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-2"
        >
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`flex items-center p-3 rounded-xl border-l-4 ${
                notification.type === 'warning' ? 'bg-orange-50 border-orange-500' :
                notification.type === 'info' ? 'bg-blue-50 border-blue-500' :
                'bg-green-50 border-green-500'
              }`}
            >
              <div className="mr-3">
                {notification.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                ) : notification.type === 'info' ? (
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900">{notification.title}</p>
                <p className="text-sm text-slate-600">{notification.message}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Stats Cards - FIXED */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="card hover:glow-primary"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <div className={`flex items-center text-xs font-medium mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' :
                    'text-slate-600'
                  }`}>
                    {stat.changeType === 'positive' && <ArrowUp className="w-3 h-3 mr-1" />}
                    {stat.changeType === 'negative' && <ArrowDown className="w-3 h-3 mr-1" />}
                    {stat.change}
                  </div>
                </div>
              </div>
              <h3 className="text-slate-600 font-medium">{stat.title}</h3>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payments */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Payments</h2>
            <button className="btn btn-secondary text-sm">View All</button>
          </div>
          
          {recentPayments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No recent payments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPayments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center justify-between p-4 glass rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-600' : 
                      payment.paymentType === 'overpayment' ? 'bg-blue-100 text-blue-600' :
                      payment.paymentType === 'underpayment' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {payment.status === 'completed' ? 
                        <CheckCircle className="w-5 h-5" /> : 
                        <AlertCircle className="w-5 h-5" />
                      }
                    </div>
                    <div>
                      <p className="text-slate-900 font-medium">
                        {payment.description || 'Payment'}
                        {payment.paymentType === 'overpayment' && ' (Overpaid)'}
                        {payment.paymentType === 'underpayment' && ' (Partial)'}
                      </p>
                      <p className="text-slate-500 text-sm">Account: {payment.accountNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-900 font-semibold">{formatCurrency(payment.amount)}</p>
                    <p className="text-slate-500 text-sm">
                      {payment.createdAt?.seconds ? 
                        formatDate(new Date(payment.createdAt.seconds * 1000)) : 
                        formatDate(new Date())
                      }
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions & Stats */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
              <Calendar className="w-5 h-5 text-slate-500" />
            </div>
            
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-secondary w-full"
              >
                Generate Report
              </motion.button>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="card">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Expected This Month</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(dashboardData.monthlyRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Collected</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(dashboardData.thisMonthRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Outstanding</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(dashboardData.monthlyRevenue - dashboardData.thisMonthRevenue)}
                </span>
              </div>
              <hr className="border-slate-200" />
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Collection Rate</span>
                <span className={`font-semibold ${
                  parseFloat(dashboardData.collectionRate) >= 80 ? 'text-green-600' : 
                  parseFloat(dashboardData.collectionRate) >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {dashboardData.collectionRate}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Performance Overview</h2>
          <div className="flex items-center space-x-2">
            <button className="btn btn-secondary text-sm">This Month</button>
            <button className="btn btn-secondary text-sm">This Year</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{dashboardData.occupancyRate}%</p>
            <p className="text-slate-600">Occupancy Rate</p>
            <div className="flex items-center justify-center mt-2">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className={`text-sm ${
                dashboardData.occupancyRate >= 90 ? 'text-green-500' :
                dashboardData.occupancyRate >= 70 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {dashboardData.occupancyRate >= 90 ? 'Excellent' :
                 dashboardData.occupancyRate >= 70 ? 'Good' : 'Needs Attention'}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{formatCurrency(dashboardData.thisMonthRevenue)}</p>
            <p className="text-slate-600">This Month Revenue</p>
            <div className="flex items-center justify-center mt-2">
              {dashboardData.thisMonthRevenue >= dashboardData.monthlyRevenue ? (
                <>
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 text-sm">On Target</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-red-500 text-sm">
                    {Math.round((dashboardData.thisMonthRevenue / dashboardData.monthlyRevenue) * 100)}%
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-success rounded-xl mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{dashboardData.collectionRate}%</p>
            <p className="text-slate-600">Collection Rate</p>
            <div className="flex items-center justify-center mt-2">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className={`text-sm ${
                parseFloat(dashboardData.collectionRate) >= 95 ? 'text-green-500' :
                parseFloat(dashboardData.collectionRate) >= 80 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {parseFloat(dashboardData.collectionRate) >= 95 ? 'Excellent' :
                 parseFloat(dashboardData.collectionRate) >= 80 ? 'Good' : 'Poor'}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{dashboardData.pendingPayments}</p>
            <p className="text-slate-600">Pending Payments</p>
            <div className="flex items-center justify-center mt-2">
              {dashboardData.pendingPayments === 0 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 text-sm">All Clear</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-orange-500 text-sm">Action Needed</span>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;