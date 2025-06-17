// backend/server.js - Complete Enhanced Property Management Server
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import cron from 'node-cron';
import { sendRentReminders } from './controllers/reminderController.js';

// Original routes (for backward compatibility)
import tenantRoutes from './routes/tenantRoutes.js';
import landlordRoutes from './routes/landlordRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';

// Enhanced routes (new system)
import enhancedPropertyRoutes from './routes/enhancedPropertyRoutes.js';
import enhancedTenantRoutes from './routes/enhancedTenantRoutes.js';
import enhancedPaymentRoutes from './routes/enhancedPaymentRoutes.js';

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

// Original API routes (v1 - backward compatibility)
app.use('/api/tenants', tenantRoutes);
app.use('/api/landlords', landlordRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reminders', reminderRoutes);

// Enhanced API routes (v2 - new features)
app.use('/api/enhanced/properties', enhancedPropertyRoutes);
app.use('/api/enhanced/tenants', enhancedTenantRoutes);
app.use('/api/enhanced/payments', enhancedPaymentRoutes);

// API version routes for clarity
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/landlords', landlordRoutes);
app.use('/api/v1/payments', paymentRoutes);

app.use('/api/v2/properties', enhancedPropertyRoutes);
app.use('/api/v2/tenants', enhancedTenantRoutes);
app.use('/api/v2/payments', enhancedPaymentRoutes);

// Root endpoint - API information
app.get('/', (req, res) => {
  res.json({
    name: 'Enhanced Property Management API',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    description: 'Comprehensive property management system with unit-based architecture',
    features: [
      'Unit-based property management',
      'Auto-generated account numbers (paybill#unit format)',
      'Smart tenant assignment with occupancy prevention',
      'Multiple unit types per property',
      'Enhanced payment processing with M-Pesa integration',
      'Real-time analytics and reporting',
      'Tenant lifecycle management',
      'Backward compatibility with v1 API'
    ],
    apis: {
      v1: {
        description: 'Original API - Backward compatible',
        endpoints: {
          tenants: '/api/v1/tenants or /api/tenants',
          landlords: '/api/v1/landlords or /api/landlords',
          payments: '/api/v1/payments or /api/payments'
        }
      },
      v2: {
        description: 'Enhanced API - New features',
        endpoints: {
          properties: '/api/v2/properties or /api/enhanced/properties',
          tenants: '/api/v2/tenants or /api/enhanced/tenants',
          payments: '/api/v2/payments or /api/enhanced/payments'
        }
      }
    },
    documentation: {
      status: '/api/status',
      health: '/api/health',
      routes: '/api/routes'
    }
  });
});

// API Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      originalAPI: 'Active',
      enhancedAPI: 'Active',
      firebaseConnection: admin.apps.length > 0 ? 'Connected' : 'Disconnected',
      database: 'Firestore',
      authentication: 'Firebase Auth'
    },
    endpoints: {
      total: 'Multiple endpoints available',
      versions: ['v1 (original)', 'v2 (enhanced)']
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

// Routes documentation endpoint
app.get('/api/routes', (req, res) => {
  res.json({
    description: 'Available API routes',
    baseUrl: `${req.protocol}://${req.get('host')}`,
    routes: {
      authentication: {
        signup: 'POST /signup',
        signin: 'POST /signin'
      },
      v1_original: {
        tenants: {
          getAll: 'GET /api/tenants',
          create: 'POST /api/tenants',
          update: 'PUT /api/tenants/:id',
          delete: 'DELETE /api/tenants/:id'
        },
        payments: {
          initiate: 'POST /api/payments/initiate',
          simulate: 'POST /api/payments/simulate-payment',
          callback: 'POST /api/payments/callback'
        }
      },
      v2_enhanced: {
        properties: {
          create: 'POST /api/enhanced/properties',
          getAll: 'GET /api/enhanced/properties/landlord/:landlordId',
          getOne: 'GET /api/enhanced/properties/:propertyId',
          update: 'PUT /api/enhanced/properties/:propertyId',
          delete: 'DELETE /api/enhanced/properties/:propertyId',
          getUnitTypes: 'GET /api/enhanced/properties/:propertyId/unit-types',
          getAvailableUnits: 'GET /api/enhanced/properties/:propertyId/available-units'
        },
        tenants: {
          create: 'POST /api/enhanced/tenants',
          getAll: 'GET /api/enhanced/tenants/landlord/:landlordId',
          getOne: 'GET /api/enhanced/tenants/:tenantId',
          update: 'PUT /api/enhanced/tenants/:tenantId',
          delete: 'DELETE /api/enhanced/tenants/:tenantId',
          moveOut: 'POST /api/enhanced/tenants/:tenantId/move-out',
          transfer: 'POST /api/enhanced/tenants/:tenantId/transfer',
          getByAccount: 'GET /api/enhanced/tenants/account/:accountNumber',
          getPaymentSummary: 'GET /api/enhanced/tenants/:tenantId/payment-summary',
          getStatistics: 'GET /api/enhanced/tenants/landlord/:landlordId/statistics'
        },
        payments: {
          simulateEnhanced: 'POST /api/enhanced/payments/simulate-enhanced',
          validateAccount: 'GET /api/enhanced/payments/validate-account/:accountNumber',
          getEnhancedTenants: 'GET /api/enhanced/payments/test-tenants-enhanced/:landlordId',
          getTenantBalance: 'GET /api/enhanced/payments/tenant/:tenantId/balance',
          getReminders: 'GET /api/enhanced/payments/reminders/:landlordId'
        }
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

// Authentication routes
app.post('/signup', async (req, res) => {
  const {  email, password, confirmPassword, name, phoneNumber,  } = req.body;
  
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

  // Password rule check
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character'
    });
  }

  try {
      const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phoneNumber
    });

     const usersCol = collection(db, 'Users');
    await setDoc(doc(usersCol, userRecord.uid), {
      uid: userRecord.uid,
      name,
      email,
      phoneNumber,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ 
      success: true,
      message: 'User created successfully', 
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

// 404 handler for undefined routes
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
        health: 'GET /api/health',
        routes: 'GET /api/routes'
      },
      authentication: {
        signup: 'POST /signup',
        signin: 'POST /signin'
      },
      v1_api: [
        '/api/tenants',
        '/api/landlords', 
        '/api/payments'
      ],
      v2_enhanced_api: [
        '/api/enhanced/properties',
        '/api/enhanced/tenants',
        '/api/enhanced/payments'
      ]
    },
    suggestion: 'Visit GET / for complete API documentation'
  });
});

// 🔄 Schedule monthly rent reminders on the 28th at 8:00 AM
cron.schedule('0 8 28 * *', async () => {
  console.log('[CRON] Sending monthly rent reminders (28th, 8:00 AM)');
  try {
    await sendRentReminders();
    console.log('[CRON] Rent reminders sent successfully');
  } catch (err) {
    console.error('[CRON] Failed to send rent reminders:', err.message);
  }
});

// Server startup
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 Enhanced Property Management Server Started');
  console.log('=============================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📊 API Status: http://localhost:${PORT}/api/status`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📖 Documentation: http://localhost:${PORT}/api/routes`);
  console.log('\n🛠️  Available APIs:');
  console.log(`   📂 V1 (Original): http://localhost:${PORT}/api/`);
  console.log(`   🎯 V2 (Enhanced): http://localhost:${PORT}/api/enhanced/`);
  console.log('\n✨ Enhanced Features:');
  console.log('   🏠 Unit-based properties');
  console.log('   🎫 Auto-generated account numbers');
  console.log('   👥 Smart tenant assignment');
  console.log('   💰 Enhanced payment processing');
  console.log('   📈 Advanced analytics');
  console.log('=============================================\n');
});