// frontend/src/services/enhancedFirestoreService.js - Direct Firestore (No API)
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

// Generate account number based on property and unit
const generateAccountNumber = (accountPrefix, unitNumber) => {
  return `${accountPrefix}#${unitNumber}`;
};

// Enhanced Property Service - Direct Firestore
export const enhancedPropertyService = {
  // Create property with unit types
  async createProperty(propertyData, landlordId) {
    const {
      name,
      location,
      type,
      paybill,
      accountPrefix,
      unitTypes,
      description,
      image
    } = propertyData;

    // Generate all units based on unit types
    const allUnits = this.generateUnitsFromTypes(unitTypes, accountPrefix);
    const totalUnits = allUnits.length;

    const docRef = await addDoc(collection(db, 'properties'), {
      name,
      location,
      type,
      paybill,
      accountPrefix,
      unitTypes,
      description,
      image,
      landlordId,
      totalUnits,
      occupiedUnits: 0,
      availableUnits: totalUnits,
      units: allUnits,
      monthlyRevenue: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return docRef.id;
  },

  // Generate units from unit type configurations
  generateUnitsFromTypes(unitTypes, accountPrefix) {
    const units = [];
    
    unitTypes.forEach(unitType => {
      const { 
        type,
        startUnit, 
        endUnit, 
        rentAmount,
        description 
      } = unitType;
      
      const startNum = this.extractUnitNumber(startUnit);
      const endNum = this.extractUnitNumber(endUnit);
      const prefix = this.extractUnitPrefix(startUnit);
      
      for (let i = startNum; i <= endNum; i++) {
        const unitNumber = `${prefix}${i}`;
        const accountNumber = generateAccountNumber(accountPrefix, unitNumber);
        
        units.push({
          unitNumber,
          unitType: type,
          rentAmount: parseFloat(rentAmount),
          accountNumber,
          isOccupied: false,
          tenantId: null,
          description: description || `${type} unit`,
          createdAt: new Date()
        });
      }
    });
    
    return units;
  },

  extractUnitNumber(unitStr) {
    const match = unitStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  },

  extractUnitPrefix(unitStr) {
    const match = unitStr.match(/([A-Za-z]*)/);
    return match ? match[1] : '';
  },

  // Get all properties for landlord
  async getProperties(landlordId) {
    const q = query(
      collection(db, 'properties'),
      where('landlordId', '==', landlordId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get single property
  async getProperty(propertyId) {
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await getDoc(propertyRef);
    if (propertySnap.exists()) {
      return { id: propertySnap.id, ...propertySnap.data() };
    }
    return null;
  },

  // Update property
  async updateProperty(propertyId, propertyData) {
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      ...propertyData,
      updatedAt: new Date()
    });
  },

  // Delete property
  async deleteProperty(propertyId) {
    const propertyRef = doc(db, 'properties', propertyId);
    await deleteDoc(propertyRef);
  },

  // Get available units by type
  async getAvailableUnitsByType(propertyId, unitType = null) {
    const property = await this.getProperty(propertyId);
    if (!property || !property.units) return [];
    
    let availableUnits = property.units.filter(unit => !unit.isOccupied);
    
    if (unitType) {
      availableUnits = availableUnits.filter(unit => unit.unitType === unitType);
    }
    
    return availableUnits;
  },

  // Get unit types for property
  async getUnitTypes(propertyId) {
    const property = await this.getProperty(propertyId);
    if (!property || !property.unitTypes) return [];
    
    return property.unitTypes.map(unitType => ({
      type: unitType.type,
      rentAmount: unitType.rentAmount,
      availableCount: property.units ? property.units.filter(unit => 
        unit.unitType === unitType.type && !unit.isOccupied
      ).length : 0,
      totalCount: property.units ? property.units.filter(unit => 
        unit.unitType === unitType.type
      ).length : 0
    }));
  }
};

// Enhanced Tenant Service - Direct Firestore  
export const enhancedTenantService = {
  // Create tenant with auto unit assignment
  async createTenant(tenantData, landlordId) {
    const {
      name,
      email,
      phone,
      propertyId,
      unitType,
      preferredUnit,
      moveInDate,
      emergencyContact,
      emergencyPhone,
      idNumber,
      occupation
    } = tenantData;

    // Get available units of the specified type
    const availableUnits = await enhancedPropertyService.getAvailableUnitsByType(propertyId, unitType);
    
    if (availableUnits.length === 0) {
      throw new Error(`No available ${unitType} units in this property`);
    }

    // Select unit
    let selectedUnit;
    if (preferredUnit) {
      selectedUnit = availableUnits.find(unit => unit.unitNumber === preferredUnit);
      if (!selectedUnit) {
        throw new Error(`Preferred unit ${preferredUnit} is not available`);
      }
    } else {
      selectedUnit = availableUnits[0];
    }

    // Create tenant record
    const docRef = await addDoc(collection(db, 'tenants'), {
      name,
      email,
      phone,
      propertyId,
      unitNumber: selectedUnit.unitNumber,
      unitType: selectedUnit.unitType,
      rentAmount: selectedUnit.rentAmount,
      accountNumber: selectedUnit.accountNumber,
      moveInDate: moveInDate ? new Date(moveInDate) : new Date(),
      emergencyContact,
      emergencyPhone,
      idNumber,
      occupation,
      landlordId,
      paymentStatus: 'pending',
      accountBalance: 0,
      lastPaymentDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });

    // Update property unit occupancy
    await this.updateUnitOccupancy(propertyId, selectedUnit.unitNumber, docRef.id, true);

    return {
      tenantId: docRef.id,
      unitNumber: selectedUnit.unitNumber,
      unitType: selectedUnit.unitType,
      rentAmount: selectedUnit.rentAmount,
      accountNumber: selectedUnit.accountNumber
    };
  },

  // Update unit occupancy in property
  async updateUnitOccupancy(propertyId, unitNumber, tenantId, isOccupied) {
    const property = await enhancedPropertyService.getProperty(propertyId);
    if (!property || !property.units) return;

    const updatedUnits = property.units.map(unit => {
      if (unit.unitNumber === unitNumber) {
        return {
          ...unit,
          isOccupied,
          tenantId: isOccupied ? tenantId : null
        };
      }
      return unit;
    });

    const occupiedCount = updatedUnits.filter(unit => unit.isOccupied).length;
    const monthlyRevenue = updatedUnits
      .filter(unit => unit.isOccupied)
      .reduce((total, unit) => total + unit.rentAmount, 0);

    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      units: updatedUnits,
      occupiedUnits: occupiedCount,
      availableUnits: property.totalUnits - occupiedCount,
      monthlyRevenue,
      updatedAt: new Date()
    });
  },

  // Get all tenants for landlord (compatible with existing data)
  async getTenants(landlordId, filters = {}) {
    let q = query(
      collection(db, 'tenants'),
      where('landlordId', '==', landlordId)
    );

    // Add filters
    if (filters.propertyId) {
      q = query(q, where('propertyId', '==', filters.propertyId));
    }
    
    if (filters.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive));
    }

    const snapshot = await getDocs(q);
    const tenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return tenants.sort((a, b) => {
      const aDate = a.createdAt?.seconds || a.createdAt?.getTime() || 0;
      const bDate = b.createdAt?.seconds || b.createdAt?.getTime() || 0;
      return bDate - aDate;
    });
  },

  // Get tenant by ID
  async getTenant(tenantId) {
    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantSnap = await getDoc(tenantRef);
    if (tenantSnap.exists()) {
      return { id: tenantSnap.id, ...tenantSnap.data() };
    }
    return null;
  },

  // Update tenant
  async updateTenant(tenantId, updateData) {
    const tenantRef = doc(db, 'tenants', tenantId);
    await updateDoc(tenantRef, {
      ...updateData,
      updatedAt: new Date()
    });
  },

  // Move tenant out
  async moveTenantOut(tenantId, moveOutDate = null) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Update tenant status
    const tenantRef = doc(db, 'tenants', tenantId);
    await updateDoc(tenantRef, {
      isActive: false,
      moveOutDate: moveOutDate ? new Date(moveOutDate) : new Date(),
      paymentStatus: 'moved_out',
      updatedAt: new Date()
    });

    // Free up the unit
    if (tenant.propertyId && tenant.unitNumber) {
      await this.updateUnitOccupancy(tenant.propertyId, tenant.unitNumber, null, false);
    }

    return {
      success: true,
      message: `${tenant.name} has been moved out from unit ${tenant.unitNumber}`,
      unitFreed: tenant.unitNumber
    };
  },

  // Delete tenant
  async deleteTenant(tenantId) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Free up the unit if tenant is still active
    if (tenant.isActive && tenant.propertyId && tenant.unitNumber) {
      await this.updateUnitOccupancy(tenant.propertyId, tenant.unitNumber, null, false);
    }

    // Delete tenant record
    const tenantRef = doc(db, 'tenants', tenantId);
    await deleteDoc(tenantRef);

    return {
      success: true,
      message: `Tenant ${tenant.name} has been permanently deleted`,
      unitFreed: tenant.unitNumber
    };
  },

  // Get tenant statistics (works with existing and new data)
  async getTenantStatistics(landlordId) {
    const allTenants = await this.getTenants(landlordId);
    const activeTenants = allTenants.filter(t => t.isActive !== false); // Works with existing data
    
    const stats = {
      total: allTenants.length,
      active: activeTenants.length,
      movedOut: allTenants.length - activeTenants.length,
      paymentStatus: {
        paid: activeTenants.filter(t => t.paymentStatus === 'paid').length,
        pending: activeTenants.filter(t => t.paymentStatus === 'pending' || !t.paymentStatus).length,
        partial: activeTenants.filter(t => t.paymentStatus === 'partial').length,
        overdue: activeTenants.filter(t => t.paymentStatus === 'overdue').length
      },
      unitTypes: {},
      totalMonthlyRent: activeTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0)
    };

    // Count by unit types (works with both old and new data)
    activeTenants.forEach(tenant => {
      const unitType = tenant.unitType || 'unknown';
      if (!stats.unitTypes[unitType]) {
        stats.unitTypes[unitType] = 0;
      }
      stats.unitTypes[unitType]++;
    });

    return stats;
  }
};

// Utility functions
export const enhancedUtils = {
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  },

  getUnitTypeDisplayName(unitType) {
    const displayNames = {
      'bedsitter': 'Bedsitter',
      '1bedroom': '1 Bedroom',
      '2bedroom': '2 Bedroom',
      '3bedroom': '3 Bedroom',
      'studio': 'Studio',
      'penthouse': 'Penthouse'
    };
    return displayNames[unitType] || unitType;
  },

  validateUnitRange(startUnit, endUnit) {
    const startNum = parseInt(startUnit.match(/\d+/)?.[0] || '0');
    const endNum = parseInt(endUnit.match(/\d+/)?.[0] || '0');
    const startPrefix = startUnit.match(/[A-Za-z]*/)?.[0] || '';
    const endPrefix = endUnit.match(/[A-Za-z]*/)?.[0] || '';
    
    return {
      isValid: startPrefix === endPrefix && startNum <= endNum,
      count: Math.max(0, endNum - startNum + 1),
      prefix: startPrefix
    };
  },

  calculateTotalUnits(unitTypes) {
    return unitTypes.reduce((total, unitType) => {
      const validation = this.validateUnitRange(unitType.startUnit, unitType.endUnit);
      return total + validation.count;
    }, 0);
  },

  calculateExpectedRevenue(unitTypes) {
    return unitTypes.reduce((total, unitType) => {
      const validation = this.validateUnitRange(unitType.startUnit, unitType.endUnit);
      const rent = parseFloat(unitType.rentAmount) || 0;
      return total + (validation.count * rent);
    }, 0);
  }
};

export default {
  enhancedPropertyService,
  enhancedTenantService,
  enhancedUtils
};