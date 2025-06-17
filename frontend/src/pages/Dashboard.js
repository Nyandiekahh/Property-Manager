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
import { analyticsService, subscribeToPayments } from '../services/firestoreService';
import { formatCurrency, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

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
    const loadDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const data = await analyticsService.getDashboardData(currentUser.uid);
        setDashboardData(data);
        setRecentPayments(data.recentPayments || []);
        
        const trends = processPaymentTrends(data.recentPayments || []);
        setPaymentTrends(trends);
        
        const distribution = processPaymentDistribution(data.recentPayments || []);
        setPaymentDistribution(distribution);
        
        loadNotifications(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    const loadNotifications = (data) => {
      const alerts = [];
      
      if (data.overduePayments > 0) {
        alerts.push({
          type: 'warning',
          title: 'Overdue Payments',
          message: `${data.overduePayments} tenant(s) have overdue payments`
        });
      }
      
      if (data.partialPayments > 0) {
        alerts.push({
          type: 'info',
          title: 'Partial Payments',
          message: `${data.partialPayments} tenant(s) have made partial payments`
        });
      }
      
      if (data.pendingPayments > 0) {
        alerts.push({
          type: 'info',
          title: 'Pending Payments',
          message: `${data.pendingPayments} payment(s) awaiting processing`
        });
      }
      
      setNotifications(alerts);
    };

    loadDashboardData();

    const unsubscribe = subscribeToPayments(currentUser?.uid, (payments) => {
      setRecentPayments(payments.slice(0, 5));
      const trends = processPaymentTrends(payments);
      setPaymentTrends(trends);
      const distribution = processPaymentDistribution(payments);
      setPaymentDistribution(distribution);
      loadDashboardData();
    });

    return () => unsubscribe && unsubscribe();
  }, [currentUser]);

  const processPaymentTrends = (payments) => {
    const monthlyData = {};
    const now = new Date();
    
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
    
    payments.forEach(payment => {
      const paymentDate = payment.createdAt?.seconds ? 
        new Date(payment.createdAt.seconds * 1000) : 
        new Date(payment.createdAt);
      const monthKey = paymentDate.toISOString().slice(0, 7);
      
      if (monthlyData[monthKey] && payment.status === 'completed') {
        monthlyData[monthKey].collected += payment.amount || 0;
        monthlyData[monthKey].revenue += payment.expectedAmount || payment.amount || 0;
      }
    });
    
    Object.keys(monthlyData).forEach(monthKey => {
      const data = monthlyData[monthKey];
      data.target = data.revenue || data.collected * 1.1;
    });
    
    return Object.values(monthlyData);
  };

  const processPaymentDistribution = (payments) => {
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
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Please add properties and tenants to see analytics</p>
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
                <h1 className="text-xl font-semibold text-gray-900">Portfolio Analytics</h1>
                <p className="text-sm text-gray-600">Real-time performance insights</p>
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
                onClick={() => window.location.reload()}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trends */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue & Collection Trends</h3>
                <p className="text-sm text-gray-600">Monthly performance analysis</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 font-medium">Target</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-gray-600 font-medium">Collected</span>
                </div>
              </div>
            </div>
            
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
          </div>

          {/* Payment Distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Types</h3>
                <p className="text-sm text-gray-600">Distribution analysis</p>
              </div>
            </div>
            
            {paymentDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <RechartsPieChart>
                    <Pie
                      data={paymentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      dataKey="percentage"
                    >
                      {paymentDistribution.map((entry, index) => (
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
                  </RechartsPieChart>
                </ResponsiveContainer>
                
                <div className="space-y-3 mt-4">
                  {paymentDistribution.map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></div>
                        <span className="text-gray-700 text-sm font-medium">{type.type}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 font-semibold text-sm">{type.percentage}%</p>
                        <p className="text-gray-500 text-xs">{type.count} payments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No payment data available</p>
                <p className="text-gray-400 text-sm">Start collecting payments to see distribution</p>
              </div>
            )}
          </div>
        </div>

        {/* Properties & Recent Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Overview */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Property Overview</h3>
                <p className="text-sm text-gray-600">Your properties at a glance</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            
            {dashboardData.properties && dashboardData.properties.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.properties.slice(0, 4).map((property) => (
                  <div key={property.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{property.name}</p>
                          <p className="text-gray-500 text-xs">{property.totalUnits || property.units || 0} units</p>
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

          {/* Recent Payments */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
                <p className="text-sm text-gray-600">Latest transactions</p>
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
                          {payment.description || 'Rent Payment'}
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
                        <p className="text-gray-600 text-sm font-semibold">{formatCurrency(payment.amount || 0)}</p>
                        <p className="text-gray-400 text-xs">
                          {payment.createdAt?.seconds ? 
                            formatDate(new Date(payment.createdAt.seconds * 1000)) : 
                            formatDate(new Date(payment.createdAt || new Date()))
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No recent payments</p>
                <p className="text-gray-400 text-sm">Payments will appear here once tenants start paying</p>
              </div>
            )}
            
            <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 text-sm py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              View All Payments
            </button>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Performance Summary</h2>
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