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
  Loader2,
  User,
  Phone,
  Check,
  X,
  ArrowRight,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const { login, signup, resetPassword, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location]);

  // Password validation regex
  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  // Handle password change
  const handlePasswordChange = (value) => {
    setPassword(value);
    if (isSignUp) {
      validatePassword(value);
    }
  };

  // Validate phone number (Kenyan format)
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // Format phone number to international format
  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('254')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+254${cleaned.slice(1)}`;
    } else if (cleaned.length === 9) {
      return `+254${cleaned}`;
    }
    return phone;
  };

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

    if (isSignUp) {
      if (!name.trim()) {
        toast.error('Full name is required');
        return false;
      }

      if (!phoneNumber.trim()) {
        toast.error('Phone number is required');
        return false;
      }

      if (!validatePhoneNumber(phoneNumber)) {
        toast.error('Please enter a valid Kenyan phone number');
        return false;
      }

      if (!validatePassword(password)) {
        toast.error('Password does not meet security requirements');
        return false;
      }

      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    } else {
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return false;
      }
    }

    return true;
  };

  // Handle main form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Call backend signup endpoint with additional data
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            confirmPassword,
            name,
            phoneNumber: formatPhoneNumber(phoneNumber)
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Account created successfully! Welcome to RentFlow!');
          // Auto-login after successful signup
          await login(email, password);
        } else {
          throw new Error(data.error || 'Failed to create account');
        }
      } else {
        await login(email, password);
        toast.success('Welcome back!');
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

  // Handle forgot password submission
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setForgotPasswordLoading(true);

    try {
      const result = await resetPassword(forgotPasswordEmail);
      
      if (result.success) {
        setForgotPasswordSent(true);
        toast.success('Password reset instructions sent to your email!');
      } else {
        throw new Error(result.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Reset forgot password form
  const resetForgotPasswordForm = () => {
    setForgotPasswordEmail('');
    setForgotPasswordSent(false);
    setForgotPasswordLoading(false);
  };

  // Close forgot password modal
  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    resetForgotPasswordForm();
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

  const getPasswordStrength = () => {
    const validCount = Object.values(passwordValidation).filter(Boolean).length;
    if (validCount <= 2) return { strength: 'weak', color: 'bg-red-500', width: '33%' };
    if (validCount <= 4) return { strength: 'medium', color: 'bg-yellow-500', width: '66%' };
    return { strength: 'strong', color: 'bg-green-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength();

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
                {/* Name Field (Sign Up Only) */}
                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="form-group"
                    >
                      <label className="form-label">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="input !pl-14 "
                          placeholder="Enter your full name"
                          disabled={isLoading}
                          autoComplete="name"
                          required
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Field */}
                <div className="form-group">
                  <label className="form-label">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 " />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input !pl-12 "
                      placeholder="Enter your email address"
                      disabled={isLoading}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Phone Number Field (Sign Up Only) */}
                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="form-group"
                    >
                      <label className="form-label">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="input !pl-12"
                          placeholder="+254712345678 or 0712345678"
                          disabled={isLoading}
                          autoComplete="tel"
                          required
                        />
                      </div>
                      <p className="text-gray-500 text-sm mt-1">
                        Enter your Kenyan phone number for M-Pesa integration
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="input !pl-12 !pr-12"
                      placeholder="Enter your password"
                      disabled={isLoading}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      required
                      minLength={isSignUp ? "8" : "6"}
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

                  {/* Password Strength Indicator (Sign Up Only) */}
                  {isSignUp && password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Password strength:</span>
                        <span className={`text-sm font-medium ${
                          passwordStrength.strength === 'strong' ? 'text-green-600' :
                          passwordStrength.strength === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {passwordStrength.strength}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: passwordStrength.width }}
                        ></div>
                      </div>
                      
                      <div className="mt-3 space-y-1">
                        {[
                          { key: 'length', text: 'At least 8 characters' },
                          { key: 'uppercase', text: 'One uppercase letter' },
                          { key: 'lowercase', text: 'One lowercase letter' },
                          { key: 'number', text: 'One number' },
                          { key: 'special', text: 'One special character (@$!%*?&)' }
                        ].map(({ key, text }) => (
                          <div key={key} className="flex items-center space-x-2">
                            {passwordValidation[key] ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm ${
                              passwordValidation[key] ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
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
                          className="input !pl-12 !pr-12"
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
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                      )}
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
                      onClick={() => setShowForgotPasswordModal(true)}
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
                      setName('');
                      setPhoneNumber('');
                      setPasswordValidation({
                        length: false,
                        uppercase: false,
                        lowercase: false,
                        number: false,
                        special: false
                      });
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

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeForgotPasswordModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white max-w-md w-full rounded-2xl shadow-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {forgotPasswordSent ? 'Check Your Email' : 'Reset Password'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {forgotPasswordSent ? 'Instructions sent!' : 'Enter your email to reset'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeForgotPasswordModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={forgotPasswordLoading}
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {forgotPasswordSent ? (
                /* Success State */
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Email Sent!</h4>
                  <p className="text-gray-600 mb-6">
                    We've sent password reset instructions to{' '}
                    <span className="font-medium text-gray-900">{forgotPasswordEmail}</span>
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={closeForgotPasswordModal}
                      className="w-full btn btn-primary"
                    >
                      Got it!
                    </button>
                    <button
                      onClick={() => setForgotPasswordSent(false)}
                      className="w-full btn btn-secondary"
                    >
                      Send to different email
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>
              ) : (
                /* Form State */
                <form onSubmit={handleForgotPassword}>
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                      Enter your email address and we'll send you instructions to reset your password.
                    </p>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <input
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email address"
                        disabled={forgotPasswordLoading}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={forgotPasswordLoading}
                      className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {forgotPasswordLoading ? (
                        <span className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <span>Send Reset Instructions</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="w-full btn btn-secondary"
                      disabled={forgotPasswordLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;