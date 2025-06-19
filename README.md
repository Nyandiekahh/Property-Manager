# RentFlow - Enhanced Property Management System

A comprehensive property management platform built with React.js frontend and Node.js backend, featuring M-Pesa integration, automated email notifications, and smart unit-based property management.

## 🏢 Project Overview

RentFlow is a full-stack property management application designed specifically for Kenyan property owners and managers. It offers enhanced features including:

- **Unit-based Property Management**: Organize properties with multiple unit types
- **M-Pesa Payment Integration**: Automated rent collection through Safaricom's M-Pesa
- **Smart Tenant Assignment**: Automatic unit allocation with account number generation
- **Email Automation**: Scheduled rent reminders and payment confirmations
- **Real-time Analytics**: Comprehensive dashboard with occupancy and revenue insights
- **Forgot Password System**: Secure password reset with email templates

## 🏗️ Architecture

### Frontend (React.js)
- **Framework**: React 18.x with functional components and hooks
- **Styling**: Tailwind CSS with custom design system
- **Animation**: Framer Motion for smooth transitions
- **State Management**: React Context API for authentication
- **Routing**: React Router v6 with protected routes
- **HTTP Client**: Axios with interceptors for API communication

### Backend (Node.js)
- **Runtime**: Node.js with Express.js framework
- **Database**: Google Firestore (NoSQL document database)
- **Authentication**: Firebase Authentication
- **Payment Gateway**: M-Pesa Daraja API integration
- **Email Service**: Nodemailer with Gmail SMTP
- **Scheduling**: Node-cron for automated tasks

## 📁 Project Structure

```
rentflow/
├── frontend/                          # React.js application
│   ├── public/                        # Static assets
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── common/               # Shared components
│   │   │   │   ├── LoadingSpinner.js
│   │   │   │   ├── Navbar.js         # Main navigation with notifications
│   │   │   │   └── Sidebar.js        # Navigation sidebar
│   │   │   ├── notifications/        # Notification system
│   │   │   │   └── NotificationCenter.js
│   │   │   ├── property/             # Property-related components
│   │   │   │   ├── EnhancedPropertyModal.js  # Enhanced property creation
│   │   │   │   └── PropertyModal.js          # Basic property modal
│   │   │   └── tenant/               # Tenant-related components
│   │   │       ├── EnhancedTenantModal.js    # Enhanced tenant creation
│   │   │       └── TenantModal.js            # Basic tenant modal
│   │   ├── context/                  # React Context providers
│   │   │   └── AuthContext.js        # Authentication context with forgot password
│   │   ├── pages/                    # Main application pages
│   │   │   ├── Analytics.js          # Analytics dashboard
│   │   │   ├── Dashboard.js          # Main dashboard
│   │   │   ├── LandingPage.js        # Marketing landing page
│   │   │   ├── Login.js              # Authentication with forgot password
│   │   │   ├── Notifications.js     # Notifications page
│   │   │   ├── PaymentHistory.js    # Payment history and analytics
│   │   │   ├── Properties.js        # Property management
│   │   │   ├── ResetPassword.js     # Password reset page
│   │   │   └── Tenants.js           # Tenant management
│   │   ├── services/                # API and external services
│   │   │   ├── api.js               # Base API configuration
│   │   │   ├── enhancedApiService.js # Enhanced API services
│   │   │   ├── firebase.js          # Firebase configuration
│   │   │   └── landlordService.js   # Landlord-specific services
│   │   ├── utils/                   # Utility functions
│   │   │   └── helpers.js           # Common helper functions
│   │   ├── App.js                   # Main application component
│   │   ├── index.css                # Global styles with Tailwind
│   │   └── index.js                 # Application entry point
│   ├── package.json                 # Frontend dependencies
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   └── postcss.config.js           # PostCSS configuration
├── backend/                         # Node.js API server
│   ├── config/                      # Configuration files
│   │   ├── firebaseClient.js        # Firebase client configuration
│   │   └── rental-management-b8516-firebase-adminsdk-fbsvc-43726bc1eb.json
│   ├── controllers/                 # Route controllers
│   │   ├── enhancedPropertyController.js    # Enhanced property CRUD
│   │   ├── enhancedTenantController.js      # Enhanced tenant management
│   │   ├── landlordController.js            # Landlord operations
│   │   ├── paymentController.js             # Payment processing
│   │   ├── reminderController.js            # Email reminders
│   │   └── tenantController.js              # Basic tenant operations
│   ├── routes/                      # API route definitions
│   │   ├── enhancedPaymentRoutes.js         # Enhanced payment endpoints
│   │   ├── enhancedPropertyRoutes.js        # Enhanced property endpoints
│   │   ├── enhancedTenantRoutes.js          # Enhanced tenant endpoints
│   │   ├── landlordRoutes.js                # Landlord endpoints
│   │   ├── paymentRoutes.js                 # Basic payment endpoints
│   │   ├── reminderRoutes.js                # Email reminder endpoints
│   │   └── tenantRoutes.js                  # Basic tenant endpoints
│   ├── services/                    # Business logic services
│   │   ├── enhancedEmailService.js          # Comprehensive email system
│   │   ├── enhancedPropertyService.js       # Enhanced property logic
│   │   ├── enhancedTenantService.js         # Enhanced tenant logic
│   │   ├── firestoreService.js              # Firestore database operations
│   │   ├── mpesaService.js                  # M-Pesa API integration
│   │   └── paymentService.js                # Smart payment processing
│   ├── utils/                       # Backend utilities
│   │   └── sendEmail.js             # Email utility functions
│   ├── .env.example                 # Environment variables template
│   ├── package.json                 # Backend dependencies
│   └── server.js                    # Express server entry point
└── README.md                        # This file
```

## 🚀 Features

### 🏢 Enhanced Property Management
- **Unit-based Organization**: Create properties with multiple unit types (bedsitter, 1BR, 2BR, etc.)
- **Auto-generated Account Numbers**: Automatic M-Pesa account number generation (format: PREFIX#UNIT)
- **Smart Unit Assignment**: Automatic tenant assignment to available units
- **Occupancy Tracking**: Real-time unit availability and occupancy rates
- **Revenue Analytics**: Property-level revenue tracking and forecasting

### 👥 Smart Tenant Management
- **Auto-assignment System**: Tenants automatically assigned to available units
- **Unit Type Selection**: Choose preferred unit types during tenant creation
- **Account Balance Tracking**: Monitor tenant balances and payment history
- **Move-out Management**: Easy tenant move-out with unit availability updates
- **Tenant Transfer**: Transfer tenants between units or properties

### 💰 M-Pesa Payment Integration
- **Daraja API Integration**: Direct integration with Safaricom's M-Pesa API
- **STK Push Payments**: Automated payment requests to tenant phones
- **Payment Categories**: Smart categorization (exact, overpayment, underpayment)
- **Balance Management**: Automatic balance tracking and carry-forward
- **Receipt Generation**: Automated M-Pesa receipt processing

### 📧 Automated Email System
- **Welcome Emails**: Automated welcome emails for new landlords and tenants
- **Monthly Reminders**: Scheduled rent reminders on the 28th of each month
- **Payment Confirmations**: Instant email confirmations for successful payments
- **Overdue Notices**: Automated overdue payment notifications on the 5th
- **Password Reset**: Secure password reset with email templates

### 📊 Analytics & Reporting
- **Dashboard Analytics**: Real-time property performance metrics
- **Revenue Trends**: Monthly revenue tracking and growth analysis
- **Occupancy Insights**: Unit-level occupancy rates and trends
- **Payment Analytics**: Success rates and payment pattern analysis
- **Tenant Statistics**: Payment status distribution and tenant metrics

### 🔐 Security & Authentication
- **Firebase Authentication**: Secure user authentication system
- **Password Strength**: Enforced password complexity requirements
- **Forgot Password**: Secure token-based password reset system
- **Role-based Access**: Landlord-specific data access controls
- **Data Encryption**: All sensitive data encrypted in transit and at rest

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher
- **Firebase Project**: Google Firebase project with Firestore enabled
- **M-Pesa Developer Account**: Safaricom Daraja API credentials
- **Gmail Account**: For SMTP email services

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Configure environment variables in `.env`:**
```env
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyCKnAn_NW45OZzJjMqtxUh3_myujY8CCZ8
FIREBASE_AUTH_DOMAIN=rental-management-b8516.firebaseapp.com
FIREBASE_PROJECT_ID=rental-management-b8516
FIREBASE_STORAGE_BUCKET=rental-management-b8516.firebasestorage.app
FIREBASE_MSG_SENDER_ID=508176792296
FIREBASE_APP_ID=1:508176792296:web:ad7116af3327f9fe83a75d
FIREBASE_MEASUREMENT_ID=G-G5ZCC3B8HW
FIREBASE_DATABASE_URL=https://rental-management-b8516-default-rtdb.firebaseio.com/

# M-Pesa Daraja API Configuration
MPESA_CONSUMER_KEY=9wtXSuBe1ziuhkPGr53MhvOiA3YJseenHOGBWBQRRdvcyt4d
MPESA_CONSUMER_SECRET=lCXDxf6VZ73GZtiizN2A0r9Bdep3PmeaqEdTIQ3arl9syAYCzBXHHX2aijmAOuOo
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=http://localhost:5000/api/payments/callback
MPESA_TIMEOUT_URL=http://localhost:5000/api/payments/timeout

# Server Configuration
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=7a2f5f3f0f444e3e9c9a648ebd92e0b0caa951be390b85d83c729b8e9ecfd48d

# Email Configuration
EMAIL_PASSWORD=zgmlwyitxspbklpp
EMAIL_USER=danielatasha03@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

5. **Add Firebase Admin SDK file:**
   - Place your Firebase Admin SDK JSON file in `backend/config/`
   - Update the import path in `server.js` if necessary

6. **Start the backend server:**
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file in frontend root:**
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=AIzaSyCKnAn_NW45OZzJjMqtxUh3_myujY8CCZ8
REACT_APP_FIREBASE_AUTH_DOMAIN=rental-management-b8516.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=rental-management-b8516
REACT_APP_FIREBASE_STORAGE_BUCKET=rental-management-b8516.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=508176792296
REACT_APP_FIREBASE_APP_ID=1:508176792296:web:ad7116af3327f9fe83a75d
```

4. **Start the development server:**
```bash
npm start
```

The frontend application will start on `http://localhost:3000`

## 📡 API Endpoints

### Authentication Endpoints
- `POST /signup` - Create new landlord account with email notifications
- `POST /signin` - Authenticate landlord
- `POST /forgot-password` - Send password reset email
- `POST /reset-password` - Reset password with token

### Enhanced Property Management
- `GET /api/enhanced/properties/landlord/:landlordId` - Get all properties
- `POST /api/enhanced/properties` - Create enhanced property with unit types
- `GET /api/enhanced/properties/:propertyId` - Get single property
- `PUT /api/enhanced/properties/:propertyId` - Update property
- `DELETE /api/enhanced/properties/:propertyId` - Delete property
- `GET /api/enhanced/properties/:propertyId/unit-types` - Get unit types
- `GET /api/enhanced/properties/:propertyId/available-units` - Get available units

### Enhanced Tenant Management
- `GET /api/enhanced/tenants/landlord/:landlordId` - Get all tenants
- `POST /api/enhanced/tenants` - Create tenant with auto-assignment
- `GET /api/enhanced/tenants/:tenantId` - Get single tenant
- `PUT /api/enhanced/tenants/:tenantId` - Update tenant
- `DELETE /api/enhanced/tenants/:tenantId` - Delete tenant
- `POST /api/enhanced/tenants/:tenantId/move-out` - Move tenant out
- `POST /api/enhanced/tenants/:tenantId/transfer` - Transfer tenant
- `GET /api/enhanced/tenants/account/:accountNumber` - Get tenant by account
- `GET /api/enhanced/tenants/:tenantId/payment-summary` - Get payment summary
- `GET /api/enhanced/tenants/landlord/:landlordId/statistics` - Get tenant stats

### Enhanced Payment System
- `POST /api/enhanced/payments/initiate` - Initiate M-Pesa payment
- `POST /api/enhanced/payments/simulate-payment` - Simulate payment for testing
- `POST /api/enhanced/payments/simulate-enhanced` - Enhanced payment simulation
- `GET /api/enhanced/payments/tenant/:tenantId/balance` - Get tenant balance
- `GET /api/enhanced/payments/reminders/:landlordId` - Get payment reminders
- `GET /api/enhanced/payments/recent` - Get recent payments for dashboard
- `GET /api/enhanced/payments/validate-account/:accountNumber` - Validate account

### Landlord Management
- `GET /api/landlords/notifications` - Get landlord notifications
- `PATCH /api/landlords/notifications/:id/read` - Mark notification as read
- `PUT /api/landlords/password` - Update password
- `GET /api/landlords/profile` - Get landlord profile

### Email Testing
- `POST /api/test-email` - Test email functionality with different types

## 🗄️ Database Schema

### Firestore Collections

#### Properties Collection
```javascript
{
  id: "property_id",
  name: "Sunrise Apartments",
  location: "Nairobi, Kenya",
  type: "Apartment Complex",
  paybill: "522522",
  accountPrefix: "823949",
  unitTypes: [
    {
      type: "bedsitter",
      startUnit: "A1",
      endUnit: "A10",
      rentAmount: 25000,
      description: "Single room units"
    },
    {
      type: "1bedroom",
      startUnit: "B1",
      endUnit: "B5",
      rentAmount: 35000,
      description: "One bedroom apartments"
    }
  ],
  totalUnits: 15,
  occupiedUnits: 8,
  availableUnits: 7,
  monthlyRevenue: 240000,
  units: [
    {
      unitNumber: "A1",
      unitType: "bedsitter",
      rentAmount: 25000,
      accountNumber: "823949#A1",
      isOccupied: true,
      tenantId: "tenant_id"
    }
  ],
  landlordId: "landlord_id",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Tenants Collection
```javascript
{
  id: "tenant_id",
  name: "John Doe",
  email: "john@example.com",
  phone: "+254712345678",
  propertyId: "property_id",
  unitNumber: "A1",
  unitType: "bedsitter",
  rentAmount: 25000,
  accountNumber: "823949#A1",
  moveInDate: Timestamp,
  emergencyContact: "Jane Doe",
  emergencyPhone: "+254798765432",
  idNumber: "12345678",
  occupation: "Software Developer",
  landlordId: "landlord_id",
  paymentStatus: "paid", // paid, pending, overdue, partial, moved_out
  accountBalance: 5000, // Positive = credit, Negative = debt
  lastPaymentDate: Timestamp,
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Payments Collection
```javascript
{
  id: "payment_id",
  landlordId: "landlord_id",
  tenantId: "tenant_id",
  tenantName: "John Doe",
  propertyId: "property_id",
  propertyName: "Sunrise Apartments",
  unitNumber: "A1",
  unitType: "bedsitter",
  amount: 25000,
  expectedAmount: 25000,
  phoneNumber: "+254712345678",
  accountNumber: "823949#A1",
  method: "M-Pesa",
  status: "completed", // completed, pending, failed
  mpesaReceiptNumber: "RK12345678",
  description: "Rent payment for John Doe - Unit A1",
  paymentType: "exact", // exact, overpayment, underpayment
  overpaymentAmount: 0,
  shortfallAmount: 0,
  source: "stk_push", // stk_push, manual, enhanced_simulation
  createdAt: Timestamp
}
```

#### Notifications Collection
```javascript
{
  id: "notification_id",
  landlordId: "landlord_id",
  title: "Payment Received",
  message: "John Doe paid KES 25,000 for Unit A1",
  type: "payment", // payment, tenant, property, reminder, warning, info, success
  data: {
    tenantId: "tenant_id",
    tenantName: "John Doe",
    propertyId: "property_id",
    propertyName: "Sunrise Apartments",
    amount: 25000
  },
  read: false,
  priority: "low", // low, medium, high
  createdAt: Timestamp
}
```

#### Users Collection
```javascript
{
  uid: "firebase_uid",
  name: "Landlord Name",
  email: "landlord@example.com",
  phoneNumber: "+254712345678",
  role: "landlord",
  isActive: true,
  createdAt: "ISO_String"
}
```

#### PasswordResets Collection
```javascript
{
  email: "user@example.com",
  token: "crypto_random_token",
  expiresAt: Timestamp,
  createdAt: Timestamp,
  used: false,
  usedAt: Timestamp // Only set when used
}
```

## 🎨 Frontend Technologies

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.1",
  "react-hot-toast": "^2.4.0",
  "framer-motion": "^10.0.1",
  "tailwindcss": "^3.2.7",
  "axios": "^1.3.4",
  "firebase": "^9.17.2",
  "lucide-react": "^0.263.1",
  "recharts": "^2.5.0",
  "date-fns": "^2.29.3"
}
```

### Styling System
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Design System**: Consistent color palette and spacing
- **Glass Morphism**: Modern glass effect components
- **Responsive Design**: Mobile-first responsive layout
- **Dark Mode Support**: Prepared for dark mode implementation

### Animation Library
- **Framer Motion**: Smooth page transitions and micro-interactions
- **Loading States**: Skeleton loading and spinners
- **Hover Effects**: Interactive button and card animations
- **Page Transitions**: Smooth navigation between pages

## 🚀 Backend Technologies

### Core Dependencies
```json
{
  "express": "^4.18.2",
  "firebase": "^10.7.1",
  "firebase-admin": "^11.11.0",
  "axios": "^1.6.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "nodemailer": "^7.0.3",
  "node-cron": "^4.1.0"
}
```

### Database
- **Firestore**: NoSQL document database for scalability
- **Firebase Admin SDK**: Server-side Firebase operations
- **Collections**: Properties, Tenants, Payments, Notifications, Users
- **Indexes**: Optimized queries for landlord-specific data

### External Integrations
- **M-Pesa Daraja API**: Payment processing integration
- **Gmail SMTP**: Email delivery service
- **Firebase Auth**: User authentication and management

## 📧 Email Automation System

### Email Types
1. **Landlord Welcome Email**: Sent on account creation
2. **Tenant Welcome Email**: Sent when tenant is added
3. **Monthly Rent Reminders**: Scheduled for 28th of each month
4. **Payment Confirmations**: Instant email on successful payment
5. **Overdue Payment Notices**: Sent on 5th of each month
6. **Password Reset Emails**: Secure password reset process

### Scheduling System
- **Monthly Reminders**: `0 8 28 * *` (28th at 8:00 AM)
- **Overdue Notices**: `0 9 5 * *` (5th at 9:00 AM)
- **Real-time**: Payment confirmations and welcome emails

### Email Templates
- **Responsive HTML**: Mobile-optimized email templates
- **Brand Consistency**: RentFlow branding and colors
- **Security Features**: Anti-phishing measures and secure links
- **Accessibility**: Screen reader compatible templates

## 💳 M-Pesa Integration

### Daraja API Features
- **STK Push**: Automated payment requests
- **OAuth Authentication**: Secure API access
- **Callback Handling**: Real-time payment status updates
- **Error Handling**: Comprehensive error management
- **Testing Mode**: Sandbox environment for development

### Payment Flow
1. **Initiate Payment**: STK push to tenant's phone
2. **User Authorization**: Tenant enters M-Pesa PIN
3. **Callback Processing**: Real-time payment confirmation
4. **Balance Update**: Automatic tenant balance adjustment
5. **Email Notification**: Instant payment confirmation email

### Account Number System
- **Format**: `PREFIX#UNIT` (e.g., "823949#A1")
- **Auto-generation**: Created with unit assignment
- **Validation**: Account number format verification
- **Mapping**: Direct mapping to tenant and unit

## 🔐 Security Features

### Authentication
- **Firebase Auth**: Industry-standard authentication
- **Password Requirements**: Minimum 8 characters with complexity
- **Token-based Reset**: Secure password reset with expiration
- **Session Management**: Automatic token refresh

### Data Protection
- **Input Validation**: Server-side input sanitization
- **SQL Injection Protection**: NoSQL database prevents SQL injection
- **XSS Prevention**: Content Security Policy headers
- **HTTPS Enforcement**: Secure data transmission

### API Security
- **JWT Tokens**: Secure API authentication
- **Rate Limiting**: Prevent API abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Environment Variables**: Sensitive data protection

## 📊 Analytics & Reporting

### Dashboard Metrics
- **Property Count**: Total properties managed
- **Tenant Statistics**: Active, moved-out, payment status
- **Revenue Analytics**: Monthly revenue and growth trends
- **Occupancy Rates**: Property and unit-level occupancy
- **Collection Efficiency**: Payment success rates

### Chart Types
- **Area Charts**: Revenue trends over time
- **Pie Charts**: Payment status distribution
- **Bar Charts**: Property performance comparison
- **Line Charts**: Occupancy trend analysis

### Export Features
- **PDF Reports**: Downloadable financial reports
- **CSV Exports**: Data export for external analysis
- **Excel Integration**: Formatted spreadsheet exports

## 🧪 Testing & Development

### Backend Testing Endpoints
- `GET /api/status` - API health check
- `GET /api/health` - Detailed health information
- `POST /api/test-email` - Email system testing
- `GET /payments/test-oauth` - M-Pesa connection test
- `POST /payments/test-payment` - STK push testing
- `POST /payments/simulate-payment` - Payment simulation

### Testing Data
- **Mock Tenants**: Pre-populated test data
- **Simulated Payments**: Test payment scenarios
- **Email Testing**: All email templates testable
- **M-Pesa Sandbox**: Safe payment testing environment

### Development Tools
- **Nodemon**: Auto-restart on file changes
- **Hot Reload**: React development server
- **Environment Switching**: Development/production configs
- **Logging**: Comprehensive error and activity logging

## 🚀 Deployment

### Environment Setup
1. **Production Firebase**: Create production Firebase project
2. **M-Pesa Production**: Obtain production M-Pesa credentials
3. **Domain Setup**: Configure production domain
4. **SSL Certificate**: Enable HTTPS for security

### Backend Deployment
- **Hosting Options**: Heroku, AWS, Google Cloud Platform
- **Environment Variables**: Set all production env vars
- **Database Setup**: Configure Firestore indexes
- **Email Configuration**: Production SMTP settings

### Frontend Deployment
- **Build Process**: `npm run build` for production build
- **Hosting Options**: Netlify, Vercel, Firebase Hosting
- **Environment Variables**: Set production API URL
- **CDN Configuration**: Optimize asset delivery

## 🔧 Configuration

### Firebase Setup
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password provider
3. Create Firestore database in production mode
4. Generate web app config and Admin SDK key
5. Configure security rules for Firestore

### M-Pesa Setup
1. Register at https://developer.safaricom.co.ke
2. Create new app and obtain Consumer Key/Secret
3. Configure STK Push and get Business Shortcode
4. Set up callback and timeout URLs
5. Test in sandbox before production

### Email Setup
1. Create Gmail account or use existing
2. Enable 2-factor authentication
3. Generate App Password for SMTP
4. Configure SMTP settings in environment variables
5. Test email delivery

## 📱 Mobile Responsiveness

### Responsive Design
- **Mobile-first**: Designed for mobile devices first
- **Breakpoints**: Tailwind CSS responsive breakpoints
- **Touch Targets**: Minimum 44px touch targets
- **Gestures**: Swipe and touch gesture support

### Progressive Web App (PWA) Ready
- **Service Worker**: Prepared for offline functionality
- **App Manifest**: Ready for home screen installation
- **Push Notifications**: Framework for future implementation

## 🔮 Future Enhancements

### Planned Features
- **Multi-language Support**: Swahili localization
- **Mobile App**: React Native mobile application
- **Tenant Portal**: Dedicated tenant dashboard
- **Maintenance Requests**: Digital maintenance management
- **Document Management**: Lease agreement storage
- **WhatsApp Integration**: WhatsApp notifications
- **Advanced Analytics**: Machine learning insights
- **Multi-tenancy**: Support for property management companies

### Technical Improvements
- **Microservices**: Break backend into microservices
- **GraphQL**: Replace REST API with GraphQL
- **Real-time Updates**: WebSocket for live updates
- **Caching**: Redis caching for performance
- **Testing**: Comprehensive test suite
- **CI/CD**: Automated deployment pipeline

## 🐛 Troubleshooting

### Common Issues

#### Backend Server Won't Start
```bash
# Check Node.js version
node --version  # Should be 16.x or higher

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env  # Ensure all required vars are set
```

#### Firebase Connection Issues
```bash
# Verify Firebase config
echo $FIREBASE_PROJECT_ID

# Check Firestore rules
# Go to Firebase Console > Firestore > Rules
# Ensure proper read/write permissions
```

#### M-Pesa Integration Issues
```bash
# Test OAuth endpoint
curl http://localhost:5000/api/payments/test-oauth

# Check M-Pesa credentials
echo $MPESA_CONSUMER_KEY
echo $MPESA_CONSUMER_SECRET

# Verify callback URLs are accessible
```

#### Email Not Sending
```bash
# Test SMTP connection
curl -X POST http://localhost:5000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"type":"welcome","email":"test@example.com","data":{"name":"Test User"}}'

# Check Gmail App Password
# Ensure 2FA is enabled and App Password is generated
```

#### Frontend Build Issues
```bash
# Clear React cache
npm start -- --reset-cache

# Check environment variables
cat .env.local  # Should contain REACT_APP_ prefixed vars

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Error Codes
- **AUTH001**: Invalid Firebase credentials
- **PAY001**: M-Pesa API connection failed
- **EMAIL001**: SMTP authentication failed
- **DB001**: Firestore connection timeout
- **API001**: Backend server unreachable

## 📞 Support & Contact

### Technical Support
- **Email**: support@rentflow.co.ke
- **Documentation**: Internal API documentation available
- **Issues**: GitHub issues for bug reports
- **Discussions**: Community discussions for feature requests

### Development Team
- **Backend**: Node.js/Express.js developers
- **Frontend**: React.js developers
- **Database**: Firestore specialists
- **Integration**: M-Pesa and Email integration experts

## 📄 License

This project is proprietary software. All rights reserved.

### Usage Rights
- **Development**: Authorized for development and testing
- **Production**: Requires production license
- **Modification**: Source code modification allowed for licensed users
- **Distribution**: Redistribution prohibited without explicit permission

### Third-party Licenses
- **React**: MIT License
- **Node.js**: MIT License
- **Firebase**: Google Terms of Service
- **M-Pesa**: Safaricom Developer Terms
- **Tailwind CSS**: MIT License
- **Framer Motion**: MIT License

## 📋 Development Workflow

### Git Workflow
```bash
# Clone repository
git clone <repository-url>
cd rentflow

# Create feature branch
git checkout -b feature/enhanced-payments

# Make changes and commit
git add .
git commit -m "feat: add enhanced payment simulation"

# Push and create pull request
git push origin feature/enhanced-payments
```

### Code Standards
- **ESLint**: JavaScript linting rules
- **Prettier**: Code formatting standards
- **Conventional Commits**: Standardized commit messages
- **JSDoc**: Function documentation requirements

### Testing Strategy
```bash
# Backend testing
cd backend
npm test                    # Run unit tests
npm run test:integration   # Run integration tests
npm run test:coverage     # Generate coverage report

# Frontend testing
cd frontend
npm test                   # Run React tests
npm run test:coverage     # Generate coverage report
npm run test:e2e          # Run end-to-end tests
```

## 🔄 Data Migration

### Initial Data Setup
```bash
# Create initial landlord
POST /signup
{
  "email": "landlord@example.com",
  "password": "SecurePass123!",
  "name": "John Landlord",
  "phoneNumber": "+254712345678"
}

# Create enhanced property
POST /api/enhanced/properties
{
  "name": "Sunrise Apartments",
  "location": "Westlands, Nairobi",
  "type": "Apartment Complex",
  "paybill": "522522",
  "accountPrefix": "823949",
  "unitTypes": [
    {
      "type": "bedsitter",
      "startUnit": "A1",
      "endUnit": "A10",
      "rentAmount": 25000,
      "description": "Single room units"
    }
  ]
}

# Add tenant with auto-assignment
POST /api/enhanced/tenants
{
  "name": "Jane Tenant",
  "email": "jane@example.com",
  "phone": "+254798765432",
  "propertyId": "property_id",
  "unitType": "bedsitter",
  "moveInDate": "2024-01-01"
}
```

### Data Export/Import
```bash
# Export property data
GET /api/enhanced/properties/landlord/:landlordId
# Save response to properties.json

# Export tenant data
GET /api/enhanced/tenants/landlord/:landlordId
# Save response to tenants.json

# Export payment history
GET /api/enhanced/payments/recent?landlordId=:id&limit=1000
# Save response to payments.json
```

## 🎯 Performance Optimization

### Frontend Optimization
- **Code Splitting**: React.lazy() for route-based splitting
- **Memoization**: React.memo() and useMemo() for expensive computations
- **Virtual Scrolling**: For large tenant/payment lists
- **Image Optimization**: WebP format and lazy loading
- **Bundle Analysis**: webpack-bundle-analyzer for bundle optimization

### Backend Optimization
- **Database Indexing**: Firestore composite indexes for complex queries
- **Caching**: In-memory caching for frequently accessed data
- **Connection Pooling**: Efficient database connection management
- **Compression**: Gzip compression for API responses
- **Rate Limiting**: Prevent API abuse and ensure fair usage

### Monitoring & Analytics
```javascript
// Performance monitoring setup
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);

// API response time monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

## 🔧 Advanced Configuration

### Custom Email Templates
```html
<!-- Custom email template structure -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{emailTitle}}</title>
    <style>
        /* Inline CSS for email compatibility */
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #3b82f6, #6366f1); }
        .content { padding: 30px 20px; background: #f8fafc; }
        .footer { background: #1f2937; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{companyName}}</h1>
        </div>
        <div class="content">
            {{emailContent}}
        </div>
        <div class="footer">
            {{footerContent}}
        </div>
    </div>
</body>
</html>
```

### Advanced Firestore Rules
```javascript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Properties: Only landlord can read/write their properties
    match /properties/{propertyId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.landlordId;
    }
    
    // Tenants: Only landlord can manage their tenants
    match /tenants/{tenantId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.landlordId;
    }
    
    // Payments: Only landlord can view their payment history
    match /payments/{paymentId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.landlordId;
    }
    
    // Notifications: Only landlord can read their notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.landlordId;
    }
    
    // Users: Users can only read/write their own data
    match /Users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

### Environment-Specific Configurations
```javascript
// config/environments.js
const environments = {
  development: {
    api: {
      baseURL: 'http://localhost:5000/api',
      timeout: 10000
    },
    mpesa: {
      environment: 'sandbox',
      baseURL: 'https://sandbox.safaricom.co.ke'
    },
    email: {
      provider: 'gmail',
      testMode: true
    }
  },
  production: {
    api: {
      baseURL: 'https://api.rentflow.co.ke/api',
      timeout: 30000
    },
    mpesa: {
      environment: 'production',
      baseURL: 'https://api.safaricom.co.ke'
    },
    email: {
      provider: 'gmail',
      testMode: false
    }
  }
};

export default environments[process.env.NODE_ENV || 'development'];
```

## 📚 API Documentation

### Authentication Flow
```javascript
// 1. User registration
POST /signup
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "name": "John Doe",
  "phoneNumber": "+254712345678"
}

// Response
{
  "success": true,
  "message": "Account created successfully",
  "uid": "firebase_uid",
  "email": "user@example.com"
}

// 2. User login
POST /signin
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response
{
  "success": true,
  "uid": "firebase_uid",
  "idToken": "jwt_token",
  "refreshToken": "refresh_token",
  "email": "user@example.com"
}

// 3. Authenticated requests
GET /api/enhanced/properties/landlord/firebase_uid
Authorization: Bearer jwt_token
authorization-uid: firebase_uid
```

### Property Management API
```javascript
// Create enhanced property
POST /api/enhanced/properties
Authorization: Bearer jwt_token
Content-Type: application/json
{
  "name": "Sunrise Apartments",
  "location": "Westlands, Nairobi",
  "type": "Apartment Complex",
  "paybill": "522522",
  "accountPrefix": "823949",
  "description": "Modern apartments with amenities",
  "image": "https://example.com/property.jpg",
  "unitTypes": [
    {
      "type": "bedsitter",
      "startUnit": "A1",
      "endUnit": "A10",
      "rentAmount": 25000,
      "description": "Single room units with kitchenette"
    },
    {
      "type": "1bedroom",
      "startUnit": "B1",
      "endUnit": "B5",
      "rentAmount": 35000,
      "description": "One bedroom apartments"
    }
  ]
}

// Response
{
  "success": true,
  "data": {
    "id": "property_id",
    "totalUnits": 15,
    "availableUnits": 15,
    "occupiedUnits": 0,
    "units": [...],
    "message": "Enhanced property created with 15 units"
  }
}
```

### Tenant Management API
```javascript
// Create tenant with auto-assignment
POST /api/enhanced/tenants
Authorization: Bearer jwt_token
Content-Type: application/json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+254798765432",
  "propertyId": "property_id",
  "unitType": "bedsitter",
  "preferredUnit": "A1", // Optional
  "moveInDate": "2024-01-01",
  "emergencyContact": "John Smith",
  "emergencyPhone": "+254712345678",
  "idNumber": "12345678",
  "occupation": "Teacher"
}

// Response
{
  "success": true,
  "data": {
    "tenantId": "tenant_id",
    "unitNumber": "A1",
    "unitType": "bedsitter",
    "rentAmount": 25000,
    "accountNumber": "823949#A1"
  },
  "message": "Tenant assigned to unit A1 with account 823949#A1"
}
```

### Payment Processing API
```javascript
// Simulate enhanced payment
POST /api/enhanced/payments/simulate-enhanced
Authorization: Bearer jwt_token
Content-Type: application/json
{
  "accountNumber": "823949#A1",
  "amount": 25000,
  "phoneNumber": "+254798765432"
}

// Response
{
  "success": true,
  "message": "Enhanced payment simulation completed",
  "paymentId": "payment_id",
  "tenant": {
    "name": "Jane Smith",
    "unitNumber": "A1",
    "unitType": "bedsitter",
    "accountNumber": "823949#A1",
    "expectedRent": 25000,
    "currentBalance": 0
  },
  "payment": {
    "amount": 25000,
    "paymentType": "exact",
    "status": "completed",
    "mpesaReceiptNumber": "RK12345678"
  }
}
```

## 🛡️ Security Best Practices

### Input Validation
```javascript
// Backend validation example
const { body, validationResult } = require('express-validator');

const validateTenant = [
  body('name').isLength({ min: 2, max: 100 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('phone').isMobilePhone('en-KE'),
  body('rentAmount').isNumeric().isFloat({ min: 0 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];
```

### Rate Limiting
```javascript
// Rate limiting configuration
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit auth attempts
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  }
});

app.use('/api/', apiLimiter);
app.use('/signin', authLimiter);
app.use('/signup', authLimiter);
```

### Data Encryption
```javascript
// Sensitive data encryption
const crypto = require('crypto');

const encrypt = (text, key) => {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decrypt = (encryptedText, key) => {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
```

## 📈 Scaling Considerations

### Horizontal Scaling
```javascript
// Load balancer configuration (nginx)
upstream rentflow_backend {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}

server {
    listen 80;
    server_name api.rentflow.co.ke;
    
    location / {
        proxy_pass http://rentflow_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Optimization
```javascript
// Firestore query optimization
const getTenantsOptimized = async (landlordId, limit = 50) => {
  const query = db.collection('tenants')
    .where('landlordId', '==', landlordId)
    .where('isActive', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(limit);
    
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Batch operations for better performance
const batchUpdateTenants = async (updates) => {
  const batch = db.batch();
  
  updates.forEach(update => {
    const tenantRef = db.collection('tenants').doc(update.id);
    batch.update(tenantRef, update.data);
  });
  
  await batch.commit();
};
```

### Caching Strategy
```javascript
// Redis caching implementation
const redis = require('redis');
const client = redis.createClient();

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};

// Usage
app.get('/api/enhanced/properties/landlord/:id', 
  cacheMiddleware(600), // Cache for 10 minutes
  getProperties
);
```

## 🎨 UI/UX Guidelines

### Design System
```css
/* CSS Custom Properties for consistent theming */
:root {
  /* Primary Colors */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  
  /* Success Colors */
  --color-success-50: #f0fdf4;
  --color-success-500: #10b981;
  --color-success-600: #059669;
  
  /* Warning Colors */
  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  
  /* Error Colors */
  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  
  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
}
```

### Component Guidelines
```javascript
// Standard button component
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  loading = false,
  ...props 
}) => {
  const baseClasses = 'btn transition-all duration-200 focus:outline-none focus:ring-2';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    warning: 'btn-warning',
    danger: 'btn-danger'
  };
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
      {children}
    </button>
  );
};
```

### Accessibility Standards
```javascript
// Accessibility helpers
const useKeyboardNavigation = (onEnter, onEscape) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') onEnter?.();
      if (event.key === 'Escape') onEscape?.();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEnter, onEscape]);
};

const FocusTrap = ({ children, active }) => {
  const trapRef = useRef();
  
  useEffect(() => {
    if (!active) return;
    
    const focusableElements = trapRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    firstElement?.focus();
    
    const handleTab = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [active]);
  
  return <div ref={trapRef}>{children}</div>;
};
```

---

## 📖 Conclusion

RentFlow represents a comprehensive property management solution tailored specifically for the Kenyan market. With its enhanced unit-based management system, seamless M-Pesa integration, and automated email notifications, it provides property owners with a powerful platform to streamline their operations and maximize their rental income.

The system's architecture ensures scalability, security, and maintainability while providing an exceptional user experience across all devices. Whether managing a single property or a large portfolio, RentFlow adapts to meet the needs of modern property management.

For additional support, updates, or feature requests, please refer to the contact information provided in the Support section of this documentation.