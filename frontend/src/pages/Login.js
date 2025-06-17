import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Building2, 
  ArrowLeft,
  CheckCircle,
  Shield,
  Smartphone,
  Users,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, signup, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location]);

  const validateForm = () => {
    if (!email.trim()) {
      toast.error('Email is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!password) {
      toast.error('Password is required');
      return false;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (isSignUp && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password);
        toast.success('Account created successfully! Welcome to RentFlow!');
      } else {
        await login(email, password);
        toast.success(`Welcome back!`);
      }
      
      // Navigate to dashboard or intended page
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Better error messages
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Building2,
      title: "Smart Property Management",
      description: "Manage multiple properties with ease"
    },
    {
      icon: Users,
      title: "Automated Tenant System",
      description: "Streamlined tenant onboarding"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Bank-grade security for your data"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Access anywhere, anytime"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-10 p-6"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Building2 className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">RentFlow</h1>
              <p className="text-sm text-gray-600">Property Management</p>
            </div>
          </Link>

          {/* Back to Home */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </motion.header>

      <div className="min-h-screen flex">
        {/* Left Side - Features & Info */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-600/90" />
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>

          <div className="relative z-10 flex flex-col justify-center p-16 text-white">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="mb-12">
                <h2 className="text-4xl font-bold mb-6 leading-tight">
                  {isSignUp ? 'Join RentFlow Today' : 'Welcome Back to RentFlow'}
                </h2>
                <p className="text-xl opacity-90 leading-relaxed">
                  {isSignUp 
                    ? 'Start managing your properties with the most comprehensive platform in Kenya.'
                    : 'Continue managing your properties with ease and efficiency.'
                  }
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      variants={itemVariants}
                      className="flex items-start space-x-4"
                    >
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                        <p className="text-white/80">{feature.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-white/20">
                <div className="grid grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold">5,000+</div>
                    <div className="text-white/80 text-sm">Properties</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">KES 2B+</div>
                    <div className="text-white/80 text-sm">Collected</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">99.9%</div>
                    <div className="text-white/80 text-sm">Uptime</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 pt-32 lg:pt-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">RentFlow</h1>
                  <p className="text-sm text-gray-600">Property Management</p>
                </div>
              </div>
            </div>

            {/* Form Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}
              </h2>
              <p className="text-lg text-gray-700">
                {isSignUp 
                  ? 'Start your property management journey' 
                  : 'Welcome back! Please enter your details'
                }
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="form-group">
                  <label className="form-label">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-12"
                      placeholder="Enter your email address"
                      disabled={isLoading}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="form-group">
                  <label className="form-label">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pl-12 pr-12"
                      placeholder="Enter your password"
                      disabled={isLoading}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field (Sign Up Only) */}
                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="form-group"
                    >
                      <label className="form-label">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="input pl-12 pr-12"
                          placeholder="Confirm your password"
                          disabled={isLoading}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Remember Me & Forgot Password */}
                {!isSignUp && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        disabled={isLoading}
                      />
                      <span className="text-gray-700 font-medium">Remember me</span>
                    </label>
                    <button 
                      type="button" 
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary text-lg h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                      {!isSignUp && <CheckCircle className="w-5 h-5" />}
                    </span>
                  )}
                </button>
              </form>

              {/* Switch Mode */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 text-center"
              >
                <p className="text-gray-700 text-lg">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setConfirmPassword('');
                      setPassword('');
                      setEmail('');
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    disabled={isLoading}
                  >
                    {isSignUp ? 'Sign In' : 'Create Account'}
                  </button>
                </p>
              </motion.div>

              {/* Security Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-blue-800 text-sm">
                    <strong>Secure & Protected:</strong> Your data is encrypted and protected with bank-grade security.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;