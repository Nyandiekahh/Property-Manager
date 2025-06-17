// backend/services/enhancedTenantService.js - Advanced Tenant Management

import { db } from '../config/firebaseClient.js';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where 
} from 'firebase/firestore';
import EnhancedPropertyService from './enhancedPropertyService.js';

export class EnhancedTenantService {
  
  // Create tenant with automatic unit assignment
  async createTenant(tenantData, landlordId) {
    const {
      name,
      email,
      phone,
      propertyId,
      unitType, // 'bedsitter', '1bedroom', '2bedroom', '3bedroom'
      preferredUnit, // Optional specific unit number
      moveInDate,
      emergencyContact,
      emergencyPhone,
      idNumber,
      occupation
    } = tenantData;

    // Validate required fields
    if (!propertyId || !unitType) {
      throw new Error('Property and unit type are required');
    }

    // Get available units of the specified type
    const availableUnits = await EnhancedPropertyService.getAvailableUnitsByType(propertyId, unitType);
    
    if (availableUnits.length === 0) {
      throw new Error(`No available ${unitType} units in this property`);
    }

    // Select unit (preferred if available, otherwise first available)
    let selectedUnit;
    if (preferredUnit) {
      selectedUnit = availableUnits.find(unit => unit.unitNumber === preferredUnit);
      if (!selectedUnit) {
        throw new Error(`Preferred unit ${preferredUnit} is not available`);
      }
    } else {
      selectedUnit = availableUnits[0]; // Auto-assign first available
    }

    // Create tenant record
    const docRef = await addDoc(collection(db, 'tenants'), {
      name,
      email,
      phone,
      propertyId,
      unitNumber: selectedUnit.unitNumber,
      unitType: selectedUnit.unitType,
      rentAmount: selectedUnit.rentAmount, // Auto-filled from unit
      accountNumber: selectedUnit.accountNumber, // Auto-generated
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

    // Assign tenant to the unit in property
    await EnhancedPropertyService.assignTenantToUnit(
      propertyId, 
      selectedUnit.unitNumber, 
      docRef.id
    );

    return {
      tenantId: docRef.id,
      unitNumber: selectedUnit.unitNumber,
      unitType: selectedUnit.unitType,
      rentAmount: selectedUnit.rentAmount,
      accountNumber: selectedUnit.accountNumber
    };
  }

  // Move tenant out (vacate unit)
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
    await EnhancedPropertyService.removeTenantFromUnit(
      tenant.propertyId, 
      tenant.unitNumber
    );

    return {
      success: true,
      message: `${tenant.name} has been moved out from unit ${tenant.unitNumber}`,
      unitFreed: tenant.unitNumber
    };
  }

  // Get tenant by ID
  async getTenant(tenantId) {
    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantSnap = await getDoc(tenantRef);
    if (tenantSnap.exists()) {
      return { id: tenantSnap.id, ...tenantSnap.data() };
    }
    return null;
  }

  // Get tenant by account number
  async getTenantByAccountNumber(accountNumber) {
    const q = query(
      collection(db, 'tenants'),
      where('accountNumber', '==', accountNumber),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  }

  // Get all tenants for landlord
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
    
    // Sort by creation date
    return tenants.sort((a, b) => {
      const aDate = a.createdAt?.seconds || a.createdAt?.getTime() || 0;
      const bDate = b.createdAt?.seconds || b.createdAt?.getTime() || 0;
      return bDate - aDate;
    });
  }

  // Update tenant information
  async updateTenant(tenantId, updateData) {
    const tenantRef = doc(db, 'tenants', tenantId);
    
    // Remove fields that shouldn't be updated directly
    const { rentAmount, accountNumber, unitNumber, unitType, ...allowedUpdates } = updateData;
    
    await updateDoc(tenantRef, {
      ...allowedUpdates,
      updatedAt: new Date()
    });
  }

  // Transfer tenant to different unit (within same or different property)
  async transferTenant(tenantId, newPropertyId, newUnitType, preferredUnit = null) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Get available units in new property
    const availableUnits = await EnhancedPropertyService.getAvailableUnitsByType(
      newPropertyId, 
      newUnitType
    );
    
    if (availableUnits.length === 0) {
      throw new Error(`No available ${newUnitType} units in the target property`);
    }

    // Select new unit
    let newUnit;
    if (preferredUnit) {
      newUnit = availableUnits.find(unit => unit.unitNumber === preferredUnit);
      if (!newUnit) {
        throw new Error(`Preferred unit ${preferredUnit} is not available`);
      }
    } else {
      newUnit = availableUnits[0];
    }

    // Free current unit
    await EnhancedPropertyService.removeTenantFromUnit(
      tenant.propertyId, 
      tenant.unitNumber
    );

    // Assign to new unit
    await EnhancedPropertyService.assignTenantToUnit(
      newPropertyId, 
      newUnit.unitNumber, 
      tenantId
    );

    // Update tenant record
    const tenantRef = doc(db, 'tenants', tenantId);
    await updateDoc(tenantRef, {
      propertyId: newPropertyId,
      unitNumber: newUnit.unitNumber,
      unitType: newUnit.unitType,
      rentAmount: newUnit.rentAmount,
      accountNumber: newUnit.accountNumber,
      transferDate: new Date(),
      updatedAt: new Date()
    });

    return {
      success: true,
      message: `${tenant.name} transferred to unit ${newUnit.unitNumber}`,
      oldUnit: tenant.unitNumber,
      newUnit: newUnit.unitNumber,
      newRent: newUnit.rentAmount,
      newAccountNumber: newUnit.accountNumber
    };
  }

  // Get tenant payment summary
  async getTenantPaymentSummary(tenantId) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return null;

    const currentBalance = parseFloat(tenant.accountBalance || 0);
    const monthlyRent = parseFloat(tenant.rentAmount || 0);
    const status = tenant.paymentStatus || 'pending';

    return {
      tenantId,
      tenantName: tenant.name,
      unitNumber: tenant.unitNumber,
      unitType: tenant.unitType,
      monthlyRent,
      currentBalance,
      paymentStatus: status,
      accountNumber: tenant.accountNumber,
      lastPaymentDate: tenant.lastPaymentDate,
      isActive: tenant.isActive,
      // Calculated fields
      amountDue: Math.max(0, monthlyRent - Math.max(0, currentBalance)),
      creditBalance: Math.max(0, currentBalance),
      debtBalance: Math.max(0, -currentBalance)
    };
  }

  // Delete tenant (hard delete - use with caution)
  async deleteTenant(tenantId) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Free up the unit if tenant is still active
    if (tenant.isActive) {
      await EnhancedPropertyService.removeTenantFromUnit(
        tenant.propertyId, 
        tenant.unitNumber
      );
    }

    // Delete tenant record
    const tenantRef = doc(db, 'tenants', tenantId);
    await deleteDoc(tenantRef);

    return {
      success: true,
      message: `Tenant ${tenant.name} has been permanently deleted`,
      unitFreed: tenant.unitNumber
    };
  }

  // Get tenant statistics for landlord
  async getTenantStatistics(landlordId) {
    const allTenants = await this.getTenants(landlordId);
    const activeTenants = allTenants.filter(t => t.isActive);
    
    const stats = {
      total: allTenants.length,
      active: activeTenants.length,
      movedOut: allTenants.length - activeTenants.length,
      paymentStatus: {
        paid: activeTenants.filter(t => t.paymentStatus === 'paid').length,
        pending: activeTenants.filter(t => t.paymentStatus === 'pending').length,
        partial: activeTenants.filter(t => t.paymentStatus === 'partial').length,
        overdue: activeTenants.filter(t => t.paymentStatus === 'overdue').length
      },
      unitTypes: {},
      totalMonthlyRent: activeTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0)
    };

    // Count by unit types
    activeTenants.forEach(tenant => {
      const unitType = tenant.unitType || 'unknown';
      if (!stats.unitTypes[unitType]) {
        stats.unitTypes[unitType] = 0;
      }
      stats.unitTypes[unitType]++;
    });

    return stats;
  }
}

export default new EnhancedTenantService();