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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { paymentService, subscribeToPayments } from '../services/firestoreService';
import { formatCurrency, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PaymentHistory = () => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    loadPayments();

    // Subscribe to real-time payment updates
    const unsubscribe = subscribeToPayments(currentUser?.uid, (paymentsData) => {
      setPayments(paymentsData);
    });

    return () => unsubscribe && unsubscribe();
  }, [currentUser]);

  const loadPayments = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const data = await paymentService.getPayments(currentUser.uid);
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.mpesaReceiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    const paymentDate = payment.createdAt?.seconds ? 
      new Date(payment.createdAt.seconds * 1000) : new Date(payment.createdAt);
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

  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const completedPayments = filteredPayments.filter(p => p.status === 'completed').length;
  const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length;

  // Calculate analytics
  const thisMonth = new Date();
  const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
  const firstDayOfThisMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);

  const thisMonthPayments = payments.filter(p => {
    const paymentDate = p.createdAt?.seconds ? 
      new Date(p.createdAt.seconds * 1000) : new Date(p.createdAt);
    return paymentDate >= firstDayOfThisMonth && p.status === 'completed';
  });

  const lastMonthPayments = payments.filter(p => {
    const paymentDate = p.createdAt?.seconds ? 
      new Date(p.createdAt.seconds * 1000) : new Date(p.createdAt);
    return paymentDate >= lastMonth && paymentDate < firstDayOfThisMonth && p.status === 'completed';
  });

  const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const lastMonthTotal = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const growthRate = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : 0;
  const successRate = payments.length > 0 ? ((completedPayments / payments.length) * 100).toFixed(1) : 0;

  if (loading) {
    return <LoadingSpinner text="Loading payment history..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment History</h1>
          <p className="text-slate-600">Track all rent payments and transactions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary mt-4 md:mt-0"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </motion.button>
      </motion.div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'This Month', 
            value: formatCurrency(thisMonthTotal), 
            icon: DollarSign, 
            color: 'from-green-500 to-emerald-500',
            change: `${growthRate > 0 ? '+' : ''}${growthRate}%`,
            isPositive: parseFloat(growthRate) >= 0
          },
          { 
            label: 'Total Payments', 
            value: filteredPayments.length, 
            icon: CreditCard, 
            color: 'from-blue-500 to-cyan-500',
            change: `${completedPayments} completed`,
            isPositive: true
          },
          { 
            label: 'Success Rate', 
            value: `${successRate}%`, 
            icon: TrendingUp, 
            color: 'from-purple-500 to-pink-500',
            change: 'All time average',
            isPositive: true
          },
          { 
            label: 'Pending', 
            value: pendingPayments, 
            icon: Clock, 
            color: 'from-orange-500 to-red-500',
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
              className="card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center text-xs font-medium ${
                  stat.isPositive ? 'text-green-600' : 'text-slate-500'
                }`}>
                  {stat.isPositive && parseFloat(stat.change) !== 0 ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : null}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-slate-600 text-sm">{stat.label}</p>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input md:w-40"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="input md:w-40"
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
        className="card overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Recent Payments</h2>
          <p className="text-slate-600 text-sm mt-1">
            Showing {filteredPayments.length} payments
          </p>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No payments found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 text-slate-700 font-medium">Description</th>
                  <th className="text-left p-4 text-slate-700 font-medium">Account</th>
                  <th className="text-left p-4 text-slate-700 font-medium">Amount</th>
                  <th className="text-left p-4 text-slate-700 font-medium">Date</th>
                  <th className="text-left p-4 text-slate-700 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-700 font-medium">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <td className="p-4">
                      <div>
                        <p className="text-slate-900 font-medium">
                          {payment.description || 'Rent Payment'}
                        </p>
                        <p className="text-slate-500 text-sm">{payment.method || 'M-Pesa'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-900 font-mono text-sm">
                        {payment.accountNumber || '-'}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-900 font-semibold">
                        {formatCurrency(payment.amount || 0)}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-900">
                        {payment.createdAt?.seconds ? 
                          formatDate(new Date(payment.createdAt.seconds * 1000)) :
                          formatDate(new Date(payment.createdAt || new Date()))
                        }
                      </p>
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
                      <p className="text-slate-600 font-mono text-sm">
                        {payment.mpesaReceiptNumber || '-'}
                      </p>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Payment Detail Modal */}
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
            className="glass-strong max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Payment Details</h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Description:</span>
                  <span className="text-slate-900 font-medium">
                    {selectedPayment.description || 'Rent Payment'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Account:</span>
                  <span className="text-slate-900 font-mono text-sm">
                    {selectedPayment.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount:</span>
                  <span className="text-slate-900 font-semibold">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Date:</span>
                  <span className="text-slate-900">
                    {selectedPayment.createdAt?.seconds ? 
                      formatDate(new Date(selectedPayment.createdAt.seconds * 1000)) :
                      formatDate(new Date(selectedPayment.createdAt))
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Method:</span>
                  <span className="text-slate-900">{selectedPayment.method || 'M-Pesa'}</span>
                </div>
                {selectedPayment.mpesaReceiptNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Receipt:</span>
                    <span className="text-slate-900 font-mono text-sm">
                      {selectedPayment.mpesaReceiptNumber}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
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
                  className="flex-1 btn btn-secondary"
                >
                  Close
                </button>
                <button className="flex-1 btn btn-primary">
                  <Download className="w-4 h-4 mr-2" />
                  Receipt
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