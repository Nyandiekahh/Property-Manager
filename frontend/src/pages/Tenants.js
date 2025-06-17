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
        // Update existing tenant
        await tenantService.updateTenant(selectedTenant.id, tenantData);
        setTenants(tenants.map(t => 
          t.id === selectedTenant.id ? { ...t, ...tenantData } : t
        ));
        toast.success('Tenant updated successfully');
      } else {
        // Add new tenant
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
        return <Clock className="w-4 h-4 text-slate-400" />;
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
    return <LoadingSpinner text="Loading tenants..." />;
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tenants</h1>
          <p className="text-slate-600">Manage your tenant relationships</p>
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
                  <p className="text-slate-600 text-xs">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{stat.value}</p>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
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
      {filteredTenants.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No tenants found</h3>
          <p className="text-slate-500 mb-6">
            {tenants.length === 0 
              ? "Get started by adding your first tenant" 
              : "No tenants match your search criteria"}
          </p>
          {tenants.length === 0 && (
            <button
              onClick={handleAddTenant}
              className="btn btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Tenant
            </button>
          )}
        </motion.div>
      ) : (
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
                       {getInitials(tenant.name || 'T')}
                     </span>
                   )}
                 </div>
                 <div>
                   <h3 className="text-slate-900 font-semibold">{tenant.name}</h3>
                   <p className="text-slate-600 text-sm">
                     {getPropertyName(tenant.propertyId)} {tenant.unit ? `• ${tenant.unit}` : ''}
                   </p>
                   {tenant.accountNumber && (
                     <p className="text-slate-500 text-xs font-mono">
                       Account: {tenant.accountNumber}
                     </p>
                   )}
                 </div>
               </div>
               <div className="flex items-center space-x-1">
                 <motion.button
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={() => handleEditTenant(tenant)}
                   className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100"
                 >
                   <Edit className="w-4 h-4 text-slate-600" />
                 </motion.button>
                 <motion.button
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={() => handleDeleteTenant(tenant.id)}
                   className="p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                 >
                   <Trash2 className="w-4 h-4 text-red-500" />
                 </motion.button>
               </div>
             </div>

             {/* Contact Info */}
             <div className="space-y-2 mb-4">
               {tenant.email && (
                 <div className="flex items-center text-slate-600 text-sm">
                   <Mail className="w-4 h-4 mr-2" />
                   {tenant.email}
                 </div>
               )}
               {tenant.phone && (
                 <div className="flex items-center text-slate-600 text-sm">
                   <Phone className="w-4 h-4 mr-2" />
                   {tenant.phone}
                 </div>
               )}
               {tenant.moveInDate && (
                 <div className="flex items-center text-slate-600 text-sm">
                   <Calendar className="w-4 h-4 mr-2" />
                   Moved in {formatDate(tenant.moveInDate)}
                 </div>
               )}
             </div>

             {/* Payment Info */}
             <div className="bg-slate-50 p-3 rounded-xl">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-slate-600 text-sm">Monthly Rent</span>
                 <span className="text-slate-900 font-semibold">
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
                   <span className="text-slate-500 text-xs">
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
                 <CreditCard className="w-4 h-4 mr-1" />
                 Payment History
               </motion.button>
             </div>
           </motion.div>
         ))}
       </div>
     )}

     {/* Tenant Modal */}
     {showModal && (
       <TenantModal
         tenant={selectedTenant}
         properties={properties}
         onClose={() => setShowModal(false)}
         onSave={handleSaveTenant}
       />
     )}
   </motion.div>
 );
};

export default Tenants;