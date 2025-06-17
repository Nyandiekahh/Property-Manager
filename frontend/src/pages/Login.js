import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password);
        toast.success('Account created successfully!');
      } else {
        await login(email, password);
        toast.success('Welcome back!');
      }
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      
      {/* Left Side - Brand & Info */}
      <div className="hidden lg:block lg:w-1/2 bg-slate-900 p-16">
        <div className="h-full flex flex-col justify-between">
          
          {/* Logo & Brand */}
          <div>
            <div className="flex items-center mb-12">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">PropertyFlow</h1>
                <p className="text-slate-400 text-sm">Property Management System</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Professional Property<br />Management Platform
            </h2>
            
            <p className="text-xl text-slate-300 mb-12 leading-relaxed">
              Streamline your property operations, manage tenants efficiently, and maximize your rental income with our comprehensive platform.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 rounded mr-4 flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Complete Portfolio Management</h3>
                  <p className="text-slate-400">Manage multiple properties and track performance</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 rounded mr-4 flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Automated Rent Collection</h3>
                  <p className="text-slate-400">M-Pesa integration for seamless payments</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 rounded mr-4 flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Tenant Communication</h3>
                  <p className="text-slate-400">Built-in messaging and notification system</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-white">5,000+</div>
              <div className="text-slate-400 text-sm">Properties</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">KES 2B+</div>
              <div className="text-slate-400 text-sm">Rent Collected</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-slate-400 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">PropertyFlow</h1>
              <p className="text-slate-600 text-sm">Property Management</p>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-slate-600">
              {isSignUp 
                ? 'Start managing your properties today' 
                : 'Welcome back! Please sign in to continue'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-slate-700 font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-slate-300 rounded" />
                  <span className="ml-2 text-sm text-slate-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-1 text-blue-600 hover:text-blue-500 font-medium"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Secure • Encrypted • GDPR Compliant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;