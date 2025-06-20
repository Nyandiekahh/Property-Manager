// backend/services/paymentService.js - Smart Payment Handling

import { db } from '../config/firebaseClient.js';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs,
  query,
  where 
} from 'firebase/firestore';

export class SmartPaymentService {
  
  // Process payment with smart handling
  async processPayment(paymentData) {
    const { tenantId, amount, accountNumber } = paymentData;
    
    // Get tenant details
    const tenant = await this.getTenantDetails(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const paidAmount = parseFloat(amount);
    const expectedRent = parseFloat(tenant.rentAmount);
    
    // Calculate payment scenario
    const paymentAnalysis = this.analyzePayment(paidAmount, expectedRent, tenant);
    
    // Record the payment
    const paymentRecord = await this.recordPayment({
      ...paymentData,
      amount: paidAmount,
      expectedAmount: expectedRent,
      paymentType: paymentAnalysis.type,
      overpaymentAmount: paymentAnalysis.overpayment,
      shortfallAmount: paymentAnalysis.shortfall,
      carryForward: paymentAnalysis.carryForward
    });

    // Update tenant status
    await this.updateTenantPaymentStatus(tenant, paymentAnalysis);
    
    // Handle notifications
    await this.handlePaymentNotifications(tenant, paymentAnalysis);
    
    return {
      success: true,
      paymentId: paymentRecord.id,
      analysis: paymentAnalysis,
      tenant: tenant.name,
      message: this.getPaymentMessage(paymentAnalysis)
    };
  }

  // Analyze payment amount vs expected rent
analyzePayment(paidAmount, expectedRent, tenant) {
  const currentBalance = parseFloat(tenant.accountBalance || 0);

  const newBalance = currentBalance + paidAmount;

  const analysis = {
    paidAmount,
    expectedRent,
    currentBalance,
    type: 'exact',
    overpayment: 0,
    shortfall: 0,
    carryForward: 0,
    newBalance,
    status: 'pending'
  };

  if (newBalance > 0) {
    analysis.type = 'overpayment';
    analysis.overpayment = newBalance;
    analysis.carryForward = newBalance;
    analysis.status = 'paid';
  } else if (newBalance < 0) {
    analysis.type = 'underpayment';
    analysis.shortfall = Math.abs(newBalance);
    analysis.status = 'partial';
  } else {
    analysis.type = 'exact';
    analysis.status = 'paid';
  }

  return analysis;
}



// Update tenant with smart payment status
async updateTenantPaymentStatus(tenant, analysis) {
  const tenantRef = doc(db, 'tenants', tenant.id);

  const updateData = {
    paymentStatus: analysis.status,
    lastPaymentDate: new Date(),
    accountBalance: analysis.newBalance,
    lastPaymentAmount: analysis.paidAmount,
    updatedAt: new Date()
  };

    // Add payment history to tenant record
    const paymentHistory = tenant.paymentHistory || [];
    paymentHistory.push({
      date: new Date(),
      amount: analysis.paidAmount,
      type: analysis.type,
      balance: analysis.newBalance,
      month: new Date().toISOString().substr(0, 7) // YYYY-MM format
    });
    
    updateData.paymentHistory = paymentHistory.slice(-12); // Keep last 12 months

    await updateDoc(tenantRef, updateData);
  }

  // Record payment with detailed information
  async recordPayment(paymentData) {
    const docRef = await addDoc(collection(db, 'payments'), {
      ...paymentData,
      createdAt: new Date(),
      amount: parseFloat(paymentData.amount),
      month: new Date().toISOString().substr(0, 7), // YYYY-MM
      processed: true
    });

    return { id: docRef.id };
  }

  // Handle notifications for different payment scenarios
  async handlePaymentNotifications(tenant, analysis) {
    const notifications = [];

    switch (analysis.type) {
      case 'overpayment':
        notifications.push({
          type: 'info',
          title: 'Overpayment Received',
          message: `${tenant.name} paid KES ${analysis.paidAmount.toLocaleString()}. Excess KES ${analysis.overpayment.toLocaleString()} carried forward to next month.`,
          tenantId: tenant.id,
          priority: 'low'
        });
        break;

      case 'underpayment':
        notifications.push({
          type: 'warning',
          title: 'Partial Payment Received',
          message: `${tenant.name} paid KES ${analysis.paidAmount.toLocaleString()}. Outstanding balance: KES ${analysis.shortfall.toLocaleString()}`,
          tenantId: tenant.id,
          priority: 'high'
        });
        break;

      case 'exact':
        notifications.push({
          type: 'success',
          title: 'Full Payment Received',
          message: `${tenant.name} paid the full rent amount of KES ${analysis.paidAmount.toLocaleString()}`,
          tenantId: tenant.id,
          priority: 'low'
        });
        break;
    }

    // Save notifications to database
    for (const notification of notifications) {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        landlordId: tenant.landlordId,
        read: false,
        createdAt: new Date()
      });
    }

    return notifications;
  }

  // Get human-readable payment message
  getPaymentMessage(analysis) {
    switch (analysis.type) {
      case 'overpayment':
        return `Payment successful! Overpayment of KES ${analysis.overpayment.toLocaleString()} has been carried forward to next month.`;
      
      case 'underpayment':
        return `Partial payment received. Outstanding balance: KES ${analysis.shortfall.toLocaleString()}. Please complete the payment.`;
      
      case 'exact':
        return `Perfect! Full rent payment received.`;
      
      default:
        return 'Payment processed successfully.';
    }
  }

  // Get tenant details
  async getTenantDetails(tenantId) {
    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantSnap = await getDoc(tenantRef);
    
    if (tenantSnap.exists()) {
      return { id: tenantSnap.id, ...tenantSnap.data() };
    }
    return null;
  }

  // Get tenant balance summary
  async getTenantBalance(tenantId) {
    const tenant = await this.getTenantDetails(tenantId);
    if (!tenant) return null;

    const currentBalance = parseFloat(tenant.accountBalance || 0);
    const monthlyRent = parseFloat(tenant.rentAmount || 0);

    return {
      tenantId,
      tenantName: tenant.name,
      currentBalance,
      monthlyRent,
      status: currentBalance >= 0 ? 'credit' : 'debt',
      balanceInMonths: monthlyRent > 0 ? (currentBalance / monthlyRent).toFixed(2) : 0,
      nextPaymentDue: monthlyRent - Math.max(0, currentBalance)
    };
  }

  // Generate payment reminders
  async generatePaymentReminders(landlordId) {
    const tenantsQuery = query(
      collection(db, 'tenants'),
      where('landlordId', '==', landlordId)
    );
    
    const snapshot = await getDocs(tenantsQuery);
    const tenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const reminders = [];
    
    for (const tenant of tenants) {
      const balance = await this.getTenantBalance(tenant.id);
      
      if (balance.status === 'debt') {
        reminders.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          amountDue: Math.abs(balance.currentBalance),
          type: 'overdue',
          priority: 'high'
        });
      } else if (balance.currentBalance < balance.monthlyRent) {
        const dueAmount = balance.monthlyRent - balance.currentBalance;
        reminders.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          amountDue: dueAmount,
          type: 'upcoming',
          priority: 'medium'
        });
      }
    }
    
    return reminders;
  }

  async billMonthlyRentForAllTenants() {
  const tenantsSnapshot = await getDocs(collection(db, 'tenants'));
  const now = new Date();
  const billedMonth = now.toISOString().substr(0, 7); // "YYYY-MM"

  for (const docSnap of tenantsSnapshot.docs) {
    const tenant = { id: docSnap.id, ...docSnap.data() };

    const rent = parseFloat(tenant.rentAmount || 0);
    const prevBalance = parseFloat(tenant.accountBalance || 0);

    const newBalance = prevBalance - rent;

    const updateData = {
      accountBalance: newBalance,
      paymentStatus: 'pending',
      updatedAt: now,
    };

    // Update balance and status
    const tenantRef = doc(db, 'tenants', tenant.id);
    await updateDoc(tenantRef, updateData);

    // Append to payment history
    const paymentHistory = tenant.paymentHistory || [];
    paymentHistory.push({
      date: now,
      amount: -rent,
      type: 'monthly billing',
      balance: newBalance,
      month: billedMonth,
    });

    await updateDoc(tenantRef, {
      paymentHistory: paymentHistory.slice(-12),
    });

    // Optional: add a reminder notification
    await addDoc(collection(db, 'notifications'), {
      tenantId: tenant.id,
      landlordId: tenant.landlordId,
      title: 'Rent Due This Month',
      message: `KES ${rent.toLocaleString()} rent has been billed for ${billedMonth}.`,
      type: 'reminder',
      priority: 'high',
      read: false,
      createdAt: now
    });
  }

  return { success: true, message: 'Monthly rent billed to all tenants.' };
}

}

const smartPaymentService = new SmartPaymentService();
export default smartPaymentService;
