import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Calendar, DollarSign, Building2 } from 'lucide-react';

const TenantModal = ({ tenant, properties, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    unit: '',
    rentAmount: '',
    moveInDate: '',
    emergencyContact: '',
    emergencyPhone: '',
    idNumber: '',
    occupation: ''
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        propertyId: tenant.propertyId || '',
        unit: tenant.unit || '',
        rentAmount: tenant.rentAmount || '',
        moveInDate: tenant.moveInDate || '',
        emergencyContact: tenant.emergencyContact || '',
        emergencyPhone: tenant.emergencyPhone || '',
        idNumber: tenant.idNumber || '',
        occupation: tenant.occupation || ''
      });
    }
  }, [tenant]);

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
          className="glass-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {tenant ? 'Edit Tenant' : 'Add New Tenant'}
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
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
                
                {/* Full Name */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="+254..."
                      required
                    />
                  </div>
                </div>

                {/* ID Number */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">
                    ID Number
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    className="input"
                    placeholder="Enter ID number"
                  />
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="input"
                    placeholder="Enter occupation"
                  />
                </div>
              </div>

              {/* Rental Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Rental Information</h3>
                
                {/* Property */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">
                    Property *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <select
                      name="propertyId"
                      value={formData.propertyId}
                      onChange={handleChange}
                      className="input pl-10 appearance-none"
                      required
                    >
                      <option value="">Select property</option>
                      {properties.map(property => (
                        <option key={property.id} value={property.id}>
                          {property.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">
                    Unit Number *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="#101"
                      required
                    />
                  </div>
                </div>

                {/* Rent Amount */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">
                    Monthly Rent (KES) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                      type="number"
                      name="rentAmount"
                      value={formData.rentAmount}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Move-in Date */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">
                    Move-in Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                      type="date"
                      name="moveInDate"
                      value={formData.moveInDate}
                      onChange={handleChange}
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="input"
                    placeholder="Enter emergency contact name"
                  />
                </div>

                {/* Emergency Phone */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="input"
                    placeholder="+254..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t border-slate-200">
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
                {tenant ? 'Update Tenant' : 'Add Tenant'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TenantModal;