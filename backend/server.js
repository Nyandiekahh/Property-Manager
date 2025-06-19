// backend/server.js - Enhanced Server with Email Automation and Forgot Password
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import cron from 'node-cron';
import crypto from 'crypto';
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
      'Overdue payment notices',
      'Password reset functionality'
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

// Forgot Password endpoint
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if user exists in Firestore Users collection
    const usersRef = admin.firestore().collection('Users');
    const userQuery = await usersRef.where('email', '==', email).get();
    
    if (userQuery.empty) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email address'
      });
    }

    const userData = userQuery.docs[0].data();
    
    // Generate password reset token (expires in 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Store reset token in Firestore
    await admin.firestore().collection('PasswordResets').doc(email).set({
      email,
      token: resetToken,
      expiresAt: resetTokenExpiry,
      createdAt: new Date(),
      used: false
    });

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${email}`;
    
    const emailResult = await enhancedEmailService.sendEmail({
      to: email,
      subject: 'Reset Your RentFlow Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8fafc; padding: 30px 20px; }
                .button { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; }
                .warning { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Reset Your Password</h1>
                    <p>RentFlow Property Management</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${userData.name}!</h2>
                    
                    <p>We received a request to reset your password for your RentFlow account. If you didn't make this request, you can safely ignore this email.</p>
                    
                    <p>To reset your password, click the button below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" class="button">Reset Password</a>
                    </div>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">${resetUrl}</p>
                    
                    <div class="warning">
                        <h3>⚠️ Important Security Information:</h3>
                        <ul>
                            <li>This link will expire in 1 hour</li>
                            <li>The link can only be used once</li>
                            <li>If you didn't request this reset, please contact support</li>
                        </ul>
                    </div>
                    
                    <p>For security reasons, this reset link will expire in 1 hour. If you need a new link, please visit the forgot password page again.</p>
                </div>
                
                <div class="footer">
                    <p>© 2024 RentFlow. This email was sent to ${email}</p>
                    <p>If you're having trouble with the button above, copy and paste the URL into your web browser.</p>
                </div>
            </div>
        </body>
        </html>
      `
    });

    if (emailResult.success) {
      console.log(`✅ Password reset email sent to ${email}`);
      res.json({
        success: true,
        message: 'Password reset instructions have been sent to your email'
      });
    } else {
      throw new Error('Failed to send reset email');
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
});

// Reset Password endpoint
app.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    
    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token, email, and new password are required'
      });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      });
    }

    // Get reset token from Firestore
    const resetDoc = await admin.firestore().collection('PasswordResets').doc(email).get();
    
    if (!resetDoc.exists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    const resetData = resetDoc.data();
    
    // Check if token matches
    if (resetData.token !== token) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reset token'
      });
    }

    // Check if token is expired
    if (new Date() > resetData.expiresAt.toDate()) {
      await admin.firestore().collection('PasswordResets').doc(email).delete();
      return res.status(400).json({
        success: false,
        error: 'Reset token has expired. Please request a new one.'
      });
    }

    // Check if token has been used
    if (resetData.used) {
      return res.status(400).json({
        success: false,
        error: 'Reset token has already been used'
      });
    }

    // Find user by email and update password
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword
    });

    // Mark token as used
    await admin.firestore().collection('PasswordResets').doc(email).update({
      used: true,
      usedAt: new Date()
    });

    // Send confirmation email
    const userData = await admin.firestore().collection('Users').doc(userRecord.uid).get();
    const user = userData.data();

    await enhancedEmailService.sendEmail({
      to: email,
      subject: 'Password Successfully Reset - RentFlow',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Successful</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f0fdf4; padding: 30px 20px; }
                .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; }
                .success-box { background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Password Reset Successful</h1>
                    <p>RentFlow Property Management</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${user?.name || 'User'}!</h2>
                    
                    <div class="success-box">
                        <h3>🎉 Your password has been successfully reset!</h3>
                        <p>You can now log in to your RentFlow account using your new password.</p>
                    </div>
                    
                    <p>If you didn't make this change, please contact our support team immediately.</p>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Log in to your account with your new password</li>
                        <li>Consider enabling two-factor authentication for added security</li>
                        <li>Make sure to keep your password secure</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p>© 2024 RentFlow. This email was sent to ${email}</p>
                    <p>For security questions, please contact support@rentflow.co.ke</p>
                </div>
            </div>
        </body>
        </html>
      `
    });

    console.log(`✅ Password reset successful for ${email}`);
    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
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

// CRON JOBS FOR AUTOMATED EMAIL NOTIFICATIONS (keeping existing code...)

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
        signin: 'POST /signin',
        forgotPassword: 'POST /forgot-password',
        resetPassword: 'POST /reset-password'
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
  console.log('   🔐 Password reset emails');
  console.log('\n🕐 Scheduled Jobs:');
  console.log('   📅 Monthly reminders: 28th at 8:00 AM');
  console.log('   🚨 Overdue notices: 5th at 9:00 AM');
  console.log('===========================================================\n');
});