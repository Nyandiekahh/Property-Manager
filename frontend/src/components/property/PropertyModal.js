import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, MapPin, DollarSign, Home } from 'lucide-react';

const PropertyModal = ({ property, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'Apartment Complex',
    units: '',
    rentPerUnit: '',
    image: '',
    description: ''
  });

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        location: property.location || '',
        type: property.type || 'Apartment Complex',
        units: property.units || property.totalUnits || '',
        rentPerUnit: property.rentPerUnit || '',
        image: property.image || '',
        description: property.description || ''
      });
    }
  }, [property]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const propertyTypes = [
    'Apartment Complex',
    'Condominium',
    'Commercial',
    'Residential',
    'Mixed Use',
    'Office Building'
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {property ? 'Edit Property' : 'Add New Property'}
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Property Name */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Property Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Enter property name"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Enter property location"
                  required
                />
              </div>
            </div>

            {/* Property Type and Units */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">
                  Property Type *
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="input pl-10 appearance-none"
                    required
                  >
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">
                  Number of Units *
                </label>
                <input
                  type="number"
                  name="units"
                  value={formData.units}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Rent per Unit */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Average Rent per Unit (KES)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="number"
                  name="rentPerUnit"
                  value={formData.rentPerUnit}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Property Image URL */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Property Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="input"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input min-h-[100px] resize-none"
                placeholder="Enter property description..."
                rows="4"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn btn-primary"
              >
                {property ? 'Update Property' : 'Add Property'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PropertyModal;