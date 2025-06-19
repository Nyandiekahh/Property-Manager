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
  CreditCard,
  Home,
  ArrowRight,
  UserX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// CHANGED: Import API services instead of direct Firestore
import { 
  enhancedTenantAPI, 
  enhancedPropertyAPI 
} from '../services/enhancedApiService';
import { formatCurrency, formatDate, getInitials } from '../utils/helpers';
import EnhancedTenantModal from '../components/tenant/EnhancedTenantModal';
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
  const [tenantStats, setTenantStats] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState('all');

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // CHANGED: Use API instead of direct Firestore
  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Load data from API endpoints
      const [tenantsResponse, propertiesResponse, statsResponse] = await Promise.all([
        enhancedTenantAPI.getTenants(currentUser.uid, { isActive: true }),
        enhancedPropertyAPI.getProperties(currentUser.uid),
        enhancedTenantAPI.getTenantStatistics(currentUser.uid)
      ]);
      
      if (tenantsResponse.success) {
        setTenants(tenantsResponse.data || []);
      } else {
        console.error('Failed to load tenants:', tenantsResponse.error);
        setTenants([]);
      }
      
      if (propertiesResponse.success) {
        setProperties(propertiesResponse.data || []);
      } else {
        console.error('Failed to load properties:', propertiesResponse.error);
        setProperties([]);
      }
      
      if (statsResponse.success) {
        setTenantStats(statsResponse.data);
      } else {
        console.error('Failed to load tenant stats:', statsResponse.error);
        setTenantStats(null);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
      // Set empty arrays to prevent crashes
      setTenants([]);
      setProperties([]);
      setTenantStats(null);
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

  // CHANGED: Use API instead of direct Firestore
  const handleMoveTenantOut = async (tenant) => {
    const confirmed = window.confirm(
      `Are you sure you want to move out ${tenant.name} from unit ${tenant.unitNumber}? This will free up the unit for new tenants.`
    );
    
    if (confirmed) {
      try {
        const response = await enhancedTenantAPI.moveTenantOut(tenant.id);
        
        if (response.success) {
          toast.success(`${tenant.name} has been moved out. Unit ${tenant.unitNumber} is now available.`);
          loadData(); // Reload to reflect changes
        } else {
          throw new Error(response.error || 'Failed to move tenant out');
        }
      } catch (error) {
        console.error('Error moving tenant out:', error);
        toast.error('Failed to move tenant out');
      }
    }
  };

  // CHANGED: Use API instead of direct Firestore
  const handleDeleteTenant = async (tenantId) => {
    if (window.confirm('Are you sure you want to permanently delete this tenant? This action cannot be undone.')) {
      try {
        const response = await enhancedTenantAPI.deleteTenant(tenantId);
        
        if (response.success) {
          toast.success('Tenant deleted successfully');
          loadData(); // Reload to reflect changes
        } else {
          throw new Error(response.error || 'Failed to delete tenant');
        }
      } catch (error) {
        console.error('Error deleting tenant:', error);
        toast.error('Failed to delete tenant');
      }
    }
  };

  // CHANGED: Use API instead of direct Firestore
  const handleSaveTenant = async (tenantData) => {
    try {
      if (selectedTenant) {
        // Update existing tenant
        const response = await enhancedTenantAPI.updateTenant(selectedTenant.id, tenantData);
        
        if (response.success) {
          toast.success('Tenant updated successfully');
        } else {
          throw new Error(response.error || 'Failed to update tenant');
        }
      } else {
        // Create new tenant with auto-assignment
        const response = await enhancedTenantAPI.createTenant(tenantData, currentUser.uid);
        
        if (response.success) {
          const result = response.data;
          toast.success(
            `Tenant added successfully! Assigned to unit ${result.unitNumber} with account ${result.accountNumber}`
          );
        } else {
          throw new Error(response.error || 'Failed to create tenant');
        }
      }
      
      setShowModal(false);
      loadData(); // Reload to reflect changes
    } catch (error) {
      console.error('Error saving tenant:', error);
      toast.error(error.message || 'Failed to save tenant');
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || tenant.paymentStatus === filterStatus;
    const matchesProperty = selectedPropertyId === 'all' || tenant.propertyId === selectedPropertyId;

    return matchesSearch && matchesFilter && matchesProperty;
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
      case 'moved_out':
        return <UserX className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  const getUnitTypeDisplayName = (unitType) => {
    const displayNames = {
      'bedsitter': 'Bedsitter',
      '1bedroom': '1 Bedroom',
      '2bedroom': '2 Bedroom',
      '3bedroom': '3 Bedroom',
      'studio': 'Studio',
      'penthouse': 'Penthouse'
    };
    return displayNames[unitType] || unitType;
  };

  // Use stats from API or calculate from tenants
  const statusCounts = tenantStats ? {
    all: tenantStats.active,
    paid: tenantStats.paymentStatus?.paid || 0,
    pending: tenantStats.paymentStatus?.pending || 0,
    overdue: tenantStats.paymentStatus?.overdue || 0,
    partial: tenantStats.paymentStatus?.partial || 0
  } : {
    all: tenants.length,
    paid: tenants.filter(t => t.paymentStatus === 'paid').length,
    pending: tenants.filter(t => t.paymentStatus === 'pending').length,
    overdue: tenants.filter(t => t.paymentStatus === 'overdue').length,
    partial: tenants.filter(t => t.paymentStatus === 'partial').length
  };

  const totalRent = tenantStats?.totalMonthlyRent || tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);

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
              <h1 className="text-xl font-semibold text-gray-900">Enhanced Tenant Management</h1>
              <p className="text-sm text-gray-600">Smart tenant assignment with unit-based system</p>
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
        {/* Stats Overview with Unit Types */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[
            { label: 'Active Tenants', value: statusCounts.all, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
            { label: 'Paid', value: statusCounts.paid, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
            { label: 'Pending', value: statusCounts.pending, icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
            { label: 'Overdue', value: statusCounts.overdue, icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
            { label: 'Partial', value: statusCounts.partial, icon: AlertCircle, color: 'text-purple-600', bgColor: 'bg-purple-50' },
            { label: 'Monthly Revenue', value: formatCurrency(totalRent), icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-50' }
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

        {/* Unit Type Distribution */}
        {tenantStats?.unitTypes && Object.keys(tenantStats.unitTypes).length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Type Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(tenantStats.unitTypes).map(([unitType, count]) => (
                <div key={unitType} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <Home className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{getUnitTypeDisplayName(unitType)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tenants, units, or account numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
          <option value="all">All Buildings</option>
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
))}
          </select>

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
                ? "Get started by adding your first tenant with auto-unit assignment" 
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
                {/* Tenant Header with Unit Info */}
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
                        {getPropertyName(tenant.propertyId)} 
                        {tenant.unitNumber && <span className="font-medium"> • Unit {tenant.unitNumber}</span>}
                      </p>
                      {tenant.unitType && (
                        <p className="text-blue-600 text-xs font-medium capitalize">
                          {getUnitTypeDisplayName(tenant.unitType)}
                        </p>
                      )}
                      {tenant.accountNumber && (
                        <p className="text-gray-500 text-xs font-mono">
                          {tenant.accountNumber}
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
                      onClick={() => handleMoveTenantOut(tenant)}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Move Out"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTenant(tenant.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Permanently"
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
                      Moved in {formatDate(
                        tenant.moveInDate.seconds ? 
                          new Date(tenant.moveInDate.seconds * 1000) : 
                          tenant.moveInDate
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Info with Balance */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm">Monthly Rent</span>
                    <span className="text-gray-900 font-semibold">
                      {formatCurrency(tenant.rentAmount || 0)}
                    </span>
                  </div>
                  {tenant.accountBalance !== undefined && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 text-sm">Account Balance</span>
                      <span className={`text-sm font-semibold ${
                        tenant.accountBalance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(tenant.accountBalance)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(tenant.paymentStatus)}
                      <span className={`text-sm font-medium capitalize ${
                        tenant.paymentStatus === 'paid' ? 'text-green-500' :
                        tenant.paymentStatus === 'pending' ? 'text-yellow-500' :
                        tenant.paymentStatus === 'overdue' ? 'text-red-500' :
                        tenant.paymentStatus === 'moved_out' ? 'text-gray-500' :
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
                    <span>Reminder</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <CreditCard className="w-4 h-4" />
                    <span>History</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <EnhancedTenantModal
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