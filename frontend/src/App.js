import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import PaymentHistory from './pages/PaymentHistory';
import Analytics from './pages/Analytics';

// Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  if (!currentUser) {
    // Redirect to login with the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Dashboard Layout wrapper
const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Loading RentFlow..." />;
  }

  return (
    <Router>
      <div className="min-h-screen">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={currentUser ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
            />
            <Route 
              path="/login" 
              element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />} 
            />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/properties" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Properties />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/tenants" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Tenants />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/payments" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PaymentHistory />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/analytics" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Analytics />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />

            {/* Legacy route redirects for backward compatibility */}
            <Route path="/properties" element={<Navigate to="/dashboard/properties" replace />} />
            <Route path="/tenants" element={<Navigate to="/dashboard/tenants" replace />} />
            <Route path="/payments" element={<Navigate to="/dashboard/payments" replace />} />
            <Route path="/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;