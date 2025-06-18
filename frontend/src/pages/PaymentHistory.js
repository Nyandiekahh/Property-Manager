import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Download, 
  Filter, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  X,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// CHANGED: Import API services instead of direct Firestore
import { 
  enhancedPaymentAPI, 
  paymentAPI 
} from '../services/enhancedApiService';
import { formatCurrency, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const PaymentHistory = () => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);

  // FIXED: Safe date handling function
  const safeCreateDate = (dateValue) => {
    try {
      if (!dateValue) return new Date();
      
      // Handle different date formats from API
      if (dateValue.seconds) {
        // Firestore timestamp format
        return new Date(dateValue.seconds * 1000);
      } else if (dateValue._seconds) {
        // Alternative Firestore timestamp format (from your API data)
        return new Date(dateValue._seconds * 1000);
      } else if (typeof dateValue === 'string') {
        // ISO string format
        return new Date(dateValue);
      } else if (dateValue instanceof Date) {
        // Already a Date object
        return dateValue;
      } else {
        // Fallback to current date
        console.warn('Unknown date format:', dateValue);
        return new Date();
      }
    } catch (error) {
      console.error('Error creating date from:', dateValue, error);
      return new Date();
    }
  };

  useEffect(() => {
    loadPayments();
  }, [currentUser]);

  // CHANGED: Use API instead of direct Firestore
  const loadPayments = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Try enhanced payments API first, fallback to regular payments
      let paymentsResponse;
      try {
        paymentsResponse = await enhancedPaymentAPI.getRecentPayments(currentUser.uid, { limit: 100 });
      } catch (enhancedError) {
        console.log('Enhanced payments not available, using regular payments API');
        paymentsResponse = await paymentAPI.getPayments(currentUser.uid);
      }
      
      if (paymentsResponse.success) {
        const paymentsData = paymentsResponse.data || [];
        console.log('📊 Loaded payments:', paymentsData);
        setPayments(paymentsData);
        
        // Calculate payment statistics
        const stats = calculatePaymentStats(paymentsData);
        setPaymentStats(stats);
      } else {
        console.error('Failed to load payments:', paymentsResponse.error);
        setPayments([]);
        setPaymentStats(null);
        toast.error('Failed to load payment history');
      }
      
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payment history');
      // Set empty data to prevent crashes
      setPayments([]);
      setPaymentStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Replace the calculatePaymentStats function in your PaymentHistory.js with this debug version

const calculatePaymentStats = (paymentsData) => {
  console.log('🔍 Raw payments data:', paymentsData);
  
  const thisMonth = new Date();
  const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
  const firstDayOfThisMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);

  console.log('📅 Date ranges:', {
    thisMonth: thisMonth.toISOString(),
    firstDayOfThisMonth: firstDayOfThisMonth.toISOString(),
    lastMonth: lastMonth.toISOString()
  });

  // Debug each payment
  paymentsData.forEach((payment, index) => {
    const paymentDate = safeCreateDate(payment.createdAt);
    console.log(`💰 Payment ${index + 1}:`, {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      createdAt: payment.createdAt,
      parsedDate: paymentDate.toISOString(),
      isThisMonth: paymentDate >= firstDayOfThisMonth,
      isCompleted: payment.status === 'completed'
    });
  });

  const thisMonthPayments = paymentsData.filter(p => {
    const paymentDate = safeCreateDate(p.createdAt);
    const isThisMonth = paymentDate >= firstDayOfThisMonth;
    const isCompleted = p.status === 'completed';
    console.log(`🗓️ This month filter - Payment ${p.id}:`, { isThisMonth, isCompleted });
    return isThisMonth && isCompleted;
  });

  const lastMonthPayments = paymentsData.filter(p => {
    const paymentDate = safeCreateDate(p.createdAt);
    return paymentDate >= lastMonth && paymentDate < firstDayOfThisMonth && p.status === 'completed';
  });

  const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const lastMonthTotal = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const growthRate = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : 
                    thisMonthTotal > 0 ? 100 : 0; // If no last month data but this month has data, show 100%
  
  // Check all possible status values
  const statusCounts = {};
  paymentsData.forEach(p => {
    const status = p.status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  console.log('📊 Status breakdown:', statusCounts);
  
  const completedPayments = paymentsData.filter(p => p.status === 'completed').length;
  const successRate = paymentsData.length > 0 ? ((completedPayments / paymentsData.length) * 100).toFixed(1) : 0;

  const stats = {
    thisMonthTotal,
    lastMonthTotal,
    growthRate,
    successRate,
    completedPayments,
    pendingPayments: paymentsData.filter(p => p.status === 'pending').length,
    failedPayments: paymentsData.filter(p => p.status === 'failed').length,
    totalAmount: paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  console.log('📊 Final Payment Stats:', stats);
  console.log('🔢 Success Rate Calculation:', {
    completedPayments,
    totalPayments: paymentsData.length,
    calculation: `${completedPayments}/${paymentsData.length} * 100 = ${successRate}%`
  });

  return stats;
};

  // CHANGED: Refresh function using API
  const handleRefresh = async () => {
    toast.promise(
      loadPayments(),
      {
        loading: 'Refreshing payment history...',
        success: 'Payment history updated!',
        error: 'Failed to refresh payments'
      }
    );
  };

  // FIXED: Filter payments with safe date handling
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.mpesaReceiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.tenantName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    const paymentDate = safeCreateDate(payment.createdAt);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    let matchesPeriod = true;
    if (filterPeriod === 'week') {
      matchesPeriod = paymentDate >= sevenDaysAgo;
    } else if (filterPeriod === 'month') {
      matchesPeriod = paymentDate >= thirtyDaysAgo;
    }
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPaymentTypeInfo = (payment) => {
    if (payment.paymentType) {
      switch (payment.paymentType) {
        case 'overpayment':
          return { 
            label: 'Overpaid', 
            color: 'bg-blue-100 text-blue-700',
            icon: <ArrowUpRight className="w-3 h-3" />
          };
        case 'underpayment':
          return { 
            label: 'Underpaid', 
            color: 'bg-orange-100 text-orange-700',
            icon: <ArrowDownRight className="w-3 h-3" />
          };
        case 'exact':
        default:
          return { 
            label: 'Exact', 
            color: 'bg-green-100 text-green-700',
            icon: <CheckCircle className="w-3 h-3" />
          };
      }
    }
    return null;
  };

  // Use calculated stats or fallback calculations
  const stats = paymentStats || {
    thisMonthTotal: 0,
    growthRate: 0,
    successRate: 0,
    completedPayments: filteredPayments.filter(p => p.status === 'completed').length,
    pendingPayments: filteredPayments.filter(p => p.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Enhanced Payment History</h1>
              <p className="text-sm text-gray-600">Track M-Pesa payments with smart categorization</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh Payments"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
              <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { 
              label: 'This Month', 
              value: formatCurrency(stats.thisMonthTotal), 
              icon: DollarSign, 
              color: 'text-green-600',
              bgColor: 'bg-green-50',
              change: `${stats.growthRate > 0 ? '+' : ''}${stats.growthRate}%`,
              isPositive: parseFloat(stats.growthRate) >= 0
            },
            { 
              label: 'Total Payments', 
              value: filteredPayments.length, 
              icon: CreditCard, 
              color: 'text-blue-600',
              bgColor: 'bg-blue-50',
              change: `${stats.completedPayments} completed`,
              isPositive: true
            },
            { 
              label: 'Success Rate', 
              value: `${stats.successRate}%`, 
              icon: TrendingUp, 
              color: 'text-purple-600',
              bgColor: 'bg-purple-50',
              change: 'All time average',
              isPositive: true
            },
            { 
              label: 'Pending', 
              value: stats.pendingPayments, 
              icon: Clock, 
              color: 'text-orange-600',
              bgColor: 'bg-orange-50',
              change: 'Awaiting completion',
              isPositive: false
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center text-xs font-medium ${
                    stat.isPositive ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {stat.isPositive && parseFloat(stat.change) !== 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : null}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search payments, accounts, or receipt numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 md:w-40"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 md:w-40"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </motion.div>

        {/* Payments Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment Transactions</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredPayments.length} payments • Total: {formatCurrency(filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0))}
            </p>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">
                {payments.length === 0 
                  ? "Payment history will appear here once tenants start paying through M-Pesa" 
                  : "No payments match your search criteria"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-gray-700 font-medium">Tenant & Description</th>
                    <th className="text-left p-4 text-gray-700 font-medium">Account</th>
                    <th className="text-left p-4 text-gray-700 font-medium">Amount</th>
                    <th className="text-left p-4 text-gray-700 font-medium">Date</th>
                    <th className="text-left p-4 text-gray-700 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-700 font-medium">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment, index) => {
                    const paymentTypeInfo = getPaymentTypeInfo(payment);
                    return (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <td className="p-4">
                          <div>
                            <p className="text-gray-900 font-medium">
                              {payment.tenantName || payment.description || 'Rent Payment'}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-gray-500 text-sm">{payment.method || 'M-Pesa'}</p>
                              {paymentTypeInfo && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentTypeInfo.color} flex items-center space-x-1`}>
                                  {paymentTypeInfo.icon}
                                  <span>{paymentTypeInfo.label}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-900 font-mono text-sm">
                            {payment.accountNumber || payment.phoneNumber || '-'}
                          </p>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-gray-900 font-semibold">
                              {formatCurrency(payment.amount || 0)}
                            </p>
                            {payment.expectedAmount && payment.expectedAmount !== payment.amount && (
                              <p className="text-gray-500 text-xs">
                                Expected: {formatCurrency(payment.expectedAmount)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-gray-900">
                              {formatDate(safeCreateDate(payment.createdAt))}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {safeCreateDate(payment.createdAt).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(payment.status)}
                            <span className={`text-sm font-medium capitalize ${
                              payment.status === 'completed' ? 'text-green-500' :
                              payment.status === 'pending' ? 'text-yellow-500' :
                              'text-red-500'
                            }`}>
                              {payment.status || 'pending'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-600 font-mono text-sm">
                            {payment.mpesaReceiptNumber || payment.transactionId || '-'}
                          </p>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Enhanced Payment Detail Modal */}
      {selectedPayment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPayment(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Payment Details</h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tenant:</span>
                  <span className="text-gray-900 font-medium">
                    {selectedPayment.tenantName || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="text-gray-900 font-medium">
                    {selectedPayment.description || 'Rent Payment'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account:</span>
                  <span className="text-gray-900 font-mono text-sm">
                    {selectedPayment.accountNumber || selectedPayment.phoneNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-gray-900 font-semibold">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
                {selectedPayment.expectedAmount && selectedPayment.expectedAmount !== selectedPayment.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected:</span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(selectedPayment.expectedAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <div className="text-right">
                    <span className="text-gray-900 block">
                      {formatDate(safeCreateDate(selectedPayment.createdAt))}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {safeCreateDate(selectedPayment.createdAt).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="text-gray-900">{selectedPayment.method || 'M-Pesa'}</span>
                </div>
                {selectedPayment.mpesaReceiptNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receipt:</span>
                    <span className="text-gray-900 font-mono text-sm">
                      {selectedPayment.mpesaReceiptNumber}
                    </span>
                  </div>
                )}
                {selectedPayment.paymentType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPayment.paymentType === 'overpayment' ? 'bg-blue-100 text-blue-700' :
                      selectedPayment.paymentType === 'underpayment' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {selectedPayment.paymentType === 'overpayment' ? 'Overpaid' :
                       selectedPayment.paymentType === 'underpayment' ? 'Underpaid' : 'Exact Payment'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedPayment.status)}
                    <span className={`text-sm font-medium capitalize ${
                      selectedPayment.status === 'completed' ? 'text-green-500' :
                      selectedPayment.status === 'pending' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Receipt</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PaymentHistory;