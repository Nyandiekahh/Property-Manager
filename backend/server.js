// backend/server.js - Enhanced Server with Email Automation
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import cron from 'node-cron';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

// Import routes
import tenantRoutes from './routes/tenantRoutes.js';
import landlordRoutes from './routes/landlordRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import enhancedPropertyRoutes from './routes/enhancedPropertyRoutes.js';
import enhancedTenantRoutes from './routes/enhancedTenantRoutes.js';
import enhancedPaymentRoutes from './routes/enhancedPaymentRoutes.js';

// Import services
import enhancedEmailService from './services/enhancedEmailService.js';
import { db } from './config/firebaseClient.js';
import admin from 'firebase-admin';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const credentials = require('./config/rental-management-b8516-firebase-adminsdk-fbsvc-43726bc1eb.json');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api/tenants', tenantRoutes);
app.use('/api/landlords', landlordRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/enhanced/properties', enhancedPropertyRoutes);
app.use('/api/enhanced/tenants', enhancedTenantRoutes);
app.use('/api/enhanced/payments', enhancedPaymentRoutes);

// Version-specific routes
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/landlords', landlordRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v2/properties', enhancedPropertyRoutes);
app.use('/api/v2/tenants', enhancedTenantRoutes);
app.use('/api/v2/payments', enhancedPaymentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Enhanced Property Management API with Email Automation',
    version: '2.1.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    features: [
      'Unit-based property management',
      'Smart tenant assignment',
      'M-Pesa payment integration',
      'Automated email notifications',
      'Monthly rent reminders',
      'Payment confirmations',
      'Overdue payment notices'
    ],
    emailService: 'Active with Gmail SMTP',
    automation: 'Cron jobs configured'
  });
});

// Status endpoint
app.get('/api/status', async (req, res) => {
  const emailStatus = await enhancedEmailService.testConnection();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      originalAPI: 'Active',
      enhancedAPI: 'Active',
      firebaseConnection: admin.apps.length > 0 ? 'Connected' : 'Disconnected',
      emailService: emailStatus ? 'Connected' : 'Failed',
      database: 'Firestore'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    checks: {
      server: 'healthy',
      firebase: admin.apps.length > 0 ? 'connected' : 'disconnected',
      memory: {
        used: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heap: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
      }
    }
  });
});

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(credentials),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
}

// Test email service on startup
enhancedEmailService.testConnection();

// Enhanced authentication routes with email notifications
app.post('/signup', async (req, res) => {
  const { email, password, confirmPassword, name, phoneNumber } = req.body;
  
  if (!email || !password || !confirmPassword || !name || !phoneNumber) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required: email, password, confirmPassword, name, phoneNumber'
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: 'Passwords do not match'
    });
  }

  // Enhanced password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    });
  }

  // Phone number validation (Kenyan format)
  const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
  if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid Kenyan phone number'
    });
  }

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+254${phoneNumber.replace(/^0/, '')}`
    });

    // Store additional user data in Firestore
    const usersCol = collection(db, 'Users');
    await setDoc(doc(usersCol, userRecord.uid), {
      uid: userRecord.uid,
      name,
      email,
      phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+254${phoneNumber.replace(/^0/, '')}`,
      createdAt: new Date().toISOString(),
      role: 'landlord',
      isActive: true
    });

    // Send welcome email
    try {
      await enhancedEmailService.sendLandlordWelcomeEmail({
        name,
        email
      });
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send welcome email to ${email}:`, emailError);
      // Don't fail the signup if email fails
    }

    res.status(201).json({ 
      success: true,
      message: 'Account created successfully. Welcome email sent!', 
      uid: userRecord.uid,
      email: userRecord.email
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Email and password are required' 
    });
  }

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, 
      {
        email,
        password,
        returnSecureToken: true
      }
    );
    
    const { idToken, refreshToken, localId, displayName } = response.data;
    
    res.status(200).json({
      success: true,
      message: 'User signed in successfully',
      uid: localId,
      idToken,
      refreshToken,
      email,
      displayName: displayName || email.split('@')[0]
    });
  } catch (error) {
    console.error('Signin error:', error.response?.data || error.message);
    const errMsg = error?.response?.data?.error?.message || error.message;
    res.status(401).json({ 
      success: false,
      error: errMsg 
    });
  }
});

// Email testing endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { type, email, data } = req.body;
    
    let result;
    switch (type) {
      case 'welcome':
        result = await enhancedEmailService.sendLandlordWelcomeEmail({
          name: data.name || 'Test User',
          email: email
        });
        break;
      
      case 'tenant-welcome':
        result = await enhancedEmailService.sendTenantWelcomeEmail(
          data.tenant || { name: 'Test Tenant', email, unitNumber: 'A1', unitType: 'bedsitter', rentAmount: 25000, accountNumber: '12345#A1' },
          data.property || { name: 'Test Property', location: 'Nairobi' },
          data.landlord || { name: 'Test Landlord', phone: '+254712345678' }
        );
        break;
        
      case 'payment-confirmation':
        result = await enhancedEmailService.sendPaymentConfirmationEmail(
          data.tenant || { name: 'Test Tenant', email, unitNumber: 'A1' },
          data.property || { name: 'Test Property' },
          data.payment || { amount: 25000, mpesaReceiptNumber: 'TEST12345', paymentType: 'exact', createdAt: new Date() }
        );
        break;
        
      case 'rent-reminder':
        result = await enhancedEmailService.sendMonthlyRentReminder(
          data.tenant || { name: 'Test Tenant', email, unitNumber: 'A1', rentAmount: 25000, accountNumber: '12345#A1' },
          data.property || { name: 'Test Property', paybill: '522522' }
        );
        break;
        
      case 'overdue-notice':
        result = await enhancedEmailService.sendOverduePaymentNotice(
          data.tenant || { name: 'Test Tenant', email, unitNumber: 'A1', rentAmount: 25000, accountNumber: '12345#A1' },
          data.property || { name: 'Test Property', paybill: '522522' },
          data.daysOverdue || 5
        );
        break;
        
      default:
        return res.status(400).json({ success: false, error: 'Invalid email type' });
    }
    
    res.json({
      success: true,
      message: `Test ${type} email sent successfully`,
      result
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// CRON JOBS FOR AUTOMATED EMAIL NOTIFICATIONS

// 1. Monthly rent reminders - 28th of each month at 8:00 AM
cron.schedule('0 8 28 * *', async () => {
  console.log('🔔 [CRON] Starting monthly rent reminders (28th, 8:00 AM)');
  
  try {
    // Get all active tenants with their property information
    const tenantsSnapshot = await admin.firestore()
      .collection('tenants')
      .where('isActive', '==', true)
      .get();
    
    const propertiesSnapshot = await admin.firestore()
      .collection('properties')
      .get();
    
    const properties = {};
    propertiesSnapshot.docs.forEach(doc => {
      properties[doc.id] = { id: doc.id, ...doc.data() };
    });
    
    const tenantsToRemind = [];
    
    // Check each tenant's payment status for current month
    for (const tenantDoc of tenantsSnapshot.docs) {
      const tenant = { id: tenantDoc.id, ...tenantDoc.data() };
      
      // Check if tenant has paid this month
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const paymentsSnapshot = await admin.firestore()
        .collection('payments')
        .where('tenantId', '==', tenant.id)
        .where('createdAt', '>=', startOfMonth)
        .where('status', '==', 'completed')
        .get();
      
      // If no payment this month, add to reminder list
      if (paymentsSnapshot.empty && tenant.email && properties[tenant.propertyId]) {
        tenantsToRemind.push({
          tenant,
          property: properties[tenant.propertyId]
        });
      }
    }
    
    console.log(`📧 Sending reminders to ${tenantsToRemind.length} tenants`);
    
    const results = await enhancedEmailService.sendBulkMonthlyReminders(tenantsToRemind);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Monthly reminders completed: ${successful} sent, ${failed} failed`);
    
  } catch (error) {
    console.error('❌ [CRON] Monthly reminders failed:', error);
  }
});

// 2. Overdue payment notices - 5th of each month at 9:00 AM
cron.schedule('0 9 5 * *', async () => {
  console.log('🚨 [CRON] Starting overdue payment notices (5th, 9:00 AM)');
  
  try {
    // Get all active tenants
    const tenantsSnapshot = await admin.firestore()
      .collection('tenants')
      .where('isActive', '==', true)
      .get();
    
    const propertiesSnapshot = await admin.firestore()
      .collection('properties')
      .get();
    
    const properties = {};
    propertiesSnapshot.docs.forEach(doc => {
      properties[doc.id] = { id: doc.id, ...doc.data() };
    });
    
    const overdueTenantsData = [];
    
    // Check each tenant's payment status
    for (const tenantDoc of tenantsSnapshot.docs) {
      const tenant = { id: tenantDoc.id, ...tenantDoc.data() };
      
      // Check if tenant has paid this month (from 1st to now)
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const paymentsSnapshot = await admin.firestore()
        .collection('payments')
        .where('tenantId', '==', tenant.id)
        .where('createdAt', '>=', startOfMonth)
        .where('status', '==', 'completed')
        .get();
      
      // If no payment this month and tenant has email
      if (paymentsSnapshot.empty && tenant.email && properties[tenant.propertyId]) {
        const daysOverdue = new Date().getDate(); // Current day of month
        overdueTenantsData.push({
          tenant,
          property: properties[tenant.propertyId],
          daysOverdue
        });
      }
    }
    
    console.log(`📧 Sending overdue notices to ${overdueTenantsData.length} tenants`);
    
    const results = await enhancedEmailService.sendBulkOverdueNotices(overdueTenantsData);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Overdue notices completed: ${successful} sent, ${failed} failed`);
    
  } catch (error) {
    console.error('❌ [CRON] Overdue notices failed:', error);
  }
});

// Helper function to send emails when tenant is created
export const sendTenantWelcomeEmailHelper = async (tenantData, propertyData, landlordData) => {
  try {
    const result = await enhancedEmailService.sendTenantWelcomeEmail(
      tenantData,
      propertyData,
      landlordData
    );
    console.log(`✅ Welcome email sent to tenant: ${tenantData.email}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send welcome email to tenant: ${tenantData.email}`, error);
    return { success: false, error: error.message };
  }
};

// Helper function to send payment confirmation emails
export const sendPaymentConfirmationHelper = async (tenantData, propertyData, paymentData) => {
  try {
    const result = await enhancedEmailService.sendPaymentConfirmationEmail(
      tenantData,
      propertyData,
      paymentData
    );
    console.log(`✅ Payment confirmation sent to: ${tenantData.email}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send payment confirmation to: ${tenantData.email}`, error);
    return { success: false, error: error.message };
  }
};


// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: {
      documentation: {
        api_info: 'GET /',
        status: 'GET /api/status',
        health: 'GET /api/health'
      },
      authentication: {
        signup: 'POST /signup',
        signin: 'POST /signin'
      },
      testing: {
        testEmail: 'POST /api/test-email'
      }
    }
  });
});

// Server startup
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 Enhanced Property Management Server with Email Automation');
  console.log('===========================================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📊 API Status: http://localhost:${PORT}/api/status`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📧 Email Service: ${process.env.EMAIL_USER} (Gmail SMTP)`);
  console.log('\n✨ Email Automation Features:');
  console.log('   📧 Welcome emails for new landlords');
  console.log('   🏠 Welcome emails for new tenants');
  console.log('   📅 Monthly rent reminders (28th of each month)');
  console.log('   ✅ Payment confirmation emails');
  console.log('   🚨 Overdue payment notices (5th of each month)');
  console.log('\n🕐 Scheduled Jobs:');
  console.log('   📅 Monthly reminders: 28th at 8:00 AM');
  console.log('   🚨 Overdue notices: 5th at 9:00 AM');
  console.log('===========================================================\n');
});