import mpesaService from '../services/mpesaService.js';
import { db } from '../config/firebaseClient.js';
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';

// Initiate STK Push payment
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
    const tenantsQuery = query(
      collection(db, 'tenants'),
      where('accountNumber', '==', accountNumber)
    );
    const tenantSnapshot = await getDocs(tenantsQuery);
    
    if (tenantSnapshot.empty) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid account number' 
      });
    }

    const tenant = { id: tenantSnapshot.docs[0].id, ...tenantSnapshot.docs[0].data() };

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

// Handle M-Pesa callback
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
        
        // Update payment record
        await updateDoc(doc(db, 'payments', paymentDoc.id), {
          ...paymentData,
          updatedAt: new Date()
        });
        
        // Update tenant payment status
        const tenantRef = doc(db, 'tenants', payment.tenantId);
        await updateDoc(tenantRef, {
          paymentStatus: 'paid',
          lastPaymentDate: new Date(),
          updatedAt: new Date()
        });
      }
      
      res.status(200).json({ message: 'Callback processed successfully' });
    } else {
      res.status(200).json({ message: 'Callback received but payment failed' });
    }
  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(500).json({ error: 'Failed to process callback' });
  }
}

// Handle M-Pesa timeout
export async function handleTimeout(req, res) {
  try {
    console.log('M-Pesa Timeout received:', JSON.stringify(req.body, null, 2));
    res.status(200).json({ message: 'Timeout received' });
  } catch (error) {
    console.error('Timeout processing error:', error);
    res.status(500).json({ error: 'Failed to process timeout' });
  }
}