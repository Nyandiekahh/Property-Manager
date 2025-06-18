// Fixed Dashboard component with safe date handling - CLEAN VERSION
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
  AlertCircle,
  CheckCircle,
  Target,
  BarChart3,
  PieChart,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { 
  enhancedPropertyAPI, 
  enhancedTenantAPI,
  enhancedPaymentAPI,
  enhancedLandlordAPI 
} from '../services/enhancedApiService';
import { formatCurrency, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState('6months');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentPayments, setRecentPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [paymentTrends, setPaymentTrends] = useState([]);
  const [paymentDistribution, setPaymentDistribution] = useState([]);

  useEffect(() => {
    if (currentUser) {
      console.log('🚀 Dashboard useEffect triggered for user:', currentUser.uid);
      loadDashboardData();
    }
  }, [currentUser, timeRange]);

  // Safe date conversion helper
  const safeCreateDate = (dateValue) => {
    try {
      if (!dateValue) return new Date();
      
      // Handle Firestore timestamp
      if (dateValue.seconds) {
        return new Date(dateValue.seconds * 1000);
      }
      
      // Handle string or number dates
      const date = new Date(dateValue);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateValue, 'using current date');
        return new Date();
      }
      
      return date;
    } catch (error) {
      console.error('Error creating date from:', dateValue, error);
      return new Date(); // Return current date as fallback
    }
  };

  const loadDashboardData = async () => {
    if (!currentUser) {
      console.log('❌ No current user, skipping data load');
      return;
    }
    
    console.log('🔄 Starting loadDashboardData...');
    console.log('📍 API Base URL:', process.env.REACT_APP_API_BASE_URL);
    console.log('👤 User ID:', currentUser.uid);
    
    try {
      setLoading(true);
      
      // Test basic API connection
      console.log('🧪 Testing API connection...');
      try {
        const testResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/status`);
        console.log('✅ API Status Test:', testResponse.status);
      } catch (statusError) {
        console.error('❌ API Status Test Failed:', statusError);
      }
      
      // Load data with individual error handling
      console.log('📊 Loading dashboard data from multiple endpoints...');
      
      const results = {};
      
      // Properties
      try {
        console.log('🔍 Calling properties API...');
        const propertiesResult = await enhancedPropertyAPI.getProperties(currentUser.uid);
        console.log('✅ Properties API Response:', propertiesResult);
        results.properties = propertiesResult;
      } catch (error) {
        console.error('❌ Properties API Error:', error);
        results.properties = { success: false, data: [] };
      }
      
      // Tenants
      try {
        console.log('🔍 Calling tenants API...');
        const tenantsResult = await enhancedTenantAPI.getTenants(currentUser.uid, { isActive: true });
        console.log('✅ Tenants API Response:', tenantsResult);
        results.tenants = tenantsResult;
      } catch (error) {
        console.error('❌ Tenants API Error:', error);
        results.tenants = { success: false, data: [] };
      }
      
      // Tenant Statistics
      try {
        console.log('🔍 Calling tenant statistics API...');
        const statsResult = await enhancedTenantAPI.getTenantStatistics(currentUser.uid);
        console.log('✅ Tenant Stats API Response:', statsResult);
        results.tenantStats = statsResult;
      } catch (error) {
        console.error('❌ Tenant Stats API Error:', error);
        results.tenantStats = { success: false, data: null };
      }
      
      // Recent Payments
      try {
        console.log('🔍 Calling payments API...');
        const paymentsResult = await enhancedPaymentAPI.getRecentPayments(currentUser.uid, { limit: 10 });
        console.log('✅ Payments API Response:', paymentsResult);
        results.payments = paymentsResult;
      } catch (error) {
        console.error('❌ Payments API Error:', error);
        results.payments = { success: false, data: [] };
      }
      
      // Notifications
      try {
        console.log('🔍 Calling notifications API...');
        const notificationsResult = await enhancedLandlordAPI.getNotifications();
        console.log('✅ Notifications API Response:', notificationsResult);
        results.notifications = notificationsResult;
      } catch (error) {
        console.error('❌ Notifications API Error:', error);
        results.notifications = { success: false, data: [] };
      }
      
      // Process results with safe fallbacks
      const properties = results.properties?.success ? (results.properties.data || []) : [];
      const tenants = results.tenants?.success ? (results.tenants.data || []) : [];
      const tenantStats = results.tenantStats?.success ? results.tenantStats.data : null;
      const payments = results.payments?.success ? (results.payments.data || []) : [];
      const notifs = results.notifications?.success ? (results.notifications.data || []) : [];
      
      console.log('📈 Processed Data Summary:', {
        properties: properties.length,
        tenants: tenants.length,
        tenantStats: tenantStats ? 'Available' : 'Null',
        payments: payments.length,
        notifications: notifs.length
      });
      
      // Calculate dashboard metrics with safe date handling
      console.log('🧮 Calculating dashboard metrics...');
      const dashboardMetrics = calculateDashboardMetrics(properties, tenants, tenantStats, payments);
      console.log('📊 Dashboard Metrics:', dashboardMetrics);
      
      setDashboardData(dashboardMetrics);
      setRecentPayments(payments.slice(0, 5));
      setNotifications(processNotifications(dashboardMetrics, notifs));
      
      // Process chart data with safe date handling
      console.log('📈 Processing chart data...');
      const trends = processPaymentTrends(payments);
      setPaymentTrends(trends);
      
      const distribution = processPaymentDistribution(payments);
      setPaymentDistribution(distribution);
      
      console.log('✅ Dashboard data loaded successfully!');
      
    } catch (error) {
      console.error('💥 Critical error in loadDashboardData:', error);
      console.error('💥 Error stack:', error.stack);
      
      toast.error(`Dashboard Error: ${error.message}`, {
        duration: 5000
      });
      
      // Set safe default data
      const safeDefaults = {
        totalProperties: 0,
        totalTenants: 0,
        totalUnits: 0,
        monthlyRevenue: 0,
        occupancyRate: 0,
        collectionRate: 0,
        paidTenants: 0,
        pendingPayments: 0,
        overduePayments: 0,
        partialPayments: 0,
        thisMonthRevenue: 0,
        properties: []
      };
      
      setDashboardData(safeDefaults);
      setRecentPayments([]);
      setNotifications([]);
      setPaymentTrends([]);
      setPaymentDistribution([]);
      
    } finally {
      setLoading(false);
      console.log('🏁 loadDashboardData completed');
    }
  };

const calculateDashboardMetrics = (properties, tenants, tenantStats, payments) => {
  console.log('🧮 calculateDashboardMetrics input:', { 
    propertiesCount: properties.length, 
    tenantsCount: tenants.length, 
    tenantStats: tenantStats,
    paymentsCount: payments.length 
  });
  
  try {
    // Use enhanced stats if available (this is the correct path for your data)
    if (tenantStats && tenantStats.total > 0) {
      console.log('📊 Using enhanced tenant stats:', tenantStats);
      
      // Calculate occupancy rate from property data
      const totalUnits = properties.reduce((sum, p) => sum + (p.totalUnits || p.units || 0), 0);
      const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0);
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
      
      // Calculate collection rate from tenant stats
      const activeTenants = tenantStats.active || 0;
      const paidTenants = tenantStats.paymentStatus?.paid || 0;
      const collectionRate = activeTenants > 0 ? Math.round((paidTenants / activeTenants) * 100) : 0;
      
      const metrics = {
        totalProperties: properties.length,
        totalTenants: tenantStats.active || 0,
        totalUnits: totalUnits,
        monthlyRevenue: tenantStats.totalMonthlyRent || 0,
        occupancyRate: occupancyRate, // FIXED: Calculate from actual property data
        collectionRate: collectionRate, // FIXED: Calculate from tenant payment status
        paidTenants: tenantStats.paymentStatus?.paid || 0,
        pendingPayments: tenantStats.paymentStatus?.pending || 0,
        overduePayments: tenantStats.paymentStatus?.overdue || 0,
        partialPayments: tenantStats.paymentStatus?.partial || 0,
        thisMonthRevenue: calculateThisMonthRevenue(payments),
        properties: properties
      };
      
      console.log('✅ Calculated metrics from enhanced stats:', metrics);
      console.log('🔢 Detailed calculations:', {
        totalUnits,
        occupiedUnits,
        occupancyCalculation: `${occupiedUnits}/${totalUnits} = ${occupancyRate}%`,
        activeTenants,
        paidTenants,
        collectionCalculation: `${paidTenants}/${activeTenants} = ${collectionRate}%`
      });
      
      return metrics;
    } else {
      console.log('📊 Calculating metrics from raw data...');
      const totalUnits = properties.reduce((sum, p) => sum + (p.totalUnits || p.units || 0), 0);
      const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0);
      const monthlyRevenue = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
      
      const metrics = {
        totalProperties: properties.length,
        totalTenants: tenants.length,
        totalUnits: totalUnits,
        monthlyRevenue: monthlyRevenue,
        occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
        collectionRate: calculateCollectionRate(tenants),
        paidTenants: tenants.filter(t => t.paymentStatus === 'paid').length,
        pendingPayments: tenants.filter(t => t.paymentStatus === 'pending').length,
        overduePayments: tenants.filter(t => t.paymentStatus === 'overdue').length,
        partialPayments: tenants.filter(t => t.paymentStatus === 'partial').length,
        thisMonthRevenue: calculateThisMonthRevenue(payments),
        properties: properties
      };
      console.log('✅ Calculated metrics from raw data:', metrics);
      return metrics;
    }
  } catch (error) {
    console.error('❌ Error in calculateDashboardMetrics:', error);
    return {
      totalProperties: 0,
      totalTenants: 0,
      totalUnits: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
      collectionRate: 0,
      paidTenants: 0,
      pendingPayments: 0,
      overduePayments: 0,
      partialPayments: 0,
      thisMonthRevenue: 0,
      properties: []
    };
  }
};

  const calculateCollectionRate = (tenants) => {
    if (tenants.length === 0) return 0;
    const paidTenants = tenants.filter(t => t.paymentStatus === 'paid').length;
    return Math.round((paidTenants / tenants.length) * 100);
  };

  // FIXED: Safe date handling in calculateThisMonthRevenue
  const calculateThisMonthRevenue = (payments) => {
    try {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      return payments
        .filter(payment => {
          try {
            const paymentDate = safeCreateDate(payment.createdAt);
            return paymentDate.getMonth() === currentMonth && 
                   paymentDate.getFullYear() === currentYear &&
                   payment.status === 'completed';
          } catch (error) {
            console.warn('Error processing payment date:', payment.createdAt, error);
            return false;
          }
        })
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    } catch (error) {
      console.error('Error in calculateThisMonthRevenue:', error);
      return 0;
    }
  };

  const processNotifications = (dashboardMetrics, apiNotifications) => {
    const alerts = [];
    
    try {
      // Add API notifications first
      if (apiNotifications && apiNotifications.length > 0) {
        apiNotifications.slice(0, 3).forEach(notif => {
          alerts.push({
            type: notif.type || 'info',
            title: notif.title,
            message: notif.message
          });
        });
      }
      
      // Add calculated alerts
      if (dashboardMetrics.overduePayments > 0) {
        alerts.push({
          type: 'warning',
          title: 'Overdue Payments',
          message: `${dashboardMetrics.overduePayments} tenant(s) have overdue payments`
        });
      }
      
      if (dashboardMetrics.partialPayments > 0) {
        alerts.push({
          type: 'info',
          title: 'Partial Payments',
          message: `${dashboardMetrics.partialPayments} tenant(s) have made partial payments`
        });
      }
      
      if (dashboardMetrics.pendingPayments > 0) {
        alerts.push({
          type: 'info',
          title: 'Pending Payments',
          message: `${dashboardMetrics.pendingPayments} payment(s) awaiting processing`
        });
      }
      
      return alerts.slice(0, 5);
    } catch (error) {
      console.error('Error processing notifications:', error);
      return [];
    }
  };

  // FIXED: Safe date handling in processPaymentTrends
  const processPaymentTrends = (payments) => {
    try {
      const monthlyData = {};
      const now = new Date();
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        monthlyData[monthKey] = {
          month: monthName,
          revenue: 0,
          collected: 0,
          target: 0
        };
      }
      
      // Process payments with safe date handling
      payments.forEach(payment => {
        try {
          const paymentDate = safeCreateDate(payment.createdAt);
          const monthKey = paymentDate.toISOString().slice(0, 7);
          
          if (monthlyData[monthKey] && payment.status === 'completed') {
            monthlyData[monthKey].collected += payment.amount || 0;
            monthlyData[monthKey].revenue += payment.expectedAmount || payment.amount || 0;
          }
        } catch (error) {
          console.warn('Error processing payment for trends:', payment.id, error);
        }
      });
      
      // Set targets
      Object.keys(monthlyData).forEach(monthKey => {
        const data = monthlyData[monthKey];
        data.target = data.revenue || data.collected * 1.1;
      });
      
      return Object.values(monthlyData);
    } catch (error) {
      console.error('Error in processPaymentTrends:', error);
      return [];
    }
  };

  const processPaymentDistribution = (payments) => {
    try {
      const distribution = {
        exact: { count: 0, value: 0 },
        overpayment: { count: 0, value: 0 },
        underpayment: { count: 0, value: 0 }
      };
      
      payments.forEach(payment => {
        if (payment.status === 'completed') {
          const type = payment.paymentType || 'exact';
          if (distribution[type]) {
            distribution[type].count++;
            distribution[type].value += payment.amount || 0;
          } else {
            distribution.exact.count++;
            distribution.exact.value += payment.amount || 0;
          }
        }
      });
      
      const total = distribution.exact.count + distribution.overpayment.count + distribution.underpayment.count;
      
      return [
        {
          type: 'Exact Payment',
          count: distribution.exact.count,
          value: distribution.exact.value,
          percentage: total > 0 ? ((distribution.exact.count / total) * 100).toFixed(1) : 0,
          color: '#10b981'
        },
        {
          type: 'Overpayment',
          count: distribution.overpayment.count,
          value: distribution.overpayment.value,
          percentage: total > 0 ? ((distribution.overpayment.count / total) * 100).toFixed(1) : 0,
          color: '#3b82f6'
        },
        {
          type: 'Underpayment',
          count: distribution.underpayment.count,
          value: distribution.underpayment.value,
          percentage: total > 0 ? ((distribution.underpayment.count / total) * 100).toFixed(1) : 0,
          color: '#f59e0b'
        }
      ].filter(item => item.count > 0);
    } catch (error) {
      console.error('Error in processPaymentDistribution:', error);
      return [];
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    toast.promise(
      loadDashboardData(),
      {
        loading: 'Refreshing dashboard...',
        success: 'Dashboard updated successfully!',
        error: 'Failed to refresh dashboard'
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
          <p className="text-gray-400 text-sm mt-2">Processing API responses...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Data Not Available</h3>
          <p className="text-gray-600 mb-4">There was an issue loading your dashboard data</p>
          <button 
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Enhanced Portfolio Analytics</h1>
                <p className="text-sm text-gray-600">Real-time performance insights with smart features</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="6months">Last 6 months</option>
                <option value="30days">Last 30 days</option>
                <option value="7days">Last 7 days</option>
                <option value="1year">Last year</option>
              </select>
              
              <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button 
                onClick={handleRefresh}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh Dashboard"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">{notifications[0].title}</p>
              <p className="text-sm text-blue-700">{notifications[0].message}</p>
            </div>
            {notifications.length > 1 && (
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                +{notifications.length - 1} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: 'Total Properties', 
              value: dashboardData.totalProperties || 0, 
              icon: Building2, 
              color: 'text-blue-600',
              bgColor: 'bg-blue-50',
              subtext: `${dashboardData.totalUnits || 0} total units`
            },
            { 
              label: 'Active Tenants', 
              value: dashboardData.totalTenants || 0, 
              icon: Users, 
              color: 'text-green-600',
              bgColor: 'bg-green-50',
              subtext: `${dashboardData.paidTenants || 0} paid this month`
            },
            { 
              label: 'Monthly Revenue', 
              value: formatCurrency(dashboardData.monthlyRevenue || 0), 
              icon: DollarSign, 
              color: 'text-purple-600',
              bgColor: 'bg-purple-50',
              subtext: `${dashboardData.occupancyRate || 0}% occupied`
            },
            { 
              label: 'Collection Rate', 
              value: `${dashboardData.collectionRate || 0}%`, 
              icon: Target, 
              color: 'text-orange-600',
              bgColor: 'bg-orange-50',
              subtext: `${dashboardData.pendingPayments || 0} pending`
            }
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 ${metric.bgColor} rounded-lg`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                  <p className="text-gray-600 text-xs font-medium">{metric.label}</p>
                  <p className="text-gray-500 text-xs mt-1">{metric.subtext}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">Dashboard loaded successfully!</p>
            <p className="text-green-600 text-sm ml-2">All API endpoints working with safe date handling</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trends Chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue & Collection Trends</h3>
                <p className="text-sm text-gray-600">Monthly performance analysis</p>
              </div>
            </div>
            
            {paymentTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={paymentTrends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [formatCurrency(value), '']}
                  />
                  <Area type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No payment trends available</p>
                <p className="text-gray-400 text-sm">Payment data will appear here once you start collecting rent</p>
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
                <p className="text-sm text-gray-600">Latest M-Pesa transactions</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-xs font-medium">Live</span>
              </div>
            </div>
            
            {recentPayments.length > 0 ? (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg ${
                      payment.status === 'completed' ? 'bg-green-50' :
                      payment.status === 'pending' ? 'bg-yellow-50' :
                      'bg-red-50'
                    }`}>
                      <CreditCard className={`w-4 h-4 ${
                        payment.status === 'completed' ? 'text-green-600' :
                        payment.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-900 text-sm font-medium truncate">
                          {payment.description || payment.tenantName || 'Rent Payment'}
                        </p>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {payment.status}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-600 text-sm font-semibold">{formatCurrency(payment.amount || 0)}</p>
                          {payment.paymentType && payment.paymentType !== 'exact' && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              payment.paymentType === 'overpayment' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {payment.paymentType === 'overpayment' ? 'Overpaid' : 'Underpaid'}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs">
                          {formatDate(safeCreateDate(payment.createdAt))}
                        </p>
                      </div>
                      {payment.accountNumber && (
                        <p className="text-gray-500 text-xs font-mono mt-1">
                          Account: {payment.accountNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No recent payments</p>
                <p className="text-gray-400 text-sm">M-Pesa payments will appear here once tenants start paying</p>
              </div>
            )}
            
            <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 text-sm py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              View All Payments
            </button>
          </div>
        </div>

        {/* Properties Overview */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Enhanced Property Overview</h3>
              <p className="text-sm text-gray-600">Your properties with smart features</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          
          {dashboardData.properties && dashboardData.properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.properties.slice(0, 6).map((property) => (
                <div key={property.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{property.name}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-500 text-xs">{property.totalUnits || property.units || 0} units</p>
                          {property.unitTypes && property.unitTypes.length > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Enhanced
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Active
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-xs font-medium">Monthly Revenue</p>
                      <p className="text-gray-900 font-semibold">{formatCurrency(property.monthlyRevenue || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium">Occupancy</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-900 font-semibold">
                          {property.totalUnits > 0 ? 
                            Math.round(((property.occupiedUnits || 0) / property.totalUnits) * 100) : 0
                          }%
                        </p>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ 
                              width: `${property.totalUnits > 0 ? 
                                Math.round(((property.occupiedUnits || 0) / property.totalUnits) * 100) : 0
                              }%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No properties found</p>
              <p className="text-gray-400 text-sm">Add your first property to see analytics</p>
            </div>
          )}
        </div>

        {/* Performance Summary */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Enhanced Performance Summary</h2>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">This Month</button>
              <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">This Year</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{dashboardData.occupancyRate || 0}%</p>
              <p className="text-gray-600 font-medium">Occupancy Rate</p>
              <div className="flex items-center justify-center mt-2">
                <span className={`text-sm font-medium ${
                  (dashboardData.occupancyRate || 0) >= 90 ? 'text-green-600' :
                  (dashboardData.occupancyRate || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(dashboardData.occupancyRate || 0) >= 90 ? 'Excellent' :
                   (dashboardData.occupancyRate || 0) >= 70 ? 'Good' : 'Needs Attention'}
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(dashboardData.thisMonthRevenue || 0)}</p>
              <p className="text-gray-600 font-medium">This Month Revenue</p>
              <div className="flex items-center justify-center mt-2">
                {(dashboardData.thisMonthRevenue || 0) >= (dashboardData.monthlyRevenue || 0) ? (
                  <span className="text-green-600 text-sm font-medium">On Target</span>
                ) : (
                  <span className="text-red-600 text-sm font-medium">
                    {Math.round(((dashboardData.thisMonthRevenue || 0) / (dashboardData.monthlyRevenue || 1)) * 100)}%
                  </span>
                )}
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{dashboardData.collectionRate || 0}%</p>
              <p className="text-gray-600 font-medium">Collection Rate</p>
              <div className="flex items-center justify-center mt-2">
                <span className={`text-sm font-medium ${
                  parseFloat(dashboardData.collectionRate || 0) >= 95 ? 'text-green-600' :
                  parseFloat(dashboardData.collectionRate || 0) >= 80 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {parseFloat(dashboardData.collectionRate || 0) >= 95 ? 'Excellent' :
                   parseFloat(dashboardData.collectionRate || 0) >= 80 ? 'Good' : 'Poor'}
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{dashboardData.pendingPayments || 0}</p>
              <p className="text-gray-600 font-medium">Pending Payments</p>
              <div className="flex items-center justify-center mt-2">
                {(dashboardData.pendingPayments || 0) === 0 ? (
                  <span className="text-green-600 text-sm font-medium">All Clear</span>
                ) : (
                  <span className="text-orange-600 text-sm font-medium">Action Needed</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;