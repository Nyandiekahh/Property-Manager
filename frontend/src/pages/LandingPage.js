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
  ArrowRight,
  Star,
  Play,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Home,
  Clock,
  Zap,
  Award,
  Target,
  Layers,
  Globe
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);

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
      description: "Manage multiple properties with intelligent unit-based organization and automated tenant assignments.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Tenant Management",
      description: "Streamlined tenant onboarding with automatic unit assignment and comprehensive tenant profiles.",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: CreditCard,
      title: "M-Pesa Integration",
      description: "Seamless rent collection through M-Pesa with automated payment tracking and instant receipts.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Comprehensive insights into property performance, occupancy rates, and revenue trends.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with 99.9% uptime guarantee. Your data is always protected and accessible.",
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Access your property management dashboard from anywhere with our fully responsive design.",
      gradient: "from-pink-500 to-rose-500"
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
      content: "GravityRent has completely transformed how I manage my rental properties. The automated rent collection through M-Pesa alone saves me hours every month. The system is intuitive and professional.",
      rating: 5,
      avatar: "SW",
      company: "Wanjiku Estates"
    },
    {
      name: "James Kimani",
      role: "Real Estate Investor",
      content: "The analytics dashboard gives me insights I never had before. I can make better investment decisions with real data. Beyond Gravity Solutions has built something truly exceptional.",
      rating: 5,
      avatar: "JK",
      company: "Kimani Properties Ltd"
    },
    {
      name: "Grace Muthoni",
      role: "Property Manager",
      content: "Managing 50+ units used to be overwhelming. Now it's simple and organized. My tenants love the M-Pesa integration too. This is the best investment I've made for my business.",
      rating: 5,
      avatar: "GM",
      company: "Muthoni Real Estate"
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
      popular: false
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
      popular: true
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
      popular: false
    }
  ];

  const whyChooseUs = [
    {
      icon: Award,
      title: "Proven Excellence",
      description: "Built by Beyond Gravity Solutions, a trusted name in innovative software solutions across Kenya."
    },
    {
      icon: Target,
      title: "Purpose-Built",
      description: "Specifically designed for the Kenyan property management market with M-Pesa integration at its core."
    },
    {
      icon: Layers,
      title: "All-In-One Solution",
      description: "Everything you need in one platform - no need for multiple tools or complicated integrations."
    },
    {
      icon: Globe,
      title: "Local Support",
      description: "Kenyan-based support team that understands your business and responds in your timezone."
    }
  ];

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              {/* BGS Logo */}
              <img 
                src="/bgs-logo.png" 
                alt="Beyond Gravity Solutions" 
                className="h-12 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg" style={{ display: 'none' }}>
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div className="border-l border-gray-300 pl-4 h-10 flex flex-col justify-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">GravityRent</h1>
                <p className="text-xs text-gray-600">Property Management Suite</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {['Features', 'Pricing', 'Testimonials', 'Contact'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
                className="px-6 py-2.5 text-gray-700 font-medium hover:text-blue-600 transition-colors"
              >
                Sign In
              </motion.button>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-6 space-y-4">
              {['Features', 'Pricing', 'Testimonials', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block text-gray-700 font-medium hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 space-y-3 border-t border-gray-100">
                <button 
                  onClick={handleSignIn}
                  className="w-full px-6 py-3 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleGetStarted}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg shadow-lg"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600 font-medium text-sm">Powered by Beyond Gravity Solutions</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Property Management
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Kenya's most comprehensive property management platform. 
                Streamline operations, automate M-Pesa rent collection, and maximize your rental income.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <button 
                onClick={handleGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-200 flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose GravityRent?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built by Kenyans, for Kenyans. A solution that understands your business.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to simplify property management and boost efficiency.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl mb-6 flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Trusted by Property Owners Across Kenya
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about GravityRent
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-lg"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-2xl text-gray-800 leading-relaxed mb-8 font-medium">
                "{testimonials[activeTestimonial].content}"
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{testimonials[activeTestimonial].name}</h4>
                  <p className="text-gray-600">{testimonials[activeTestimonial].role}</p>
                  <p className="text-sm text-gray-500">{testimonials[activeTestimonial].company}</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeTestimonial 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect plan for your property portfolio
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`relative p-8 rounded-2xl transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-2xl scale-105' 
                    : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`mb-6 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      KES {plan.price}
                    </span>
                    <span className={`ml-2 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                      /{plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-green-500'}`} />
                      <span className={plan.popular ? 'text-white' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={plan.price === 'Custom' ? undefined : handleGetStarted}
                  className={`w-full py-4 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-white text-blue-600 shadow-lg hover:shadow-xl hover:scale-105'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-12 text-white shadow-2xl"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to Transform Your Property Management?
            </h2>
            <p className="text-xl mb-8 text-blue-50">
              Join thousands of property owners who trust GravityRent to manage their rental business
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleGetStarted}
                className="px-10 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Start Free Trial
              </button>
              <button className="px-10 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                <p className="text-gray-600 mb-8">
                  Reach out to us through any of these channels. We're here to help you succeed.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {/* Phone */}
                <a 
                  href="tel:+254719408098"
                  className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                    <p className="text-gray-600">+254 719 408 098</p>
                    <p className="text-sm text-gray-500">Mon-Fri from 8am to 5pm</p>
                  </div>
                </a>

                {/* WhatsApp */}
                <a 
                  href="https://wa.me/254719408098"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">WhatsApp</h4>
                    <p className="text-gray-600">+254 719 408 098</p>
                    <p className="text-sm text-gray-500">Chat with us instantly</p>
                  </div>
                </a>

                {/* Email */}
                <a 
                  href="mailto:marketing@bgsolutions.co.ke"
                  className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">marketing@bgsolutions.co.ke</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Office Location</h4>
                    <p className="text-gray-600">Juja, Kiambu County</p>
                    <p className="text-sm text-gray-500">Kenya</p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center space-x-3 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Quick Response Time</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  We typically respond to inquiries within 2-4 hours during business hours. 
                  For urgent matters, please call or WhatsApp us directly.
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Last Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+254 712 345 678"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Subject *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="How can we help you?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Message *</label>
                  <textarea
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Tell us about your property management needs..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Send Message</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-sm text-gray-500 text-center">
                  By submitting this form, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <img 
                  src="/bgs-logo.png" 
                  alt="Beyond Gravity Solutions" 
                  className="h-12 w-auto brightness-0 invert"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center" style={{ display: 'none' }}>
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">GravityRent</h3>
                  <p className="text-gray-400 text-sm">by Beyond Gravity Solutions</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Kenya's most comprehensive property management platform. 
                Built to streamline your operations and maximize your rental income.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Phone className="w-5 h-5 mr-3" />
                  <a href="tel:+254719408098" className="hover:text-white transition-colors">
                    +254 719 408 098
                  </a>
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <a href="https://wa.me/254719408098" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    WhatsApp: +254 719 408 098
                  </a>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail className="w-5 h-5 mr-3" />
                  <a href="mailto:marketing@bgsolutions.co.ke" className="hover:text-white transition-colors">
                    marketing@bgsolutions.co.ke
                  </a>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span>Juja, Kiambu County, Kenya</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Testimonials', 'About Us', 'Support', 'Blog'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Legal</h4>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Security'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-center md:text-left">
                © 2024 GravityRent. All rights reserved. Built with ❤️ by{' '}
                <a 
                  href="https://www.bgsolutions.co.ke/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Beyond Gravity Solutions
                </a>
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">Made in Kenya 🇰🇪</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;