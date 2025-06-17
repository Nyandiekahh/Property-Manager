import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'large', text = 'Loading...', fullScreen = true }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10'
  };

  const LoadingContent = () => (
    <div className="text-center">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">RentFlow</h2>
        <p className="text-sm text-gray-600">Property Management</p>
      </motion.div>

      {/* Spinner */}
      <motion.div
        className={`${sizeClasses[size]} border-3 border-gray-200 border-t-blue-600 rounded-full mx-auto mb-4`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 text-lg font-medium"
      >
        {text}
      </motion.div>

      {/* Loading Dots */}
      <motion.div
        className="flex space-x-1 justify-center mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center z-50">
        <LoadingContent />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <LoadingContent />
    </div>
  );
};

export default LoadingSpinner;