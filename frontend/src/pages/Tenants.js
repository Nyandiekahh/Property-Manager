import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { formatCurrency, formatDate, getPaymentStatusColor, getInitials } from '../utils/helpers';
import TenantModal from '../components/tenant/TenantModal';

const Tenants = () => {
  const [tenants, setTenants] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+254701234567',
      property: 'Sunset Apartments',
      unit: '#201',
      rentAmount: 25000,
      moveInDate: '2024-01-15',
      paymentStatus: 'paid',
      lastPaymentDate: '2024-06-01',
      avatar: null
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+254707654321',
      property: 'Garden View Condos',
      unit: '#105',
      rentAmount: 18000,
      moveInDate: '2024-03-10',
      paymentStatus: 'pending',
      lastPaymentDate: '2024-05-01',
      avatar: null
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+254712345678',
      property: 'City Center Plaza',
      unit: '#302',
      rentAmount: 32000,
      moveInDate: '2023-11-20',
      paymentStatus: 'overdue',
      lastPaymentDate: '2024-04-28',
      avatar: null
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+254723456789',
      property: 'Oceanview Heights',
      unit: '#404',
      rentAmount: 28000,
      moveInDate: '2024-02-05',
      paymentStatus: 'partial',
      lastPaymentDate: '2024-06-10',
      avatar: null
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleAddTenant = () => {
    setSelectedTenant(null);
    setShowModal(true);
  };

  const handleEditTenant = (tenant) => {
    setSelectedTenant(tenant);
    setShowModal(true);
  };

  const handleDeleteTenant = (tenantId) => {
    if (window.confirm('Are you sure you want to remove this tenant?')) {
      setTenants(tenants.filter(t => t.id !== tenantId));
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.property.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || tenant.paymentStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const statusCounts = {
    all: tenants.length,
    paid: tenants.filter(t => t.paymentStatus === 'paid').length,
    pending: tenants.filter(t => t.paymentStatus === 'pending').length,
    overdue: tenants.filter(t => t.paymentStatus === 'overdue').length,
    partial: tenants.filter(t => t.paymentStatus === 'partial').length
  };

  const totalRent = tenants.reduce((sum, t) => sum + t.rentAmount, 0);

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
          <h1 className="text-3xl font-bold text-white mb-2">Tenants</h1>
          <p className="text-white/60">Manage your tenant relationships</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddTenant}
          className="btn btn-primary mt-4 md:mt-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Tenant
        </motion.button>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Tenants', value: tenants.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
          { label: 'Paid', value: statusCounts.paid, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
          { label: 'Pending', value: statusCounts.pending, icon: Clock, color: 'from-yellow-500 to-orange-500' },
          { label: 'Overdue', value: statusCounts.overdue, icon: AlertCircle, color: 'from-red-500 to-pink-500' },
          { label: 'Total Monthly Rent', value: formatCurrency(totalRent), icon: DollarSign, color: 'from-purple-500 to-indigo-500' }
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs">{stat.label}</p>
                  <p className="text-lg font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search and Filter */}
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
            placeholder="Search tenants..."
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
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
        </select>
      </motion.div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTenants.map((tenant, index) => (
          <motion.div
            key={tenant.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="card hover:glow-primary group"
          >
            {/* Tenant Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                  {tenant.avatar ? (
                    <img src={tenant.avatar} alt={tenant.name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <span className="text-white font-semibold">
                      {getInitials(tenant.name)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{tenant.name}</h3>
                  <p className="text-white/60 text-sm">{tenant.property} {tenant.unit}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEditTenant(tenant)}
                  className="p-2 glass rounded-lg hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteTenant(tenant.id)}
                  className="p-2 glass rounded-lg hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </motion.button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-white/60 text-sm">
                <Mail className="w-4 h-4 mr-2" />
                {tenant.email}
              </div>
              <div className="flex items-center text-white/60 text-sm">
                <Phone className="w-4 h-4 mr-2" />
                {tenant.phone}
              </div>
              <div className="flex items-center text-white/60 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Moved in {formatDate(tenant.moveInDate)}
              </div>
            </div>

            {/* Payment Info */}
            <div className="glass p-3 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Monthly Rent</span>
                <span className="text-white font-semibold">{formatCurrency(tenant.rentAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(tenant.paymentStatus)}
                  <span className={`text-sm font-medium capitalize ${
                    tenant.paymentStatus === 'paid' ? 'text-green-400' :
                    tenant.paymentStatus === 'pending' ? 'text-yellow-400' :
                    tenant.paymentStatus === 'overdue' ? 'text-red-400' :
                    'text-blue-400'
                  }`}>
                    {tenant.paymentStatus}
                  </span>
                </div>
                <span className="text-white/60 text-xs">
                  Last: {formatDate(tenant.lastPaymentDate, 'MMM dd')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 btn btn-secondary text-sm"
              >
                <Mail className="w-4 h-4 mr-1" />
                Send Reminder
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 btn btn-primary text-sm"
              >
                View Details
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tenant Modal */}
      {showModal && (
        <TenantModal
          tenant={selectedTenant}
          onClose={() => setShowModal(false)}
          onSave={(tenantData) => {
            if (selectedTenant) {
              // Update existing tenant
              setTenants(tenants.map(t => 
                t.id === selectedTenant.id ? { ...t, ...tenantData } : t
              ));
            } else {
              // Add new tenant
              const newTenant = {
                id: Date.now(),
                ...tenantData,
                paymentStatus: 'pending',
                lastPaymentDate: null
              };
              setTenants([...tenants, newTenant]);
            }
            setShowModal(false);
          }}
        />
      )}
    </motion.div>
  );
};

export default Tenants;