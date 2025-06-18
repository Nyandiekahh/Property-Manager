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
  Home,
  Settings,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// CHANGED: Import API services instead of direct Firestore
import { 
  enhancedPropertyAPI, 
  enhancedTenantAPI 
} from '../services/enhancedApiService';
import { formatCurrency } from '../utils/helpers';
import EnhancedPropertyModal from '../components/property/EnhancedPropertyModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Properties = () => {
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [useEnhancedMode, setUseEnhancedMode] = useState(true); // Default to enhanced mode

  useEffect(() => {
    loadProperties();
    loadTenants();
  }, [currentUser]);

  // CHANGED: Use API instead of direct Firestore
  const loadProperties = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await enhancedPropertyAPI.getProperties(currentUser.uid);
      
      if (response.success) {
        setProperties(response.data || []);
        
        // Check if any properties have enhanced features (unitTypes)
        const hasEnhancedProperties = (response.data || []).some(p => p.unitTypes && p.unitTypes.length > 0);
        if (hasEnhancedProperties) {
          setUseEnhancedMode(true);
        }
      } else {
        throw new Error(response.error || 'Failed to load properties');
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to load properties');
      // Set empty array on error to prevent crashes
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // CHANGED: Use API instead of direct Firestore
  const loadTenants = async () => {
    if (!currentUser) return;
    
    try {
      const response = await enhancedTenantAPI.getTenants(currentUser.uid);
      
      if (response.success) {
        setTenants(response.data || []);
      } else {
        console.error('Failed to load tenants:', response.error);
        setTenants([]);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      // Don't show error toast for tenants as it's secondary data
      setTenants([]);
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

  // CHANGED: Use API instead of direct Firestore
  const handleDeleteProperty = async (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    const hasOccupiedUnits = property && property.occupiedUnits > 0;
    
    if (hasOccupiedUnits) {
      toast.error('Cannot delete property with occupied units. Please move out all tenants first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const response = await enhancedPropertyAPI.deleteProperty(propertyId);
        
        if (response.success) {
          setProperties(properties.filter(p => p.id !== propertyId));
          toast.success('Property deleted successfully');
        } else {
          throw new Error(response.error || 'Failed to delete property');
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error(error.message || 'Failed to delete property');
      }
    }
  };

  // CHANGED: Use API instead of direct Firestore
  const handleSaveProperty = async (propertyData) => {
    try {
      if (selectedProperty) {
        // Update existing property
        const response = await enhancedPropertyAPI.updateProperty(selectedProperty.id, propertyData);
        
        if (response.success) {
          setUseEnhancedMode(true);
          toast.success('Property updated successfully');
        } else {
          throw new Error(response.error || 'Failed to update property');
        }
      } else {
        // Create new property
        const response = await enhancedPropertyAPI.createProperty(propertyData, currentUser.uid);
        
        if (response.success) {
          setUseEnhancedMode(true);
          toast.success('Enhanced property created with unit types!');
        } else {
          throw new Error(response.error || 'Failed to create property');
        }
      }
      
      setShowModal(false);
      loadProperties(); // Reload to get updated data
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error(error.message || 'Failed to save property');
    }
  };

  const filteredProperties = properties.filter(property =>
    property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats with both old and new property formats
  const calculateStats = () => {
    let totalUnits = 0;
    let totalOccupied = 0;
    let totalRevenue = 0;

    properties.forEach(property => {
      // Handle both old and new property formats
      if (property.totalUnits !== undefined) {
        // New enhanced format
        totalUnits += property.totalUnits || 0;
        totalOccupied += property.occupiedUnits || 0;
        totalRevenue += property.monthlyRevenue || 0;
      } else {
        // Old format
        totalUnits += property.units || 0;
        // Count tenants for this property
        const propertyTenants = tenants.filter(t => t.propertyId === property.id && t.isActive !== false);
        totalOccupied += propertyTenants.length;
        totalRevenue += propertyTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
      }
    });

    return { totalUnits, totalOccupied, totalRevenue };
  };

  const { totalUnits, totalOccupied, totalRevenue } = calculateStats();
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
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  {useEnhancedMode ? 'Enhanced Properties' : 'Properties'}
                </h1>
                {useEnhancedMode && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Enhanced Mode
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {useEnhancedMode 
                  ? 'Unit-based property management with auto-assignment'
                  : 'Manage your property portfolio'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {useEnhancedMode && (
                <button
                  onClick={() => setUseEnhancedMode(!useEnhancedMode)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Mode</span>
                </button>
              )}
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
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Properties', value: properties.length, icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-50' },
            { label: 'Total Units', value: totalUnits, icon: Users, color: 'text-green-600', bgColor: 'bg-green-50' },
            { label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' },
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

        {/* Enhanced Mode Notice */}
        {!useEnhancedMode && properties.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Home className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-blue-800 font-medium">Upgrade to Enhanced Properties</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Create properties with multiple unit types, auto-generated account numbers, 
                  and smart tenant assignment. Existing properties will continue working as normal.
                </p>
                <button
                  onClick={() => setUseEnhancedMode(true)}
                  className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800"
                >
                  Learn More →
                </button>
              </div>
            </div>
          </div>
        )}

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
            {filteredProperties.map((property, index) => {
              // Calculate stats for both old and new format
              const isEnhanced = property.unitTypes && property.unitTypes.length > 0;
              
              let displayUnits, displayOccupied, displayRevenue, displayOccupancyRate;
              
              if (isEnhanced) {
                // New enhanced format
                displayUnits = property.totalUnits || 0;
                displayOccupied = property.occupiedUnits || 0;
                displayRevenue = property.monthlyRevenue || 0;
              } else {
                // Old format - calculate from tenants
                displayUnits = property.units || 0;
                const propertyTenants = tenants.filter(t => t.propertyId === property.id && t.isActive !== false);
                displayOccupied = propertyTenants.length;
                displayRevenue = propertyTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
              }
              
              displayOccupancyRate = displayUnits > 0 ? Math.round((displayOccupied / displayUnits) * 100) : 0;

              return (
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
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-gray-900 text-xs font-medium">
                        {property.type || 'Property'}
                      </span>
                      {isEnhanced && (
                        <span className="px-2 py-1 bg-blue-600/90 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                          Enhanced
                        </span>
                      )}
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
                          Units: {displayOccupied}/{displayUnits}
                        </span>
                        <span className={`font-medium ${displayOccupancyRate >= 80 ? 'text-green-600' : displayOccupancyRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {displayOccupancyRate}% occupied
                        </span>
                      </div>
                    </div>

                    {/* Enhanced: Show unit types for enhanced properties */}
                    {isEnhanced && property.unitTypes && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 text-xs font-medium mb-2">Unit Types:</p>
                        <div className="flex flex-wrap gap-1">
                          {property.unitTypes.map((unitType, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {unitType.type.charAt(0).toUpperCase() + unitType.type.slice(1)}
                            </span>
                          ))}
                        </div>
                        {property.paybill && (
                          <p className="text-gray-500 text-xs mt-2">
                            Paybill: {property.paybill} • Prefix: {property.accountPrefix}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Monthly Revenue</p>
                        <p className="text-gray-900 font-semibold">
                          {formatCurrency(displayRevenue)}
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

                    {/* Enhanced: Additional info for enhanced properties */}
                    {isEnhanced && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Available Units</p>
                            <p className="text-gray-900 font-medium">{property.availableUnits || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Unit Types</p>
                            <p className="text-gray-900 font-medium">{property.unitTypes?.length || 0}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Property Modal */}
      {showModal && (
        <EnhancedPropertyModal
          property={selectedProperty}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProperty}
        />
      )}
    </div>
  );
};

export default Properties;