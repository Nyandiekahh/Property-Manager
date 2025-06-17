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
  Filter,
  MoreHorizontal
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
        await propertyService.updateProperty(selectedProperty.id, propertyData);
        setProperties(properties.map(p => 
          p.id === selectedProperty.id ? { ...p, ...propertyData } : p
        ));
        toast.success('Property updated successfully');
      } else {
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading properties...</p>
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
              <h1 className="text-xl font-semibold text-gray-900">Properties</h1>
              <p className="text-sm text-gray-600">Manage your property portfolio</p>
            </div>
            <button
              onClick={handleAddProperty}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Properties', value: properties.length, icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-50' },
            { label: 'Total Units', value: totalUnits, icon: Users, color: 'text-green-600', bgColor: 'bg-green-50' },
            { label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: Eye, color: 'text-purple-600', bgColor: 'bg-purple-50' },
            { label: 'Monthly Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-orange-600', bgColor: 'bg-orange-50' }
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
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
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
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-gray-600 font-medium">Filter</span>
          </button>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              {properties.length === 0 
                ? "Get started by adding your first property" 
                : "No properties match your search criteria"}
            </p>
            {properties.length === 0 && (
              <button
                onClick={handleAddProperty}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Property</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Property Image */}
                <div className="relative h-48 rounded-t-lg overflow-hidden bg-gray-100">
                  {property.image ? (
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center" style={{ display: property.image ? 'none' : 'flex' }}>
                    <Building2 className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-gray-900 text-xs font-medium">
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
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.name}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
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
                      <p className="text-gray-600 text-sm">Monthly Revenue</p>
                      <p className="text-gray-900 font-semibold">
                        {formatCurrency(property.monthlyRevenue || 0)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditProperty(property)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Property Modal */}
      {showModal && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProperty}
        />
      )}
    </div>
  );
};

export default Properties;