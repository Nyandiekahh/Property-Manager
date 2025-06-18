import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, MapPin, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
// CHANGED: Import toast for better user feedback
import toast from 'react-hot-toast';

const EnhancedPropertyModal = ({ property, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'Apartment Complex',
    paybill: '',
    accountPrefix: '',
    description: '',
    image: '',
    unitTypes: [
      {
        type: 'bedsitter',
        startUnit: 'A1',
        endUnit: 'A5',
        rentAmount: '',
        description: ''
      }
    ]
  });

  const [errors, setErrors] = useState({});
  // CHANGED: Add loading state for form submission
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        location: property.location || '',
        type: property.type || 'Apartment Complex',
        paybill: property.paybill || '',
        accountPrefix: property.accountPrefix || '',
        description: property.description || '',
        image: property.image || '',
        unitTypes: property.unitTypes || [
          {
            type: 'bedsitter',
            startUnit: 'A1',
            endUnit: 'A5',
            rentAmount: '',
            description: ''
          }
        ]
      });
    }
  }, [property]);

  // CHANGED: Enhanced form submission with loading state and better error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Property name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.paybill.trim()) newErrors.paybill = 'Paybill number is required';
    if (!formData.accountPrefix.trim()) newErrors.accountPrefix = 'Account prefix is required';
    
    // Enhanced validation for unit types
    formData.unitTypes.forEach((unitType, index) => {
      if (!unitType.startUnit.trim()) {
        newErrors[`unitType_${index}_startUnit`] = 'Start unit is required';
      }
      if (!unitType.endUnit.trim()) {
        newErrors[`unitType_${index}_endUnit`] = 'End unit is required';
      }
      if (!unitType.rentAmount || parseFloat(unitType.rentAmount) <= 0) {
        newErrors[`unitType_${index}_rentAmount`] = 'Valid rent amount is required';
      }
      
      // Additional validation: check unit range
      const startNum = parseInt(unitType.startUnit.match(/\d+/)?.[0] || '0');
      const endNum = parseInt(unitType.endUnit.match(/\d+/)?.[0] || '0');
      if (startNum > endNum) {
        newErrors[`unitType_${index}_endUnit`] = 'End unit must be greater than or equal to start unit';
      }
    });

    // Check for duplicate unit ranges
    const unitRanges = formData.unitTypes.map(ut => ({
      start: ut.startUnit,
      end: ut.endUnit,
      prefix: ut.startUnit.replace(/\d+/, '')
    }));
    
    for (let i = 0; i < unitRanges.length; i++) {
      for (let j = i + 1; j < unitRanges.length; j++) {
        if (unitRanges[i].prefix === unitRanges[j].prefix) {
          const range1Start = parseInt(unitRanges[i].start.match(/\d+/)?.[0] || '0');
          const range1End = parseInt(unitRanges[i].end.match(/\d+/)?.[0] || '0');
          const range2Start = parseInt(unitRanges[j].start.match(/\d+/)?.[0] || '0');
          const range2End = parseInt(unitRanges[j].end.match(/\d+/)?.[0] || '0');
          
          // Check for overlapping ranges
          if ((range1Start <= range2End && range1End >= range2Start)) {
            newErrors[`unitType_${j}_startUnit`] = 'Unit ranges cannot overlap';
            newErrors[`unitType_${j}_endUnit`] = 'Unit ranges cannot overlap';
          }
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // Calculate additional properties for the API
      const enhancedFormData = {
        ...formData,
        // Calculate total units and revenue
        totalUnits: calculateTotalUnits(),
        expectedMonthlyRevenue: calculateTotalRevenue(),
        // Add timestamps
        createdAt: property ? property.createdAt : new Date(),
        updatedAt: new Date(),
        // Ensure all unit types have proper structure
        unitTypes: formData.unitTypes.map(unitType => ({
          ...unitType,
          rentAmount: parseFloat(unitType.rentAmount),
          unitsCount: (() => {
            const startNum = parseInt(unitType.startUnit.match(/\d+/)?.[0] || '0');
            const endNum = parseInt(unitType.endUnit.match(/\d+/)?.[0] || '0');
            return Math.max(0, endNum - startNum + 1);
          })()
        }))
      };

      // Call the parent onSave function
      await onSave(enhancedFormData);
      
      // Success feedback is handled by the parent component
      // onClose will be called by parent on success
      
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Failed to save property. Please try again.');
    } finally {
      setLoading(false);
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

  const handleUnitTypeChange = (index, field, value) => {
    const updatedUnitTypes = [...formData.unitTypes];
    updatedUnitTypes[index] = {
      ...updatedUnitTypes[index],
      [field]: value
    };
    setFormData({
      ...formData,
      unitTypes: updatedUnitTypes
    });
    
    // Clear related errors
    const errorKey = `unitType_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: undefined
      }));
    }
  };

  const addUnitType = () => {
    setFormData({
      ...formData,
      unitTypes: [
        ...formData.unitTypes,
        {
          type: 'bedsitter',
          startUnit: '',
          endUnit: '',
          rentAmount: '',
          description: ''
        }
      ]
    });
  };

  const removeUnitType = (index) => {
    if (formData.unitTypes.length > 1) {
      const updatedUnitTypes = formData.unitTypes.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        unitTypes: updatedUnitTypes
      });
      
      // Clear errors for removed unit type
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`unitType_${index}_`)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  const propertyTypes = [
    'Apartment Complex',
    'Condominium', 
    'Commercial',
    'Residential',
    'Mixed Use',
    'Office Building'
  ];

  const unitTypeOptions = [
    { value: 'bedsitter', label: 'Bedsitter' },
    { value: '1bedroom', label: '1 Bedroom' },
    { value: '2bedroom', label: '2 Bedroom' },
    { value: '3bedroom', label: '3 Bedroom' },
    { value: 'studio', label: 'Studio' },
    { value: 'penthouse', label: 'Penthouse' }
  ];

  const calculateTotalUnits = () => {
    return formData.unitTypes.reduce((total, unitType) => {
      const startNum = parseInt(unitType.startUnit.match(/\d+/)?.[0] || '0');
      const endNum = parseInt(unitType.endUnit.match(/\d+/)?.[0] || '0');
      return total + Math.max(0, endNum - startNum + 1);
    }, 0);
  };

  const calculateTotalRevenue = () => {
    return formData.unitTypes.reduce((total, unitType) => {
      const startNum = parseInt(unitType.startUnit.match(/\d+/)?.[0] || '0');
      const endNum = parseInt(unitType.endUnit.match(/\d+/)?.[0] || '0');
      const units = Math.max(0, endNum - startNum + 1);
      const rent = parseFloat(unitType.rentAmount) || 0;
      return total + (units * rent);
    }, 0);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={loading ? undefined : onClose} // Prevent closing while loading
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
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {property ? 'Edit Enhanced Property' : 'Create Enhanced Property'}
                </h2>
                <p className="text-sm text-gray-600">
                  {property ? 'Update property with unit-based management' : 'Set up property with smart unit types and M-Pesa integration'}
                </p>
              </div>
            </div>
            <button
              onClick={loading ? undefined : onClose}
              disabled={loading}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                {/* Property Name */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Property Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter property name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter property location"
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Property Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Enter property description..."
                    rows="3"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Property Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Payment Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">M-Pesa Payment Configuration</h3>
                
                {/* Paybill Number */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    M-Pesa Paybill Number *
                  </label>
                  <input
                    type="text"
                    name="paybill"
                    value={formData.paybill}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.paybill ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 522522"
                  />
                  {errors.paybill && <p className="text-red-500 text-sm mt-1">{errors.paybill}</p>}
                  <p className="text-gray-500 text-sm mt-1">
                    Your M-Pesa paybill number for rent collection
                  </p>
                </div>

                {/* Account Prefix */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Account Number Prefix *
                  </label>
                  <input
                    type="text"
                    name="accountPrefix"
                    value={formData.accountPrefix}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.accountPrefix ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 823949"
                  />
                  {errors.accountPrefix && <p className="text-red-500 text-sm mt-1">{errors.accountPrefix}</p>}
                  <p className="text-gray-500 text-sm mt-1">
                    Account numbers will be generated as: <code className="bg-gray-100 px-1 rounded">{formData.accountPrefix || 'PREFIX'}#[Unit Number]</code>
                  </p>
                </div>

                {/* Enhanced Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Enhanced Property Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-blue-800">
                      <span>Total Units:</span>
                      <span className="font-semibold">{calculateTotalUnits()}</span>
                    </div>
                    <div className="flex justify-between text-blue-800">
                      <span>Expected Monthly Revenue:</span>
                      <span className="font-semibold">KES {calculateTotalRevenue().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-blue-800">
                      <span>Unit Types:</span>
                      <span className="font-semibold">{formData.unitTypes.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Unit Types Configuration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Smart Unit Types & Ranges</h3>
                  <p className="text-sm text-gray-600">Define unit types with auto-generated account numbers</p>
                </div>
                <button
                  type="button"
                  onClick={addUnitType}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Unit Type</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.unitTypes.map((unitType, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-2">
                          {index + 1}
                        </span>
                        Unit Type #{index + 1}
                      </h4>
                      {formData.unitTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUnitType(index)}
                          disabled={loading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* Unit Type */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Type
                        </label>
                        <select
                          value={unitType.type}
                          onChange={(e) => handleUnitTypeChange(index, 'type', e.target.value)}
                          disabled={loading}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          {unitTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Start Unit */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Start Unit *
                        </label>
                        <input
                          type="text"
                          value={unitType.startUnit}
                          onChange={(e) => handleUnitTypeChange(index, 'startUnit', e.target.value)}
                          disabled={loading}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                            errors[`unitType_${index}_startUnit`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="A1"
                        />
                        {errors[`unitType_${index}_startUnit`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`unitType_${index}_startUnit`]}</p>
                        )}
                      </div>

                      {/* End Unit */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          End Unit *
                        </label>
                        <input
                          type="text"
                          value={unitType.endUnit}
                          onChange={(e) => handleUnitTypeChange(index, 'endUnit', e.target.value)}
                          disabled={loading}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                            errors[`unitType_${index}_endUnit`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="A10"
                        />
                        {errors[`unitType_${index}_endUnit`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`unitType_${index}_endUnit`]}</p>
                        )}
                      </div>

                      {/* Rent Amount */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Rent (KES) *
                        </label>
                        <input
                          type="number"
                          value={unitType.rentAmount}
                          onChange={(e) => handleUnitTypeChange(index, 'rentAmount', e.target.value)}
                          disabled={loading}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                            errors[`unitType_${index}_rentAmount`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="25000"
                          min="0"
                        />
                        {errors[`unitType_${index}_rentAmount`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`unitType_${index}_rentAmount`]}</p>
                        )}
                      </div>

                      {/* Units Count */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Units Count
                        </label>
                        <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium">
                          {(() => {
                            const startNum = parseInt(unitType.startUnit.match(/\d+/)?.[0] || '0');
                            const endNum = parseInt(unitType.endUnit.match(/\d+/)?.[0] || '0');
                            return Math.max(0, endNum - startNum + 1);
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Unit Description */}
                    <div className="mt-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={unitType.description}
                        onChange={(e) => handleUnitTypeChange(index, 'description', e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Additional details about this unit type..."
                      />
                    </div>

                    {/* Example Account Numbers */}
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <strong>Generated Account Numbers:</strong> 
                        <code className="ml-2 bg-blue-100 px-2 py-1 rounded">
                          {formData.accountPrefix || 'PREFIX'}#{unitType.startUnit}
                        </code> 
                        to 
                        <code className="ml-1 bg-blue-100 px-2 py-1 rounded">
                          {formData.accountPrefix || 'PREFIX'}#{unitType.endUnit}
                        </code>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Info Box */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-amber-800 font-medium">Enhanced Property Features:</h4>
                  <ul className="text-amber-700 text-sm mt-1 space-y-1">
                    <li>• <strong>Smart Unit Assignment:</strong> Tenants auto-assigned to available units</li>
                    <li>• <strong>M-Pesa Integration:</strong> Account numbers auto-generated for each unit</li>
                    <li>• <strong>Payment Tracking:</strong> Track overpayments, underpayments, and exact payments</li>
                    <li>• <strong>Unit-Based Analytics:</strong> Detailed occupancy and revenue reporting</li>
                    <li>• <strong>Flexible Configuration:</strong> Multiple unit types with different rent amounts</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {loading 
                    ? (property ? 'Updating...' : 'Creating...') 
                    : (property ? 'Update Enhanced Property' : 'Create Enhanced Property')
                  }
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedPropertyModal;