import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  BarChart3,
  Zap
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/properties', icon: Building2, label: 'Properties' },
    { path: '/tenants', icon: Users, label: 'Tenants' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-64 glass border-r border-white/10 flex flex-col h-full"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center glow-primary">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">RentFlow</h1>
            <p className="text-xs text-white/60">Property Manager</p>
          </div>
        </motion.div>
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
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-primary text-white glow-primary'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Icon 
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} 
                />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                  />
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-strong p-4 rounded-xl text-center"
        >
          <div className="w-12 h-12 bg-gradient-secondary rounded-xl mx-auto mb-3 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">Upgrade to Pro</h3>
          <p className="text-white/60 text-xs mb-3">Get advanced analytics and unlimited properties</p>
          <button className="btn btn-secondary w-full text-xs">
            Upgrade Now
          </button>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;