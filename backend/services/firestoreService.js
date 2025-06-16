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
  where, 
  orderBy 
} from 'firebase/firestore';

// Generate unique account number for tenant
const generateAccountNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${timestamp.slice(-6)}${random}`;
};

// Tenant Management (Backend)
export const tenantService = {
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
  }
};

// Payment Management (Backend)
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
      await tenantService.updateTenantPaymentStatus(paymentData.tenantId, paymentData.amount);
    }

    return docRef.id;
  },

  // Update payment status
  async updatePayment(paymentId, updateData) {
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, {
      ...updateData,
      updatedAt: new Date()
    });
  }
};