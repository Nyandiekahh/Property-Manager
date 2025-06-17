import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  CreditCard, 
  BarChart3,
  CheckCircle,
  Shield,
  Smartphone,
  Globe,
  ArrowRight,
  Star,
  Quote,
  Play,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Home,
  Clock
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Building2,
      title: "Smart Property Management",
      description: "Effortlessly manage multiple properties with unit-based organization and automated assignments.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Enhanced Tenant Management",
      description: "Streamlined tenant onboarding with automatic unit assignment and detailed tenant profiles.",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: CreditCard,
      title: "M-Pesa Integration",
      description: "Seamless rent collection through M-Pesa with automated payment tracking and receipts.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time insights into your property performance, occupancy rates, and revenue trends.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Bank-grade security with 99.9% uptime guarantee. Your data is always safe and accessible.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Access your property management dashboard from anywhere with our responsive design.",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const stats = [
    { number: "5,000+", label: "Properties Managed", icon: Building2 },
    { number: "15,000+", label: "Happy Tenants", icon: Users },
    { number: "KES 2B+", label: "Rent Collected", icon: CreditCard },
    { number: "99.9%", label: "System Uptime", icon: Shield }
  ];

  const testimonials = [
    {
      name: "Sarah Wanjiku",
      role: "Property Owner, Nairobi",
      content: "PropertyFlow has completely transformed how I manage my rental properties. The automated rent collection alone saves me hours every month.",
      rating: 5,
      avatar: "SW"
    },
    {
      name: "James Kimani",
      role: "Real Estate Investor",
      content: "The analytics dashboard gives me insights I never had before. I can make better investment decisions with real data.",
      rating: 5,
      avatar: "JK"
    },
    {
      name: "Grace Muthoni",
      role: "Property Manager",
      content: "Managing 50+ units used to be overwhelming. Now it's simple and organized. My tenants love the M-Pesa integration too.",
      rating: 5,
      avatar: "GM"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "2,500",
      period: "per month",
      description: "Perfect for small property owners",
      features: [
        "Up to 10 units",
        "Basic tenant management",
        "M-Pesa integration",
        "Monthly reports",
        "Email support"
      ],
      popular: false,
      color: "from-gray-500 to-gray-600"
    },
    {
      name: "Professional",
      price: "5,000",
      period: "per month",
      description: "Ideal for growing portfolios",
      features: [
        "Up to 50 units",
        "Advanced analytics",
        "Automated reminders",
        "Custom reports",
        "Priority support",
        "Bulk operations"
      ],
      popular: true,
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large property management companies",
      features: [
        "Unlimited units",
        "White-label solution",
        "API access",
        "Dedicated support",
        "Custom integrations",
        "Advanced security"
      ],
      popular: false,
      color: "from-purple-500 to-purple-600"
    }
  ];

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.header 
        style={{ opacity: headerOpacity, scale: headerScale }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RentFlow</h1>
                <p className="text-sm text-gray-600">Property Management</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-10">
              {['Features', 'Pricing', 'About', 'Contact'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-gray-700 hover:text-blue-600 font-medium text-lg transition-colors duration-200"
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
                className="px-8 py-3 text-gray-700 font-semibold text-lg hover:text-blue-600 transition-colors"
              >
                Sign In
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Get Started Free
              </motion.button>
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-4">
              {['Features', 'Pricing', 'About', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block text-gray-700 font-medium text-lg hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 space-y-3">
                <button 
                  onClick={handleSignIn}
                  className="w-full px-6 py-3 text-gray-700 font-medium text-lg border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleGetStarted}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-lg rounded-xl"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Manage Properties
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Like a Pro
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
                The most comprehensive property management platform in Kenya. 
                Streamline operations, automate rent collection, and maximize your rental income with ease.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <button 
                onClick={handleGetStarted}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xl rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center space-x-3"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-10 py-4 border-2 border-gray-300 text-gray-700 font-semibold text-xl rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all duration-200 flex items-center space-x-3">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Hero Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              variants={staggerContainer}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    variants={fadeInUp}
                    className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-700 font-medium">{stat.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Powerful features designed to simplify property management and boost your rental business efficiency.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 flex items-center justify-center shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Property Owners Across Kenya
            </h2>
            <p className="text-xl text-gray-700">
              See what our customers have to say about RentFlow
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100"
            >
              <Quote className="w-16 h-16 text-blue-600 mb-6" />
              <p className="text-2xl text-gray-800 leading-relaxed mb-8 font-medium">
                "{testimonials[activeTestimonial].content}"
              </p>
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{testimonials[activeTestimonial].name}</h4>
                  <p className="text-gray-600 text-lg">{testimonials[activeTestimonial].role}</p>
                  <div className="flex mt-2">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial Dots */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === activeTestimonial 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-700">
              Choose the perfect plan for your property portfolio
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                  plan.popular 
                    ? 'border-blue-600 bg-white shadow-2xl' 
                    : 'border-gray-200 bg-white shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">KES {plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={plan.price === 'Custom' ? undefined : handleGetStarted}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : 'border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                  }`}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to Transform Your Property Management?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of property owners who trust RentFlow to manage their rental business
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleGetStarted}
                className="px-10 py-4 bg-white text-blue-600 font-semibold text-xl rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                Start Free Trial
              </button>
              <button className="px-10 py-4 border-2 border-white text-white font-semibold text-xl rounded-xl hover:bg-white hover:text-blue-600 transition-all">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">RentFlow</h3>
                  <p className="text-gray-400">Property Management Suite</p>
                </div>
              </div>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                The most comprehensive property management platform in Kenya. 
                Streamline your operations and maximize your rental income.
              </p>
              <div className="flex space-x-6">
                <div className="flex items-center text-gray-300">
                  <Phone className="w-5 h-5 mr-2" />
                  <span className="text-lg">+254 700 123 456</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail className="w-5 h-5 mr-2" />
                  <span className="text-lg">hello@rentflow.co.ke</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'About Us', 'Contact', 'Support', 'Blog'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Legal</h4>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Security'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-lg">
              © 2024 RentFlow. All rights reserved. Made with ❤️ in Kenya.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;