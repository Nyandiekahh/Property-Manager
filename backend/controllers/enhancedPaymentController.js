// backend/controllers/enhancedPaymentController.js - Enhanced with Email Integration
import mpesaService from '../services/mpesaService.js';
import SmartPaymentService from '../services/paymentService.js';
import EnhancedTenantService from '../services/enhancedTenantService.js';
import EnhancedPropertyService from '../services/enhancedPropertyService.js';
import enhancedEmailService from '../services/enhancedEmailService.js';
import { db } from '../config/firebaseClient.js';
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';

// Enhanced payment simulation with smart processing and email confirmation
export async function simulatePayment(req, res) {
  try {
    const { accountNumber, amount, phoneNumber } = req.body;
    
    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        error: 'accountNumber is required'
      });
    }

    // Find the tenant by account number
    const tenant = await EnhancedTenantService.getTenantByAccountNumber(accountNumber);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: `No tenant found with account number: ${accountNumber}`
      });
    }

    // Get property details
    const property = await EnhancedPropertyService.getProperty(tenant.propertyId);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // Use tenant's data with override amount if provided
    const paymentAmount = amount ? parseFloat(amount) : parseFloat(tenant.rentAmount);
    const payerPhone = phoneNumber || tenant.phone || '254708374149';

    // Process payment with smart handling
    const paymentData = {
      landlordId: tenant.landlordId,
      tenantId: tenant.id,
      propertyId: tenant.propertyId,
      amount: paymentAmount,
      expectedAmount: tenant.rentAmount,
      phoneNumber: payerPhone,
      accountNumber: accountNumber,
      method: 'M-Pesa',
      status: 'completed',
      mpesaReceiptNumber: 'SIM' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      description: `Rent payment for ${tenant.name}`,
      source: 'simulation',
      createdAt: new Date()
    };

    // Use smart payment service to process
    const result = await SmartPaymentService.processPayment(paymentData);

    // Send payment confirmation email if tenant has email
    if (tenant.email) {
      try {
        await enhancedEmailService.sendPaymentConfirmationEmail(
          {
            name: tenant.name,
            email: tenant.email,
            unitNumber: tenant.unitNumber
          },
          {
            name: property.name
          },
          {
            amount: paymentAmount,
            mpesaReceiptNumber: paymentData.mpesaReceiptNumber,
            paymentType: result.analysis?.type || 'exact',
            overpaymentAmount: result.analysis?.overpayment || 0,
            shortfallAmount: result.analysis?.shortfall || 0,
            createdAt: paymentData.createdAt
          }
        );
        console.log(`✅ Payment confirmation email sent to: ${tenant.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send payment confirmation to: ${tenant.email}`, emailError);
        // Don't fail the payment if email fails
      }
    }

    res.json({
      success: true,
      message: 'Payment simulated and processed successfully. Confirmation email sent!',
      paymentId: result.paymentId,
      tenant: {
        name: tenant.name,
        accountNumber: tenant.accountNumber,
        expectedRent: tenant.rentAmount,
        previousBalance: tenant.accountBalance || 0
      },
      payment: paymentData,
      analysis: result.analysis,
      smartMessage: result.message,
      emailSent: tenant.email ? 'Yes' : 'No (no email provided)',
      instructions: 'Check your dashboard - payment should appear and tenant status should update'
    });

  } catch (error) {
    console.error('Payment simulation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment simulation failed'
    });
  }
}

// Enhanced callback handling with smart processing and email confirmation
export async function handleCallback(req, res) {
  try {
    console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));
    
    const result = await mpesaService.handleCallback(req.body);
    
    if (result.success) {
      const { paymentData } = result;
      
      // Find the pending payment record
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('checkoutRequestID', '==', paymentData.checkoutRequestID),
        where('status', '==', 'pending')
      );
      const paymentSnapshot = await getDocs(paymentsQuery);
      
      if (!paymentSnapshot.empty) {
        const paymentDoc = paymentSnapshot.docs[0];
        const payment = paymentDoc.data();
        
        // Get tenant and property details for email
        const tenant = await EnhancedTenantService.getTenant(payment.tenantId);
        const property = await EnhancedPropertyService.getProperty(payment.propertyId);
        
        // Process with smart payment handling
        const enhancedPaymentData = {
          ...paymentData,
          landlordId: payment.landlordId,
          tenantId: payment.tenantId,
          propertyId: payment.propertyId,
          accountNumber: payment.accountNumber,
          description: payment.description,
          source: 'mpesa' // Real M-Pesa payment
        };

        // Use smart payment service
        const smartResult = await SmartPaymentService.processPayment(enhancedPaymentData);
        
        // Update the original payment record
        await updateDoc(doc(db, 'payments', paymentDoc.id), {
          ...paymentData,
          analysis: smartResult.analysis,
          smartProcessed: true,
          updatedAt: new Date()
        });

        // Send payment confirmation email if tenant has email
        if (tenant && tenant.email && property) {
          try {
            await enhancedEmailService.sendPaymentConfirmationEmail(
              {
                name: tenant.name,
                email: tenant.email,
                unitNumber: tenant.unitNumber
              },
              {
                name: property.name
              },
              {
                amount: paymentData.amount,
                mpesaReceiptNumber: paymentData.mpesaReceiptNumber,
                paymentType: smartResult.analysis?.type || 'exact',
                overpaymentAmount: smartResult.analysis?.overpayment || 0,
                shortfallAmount: smartResult.analysis?.shortfall || 0,
                createdAt: paymentData.transactionDate || new Date()
              }
            );
            console.log(`✅ Payment confirmation email sent to: ${tenant.email}`);
          } catch (emailError) {
            console.error(`❌ Failed to send payment confirmation to: ${tenant.email}`, emailError);
          }
        }
      }
      
      res.status(200).json({ 
        message: 'Callback processed successfully with smart handling and email notification',
        smartProcessed: true,
        emailSent: tenant?.email ? 'Yes' : 'No'
      });
    } else {
      // Handle failed payments
      res.status(200).json({ 
        message: 'Payment failed', 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(500).json({ error: 'Failed to process callback' });
  }
}

// Get tenant balance information
export async function getTenantBalance(req, res) {
  try {
    const { tenantId } = req.params;
    
    const balance = await SmartPaymentService.getTenantBalance(tenantId);
    
    if (!balance) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      balance
    });

  } catch (error) {
    console.error('Error getting tenant balance:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Generate payment reminders with email option
export async function generateReminders(req, res) {
  try {
    const { landlordId } = req.params;
    const { sendEmails = false } = req.query;
    
    const reminders = await SmartPaymentService.generatePaymentReminders(landlordId);
    
    let emailResults = [];
    
    // Send emails if requested
    if (sendEmails === 'true' && reminders.length > 0) {
      console.log(`📧 Sending email reminders to ${reminders.length} tenants`);
      
      for (const reminder of reminders) {
        try {
          // Get full tenant and property details
          const tenant = await EnhancedTenantService.getTenant(reminder.tenantId);
          const property = await EnhancedPropertyService.getProperty(tenant.propertyId);
          
          if (tenant.email && property) {
            const emailResult = await enhancedEmailService.sendMonthlyRentReminder(
              {
                name: tenant.name,
                email: tenant.email,
                unitNumber: tenant.unitNumber,
                rentAmount: tenant.rentAmount,
                accountNumber: tenant.accountNumber,
                accountBalance: tenant.accountBalance || 0
              },
              {
                name: property.name,
                paybill: property.paybill
              },
              reminder.type !== 'overdue' // isFirstReminder
            );
            
            emailResults.push({
              tenant: tenant.name,
              email: tenant.email,
              success: emailResult.success,
              type: reminder.type
            });
          }
        } catch (emailError) {
          console.error(`Failed to send reminder email to tenant ${reminder.tenantId}:`, emailError);
          emailResults.push({
            tenant: reminder.tenantName,
            success: false,
            error: emailError.message
          });
        }
      }
    }
    
    res.json({
      success: true,
      reminders,
      count: reminders.length,
      emailsSent: sendEmails === 'true',
      emailResults: emailResults
    });

  } catch (error) {
    console.error('Error generating reminders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Test different payment scenarios
export async function testPaymentScenarios(req, res) {
  try {
    const { accountNumber } = req.body;

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        error: 'accountNumber is required'
      });
    }

    // Find tenant
    const tenant = await EnhancedTenantService.getTenantByAccountNumber(accountNumber);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: `No tenant found with account number: ${accountNumber}`
      });
    }

    const rentAmount = parseFloat(tenant.rentAmount);

    // Test scenarios
    const scenarios = [
      {
        name: 'Exact Payment',
        amount: rentAmount,
        description: 'Pays exactly the rent amount'
      },
      {
        name: 'Overpayment',
        amount: rentAmount + 5000,
        description: 'Pays more than rent (excess carried forward)'
      },
      {
        name: 'Underpayment',
        amount: rentAmount * 0.7,
        description: 'Pays 70% of rent (partial payment)'
      },
      {
        name: 'Small Underpayment',
        amount: rentAmount - 1000,
        description: 'Pays almost full amount (KES 1,000 short)'
      }
    ];

    const results = [];

    for (const scenario of scenarios) {
      const analysis = SmartPaymentService.analyzePayment(
        scenario.amount, 
        rentAmount, 
        tenant
      );
      
      results.push({
        scenario: scenario.name,
        description: scenario.description,
        amount: scenario.amount,
        analysis: analysis,
        message: SmartPaymentService.getPaymentMessage(analysis)
      });
    }

    res.json({
      success: true,
      tenant: {
        name: tenant.name,
        accountNumber: tenant.accountNumber,
        monthlyRent: rentAmount,
        currentBalance: tenant.accountBalance || 0
      },
      scenarios: results
    });

  } catch (error) {
    console.error('Error testing scenarios:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Send manual payment confirmation email
export async function sendPaymentConfirmation(req, res) {
  try {
    const { paymentId } = req.params;
    
    // Get payment details
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('id', '==', paymentId)
    );
    const paymentSnapshot = await getDocs(paymentsQuery);
    
    if (paymentSnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }
    
    const payment = { id: paymentSnapshot.docs[0].id, ...paymentSnapshot.docs[0].data() };
    
    // Get tenant and property details
    const tenant = await EnhancedTenantService.getTenant(payment.tenantId);
    const property = await EnhancedPropertyService.getProperty(payment.propertyId);
    
    if (!tenant || !property) {
      return res.status(404).json({
        success: false,
        error: 'Tenant or property not found'
      });
    }
    
    if (!tenant.email) {
      return res.status(400).json({
        success: false,
        error: 'Tenant email not available'
      });
    }
    
    // Send confirmation email
    const result = await enhancedEmailService.sendPaymentConfirmationEmail(
      {
        name: tenant.name,
        email: tenant.email,
        unitNumber: tenant.unitNumber
      },
      {
        name: property.name
      },
      {
        amount: payment.amount,
        mpesaReceiptNumber: payment.mpesaReceiptNumber,
        paymentType: payment.paymentType || 'exact',
        overpaymentAmount: payment.overpaymentAmount || 0,
        shortfallAmount: payment.shortfallAmount || 0,
        createdAt: payment.createdAt
      }
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Payment confirmation email sent successfully',
        data: {
          tenant: tenant.name,
          email: tenant.email,
          paymentAmount: payment.amount,
          messageId: result.messageId
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send confirmation email'
      });
    }
    
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Original functions (keeping for compatibility)
export async function initiatePayment(req, res) {
  try {
    const { phoneNumber, amount, accountNumber } = req.body;

    if (!phoneNumber || !amount || !accountNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number, amount, and account number are required' 
      });
    }

    // Verify tenant exists
    const tenant = await EnhancedTenantService.getTenantByAccountNumber(accountNumber);
    
    if (!tenant) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid account number' 
      });
    }

    // Initiate STK push
    const result = await mpesaService.initiateSTKPush(phoneNumber, amount, accountNumber);
    
    if (result.success) {
      // Store pending payment record
      await addDoc(collection(db, 'payments'), {
        tenantId: tenant.id,
        landlordId: tenant.landlordId,
        propertyId: tenant.propertyId,
        amount: parseFloat(amount),
        phoneNumber: phoneNumber,
        accountNumber: accountNumber,
        method: 'M-Pesa',
        status: 'pending',
        checkoutRequestID: result.checkoutRequestID,
        description: `Rent payment initiated for ${tenant.name}`,
        createdAt: new Date()
      });

      res.json({
        success: true,
        message: 'Payment initiated successfully',
        checkoutRequestID: result.checkoutRequestID,
        customerMessage: result.customerMessage
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to initiate payment' 
    });
  }
}

export async function handleTimeout(req, res) {
  try {
    console.log('M-Pesa Timeout received:', JSON.stringify(req.body, null, 2));
    res.status(200).json({ message: 'Timeout received' });
  } catch (error) {
    console.error('Timeout processing error:', error);
    res.status(500).json({ error: 'Failed to process timeout' });
  }
}