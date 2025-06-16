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
    const effectivePayment = paidAmount + currentBalance;
    
    let analysis = {
      paidAmount,
      expectedRent,
      currentBalance,
      effectivePayment,
      type: 'exact',
      overpayment: 0,
      shortfall: 0,
      carryForward: 0,
      newBalance: 0,
      status: 'paid'
    };

    if (effectivePayment > expectedRent) {
      // OVERPAYMENT - Carry forward to next month
      analysis.type = 'overpayment';
      analysis.overpayment = effectivePayment - expectedRent;
      analysis.carryForward = analysis.overpayment;
      analysis.newBalance = analysis.overpayment;
      analysis.status = 'paid';
      
    } else if (effectivePayment < expectedRent) {
      // UNDERPAYMENT - Partial payment
      analysis.type = 'underpayment';
      analysis.shortfall = expectedRent - effectivePayment;
      analysis.newBalance = -analysis.shortfall; // Negative balance = debt
      analysis.status = 'partial';
      
    } else {
      // EXACT PAYMENT
      analysis.type = 'exact';
      analysis.newBalance = 0;
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
}

export default new SmartPaymentService();