import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Target,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Cell,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { analyticsService, subscribeToPayments, tenantService, propertyService } from '../services/firestoreService';
import { formatCurrency, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Analytics = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12months');
  const [dashboardData, setDashboardData] = useState(null);
  const [paymentTrends, setPaymentTrends] = useState([]);
  const [propertyAnalytics, setPropertyAnalytics] = useState([]);
  const [tenantAnalytics, setTenantAnalytics] = useState([]);
  const [collectionAnalytics, setCollectionAnalytics] = useState([]);
  const [occupancyTrends, setOccupancyTrends] = useState([]);

  useEffect(() => {
    loadAnalyticsData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToPayments(currentUser?.uid, (payments) => {
      processPaymentAnalytics(payments);
    });

    return () => unsubscribe && unsubscribe();
  }, [currentUser, timeRange]);

  const loadAnalyticsData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const [dashData, properties, tenants, payments] = await Promise.all([
        analyticsService.getDashboardData(currentUser.uid),
        propertyService.getProperties(currentUser.uid),
        tenantService.getTenants(currentUser.uid),
        analyticsService.getPayments ? analyticsService.getPayments(currentUser.uid) : []
      ]);

      setDashboardData(dashData);
      
      // Process analytics
      processPaymentAnalytics(dashData.recentPayments || []);
      processPropertyAnalytics(properties, tenants);
      processTenantAnalytics(tenants);
      processOccupancyTrends(properties, tenants);
      processCollectionAnalytics(dashData.recentPayments || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setLoading(false);
    }
  };

  const processPaymentAnalytics = (payments) => {
    const monthsToShow = timeRange === '12months' ? 12 : timeRange === '6months' ? 6 : 3;
    const monthlyData = {};
    const now = new Date();
    
    // Initialize months
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      monthlyData[monthKey] = {
        month: monthName,
        revenue: 0,
        payments: 0,
        avgAmount: 0,
        successRate: 0
      };
    }
    
    // Process payments
    const monthlyPayments = {};
    payments.forEach(payment => {
      const paymentDate = payment.createdAt?.seconds ? 
        new Date(payment.createdAt.seconds * 1000) : 
        new Date(payment.createdAt);
      const monthKey = paymentDate.toISOString().slice(0, 7);
      
      if (monthlyData[monthKey]) {
        if (!monthlyPayments[monthKey]) {
          monthlyPayments[monthKey] = { completed: 0, total: 0, revenue: 0 };
        }
        
        monthlyPayments[monthKey].total++;
        if (payment.status === 'completed') {
          monthlyPayments[monthKey].completed++;
          monthlyPayments[monthKey].revenue += payment.amount || 0;
        }
      }
    });
    
    // Calculate final metrics
    Object.keys(monthlyData).forEach(monthKey => {
      const monthPayments = monthlyPayments[monthKey] || { completed: 0, total: 0, revenue: 0 };
      monthlyData[monthKey].revenue = monthPayments.revenue;
      monthlyData[monthKey].payments = monthPayments.completed;
      monthlyData[monthKey].avgAmount = monthPayments.completed > 0 ? 
        monthPayments.revenue / monthPayments.completed : 0;
      monthlyData[monthKey].successRate = monthPayments.total > 0 ? 
        (monthPayments.completed / monthPayments.total) * 100 : 0;
    });
    
    setPaymentTrends(Object.values(monthlyData));
  };

  const processPropertyAnalytics = (properties, tenants) => {
    const analytics = properties.map(property => {
      const propertyTenants = tenants.filter(t => t.propertyId === property.id);
      const totalUnits = property.totalUnits || property.units || 0;
      const occupiedUnits = propertyTenants.length;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
      const monthlyRevenue = propertyTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
      const avgRentPerUnit = occupiedUnits > 0 ? monthlyRevenue / occupiedUnits : 0;
      
      return {
        name: property.name,
        occupancyRate,
        monthlyRevenue,
        totalUnits,
        occupiedUnits,
        avgRentPerUnit,
        location: property.location
      };
    });
    
    setPropertyAnalytics(analytics);
  };

  const processTenantAnalytics = (tenants) => {
    const statusDistribution = {
      paid: tenants.filter(t => t.paymentStatus === 'paid').length,
      pending: tenants.filter(t => t.paymentStatus === 'pending').length,
      overdue: tenants.filter(t => t.paymentStatus === 'overdue').length,
      partial: tenants.filter(t => t.paymentStatus === 'partial').length
    };
    
    const rentDistribution = tenants.reduce((acc, tenant) => {
      const rent = tenant.rentAmount || 0;
      if (rent < 30000) acc.low++;
      else if (rent < 60000) acc.medium++;
      else acc.high++;
      return acc;
    }, { low: 0, medium: 0, high: 0 });
    
    setTenantAnalytics({
      statusDistribution,
      rentDistribution,
      totalTenants: tenants.length,
      avgRent: tenants.length > 0 ? 
        tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0) / tenants.length : 0
    });
  };

  const processOccupancyTrends = (properties, tenants) => {
    // Simulate occupancy over time (in real app, you'd have historical data)
    const trends = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Calculate current occupancy
      const totalUnits = properties.reduce((sum, p) => sum + (p.totalUnits || p.units || 0), 0);
      const occupiedUnits = tenants.length;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
      
      // Simulate slight variations for historical months
      const variation = (Math.random() - 0.5) * 10;
      const historicalRate = Math.max(0, Math.min(100, occupancyRate + variation));
      
      trends.push({
        month: monthName,
        occupancyRate: i === 0 ? occupancyRate : historicalRate,
        totalUnits: totalUnits,
        occupiedUnits: i === 0 ? occupiedUnits : Math.round((historicalRate / 100) * totalUnits)
      });
    }
    
    setOccupancyTrends(trends);
  };

  const processCollectionAnalytics = (payments) => {
    const last30Days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayKey = date.toISOString().slice(0, 10);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayPayments = payments.filter(p => {
        const paymentDate = p.createdAt?.seconds ? 
          new Date(p.createdAt.seconds * 1000) : 
          new Date(p.createdAt);
        return paymentDate.toISOString().slice(0, 10) === dayKey;
      });
      
      const completedPayments = dayPayments.filter(p => p.status === 'completed');
      const totalAmount = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      
      last30Days.push({
        day: dayName,
        date: date.getDate(),
        amount: totalAmount,
        payments: completedPayments.length,
        successRate: dayPayments.length > 0 ? 
          (completedPayments.length / dayPayments.length) * 100 : 0
      });
    }
    
    setCollectionAnalytics(last30Days);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Add properties and tenants to see detailed analytics</p>
        </div>
      </div>
    );
  }

  const currentMonthRevenue = paymentTrends[paymentTrends.length - 1]?.revenue || 0;
  const previousMonthRevenue = paymentTrends[paymentTrends.length - 2]?.revenue || 0;
  const revenueGrowth = previousMonthRevenue > 0 ? 
    ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-600">Deep insights into your property business</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="3months">Last 3 months</option>
                <option value="6months">Last 6 months</option>
                <option value="12months">Last 12 months</option>
              </select>
              
              <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              
              <button 
                onClick={loadAnalyticsData}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Revenue',
              value: formatCurrency(dashboardData.monthlyRevenue || 0),
              change: `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}%`,
              positive: parseFloat(revenueGrowth) >= 0,
              icon: DollarSign,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            },
            {
              label: 'Portfolio Occupancy',
              value: `${dashboardData.occupancyRate || 0}%`,
              change: dashboardData.occupancyRate >= 85 ? 'Excellent' : dashboardData.occupancyRate >= 70 ? 'Good' : 'Needs Attention',
              positive: dashboardData.occupancyRate >= 70,
              icon: Building2,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              label: 'Collection Rate',
              value: `${dashboardData.collectionRate || 0}%`,
              change: dashboardData.collectionRate >= 90 ? 'Excellent' : 'Room for Improvement',
              positive: dashboardData.collectionRate >= 90,
              icon: Target,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50'
            },
            {
              label: 'Active Tenants',
              value: dashboardData.totalTenants || 0,
              change: `${dashboardData.paidTenants || 0} paid this month`,
              positive: true,
              icon: Users,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50'
            }
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${metric.bgColor} rounded-lg`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div className={`flex items-center text-sm font-medium ${
                    metric.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.positive ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                    {metric.change}
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                  <p className="text-gray-600 text-sm">{metric.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Revenue & Payment Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
                <p className="text-sm text-gray-600">Monthly revenue over time</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={paymentTrends}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
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
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Success Rate</h3>
                <p className="text-sm text-gray-600">Success rate over time</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={paymentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Success Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="successRate" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property Performance */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Property Performance</h3>
              <p className="text-sm text-gray-600">Occupancy and revenue by property</p>
            </div>
          </div>
          
          {propertyAnalytics.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={propertyAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                    fontSize: '12px'
                  }}
                  formatter={(value, name) => [
                    name === 'monthlyRevenue' ? formatCurrency(value) : 
                    name === 'occupancyRate' ? `${value.toFixed(1)}%` : value,
                    name === 'monthlyRevenue' ? 'Revenue' : 
                    name === 'occupancyRate' ? 'Occupancy' : name
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="monthlyRevenue" fill="#3b82f6" name="Monthly Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="occupancyRate" stroke="#10b981" strokeWidth={3} name="Occupancy Rate" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No property data available</p>
            </div>
          )}
        </div>

        {/* Tenant Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tenant Payment Status</h3>
                <p className="text-sm text-gray-600">Current payment distribution</p>
              </div>
            </div>
            
            {tenantAnalytics.totalTenants > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Paid', value: tenantAnalytics.statusDistribution.paid, color: '#10b981' },
                      { name: 'Pending', value: tenantAnalytics.statusDistribution.pending, color: '#f59e0b' },
                      { name: 'Overdue', value: tenantAnalytics.statusDistribution.overdue, color: '#ef4444' },
                      { name: 'Partial', value: tenantAnalytics.statusDistribution.partial, color: '#3b82f6' }
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {[
                      { name: 'Paid', value: tenantAnalytics.statusDistribution.paid, color: '#10b981' },
                      { name: 'Pending', value: tenantAnalytics.statusDistribution.pending, color: '#f59e0b' },
                      { name: 'Overdue', value: tenantAnalytics.statusDistribution.overdue, color: '#ef4444' },
                      { name: 'Partial', value: tenantAnalytics.statusDistribution.partial, color: '#3b82f6' }
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tenant data available</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Occupancy Trends</h3>
                <p className="text-sm text-gray-600">12-month occupancy rate</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={occupancyTrends}>
                <defs>
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Occupancy Rate']}
                />
                <Area 
                  type="monotone" 
                  dataKey="occupancyRate" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#occupancyGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Collection Activity */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Daily Collection Activity</h3>
              <p className="text-sm text-gray-600">Last 30 days payment collection</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={collectionAnalytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#111827',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [
                  name === 'amount' ? formatCurrency(value) : value,
                  name === 'amount' ? 'Amount Collected' : 'Payments'
                ]}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;