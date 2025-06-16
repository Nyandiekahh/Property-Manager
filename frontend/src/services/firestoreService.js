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

// Generate systematic account number based on property and unit
const generateAccountNumber = (propertyCode, unitNumber) => {
  // Remove special characters and spaces from unit number
  const cleanUnit = unitNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Format: PROPERTYCODE#UNIT (e.g., "187293#C4")
  return `${propertyCode}#${cleanUnit}`;
};

// Property Management - ENHANCED
export const propertyService = {
  // Get all properties for a landlord with consistent unit calculations
  async getProperties(landlordId) {
    const q = query(
      collection(db, 'properties'), 
      where('landlordId', '==', landlordId)
    );
    const snapshot = await getDocs(q);
    const properties = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure totalUnits is consistent
        totalUnits: data.totalUnits || data.units || 0,
        occupiedUnits: data.occupiedUnits || 0
      };
    });
    
    return properties.sort((a, b) => {
      const aDate = a.createdAt?.seconds || a.createdAt?.getTime() || 0;
      const bDate = b.createdAt?.seconds || b.createdAt?.getTime() || 0;
      return bDate - aDate;
    });
  },

  // Add new property with paybill configuration
  async createProperty(propertyData, landlordId) {
    const docRef = await addDoc(collection(db, 'properties'), {
      ...propertyData,
      landlordId,
      // Add paybill configuration
      paybillCode: propertyData.paybillCode || '187293', // Default or custom
      accountPrefix: propertyData.accountPrefix || propertyData.paybillCode || '187293',
      createdAt: new Date(),
      updatedAt: new Date(),
      totalUnits: parseInt(propertyData.units),
      occupiedUnits: 0,
      monthlyRevenue: 0,
      // Enhanced property data
      units: [], // Will store unit details
      availableUnits: parseInt(propertyData.units) // Track available units
    });
    
    // Create individual units for the property
    await this.createPropertyUnits(docRef.id, propertyData);
    
    return docRef.id;
  },

  // Create individual units for a property
  async createPropertyUnits(propertyId, propertyData) {
    const totalUnits = parseInt(propertyData.units);
    const units = [];
    
    for (let i = 1; i <= totalUnits; i++) {
      const unitNumber = propertyData.unitNamingPattern ? 
        propertyData.unitNamingPattern.replace('{n}', i) : 
        `${i}`;
      
      units.push({
        unitNumber,
        isOccupied: false,
        rentAmount: parseFloat(propertyData.rentPerUnit) || 0,
        accountNumber: generateAccountNumber(
          propertyData.paybillCode || '187293', 
          unitNumber
        ),
        tenantId: null
      });
    }
    
    // Update property with units
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      units,
      updatedAt: new Date()
    });
  },

  // Update property with proper unit handling
  async updateProperty(propertyId, propertyData) {
    const updateData = { ...propertyData };
    
    // Ensure totalUnits is properly set
    if (propertyData.units) {
      updateData.totalUnits = parseInt(propertyData.units);
    }
    if (propertyData.totalUnits) {
      updateData.totalUnits = parseInt(propertyData.totalUnits);
    }
    
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      ...updateData,
      updatedAt: new Date()
    });
  },

  // Delete property
  async deleteProperty(propertyId) {
    const propertyRef = doc(db, 'properties', propertyId);
    await deleteDoc(propertyRef);
  },

  // Get property by ID
  async getProperty(propertyId) {
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await getDoc(propertyRef);
    if (propertySnap.exists()) {
      return { id: propertySnap.id, ...propertySnap.data() };
    }
    return null;
  },

  // Get available units for a property
  async getAvailableUnits(propertyId) {
    const property = await this.getProperty(propertyId);
    if (!property || !property.units) return [];
    
    return property.units.filter(unit => !unit.isOccupied);
  }
};

// Tenant Management - ENHANCED
export const tenantService = {
  // Get all tenants for a landlord
  async getTenants(landlordId, propertyId = null) {
    let q;
    if (propertyId) {
      q = query(
        collection(db, 'tenants'),
        where('landlordId', '==', landlordId),
        where('propertyId', '==', propertyId)
      );
    } else {
      q = query(
        collection(db, 'tenants'),
        where('landlordId', '==', landlordId)
      );
    }
    const snapshot = await getDocs(q);
    const tenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return tenants.sort((a, b) => {
      const aDate = a.createdAt?.seconds || a.createdAt?.getTime() || 0;
      const bDate = b.createdAt?.seconds || b.createdAt?.getTime() || 0;
      return bDate - aDate;
    });
  },

  // Add new tenant with automatic unit assignment
  async createTenant(tenantData, landlordId) {
    // Get property details to get unit and rent information
    const property = await propertyService.getProperty(tenantData.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Get available units
    const availableUnits = await propertyService.getAvailableUnits(tenantData.propertyId);
    if (availableUnits.length === 0) {
      throw new Error('No available units in this property');
    }

    // Auto-assign to first available unit or use specified unit
    let assignedUnit;
    if (tenantData.unit) {
      // Check if specified unit is available
      assignedUnit = availableUnits.find(unit => unit.unitNumber === tenantData.unit);
      if (!assignedUnit) {
        throw new Error(`Unit ${tenantData.unit} is not available`);
      }
    } else {
      // Auto-assign first available unit
      assignedUnit = availableUnits[0];
    }

    // Generate account number using property code and unit
    const accountNumber = assignedUnit.accountNumber;
    
    // Check if account number already exists (shouldn't happen with proper unit management)
    const existingTenant = await this.getTenantByAccountNumber(accountNumber);
    if (existingTenant) {
      throw new Error(`Unit ${assignedUnit.unitNumber} is already occupied`);
    }

    const docRef = await addDoc(collection(db, 'tenants'), {
      ...tenantData,
      landlordId,
      accountNumber,
      unit: assignedUnit.unitNumber,
      rentAmount: assignedUnit.rentAmount, // Use unit's rent amount
      paymentStatus: 'pending',
      lastPaymentDate: null,
      accountBalance: 0, // Initialize balance
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update property unit occupancy
    await this.updateUnitOccupancy(tenantData.propertyId, assignedUnit.unitNumber, docRef.id, true);
    
    return {
      tenantId: docRef.id,
      accountNumber,
      unitNumber: assignedUnit.unitNumber,
      rentAmount: assignedUnit.rentAmount
    };
  },

  // Update unit occupancy in property
  async updateUnitOccupancy(propertyId, unitNumber, tenantId, isOccupied) {
    const property = await propertyService.getProperty(propertyId);
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

    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      units: updatedUnits,
      occupiedUnits: occupiedCount,
      availableUnits: property.totalUnits - occupiedCount,
      updatedAt: new Date()
    });
  },

  // Update tenant
  async updateTenant(tenantId, tenantData) {
    const tenantRef = doc(db, 'tenants', tenantId);
    await updateDoc(tenantRef, {
      ...tenantData,
      updatedAt: new Date()
    });
  },

  // Delete tenant and free up unit
  async deleteTenant(tenantId) {
    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantSnap = await getDoc(tenantRef);
    
    if (tenantSnap.exists()) {
      const tenantData = tenantSnap.data();
      await deleteDoc(tenantRef);
      
      // Free up the unit
      await this.updateUnitOccupancy(
        tenantData.propertyId, 
        tenantData.unit, 
        null, 
        false
      );
    }
  },

  // Get tenant by account number
  async getTenantByAccountNumber(accountNumber) {
    const q = query(
      collection(db, 'tenants'),
      where('accountNumber', '==', accountNumber)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  }
};

// Payment Management - ENHANCED
export const paymentService = {
  // Record new payment
  async recordPayment(paymentData) {
    const docRef = await addDoc(collection(db, 'payments'), {
      ...paymentData,
      createdAt: new Date(),
      amount: parseFloat(paymentData.amount)
    });

    // Update tenant payment status if payment is completed
    if (paymentData.tenantId && paymentData.status === 'completed') {
      await this.updateTenantPaymentStatus(paymentData.tenantId, paymentData.amount);
    }

    return docRef.id;
  },

  // Get payments for a landlord
  async getPayments(landlordId, filters = {}) {
    let q = query(
      collection(db, 'payments'),
      where('landlordId', '==', landlordId)
    );

    // Add filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.tenantId) {
      q = query(q, where('tenantId', '==', filters.tenantId));
    }

    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return payments.sort((a, b) => {
      const aDate = a.createdAt?.seconds || a.createdAt?.getTime() || 0;
      const bDate = b.createdAt?.seconds || b.createdAt?.getTime() || 0;
      return bDate - aDate;
    });
  },

  // ENHANCED: Smart tenant payment status update
  async updateTenantPaymentStatus(tenantId, amount) {
    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantSnap = await getDoc(tenantRef);
    
    if (tenantSnap.exists()) {
      const tenantData = tenantSnap.data();
      const rentAmount = tenantData.rentAmount;
      const currentBalance = parseFloat(tenantData.accountBalance || 0);
      const effectivePayment = amount + currentBalance;
      
      let paymentStatus = 'pending';
      let newBalance = 0;
      
      if (effectivePayment >= rentAmount) {
        paymentStatus = 'paid';
        newBalance = effectivePayment - rentAmount; // Carry forward excess
      } else if (effectivePayment > 0) {
        paymentStatus = 'partial';
        newBalance = effectivePayment - rentAmount; // Negative = debt
      }

      await updateDoc(tenantRef, {
        paymentStatus,
        lastPaymentDate: new Date(),
        accountBalance: newBalance,
        lastPaymentAmount: amount,
        updatedAt: new Date()
      });
    }
  },

  // Get payment history for a tenant
  async getPaymentHistory(tenantId) {
    const q = query(
      collection(db, 'payments'),
      where('tenantId', '==', tenantId)
    );
    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return payments.sort((a, b) => {
      const aDate = a.createdAt?.seconds || a.createdAt?.getTime() || 0;
      const bDate = b.createdAt?.seconds || b.createdAt?.getTime() || 0;
      return bDate - aDate;
    });
  }
};

// FIXED: Dashboard Analytics
export const analyticsService = {
  // Get dashboard data for landlord with PROPER calculations
  async getDashboardData(landlordId) {
    const [properties, tenants, payments] = await Promise.all([
      propertyService.getProperties(landlordId),
      tenantService.getTenants(landlordId),
      paymentService.getPayments(landlordId)
    ]);

    // FIXED: Consistent unit calculations
    const totalProperties = properties.length;
    const totalTenants = tenants.length;
    
    // Calculate total units properly - check both fields
    const totalUnits = properties.reduce((sum, p) => {
      const units = p.totalUnits || p.units || 0;
      return sum + parseInt(units);
    }, 0);
    
    // Calculate occupied units - count actual tenants per property
    let occupiedUnits = 0;
    properties.forEach(property => {
      const propertyTenants = tenants.filter(t => t.propertyId === property.id);
      occupiedUnits += propertyTenants.length;
    });
    
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;

    // FIXED: Monthly revenue calculation
    const monthlyRevenue = tenants.reduce((sum, t) => {
      const rent = parseFloat(t.rentAmount) || 0;
      return sum + rent;
    }, 0);

    // Payment statistics with proper date handling
    const thisMonth = new Date();
    const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    
    const thisMonthPayments = payments.filter(p => {
      const paymentDate = p.createdAt?.seconds ? 
        new Date(p.createdAt.seconds * 1000) : 
        new Date(p.createdAt);
      return paymentDate >= firstDayOfMonth && p.status === 'completed';
    });

    // FIXED: Payment status calculations
    const paidTenants = tenants.filter(t => t.paymentStatus === 'paid').length;
    const pendingPayments = tenants.filter(t => 
      t.paymentStatus === 'pending' || !t.paymentStatus
    ).length;
    const overduePayments = tenants.filter(t => t.paymentStatus === 'overdue').length;
    const partialPayments = tenants.filter(t => t.paymentStatus === 'partial').length;

    // Calculate this month's revenue from actual payments
    const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalProperties,
      totalTenants,
      totalUnits,
      occupiedUnits,
      occupancyRate: parseFloat(occupancyRate),
      monthlyRevenue,
      paidTenants,
      pendingPayments,
      overduePayments,
      partialPayments,
      thisMonthRevenue,
      recentPayments: payments.slice(0, 5),
      properties,
      tenants: tenants.slice(0, 10),
      // Additional stats
      averageRent: totalTenants > 0 ? (monthlyRevenue / totalTenants) : 0,
      collectionRate: totalTenants > 0 ? ((paidTenants / totalTenants) * 100).toFixed(1) : 0
    };
  }
};

// Real-time listeners (simplified - no orderBy)
export const subscribeToPayments = (landlordId, callback) => {
  const q = query(
    collection(db, 'payments'),
    where('landlordId', '==', landlordId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort in JavaScript
    const sortedPayments = payments.sort((a, b) => {
      const aDate = a.createdAt?.seconds || a.createdAt?.getTime() || 0;
      const bDate = b.createdAt?.seconds || b.createdAt?.getTime() || 0;
      return bDate - aDate;
    });
    callback(sortedPayments);
  });
};

export const subscribeToTenants = (landlordId, callback) => {
  const q = query(
    collection(db, 'tenants'),
    where('landlordId', '==', landlordId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const tenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort in JavaScript
    const sortedTenants = tenants.sort((a, b) => {
      const aDate = a.createdAt?.seconds || a.createdAt?.getTime() || 0;
      const bDate = b.createdAt?.seconds || b.createdAt?.getTime() || 0;
      return bDate - aDate;
    });
    callback(sortedTenants);
  });
};