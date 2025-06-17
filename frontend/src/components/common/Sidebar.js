import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  BarChart3,
  Menu,
  X,
  Zap
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/dashboard/properties', icon: Building2, label: 'Properties' },
    { path: '/dashboard/tenants', icon: Users, label: 'Tenants' },
    { path: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ 
          x: isMobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -300)
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`${
          isMobileOpen ? 'fixed' : 'hidden lg:block'
        } w-64 bg-white border-r border-gray-200 flex flex-col h-full z-40`}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={closeMobileMenu}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">RentFlow</h1>
              <p className="text-xs text-gray-600">Property Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NavLink
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) => `
                    flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group
                    ${isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`} 
                  />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                    />
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
};

export default Sidebar;