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
  CheckCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 12,
    totalTenants: 48,
    monthlyRevenue: 245000,
    pendingPayments: 8,
    revenueChange: 12.5,
    occupancyRate: 92.3
  });

  const [recentPayments, setRecentPayments] = useState([
    {
      id: 1,
      tenant: 'John Doe',
      property: 'Sunset Apartments #201',
      amount: 25000,
      date: '2024-06-14',
      status: 'completed'
    },
    {
      id: 2,
      tenant: 'Jane Smith',
      property: 'Garden View #105',
      amount: 18000,
      date: '2024-06-13',
      status: 'completed'
    },
    {
      id: 3,
      tenant: 'Mike Johnson',
      property: 'City Center #302',
      amount: 32000,
      date: '2024-06-12',
      status: 'pending'
    }
  ]);

  const [upcomingRents, setUpcomingRents] = useState([
    {
      id: 1,
      tenant: 'Sarah Wilson',
      property: 'Oceanview #404',
      amount: 28000,
      dueDate: '2024-06-20',
      status: 'due'
    },
    {
      id: 2,
      tenant: 'David Brown',
      property: 'Mountain View #201',
      amount: 22000,
      dueDate: '2024-06-22',
      status: 'upcoming'
    }
  ]);

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: Building2,
      color: 'from-blue-500 to-cyan-500',
      change: '+2 this month'
    },
    {
      title: 'Total Tenants',
      value: stats.totalTenants,
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      change: '+5 this month'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500',
      change: `+${stats.revenueChange}%`
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500',
      change: '-3 from last week'
    }
  ];

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
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/60">Welcome back! Here's what's happening with your properties.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="glass px-4 py-2 rounded-xl">
            <p className="text-white/60 text-sm">Today</p>
            <p className="text-white font-semibold">{formatDate(new Date(), 'EEEE, MMM dd')}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
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
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-green-400">{stat.change}</p>
                </div>
              </div>
              <h3 className="text-white/80 font-medium">{stat.title}</h3>
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
            <h2 className="text-xl font-bold text-white">Recent Payments</h2>
            <button className="btn btn-secondary text-sm">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-4 glass rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    payment.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {payment.status === 'completed' ? 
                      <CheckCircle className="w-5 h-5" /> : 
                      <AlertCircle className="w-5 h-5" />
                    }
                  </div>
                  <div>
                    <p className="text-white font-medium">{payment.tenant}</p>
                    <p className="text-white/60 text-sm">{payment.property}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{formatCurrency(payment.amount)}</p>
                  <p className="text-white/60 text-sm">{formatDate(payment.date)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Rents */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Upcoming Rents</h2>
            <Calendar className="w-5 h-5 text-white/60" />
          </div>
          
          <div className="space-y-4">
            {upcomingRents.map((rent, index) => (
              <motion.div
                key={rent.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-4 glass rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">{rent.tenant}</p>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    rent.status === 'due' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {rent.status}
                  </span>
                </div>
                <p className="text-white/60 text-sm mb-2">{rent.property}</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">{formatCurrency(rent.amount)}</p>
                  <p className="text-white/60 text-sm">Due {formatDate(rent.dueDate, 'MMM dd')}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary w-full mt-4"
          >
            Send Reminders
          </motion.button>
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
          <h2 className="text-xl font-bold text-white">Performance Overview</h2>
          <div className="flex items-center space-x-2">
            <button className="btn btn-secondary text-sm">This Month</button>
            <button className="btn btn-secondary text-sm">This Year</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stats.occupancyRate}%</p>
            <p className="text-white/60">Occupancy Rate</p>
            <div className="flex items-center justify-center mt-2">
              <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 text-sm">+2.3%</span>
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{formatCurrency(stats.monthlyRevenue * 12)}</p>
            <p className="text-white/60">Annual Revenue</p>
            <div className="flex items-center justify-center mt-2">
              <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 text-sm">+{stats.revenueChange}%</span>
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-success rounded-xl mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">96.2%</p>
            <p className="text-white/60">Payment Success Rate</p>
            <div className="flex items-center justify-center mt-2">
              <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 text-sm">+1.8%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;