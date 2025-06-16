# Property Management System (RentFlow)

A comprehensive property management platform built with React.js frontend and Node.js backend, integrated with Firebase for authentication and real-time data management.

## 🏗️ Project Overview

**RentFlow** is a modern property management system designed for landlords and property managers to efficiently manage their rental properties, tenants, payments, and analytics.

### ✨ Features

- **🏠 Property Management**: Add, edit, and manage multiple properties
- **👥 Tenant Management**: Complete tenant profiles with contact information and lease details
- **💰 Payment Tracking**: Real-time payment monitoring and history
- **📊 Analytics Dashboard**: Financial insights and property performance metrics
- **🔐 Secure Authentication**: Firebase-powered user authentication
- **📱 Responsive Design**: Mobile-friendly interface
- **🎨 Professional UI**: Clean, business-focused design

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - Modern UI framework
- **Tailwind CSS 3** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Elegant notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Firebase Admin SDK** - Server-side Firebase integration
- **Cors** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

### Database & Authentication
- **Firebase Firestore** - NoSQL document database
- **Firebase Authentication** - User management
- **Firebase Realtime Database** - Real-time data synchronization

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Firestore and Authentication enabled

### Clone Repository
```bash
git clone https://github.com/Nyandiekahh/Property-Manager.git
cd Property-Manager
```

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Firebase configuration to .env
# FIREBASE_API_KEY=your_api_key
# FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config values

# Place your Firebase service account key in backend/config/
# Download from Firebase Console > Project Settings > Service Accounts

# Start the backend server
npm start
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.development.example .env.development

# Add your Firebase configuration to .env.development
# REACT_APP_FIREBASE_API_KEY=your_api_key
# REACT_APP_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config values

# Start the development server
npm start
```

## 📁 Project Structure

```
Property-Manager/
├── backend/
│   ├── config/
│   │   ├── firebaseClient.js
│   │   └── [service-account-key].json
│   ├── controllers/
│   │   ├── landlordController.js
│   │   ├── paymentController.js
│   │   └── tenantController.js
│   ├── routes/
│   │   ├── landlordRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── tenantRoutes.js
│   ├── services/
│   │   └── darajaService.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── property/
│   │   │   └── tenant/
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── Properties.js
│   │   │   ├── Tenants.js
│   │   │   └── PaymentHistory.js
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   └── styles/
│   ├── package.json
│   └── .env.development
└── README.md
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Enable Realtime Database
5. Download service account key
6. Add Firebase config to environment files

### Environment Variables

**Backend (.env)**
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MSG_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com/
PORT=5000
```

**Frontend (.env.development)**
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 🎯 Usage

1. **Start the backend server**: `cd backend && npm start`
2. **Start the frontend**: `cd frontend && npm start`
3. **Access the application**: Open http://localhost:3000
4. **Create an account**: Click "Create Account" and register
5. **Start managing**: Add properties, tenants, and track payments

## 🌟 Key Components

### Dashboard
- Overview of all properties and tenants
- Revenue analytics and occupancy rates
- Recent payments and upcoming rents
- Quick action buttons

### Property Management
- Add/edit property details
- Upload property images
- Track occupancy and revenue per property
- Property analytics

### Tenant Management
- Complete tenant profiles
- Lease management
- Payment history per tenant
- Communication tools

### Payment Tracking
- Real-time payment status
- Payment history with filters
- Export payment reports
- M-Pesa integration (planned)

## 🔄 API Endpoints

### Authentication
- `POST /signup` - Create new user account
- `POST /signin` - User login

### Tenants
- `GET /api/tenants` - Get all tenants
- `POST /api/tenants` - Create new tenant
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/callback` - Payment callback

## 🚧 Development Status

### ✅ Completed
- User authentication system
- Property management CRUD operations
- Tenant management system
- Dashboard with analytics
- Payment tracking interface
- Responsive UI design
- Firebase integration

### 🔄 In Progress
- M-Pesa payment integration
- Email notifications
- Advanced analytics
- Property image upload

### 📋 Planned Features
- SMS notifications
- Automated rent reminders
- Maintenance request system
- Document management
- Mobile app
- Multi-language support

## 👥 Contributors

- **Nyandieka** - Frontend Developer
- **Daniela** - Backend Developer & Firebase Setup

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, create an issue in this repository.

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Tailwind CSS for styling system
- Lucide React for beautiful icons
- Framer Motion for smooth animations
