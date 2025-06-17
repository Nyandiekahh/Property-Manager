import React, { useState, useEffect } from 'react';
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
  Clock,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tenantService, propertyService } from '../services/firestoreService';
import { formatCurrency, formatDate, getInitials } from '../utils/helpers';
import TenantModal from '../components/tenant/TenantModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Tenants = () => {
  const { currentUser } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const [tenantsData, propertiesData] = await Promise.all([
        tenantService.getTenants(currentUser.uid),
        propertyService.getProperties(currentUser.uid)
      ]);
      setTenants(tenantsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTenant = () => {
    setSelectedTenant(null);
    setShowModal(true);
  };

  const handleEditTenant = (tenant) => {
    setSelectedTenant(tenant);
    setShowModal(true);
  };

  const handleDeleteTenant = async (tenantId) => {
    if (window.confirm('Are you sure you want to remove this tenant?')) {
      try {
        await tenantService.deleteTenant(tenantId);
        setTenants(tenants.filter(t => t.id !== tenantId));
        toast.success('Tenant removed successfully');
      } catch (error) {
        console.error('Error deleting tenant:', error);
        toast.error('Failed to remove tenant');
      }
    }
  };

  const handleSaveTenant = async (tenantData) => {
    try {
      if (selectedTenant) {
        await tenantService.updateTenant(selectedTenant.id, tenantData);
        setTenants(tenants.map(t => 
          t.id === selectedTenant.id ? { ...t, ...tenantData } : t
        ));
        toast.success('Tenant updated successfully');
      } else {
        const newTenantId = await tenantService.createTenant(tenantData, currentUser.uid);
        const newTenant = {
          id: newTenantId,
          ...tenantData,
          landlordId: currentUser.uid,
          paymentStatus: 'pending',
          lastPaymentDate: null,
          createdAt: new Date()
        };
        setTenants([newTenant, ...tenants]);
        toast.success('Tenant added successfully');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving tenant:', error);
      toast.error('Failed to save tenant');
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.property?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || tenant.paymentStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  const statusCounts = {
    all: tenants.length,
    paid: tenants.filter(t => t.paymentStatus === 'paid').length,
    pending: tenants.filter(t => t.paymentStatus === 'pending').length,
    overdue: tenants.filter(t => t.paymentStatus === 'overdue').length,
    partial: tenants.filter(t => t.paymentStatus === 'partial').length
  };

  const totalRent = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading tenants...</p>
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
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Tenants</h1>
              <p className="text-sm text-gray-600">Manage your tenant relationships</p>
            </div>
            <button
              onClick={handleAddTenant}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tenant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Tenants', value: tenants.length, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
            { label: 'Paid', value: statusCounts.paid, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
            { label: 'Pending', value: statusCounts.pending, icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
            { label: 'Overdue', value: statusCounts.overdue, icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
            { label: 'Total Monthly Rent', value: formatCurrency(totalRent), icon: DollarSign, color: 'text-purple-600', bgColor: 'bg-purple-50' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs font-medium">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
          </select>
        </div>

        {/* Tenants Grid */}
        {filteredTenants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenants found</h3>
            <p className="text-gray-600 mb-6">
              {tenants.length === 0 
                ? "Get started by adding your first tenant" 
                : "No tenants match your search criteria"}
            </p>
            {tenants.length === 0 && (
              <button
                onClick={handleAddTenant}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Tenant</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTenants.map((tenant, index) => (
              <motion.div
                key={tenant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Tenant Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      {tenant.avatar ? (
                        <img src={tenant.avatar} alt={tenant.name} className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <span className="text-blue-600 font-semibold">
                          {getInitials(tenant.name || 'T')}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold">{tenant.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {getPropertyName(tenant.propertyId)} {tenant.unit ? `• ${tenant.unit}` : ''}
                      </p>
                      {tenant.accountNumber && (
                        <p className="text-gray-500 text-xs font-mono">
                          Account: {tenant.accountNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditTenant(tenant)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTenant(tenant.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {tenant.email && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <Mail className="w-4 h-4 mr-2" />
                      {tenant.email}
                    </div>
                  )}
                  {tenant.phone && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <Phone className="w-4 h-4 mr-2" />
                      {tenant.phone}
                    </div>
                  )}
                  {tenant.moveInDate && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Moved in {formatDate(tenant.moveInDate)}
                    </div>
                  )}
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm">Monthly Rent</span>
                    <span className="text-gray-900 font-semibold">
                      {formatCurrency(tenant.rentAmount || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(tenant.paymentStatus)}
                      <span className={`text-sm font-medium capitalize ${
                        tenant.paymentStatus === 'paid' ? 'text-green-500' :
                        tenant.paymentStatus === 'pending' ? 'text-yellow-500' :
                        tenant.paymentStatus === 'overdue' ? 'text-red-500' :
                        'text-blue-500'
                      }`}>
                        {tenant.paymentStatus || 'pending'}
                      </span>
                    </div>
                    {tenant.lastPaymentDate && (
                      <span className="text-gray-500 text-xs">
                        Last: {formatDate(
                          tenant.lastPaymentDate.seconds 
                            ? new Date(tenant.lastPaymentDate.seconds * 1000)
                            : tenant.lastPaymentDate,
                          'MMM dd'
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Mail className="w-4 h-4" />
                    <span>Send Reminder</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <CreditCard className="w-4 h-4" />
                    <span>Payment History</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Tenant Modal */}
      {showModal && (
        <TenantModal
          tenant={selectedTenant}
          properties={properties}
          onClose={() => setShowModal(false)}
          onSave={handleSaveTenant}
        />
      )}
    </div>
  );
};

export default Tenants;