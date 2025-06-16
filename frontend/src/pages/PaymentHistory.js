import React, { useState } from 'react';
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
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency, formatDate, getPaymentStatusColor } from '../utils/helpers';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([
    {
      id: 1,
      tenant: 'John Doe',
      property: 'Sunset Apartments',
      unit: '#201',
      amount: 25000,
      date: '2024-06-14',
      status: 'completed',
      method: 'M-Pesa',
      transactionId: 'MP240614001',
      reference: 'RENT-JUN-2024'
    },
    {
      id: 2,
      tenant: 'Jane Smith',
      property: 'Garden View Condos',
      unit: '#105',
      amount: 18000,
      date: '2024-06-13',
      status: 'completed',
      method: 'M-Pesa',
      transactionId: 'MP240613002',
      reference: 'RENT-JUN-2024'
    },
    {
      id: 3,
      tenant: 'Sarah Wilson',
      property: 'Oceanview Heights',
      unit: '#404',
      amount: 28000,
      date: '2024-06-12',
      status: 'completed',
      method: 'M-Pesa',
      transactionId: 'MP240612003',
      reference: 'RENT-JUN-2024'
    },
    {
      id: 4,
      tenant: 'Mike Johnson',
      property: 'City Center Plaza',
      unit: '#302',
      amount: 15000,
      date: '2024-06-10',
      status: 'completed',
      method: 'M-Pesa',
      transactionId: 'MP240610004',
      reference: 'PARTIAL-JUN-2024'
    },
    {
      id: 5,
      tenant: 'David Brown',
      property: 'Mountain View',
      unit: '#201',
      amount: 22000,
      date: '2024-06-08',
      status: 'completed',
      method: 'M-Pesa',
      transactionId: 'MP240608005',
      reference: 'RENT-JUN-2024'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    const paymentDate = new Date(payment.date);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    
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
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const completedPayments = filteredPayments.filter(p => p.status === 'completed').length;
  const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length;

  // Mock analytics data
  const analytics = {
    thisMonth: 245000,
    lastMonth: 220000,
    avgPaymentTime: 2.5,
    successRate: 96.2
  };

  const growthRate = ((analytics.thisMonth - analytics.lastMonth) / analytics.lastMonth * 100).toFixed(1);

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
          <h1 className="text-3xl font-bold text-white mb-2">Payment History</h1>
          <p className="text-white/60">Track all rent payments and transactions</p>
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
            value: formatCurrency(analytics.thisMonth), 
            icon: DollarSign, 
            color: 'from-green-500 to-emerald-500',
            change: `+${growthRate}%`,
            isPositive: true
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
            value: `${analytics.successRate}%`, 
            icon: TrendingUp, 
            color: 'from-purple-500 to-pink-500',
            change: '+2.1% vs last month',
            isPositive: true
          },
          { 
            label: 'Avg Payment Time', 
            value: `${analytics.avgPaymentTime} days`, 
            icon: Clock, 
            color: 'from-orange-500 to-red-500',
            change: '-0.5 days improved',
            isPositive: true
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
                  stat.isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.isPositive ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-white/60 text-sm">{stat.label}</p>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
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
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Recent Payments</h2>
          <p className="text-white/60 text-sm mt-1">
            Showing {filteredPayments.length} payments
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white/80 font-medium">Tenant</th>
                <th className="text-left p-4 text-white/80 font-medium">Property</th>
                <th className="text-left p-4 text-white/80 font-medium">Amount</th>
                <th className="text-left p-4 text-white/80 font-medium">Date</th>
                <th className="text-left p-4 text-white/80 font-medium">Status</th>
                <th className="text-left p-4 text-white/80 font-medium">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, index) => (
                <motion.tr
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedPayment(payment)}
                >
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{payment.tenant}</p>
                      <p className="text-white/60 text-sm">{payment.unit}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-white">{payment.property}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-white font-semibold">{formatCurrency(payment.amount)}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-white">{formatDate(payment.date)}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <span className={`text-sm font-medium capitalize ${
                        payment.status === 'completed' ? 'text-green-400' :
                        payment.status === 'pending' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-white/80 font-mono text-sm">{payment.transactionId}</p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">No payments found matching your criteria</p>
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
              <h3 className="text-xl font-bold text-white mb-4">Payment Details</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/60">Tenant:</span>
                  <span className="text-white">{selectedPayment.tenant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Property:</span>
                  <span className="text-white">{selectedPayment.property} {selectedPayment.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Amount:</span>
                  <span className="text-white font-semibold">{formatCurrency(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Date:</span>
                  <span className="text-white">{formatDate(selectedPayment.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Method:</span>
                  <span className="text-white">{selectedPayment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Transaction ID:</span>
                  <span className="text-white font-mono text-sm">{selectedPayment.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Reference:</span>
                  <span className="text-white">{selectedPayment.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Status:</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedPayment.status)}
                    <span className={`text-sm font-medium capitalize ${
                      selectedPayment.status === 'completed' ? 'text-green-400' :
                      selectedPayment.status === 'pending' ? 'text-yellow-400' :
                      'text-red-400'
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