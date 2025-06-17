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

// Generate unique account number for tenant
const generateAccountNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${timestamp.slice(-6)}${random}`;
};

// Property Management
export const propertyService = {
  // Get all properties for a landlord
  async getProperties(landlordId) {
    const q = query(
      collection(db, 'properties'), 
      where('landlordId', '==', landlordId)
    );
    const snapshot = await getDocs(q);
    const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort in JavaScript instead of Firestore
    return properties.sort((a, b) => {
      const aDate = a.createdAt?.seconds || a.createdAt?.getTime() || 0;
      const bDate = b.createdAt?.seconds || b.createdAt?.getTime() || 0;
      return bDate - aDate;
    });
  },

  // Add new property
  async createProperty(propertyData, landlordId) {
    const docRef = await addDoc(collection(db, 'properties'), {
      ...propertyData,
      landlordId,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalUnits: parseInt(propertyData.units),
      occupiedUnits: 0,
      monthlyRevenue: 0
    });
    return docRef.id;
  },

  // Update property
  async updateProperty(propertyId, propertyData) {
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      ...propertyData,
      updatedAt: new Date(),
      totalUnits: parseInt(propertyData.units || propertyData.totalUnits)
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
  }
};

// Tenant Management
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
    
    // Sort in JavaScript
    return tenants.sort((a, b) => {
      const aDate = a.createdAt?.seconds || a.createdAt?.getTime() || 0;
      const bDate = b.createdAt?.seconds || b.createdAt?.getTime() || 0;
      return bDate - aDate;
    });
  },

  // Add new tenant
  async createTenant(tenantData, landlordId) {
    const accountNumber = generateAccountNumber();
    
    const docRef = await addDoc(collection(db, 'tenants'), {
      ...tenantData,
      landlordId,
      accountNumber,
      paymentStatus: 'pending',
      lastPaymentDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      rentAmount: parseFloat(tenantData.rentAmount)
    });

    // Update property occupied units
    await this.updatePropertyOccupancy(tenantData.propertyId);
    
    return docRef.id;
  },

  // Update tenant
  async updateTenant(tenantId, tenantData) {
    const tenantRef = doc(db, 'tenants', tenantId);
    await updateDoc(tenantRef, {
      ...tenantData,
      updatedAt: new Date(),
      rentAmount: parseFloat(tenantData.rentAmount)
    });
  },

  // Delete tenant
  async deleteTenant(tenantId) {
    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantSnap = await getDoc(tenantRef);
    
    if (tenantSnap.exists()) {
      const tenantData = tenantSnap.data();
      await deleteDoc(tenantRef);
      
      // Update property occupied units
      await this.updatePropertyOccupancy(tenantData.propertyId);
    }
  },

  // Update property occupancy count
  async updatePropertyOccupancy(propertyId) {
    const tenantsQuery = query(
      collection(db, 'tenants'),
      where('propertyId', '==', propertyId)
    );
    const tenantsSnapshot = await getDocs(tenantsQuery);
    const occupiedUnits = tenantsSnapshot.size;

    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      occupiedUnits,
      updatedAt: new Date()
    });
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

// Payment Management
export const paymentService = {
  // Record new payment
  async recordPayment(paymentData) {
    const docRef = await addDoc(collection(db, 'payments'), {
      ...paymentData,
      createdAt: new Date(),
      amount: parseFloat(paymentData.amount)
    });

    // Update tenant payment status
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
    
    // Sort in JavaScript
    return payments.sort((a, b) => {
      const aDate = a.createdAt?.seconds || a.createdAt?.getTime() || 0;
      const bDate = b.createdAt?.seconds || b.createdAt?.getTime() || 0;
      return bDate - aDate;
    });
  },

  // Update tenant payment status
  async updateTenantPaymentStatus(tenantId, amount) {
    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantSnap = await getDoc(tenantRef);
    
    if (tenantSnap.exists()) {
      const tenantData = tenantSnap.data();
      const rentAmount = tenantData.rentAmount;
      
      let paymentStatus = 'pending';
      if (amount >= rentAmount) {
        paymentStatus = 'paid';
      } else if (amount > 0) {
        paymentStatus = 'partial';
      }

      await updateDoc(tenantRef, {
        paymentStatus,
        lastPaymentDate: new Date(),
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

// Dashboard Analytics
export const analyticsService = {
  // Get dashboard data for landlord
  async getDashboardData(landlordId) {
    const [properties, tenants, payments] = await Promise.all([
      propertyService.getProperties(landlordId),
      tenantService.getTenants(landlordId),
      paymentService.getPayments(landlordId)
    ]);

    const totalProperties = properties.length;
    const totalTenants = tenants.length;
    const totalUnits = properties.reduce((sum, p) => sum + (p.totalUnits || 0), 0);
    const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0);
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;

    // Calculate monthly revenue
    const monthlyRevenue = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);

    // Payment statistics
    const thisMonth = new Date();
    const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    
    const thisMonthPayments = payments.filter(p => {
      const paymentDate = p.createdAt?.seconds ? 
        new Date(p.createdAt.seconds * 1000) : 
        new Date(p.createdAt);
      return paymentDate >= firstDayOfMonth && p.status === 'completed';
    });

    const paidTenants = tenants.filter(t => t.paymentStatus === 'paid').length;
    const pendingPayments = tenants.filter(t => t.paymentStatus === 'pending').length;
    const overduePayments = tenants.filter(t => t.paymentStatus === 'overdue').length;

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
      thisMonthRevenue: thisMonthPayments.reduce((sum, p) => sum + p.amount, 0),
      recentPayments: payments.slice(0, 5),
      properties,
      tenants: tenants.slice(0, 10)
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