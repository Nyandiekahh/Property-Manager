import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Calendar, Building2, Home, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
// CHANGED: Import API services and toast for better user feedback
import { 
  enhancedPropertyAPI, 
  enhancedTenantAPI 
} from '../../services/enhancedApiService';
import toast from 'react-hot-toast';

const EnhancedTenantModal = ({ tenant, properties, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    unitType: '',
    preferredUnit: '',
    moveInDate: '',
    emergencyContact: '',
    emergencyPhone: '',
    idNumber: '',
    occupation: ''
  });

  const [errors, setErrors] = useState({});
  const [availableUnits, setAvailableUnits] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [unitTypes, setUnitTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  // CHANGED: Add form submission loading state
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        propertyId: tenant.propertyId || '',
        unitType: tenant.unitType || '',
        preferredUnit: tenant.unitNumber || '',
        moveInDate: tenant.moveInDate ? 
          (tenant.moveInDate.seconds ? 
            new Date(tenant.moveInDate.seconds * 1000).toISOString().split('T')[0] :
            new Date(tenant.moveInDate).toISOString().split('T')[0]
          ) : '',
        emergencyContact: tenant.emergencyContact || '',
        emergencyPhone: tenant.emergencyPhone || '',
        idNumber: tenant.idNumber || '',
        occupation: tenant.occupation || ''
      });

      if (tenant.propertyId) {
        loadPropertyDetails(tenant.propertyId);
      }
    }
  }, [tenant]);

  useEffect(() => {
    if (formData.propertyId) {
      loadPropertyDetails(formData.propertyId);
    }
  }, [formData.propertyId]);

  useEffect(() => {
    if (formData.propertyId && formData.unitType) {
      loadAvailableUnits(formData.propertyId, formData.unitType);
    }
  }, [formData.propertyId, formData.unitType]);

  const loadPropertyDetails = async (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      
      // Extract unique unit types from property
      const types = property.unitTypes || [];
      setUnitTypes(types);
      
      // Auto-select first unit type if only one exists
      if (types.length === 1 && !formData.unitType) {
        setFormData(prev => ({ ...prev, unitType: types[0].type }));
      }
    }
  };

  // CHANGED: Use API to load available units
  const loadAvailableUnits = async (propertyId, unitType) => {
    setLoading(true);
    try {
      const response = await enhancedPropertyAPI.getAvailableUnits(propertyId, unitType);
      
      if (response.success) {
        const units = response.data || [];
        setAvailableUnits(units);
      } else {
        console.error('Failed to load available units:', response.error);
        setAvailableUnits([]);
        toast.error('Failed to load available units');
      }
    } catch (error) {
      console.error('Error loading available units:', error);
      setAvailableUnits([]);
      // Don't show error toast for unit loading as it's not critical
    } finally {
      setLoading(false);
    }
  };

  // CHANGED: Enhanced form submission with API integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.propertyId) newErrors.propertyId = 'Property selection is required';
    if (!formData.unitType) newErrors.unitType = 'Unit type selection is required';
    if (!formData.moveInDate) newErrors.moveInDate = 'Move-in date is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (Kenyan format)
    if (formData.phone && !/^(\+254|0)?[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Kenyan phone number';
    }

    // Check if units are available for new tenants
    if (!tenant && formData.unitType && availableUnits.length === 0) {
      newErrors.unitType = 'No available units for this unit type';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      // Prepare enhanced tenant data for API
      const enhancedTenantData = {
        ...formData,
        // Convert moveInDate to proper format
        moveInDate: new Date(formData.moveInDate),
        // Add metadata
        createdAt: tenant ? tenant.createdAt : new Date(),
        updatedAt: new Date(),
        // Format phone number
        phone: formData.phone.startsWith('+254') ? formData.phone : 
               formData.phone.startsWith('0') ? '+254' + formData.phone.slice(1) : 
               '+254' + formData.phone,
        // Add unit assignment details
        unitAssignment: {
          propertyId: formData.propertyId,
          unitType: formData.unitType,
          preferredUnit: formData.preferredUnit || null,
          autoAssign: !formData.preferredUnit
        }
      };

      // Call the parent onSave function with enhanced data
      await onSave(enhancedTenantData);
      
      // Success feedback is handled by the parent component
      // onClose will be called by parent on success
      
    } catch (error) {
      console.error('Error saving tenant:', error);
      toast.error('Failed to save tenant. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const getSelectedUnitDetails = () => {
    if (!formData.preferredUnit || availableUnits.length === 0) return null;
    return availableUnits.find(unit => unit.unitNumber === formData.preferredUnit);
  };

  const getUnitTypeDetails = () => {
    if (!formData.unitType || !selectedProperty) return null;
    return selectedProperty.unitTypes?.find(type => type.type === formData.unitType);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
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
    return displayNames[unitType] || unitType?.charAt(0).toUpperCase() + unitType?.slice(1);
  };

  const unitDetails = getSelectedUnitDetails();
  const unitTypeDetails = getUnitTypeDetails();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={submitting ? undefined : onClose} // Prevent closing while submitting
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {tenant ? 'Edit Enhanced Tenant' : 'Add Enhanced Tenant'}
                </h2>
                <p className="text-sm text-gray-600">
                  {tenant ? 'Update tenant with smart unit management' : 'Smart tenant assignment with auto-generated account numbers'}
                </p>
              </div>
            </div>
            <button
              onClick={submitting ? undefined : onClose}
              disabled={submitting}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                
                {/* Full Name */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={submitting}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter full name"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={submitting}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Phone Number * (M-Pesa)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={submitting}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+254712345678"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  <p className="text-gray-500 text-sm mt-1">
                    This will be used for M-Pesa payment notifications
                  </p>
                </div>

                {/* ID Number */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    ID Number
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Enter ID number"
                  />
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Enter occupation"
                  />
                </div>

                {/* Move-in Date */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Move-in Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="date"
                      name="moveInDate"
                      value={formData.moveInDate}
                      onChange={handleChange}
                      disabled={submitting}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        errors.moveInDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.moveInDate && <p className="text-red-500 text-sm mt-1">{errors.moveInDate}</p>}
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      disabled={submitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="Enter emergency contact name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      disabled={submitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="+254..."
                    />
                  </div>
                </div>
              </div>

              {/* Property & Unit Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Property & Unit Assignment</h3>
                
                {/* Property Selection */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Enhanced Property *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <select
                      name="propertyId"
                      value={formData.propertyId}
                      onChange={handleChange}
                      disabled={submitting}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        errors.propertyId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select enhanced property</option>
                      {properties.map(property => (
                        <option key={property.id} value={property.id}>
                          {property.name} - {property.location}
                          {property.unitTypes?.length > 0 && ' (Enhanced)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.propertyId && <p className="text-red-500 text-sm mt-1">{errors.propertyId}</p>}
                </div>

                {/* Unit Type Selection */}
                {selectedProperty && (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Unit Type *
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <select
                        name="unitType"
                        value={formData.unitType}
                        onChange={handleChange}
                        disabled={submitting}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
                          errors.unitType ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select unit type</option>
                        {unitTypes.map(unitType => (
                          <option key={unitType.type} value={unitType.type}>
                            {getUnitTypeDisplayName(unitType.type)} - {formatCurrency(unitType.rentAmount)}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.unitType && <p className="text-red-500 text-sm mt-1">{errors.unitType}</p>}
                  </div>
                )}

                {/* Available Units */}
                {formData.unitType && availableUnits.length > 0 && (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Preferred Unit (Optional)
                    </label>
                    <select
                      name="preferredUnit"
                      value={formData.preferredUnit}
                      onChange={handleChange}
                      disabled={submitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Auto-assign first available unit</option>
                      {availableUnits.map(unit => (
                        <option key={unit.unitNumber} value={unit.unitNumber}>
                          Unit {unit.unitNumber} - {formatCurrency(unit.rentAmount)} 
                          {unit.accountNumber && ` (Account: ${unit.accountNumber})`}
                        </option>
                      ))}
                    </select>
                    <p className="text-gray-500 text-sm mt-1">
                      {availableUnits.length} unit(s) available for {getUnitTypeDisplayName(formData.unitType)}
                    </p>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">Loading available units...</span>
                  </div>
                )}

                {/* No Units Available */}
                {formData.unitType && !loading && availableUnits.length === 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <h4 className="text-red-800 font-medium">No Available Units</h4>
                        <p className="text-red-700 text-sm">
                          All {getUnitTypeDisplayName(formData.unitType)} units in this property are currently occupied.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unit Details Summary */}
                {unitDetails && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-green-800 font-medium mb-2">Selected Unit Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-green-700"><strong>Unit Number:</strong> {unitDetails.unitNumber}</p>
                            <p className="text-green-700"><strong>Unit Type:</strong> {getUnitTypeDisplayName(unitDetails.unitType)}</p>
                          </div>
                          <div>
                            <p className="text-green-700"><strong>Monthly Rent:</strong> {formatCurrency(unitDetails.rentAmount)}</p>
                            <p className="text-green-700"><strong>Account Number:</strong> {unitDetails.accountNumber}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-Assignment Info */}
                {formData.unitType && !formData.preferredUnit && availableUnits.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-blue-800 font-medium">Smart Auto-Assignment</h4>
                        <p className="text-blue-700 text-sm mt-1">
                          The system will automatically assign this tenant to unit <strong>{availableUnits[0]?.unitNumber}</strong> 
                          with rent <strong>{formatCurrency(availableUnits[0]?.rentAmount || 0)}</strong> 
                          and auto-generate account number <strong>{availableUnits[0]?.accountNumber}</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Property Payment Info */}
                {selectedProperty && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-gray-800 font-medium mb-2">M-Pesa Payment Configuration</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p><strong>Paybill:</strong> {selectedProperty.paybill}</p>
                      <p><strong>Account Format:</strong> {selectedProperty.accountPrefix}#[Unit Number]</p>
                      {unitTypeDetails && (
                        <p><strong>Monthly Rent:</strong> {formatCurrency(unitTypeDetails.rentAmount)}</p>
                      )}
                      <p className="text-green-600 font-medium">✓ Auto-generated account numbers for easy M-Pesa payments</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Features Info */}
            <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-amber-800 font-medium">Enhanced Tenant Features:</h4>
                  <ul className="text-amber-700 text-sm mt-1 space-y-1">
                    <li>• <strong>Smart Unit Assignment:</strong> Automatic assignment to available units</li>
                    <li>• <strong>M-Pesa Integration:</strong> Auto-generated account numbers for easy payments</li>
                    <li>• <strong>Payment Tracking:</strong> Real-time payment status updates</li>
                    <li>• <strong>Unit Management:</strong> Easy transfer between units when needed</li>
                    <li>• <strong>Balance Tracking:</strong> Automatic tracking of overpayments and balances</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.propertyId || !formData.unitType || (formData.unitType && availableUnits.length === 0)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {submitting 
                    ? (tenant ? 'Updating...' : 'Adding...') 
                    : (tenant ? 'Update Tenant' : 'Add Tenant')}
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedTenantModal;