import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';

const TermsOfService = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using GravityRent ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Service.

GravityRent is provided by Beyond Gravity Solutions, a company registered in Kenya. These terms constitute a legally binding agreement between you and Beyond Gravity Solutions.`
    },
    {
      title: "2. Description of Service",
      content: `GravityRent is a comprehensive property management platform that provides:
• Property and unit management tools
• Tenant management and onboarding
• Rent collection and payment tracking via M-Pesa integration
• Financial reporting and analytics
• Automated notifications and reminders
• Document management and storage

The Service is provided on a subscription basis with various pricing tiers as detailed on our website.`
    },
    {
      title: "3. Account Registration and Security",
      content: `To use GravityRent, you must:
• Provide accurate, current, and complete information during registration
• Maintain and promptly update your account information
• Keep your password secure and confidential
• Notify us immediately of any unauthorized use of your account

You are responsible for all activities that occur under your account. Beyond Gravity Solutions cannot and will not be liable for any loss or damage arising from your failure to maintain account security.`
    },
    {
      title: "4. User Responsibilities and Conduct",
      content: `When using GravityRent, you agree to:
• Use the Service only for lawful purposes
• Not violate any applicable laws or regulations in Kenya
• Not attempt to gain unauthorized access to any part of the Service
• Not transmit any viruses, malware, or harmful code
• Not interfere with or disrupt the Service or servers
• Not use the Service to collect or store personal data of others without consent
• Maintain accurate records of all transactions and interactions

You represent and warrant that you have the legal right to manage the properties and tenant information you enter into the system.`
    },
    {
      title: "5. Payment Terms and M-Pesa Integration",
      content: `Subscription Fees:
• Fees are charged based on your selected subscription plan
• All fees are in Kenyan Shillings (KES)
• Payments are processed monthly or annually as per your plan
• Fees are non-refundable except as required by law

M-Pesa Integration:
• GravityRent integrates with M-Pesa for rent collection
• M-Pesa transaction fees may apply as per Safaricom's terms
• You authorize us to facilitate M-Pesa transactions on your behalf
• We are not responsible for M-Pesa service outages or errors
• All M-Pesa transactions are subject to Safaricom's terms and conditions

Late Payments:
• Failure to pay subscription fees may result in service suspension
• We reserve the right to charge late payment fees
• Suspended accounts will retain data for 30 days before deletion`
    },
    {
      title: "6. Data Ownership and Usage",
      content: `Your Data:
• You retain all ownership rights to the data you input into GravityRent
• We do not claim ownership of your property or tenant information
• You grant us a limited license to use your data solely to provide the Service
• You can export your data at any time through the platform

Our Rights:
• We may use aggregated, anonymized data for analytics and service improvement
• We will never sell your personal or business data to third parties
• Usage data and analytics help us improve the platform for all users`
    },
    {
      title: "7. Privacy and Data Protection",
      content: `GravityRent is committed to protecting your privacy and complying with Kenya's Data Protection Act, 2019:
• We collect only necessary information to provide the Service
• Personal data is stored securely on servers with bank-grade encryption
• We implement appropriate technical and organizational measures
• Data is processed in accordance with our Privacy Policy
• You have rights to access, correct, and delete your personal data

For complete details, please refer to our Privacy Policy.`
    },
    {
      title: "8. Intellectual Property Rights",
      content: `The Service and its original content, features, and functionality are owned by Beyond Gravity Solutions and are protected by:
• International copyright laws
• Trademark laws
• Other intellectual property rights

The GravityRent name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Beyond Gravity Solutions. You may not use these without our prior written permission.

You may not:
• Copy, modify, or create derivative works of the Service
• Reverse engineer or attempt to extract the source code
• Remove any copyright or proprietary notices`
    },
    {
      title: "9. Service Availability and Support",
      content: `Service Level:
• We strive to maintain 99.9% uptime
• Scheduled maintenance will be announced in advance
• We are not liable for service interruptions beyond our control

Support:
• Email support is available at marketing@bgsolutions.co.ke
• Response times vary by subscription tier
• Enterprise customers receive priority support
• Support is available Monday-Friday, 8am-5pm EAT

We reserve the right to modify, suspend, or discontinue any part of the Service with or without notice.`
    },
    {
      title: "10. Limitation of Liability",
      content: `To the maximum extent permitted by Kenyan law:

Beyond Gravity Solutions shall not be liable for:
• Any indirect, incidental, special, consequential, or punitive damages
• Loss of profits, data, use, or other intangible losses
• Damages resulting from unauthorized access to your account
• Service interruptions or data loss
• Third-party services including M-Pesa

Our total liability shall not exceed the amount you paid us in the 12 months prior to the claim.

SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OF LIABILITY, SO THESE LIMITATIONS MAY NOT APPLY TO YOU.`
    },
    {
      title: "11. Indemnification",
      content: `You agree to indemnify, defend, and hold harmless Beyond Gravity Solutions, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or in any way connected with:
• Your access to or use of the Service
• Your violation of these Terms
• Your violation of any third-party rights
• Your violation of any applicable laws or regulations
• Any data or content you submit to the Service`
    },
    {
      title: "12. Termination",
      content: `Account Termination by You:
• You may cancel your subscription at any time through your account settings
• Cancellation takes effect at the end of your current billing period
• No refunds are provided for partial months or years

Termination by Us:
We may terminate or suspend your account immediately if you:
• Violate these Terms of Service
• Fail to pay subscription fees
• Engage in fraudulent or illegal activities
• Abuse the Service or other users

Upon termination:
• Your right to use the Service ceases immediately
• You will have 30 days to export your data
• After 30 days, your data will be permanently deleted
• Outstanding fees remain payable`
    },
    {
      title: "13. Modifications to Terms",
      content: `Beyond Gravity Solutions reserves the right to modify these Terms at any time. We will:
• Notify you of material changes via email or in-app notification
• Provide at least 30 days notice before changes take effect
• Post the updated Terms on our website with the effective date

Your continued use of the Service after changes take effect constitutes acceptance of the modified Terms. If you do not agree to the changes, you must stop using the Service and cancel your account.`
    },
    {
      title: "14. Dispute Resolution and Governing Law",
      content: `Governing Law:
These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya, without regard to conflict of law provisions.

Dispute Resolution:
• Any disputes shall first be attempted to be resolved through good faith negotiations
• If negotiations fail, disputes shall be resolved through arbitration in Nairobi, Kenya
• Arbitration shall be conducted in accordance with the Arbitration Act of Kenya
• Each party shall bear its own costs unless otherwise determined by the arbitrator
• The decision of the arbitrator shall be final and binding

Jurisdiction:
You agree to submit to the exclusive jurisdiction of the courts in Nairobi, Kenya for any legal proceedings.`
    },
    {
      title: "15. Compliance with Kenyan Laws",
      content: `You agree to comply with all applicable Kenyan laws including but not limited to:
• The Data Protection Act, 2019
• The Computer Misuse and Cybercrimes Act, 2018
• The Kenya Information and Communications Act
• Tax laws and reporting requirements
• Landlord and tenant regulations
• Anti-money laundering regulations

You are responsible for ensuring your use of the Service complies with all applicable laws in your jurisdiction.`
    },
    {
      title: "16. Third-Party Services",
      content: `GravityRent integrates with third-party services including:
• M-Pesa (Safaricom)
• Payment gateways
• Email service providers
• Cloud storage services

Your use of these third-party services is subject to their respective terms and conditions. We are not responsible for:
• The availability of third-party services
• Changes to third-party terms or pricing
• Data security practices of third parties
• Service interruptions or failures of third parties`
    },
    {
      title: "17. Warranties and Disclaimers",
      content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
• Warranties of merchantability
• Fitness for a particular purpose
• Non-infringement
• Accuracy, reliability, or availability

We do not warrant that:
• The Service will be uninterrupted or error-free
• Defects will be corrected
• The Service is free from viruses or harmful components
• Results obtained from the Service will be accurate or reliable

You use the Service at your own risk. We recommend maintaining backup copies of your important data.`
    },
    {
      title: "18. Force Majeure",
      content: `Beyond Gravity Solutions shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to:
• Acts of God (natural disasters, pandemics)
• War, terrorism, or civil unrest
• Government actions or regulations
• Internet service provider failures
• Power outages
• Labor disputes
• Telecommunications failures

During force majeure events, our obligations under these Terms will be suspended for the duration of the event.`
    },
    {
      title: "19. Severability",
      content: `If any provision of these Terms is found to be unenforceable or invalid under Kenyan law, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.

The failure of Beyond Gravity Solutions to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision.`
    },
    {
      title: "20. Contact Information",
      content: `For questions about these Terms of Service, please contact us:

Beyond Gravity Solutions
Email: marketing@bgsolutions.co.ke
Phone: +254 719 408 098
WhatsApp: +254 719 408 098
Address: Juja, Kiambu County, Kenya
Website: https://www.bgsolutions.co.ke/

Last Updated: January 12, 2026
Effective Date: January 12, 2026`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/bgs-logo.png" 
                alt="Beyond Gravity Solutions" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  GravityRent
                </h1>
              </div>
            </Link>
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            GravityRent by Beyond Gravity Solutions
          </p>
          <p className="text-sm text-gray-500">
            Last Updated: January 12, 2026 • Effective Date: January 12, 2026
          </p>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Important Information
              </h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                Please read these Terms of Service carefully before using GravityRent. 
                By creating an account or using our services, you agree to be bound by these terms. 
                If you do not agree to these terms, please do not use our platform.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Terms Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-8 sm:p-12">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="mb-8 last:mb-0"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                  {section.title}
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line pl-7">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/privacy-policy"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </Link>
            <span className="hidden sm:block text-gray-300">|</span>
            <a
              href="mailto:marketing@bgsolutions.co.ke"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Us
            </a>
            <span className="hidden sm:block text-gray-300">|</span>
            <a
              href="https://www.bgsolutions.co.ke"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Beyond Gravity Solutions
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            © 2024 Beyond Gravity Solutions. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;