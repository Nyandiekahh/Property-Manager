import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Building2, 
  MapPin, 
  Users, 
  Edit, 
  Trash2, 
  Eye,
  DollarSign,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/firestoreService';
import { formatCurrency } from '../utils/helpers';
import PropertyModal from '../components/property/PropertyModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Properties = () => {
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProperties();
  }, [currentUser]);

  const loadProperties = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const data = await propertyService.getProperties(currentUser.uid);
      setProperties(data);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = () => {
    setSelectedProperty(null);
    setShowModal(true);
  };

  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setShowModal(true);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyService.deleteProperty(propertyId);
        setProperties(properties.filter(p => p.id !== propertyId));
        toast.success('Property deleted successfully');
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error('Failed to delete property');
      }
    }
  };

  const handleSaveProperty = async (propertyData) => {
    try {
      if (selectedProperty) {
        // Update existing property
        await propertyService.updateProperty(selectedProperty.id, propertyData);
        setProperties(properties.map(p => 
          p.id === selectedProperty.id ? { ...p, ...propertyData } : p
        ));
        toast.success('Property updated successfully');
      } else {
        // Add new property
        const newPropertyId = await propertyService.createProperty(propertyData, currentUser.uid);
        const newProperty = {
          id: newPropertyId,
          ...propertyData,
          landlordId: currentUser.uid,
          occupiedUnits: 0,
          monthlyRevenue: 0,
          createdAt: new Date()
        };
        setProperties([newProperty, ...properties]);
        toast.success('Property added successfully');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Failed to save property');
    }
  };

  const filteredProperties = properties.filter(property =>
    property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnits = properties.reduce((sum, p) => sum + (p.totalUnits || 0), 0);
  const totalOccupied = properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0);
  const totalRevenue = properties.reduce((sum, p) => sum + (p.monthlyRevenue || 0), 0);
  const occupancyRate = totalUnits > 0 ? ((totalOccupied / totalUnits) * 100).toFixed(1) : 0;

  if (loading) {
    return <LoadingSpinner text="Loading properties..." />;
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Properties</h1>
          <p className="text-slate-600">Manage your property portfolio</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddProperty}
          className="btn btn-primary mt-4 md:mt-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Property
        </motion.button>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Properties', value: properties.length, icon: Building2, color: 'from-blue-500 to-cyan-500' },
          { label: 'Total Units', value: totalUnits, icon: Users, color: 'from-green-500 to-emerald-500' },
          { label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: Eye, color: 'from-purple-500 to-pink-500' },
          { label: 'Monthly Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'from-orange-500 to-red-500' }
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
                  <p className="text-slate-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
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
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button className="btn btn-secondary">
          <Filter className="w-5 h-5 mr-2" />
          Filter
        </button>
      </motion.div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No properties found</h3>
          <p className="text-slate-500 mb-6">
            {properties.length === 0 
              ? "Get started by adding your first property" 
              : "No properties match your search criteria"}
          </p>
          {properties.length === 0 && (
            <button
              onClick={handleAddProperty}
              className="btn btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Property
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="card hover:glow-primary group"
            >
              {/* Property Image */}
              <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-slate-100">
                {property.image ? (
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center" style={{ display: property.image ? 'none' : 'flex' }}>
                  <Building2 className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-slate-900 text-xs font-medium">
                    {property.type || 'Property'}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className="flex items-center text-white text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.location || 'Location not specified'}
                  </div>
                </div>
              </div>

              {/* Property Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{property.name}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Units: {property.occupiedUnits || 0}/{property.totalUnits || property.units || 0}
                    </span>
                    <span className="text-green-600 font-medium">
                      {property.totalUnits > 0 ? 
                        Math.round(((property.occupiedUnits || 0) / property.totalUnits) * 100) : 0}% occupied
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Monthly Revenue</p>
                    <p className="text-slate-900 font-semibold">
                      {formatCurrency(property.monthlyRevenue || 0)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditProperty(property)}
                      className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteProperty(property.id)}
                      className="p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Property Modal */}
      {showModal && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProperty}
        />
      )}
    </motion.div>
  );
};

export default Properties;