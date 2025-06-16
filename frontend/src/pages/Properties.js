import React, { useState } from 'react';
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
import { formatCurrency } from '../utils/helpers';
import PropertyModal from '../components/property/PropertyModal';

const Properties = () => {
  const [properties, setProperties] = useState([
    {
      id: 1,
      name: 'Sunset Apartments',
      location: 'Westlands, Nairobi',
      units: 24,
      occupiedUnits: 22,
      monthlyRevenue: 120000,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
      type: 'Apartment Complex'
    },
    {
      id: 2,
      name: 'Garden View Condos',
      location: 'Karen, Nairobi',
      units: 16,
      occupiedUnits: 14,
      monthlyRevenue: 85000,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      type: 'Condominium'
    },
    {
      id: 3,
      name: 'City Center Plaza',
      location: 'CBD, Nairobi',
      units: 32,
      occupiedUnits: 30,
      monthlyRevenue: 180000,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
      type: 'Commercial'
    },
    {
      id: 4,
      name: 'Oceanview Heights',
      location: 'Kilifi, Coast',
      units: 18,
      occupiedUnits: 16,
      monthlyRevenue: 95000,
      image: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=400',
      type: 'Residential'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddProperty = () => {
    setSelectedProperty(null);
    setShowModal(true);
  };

  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setShowModal(true);
  };

  const handleDeleteProperty = (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      setProperties(properties.filter(p => p.id !== propertyId));
    }
  };

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const totalOccupied = properties.reduce((sum, p) => sum + p.occupiedUnits, 0);
  const totalRevenue = properties.reduce((sum, p) => sum + p.monthlyRevenue, 0);
  const occupancyRate = ((totalOccupied / totalUnits) * 100).toFixed(1);

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
          <h1 className="text-3xl font-bold text-white mb-2">Properties</h1>
          <p className="text-white/60">Manage your property portfolio</p>
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
                  <p className="text-white/60 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
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
            <div className="relative h-48 rounded-xl overflow-hidden mb-4">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                  {property.type}
                </span>
              </div>
              <div className="absolute bottom-3 left-3">
                <div className="flex items-center text-white text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.location}
                </div>
              </div>
            </div>

            {/* Property Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{property.name}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Units: {property.occupiedUnits}/{property.units}</span>
                  <span className="text-green-400 font-medium">
                    {((property.occupiedUnits / property.units) * 100).toFixed(0)}% occupied
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Monthly Revenue</p>
                  <p className="text-white font-semibold">{formatCurrency(property.monthlyRevenue)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEditProperty(property)}
                    className="p-2 glass rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-white" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteProperty(property.id)}
                    className="p-2 glass rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Property Modal */}
      {showModal && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setShowModal(false)}
          onSave={(propertyData) => {
            if (selectedProperty) {
              // Update existing property
              setProperties(properties.map(p => 
                p.id === selectedProperty.id ? { ...p, ...propertyData } : p
              ));
            } else {
              // Add new property
              const newProperty = {
                id: Date.now(),
                ...propertyData,
                occupiedUnits: 0,
                monthlyRevenue: 0
              };
              setProperties([...properties, newProperty]);
            }
            setShowModal(false);
          }}
        />
      )}
    </motion.div>
  );
};

export default Properties;