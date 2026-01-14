import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  CheckCircle,
  AlertCircle,
  Zap,
  Eye,
  Database,
  Users,
  FileText
} from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "1. Introduction",
      icon: Shield,
      content: `Beyond Gravity Solutions ("we," "us," or "our") operates GravityRent, a comprehensive property management platform. We are committed to protecting your privacy and complying with the Data Protection Act, 2019 of Kenya and other applicable data protection laws.

This Privacy Policy explains:
• What information we collect and why
• How we use and protect your information
• Your rights regarding your personal data
• How to contact us about privacy concerns

By using GravityRent, you consent to the collection and use of your information as described in this Privacy Policy.`
    },
    {
      title: "2. Information We Collect",
      icon: Database,
      content: `Personal Information You Provide:
• Account Information: Name, email address, phone number, password
• Business Information: Company name, business registration details
• Property Information: Property addresses, unit details, rental amounts
• Tenant Information: Tenant names, contact details, lease information
• Payment Information: M-Pesa transaction details, payment history
• Communication Data: Messages, support requests, feedback

Information Collected Automatically:
• Usage Data: Pages visited, features used, time spent on platform
• Device Information: IP address, browser type, operating system
• Cookies and Similar Technologies: Session data, preferences
• Log Data: Access times, error logs, system activity

Information from Third Parties:
• M-Pesa transaction confirmations from Safaricom
• Verification data from identity verification services
• Payment processing information from payment providers`
    },
    {
      title: "3. How We Use Your Information",
      icon: Eye,
      content: `We use your information for the following purposes:

Service Delivery:
• Create and manage your account
• Process property and tenant management
• Facilitate rent collection via M-Pesa
• Generate reports and analytics
• Send notifications and reminders
• Provide customer support

Business Operations:
• Improve and optimize the platform
• Develop new features and services
• Conduct research and analytics
• Prevent fraud and ensure security
• Comply with legal obligations

Communications:
• Send service-related emails and notifications
• Provide updates about your account
• Send marketing communications (with your consent)
• Respond to your inquiries and requests

Legal Compliance:
• Comply with Kenyan laws and regulations
• Respond to legal requests and court orders
• Protect our rights and property
• Enforce our Terms of Service`
    },
    {
      title: "4. Legal Basis for Processing (Data Protection Act, 2019)",
      icon: FileText,
      content: `Under Kenya's Data Protection Act, 2019, we process your personal data based on:

Consent:
• You have given explicit consent for specific purposes
• You can withdraw consent at any time through your account settings

Contract Performance:
• Processing is necessary to provide the services you requested
• Required to fulfill our obligations under our Terms of Service

Legal Obligation:
• Compliance with Kenyan tax laws and regulations
• Responding to lawful requests from authorities
• Meeting anti-money laundering requirements

Legitimate Interests:
• Improving our services and user experience
• Preventing fraud and ensuring platform security
• Conducting business analytics
• Marketing our services (subject to your rights)`
    },
    {
      title: "5. Data Sharing and Disclosure",
      icon: Users,
      content: `We do not sell your personal data. We may share your information with:

Service Providers:
• Cloud hosting providers (data storage)
• M-Pesa and payment processors (payment processing)
• Email service providers (communications)
• Analytics providers (platform improvement)
• Customer support tools

These providers are contractually obligated to protect your data and use it only for specified purposes.

Legal Requirements:
We may disclose your information when required by law:
• In response to court orders or legal processes
• To comply with government requests
• To protect our rights, property, or safety
• To prevent fraud or illegal activities
• To enforce our Terms of Service

Business Transfers:
In case of merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, subject to confidentiality obligations.

Aggregated Data:
We may share anonymized, aggregated data that cannot identify you personally for:
• Industry research and reports
• Platform analytics and improvements
• Marketing and business purposes`
    },
    {
      title: "6. Data Security Measures",
      icon: Lock,
      content: `We implement comprehensive security measures to protect your data:

Technical Safeguards:
• Bank-grade encryption (TLS/SSL) for data transmission
• Encrypted data storage using AES-256 encryption
• Secure authentication and password hashing
• Regular security audits and vulnerability assessments
• Firewall protection and intrusion detection systems
• Secure API connections with authentication tokens

Organizational Measures:
• Access controls and role-based permissions
• Employee confidentiality agreements
• Security training for all staff
• Incident response procedures
• Regular backup systems
• Data retention policies

Physical Security:
• Secure data centers with restricted access
• 24/7 monitoring and surveillance
• Environmental controls and redundancy
• Disaster recovery procedures

While we implement strong security measures, no system is 100% secure. We cannot guarantee absolute security but are committed to protecting your data using industry-standard practices.`
    },
    {
      title: "7. Your Rights Under Kenya's Data Protection Act",
      icon: CheckCircle,
      content: `As a data subject in Kenya, you have the following rights:

Right to Access:
• Request confirmation of data processing
• Obtain a copy of your personal data
• Receive information about how we use your data

Right to Rectification:
• Correct inaccurate or incomplete data
• Update your account information

Right to Erasure ("Right to be Forgotten"):
• Request deletion of your personal data
• Subject to legal retention requirements
• Does not apply to data needed for contract performance

Right to Restrict Processing:
• Limit how we use your data
• Object to processing based on legitimate interests

Right to Data Portability:
• Receive your data in a structured, machine-readable format
• Transfer your data to another service provider
• Export your data through platform tools

Right to Object:
• Object to processing for direct marketing
• Object to automated decision-making
• Withdraw consent at any time

Right to Lodge a Complaint:
• File a complaint with the Office of the Data Protection Commissioner (ODPC)
• Contact: commissioner@odpc.go.ke

To exercise these rights, contact us at marketing@bgsolutions.co.ke with your request.`
    },
    {
      title: "8. Data Retention",
      icon: Database,
      content: `We retain your personal data for different periods depending on the purpose:

Active Accounts:
• Account data: Retained while your account is active
• Property data: Retained while you manage the property
• Transaction records: Retained as required by law (minimum 7 years)

Closed Accounts:
• Account data: Deleted 30 days after account closure
• Backup copies: Deleted within 90 days
• Legal records: Retained as required by law

Tax and Legal Requirements:
• Financial records: 7 years (Kenya Revenue Authority requirement)
• Transaction logs: 6 years (anti-money laundering regulations)
• Legal documents: Duration of legal obligation

You can request earlier deletion, subject to legal requirements. After retention periods expire, we securely delete or anonymize your data.`
    },
    {
      title: "9. Cookies and Tracking Technologies",
      icon: Eye,
      content: `We use cookies and similar technologies to enhance your experience:

Essential Cookies:
• Required for platform functionality
• Session management and authentication
• Security features
• Cannot be disabled without affecting service

Analytics Cookies:
• Track usage patterns and performance
• Help us improve the platform
• Aggregated and anonymized data
• Can be disabled in browser settings

Preference Cookies:
• Remember your settings and preferences
• Language and display options
• Improve user experience

You can control cookies through:
• Browser settings and preferences
• Our cookie consent banner
• Opt-out tools for specific services

Disabling cookies may limit platform functionality.`
    },
    {
      title: "10. International Data Transfers",
      icon: Shield,
      content: `Your data is primarily stored and processed in Kenya. However, some service providers may process data outside Kenya, including:
• Cloud hosting services
• Email service providers
• Analytics platforms

When transferring data internationally, we ensure:
• Adequate data protection safeguards
• Compliance with Kenya's Data Protection Act
• Contractual obligations for data protection
• Standard contractual clauses where applicable

We only work with providers that meet international data protection standards and implement appropriate security measures.`
    },
    {
      title: "11. Children's Privacy",
      icon: Shield,
      content: `GravityRent is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.

If you are a parent or guardian and believe your child has provided us with personal information:
• Contact us immediately at marketing@bgsolutions.co.ke
• We will promptly delete the information from our systems
• We will take steps to prevent future collection

If we become aware of collecting data from a child without parental consent, we will delete that information as quickly as possible.`
    },
    {
      title: "12. Third-Party Services",
      icon: Users,
      content: `GravityRent integrates with third-party services:

M-Pesa (Safaricom):
• Subject to Safaricom's privacy policy
• Transaction data shared for payment processing
• We do not control M-Pesa's data practices

Payment Processors:
• Handle payment information securely
• Comply with PCI-DSS standards
• Subject to their own privacy policies

External Links:
• Our platform may contain links to external websites
• We are not responsible for their privacy practices
• Review their privacy policies before providing data

We recommend reviewing the privacy policies of any third-party services you use in connection with GravityRent.`
    },
    {
      title: "13. Marketing Communications",
      icon: Eye,
      content: `With your consent, we may send you:
• Product updates and new features
• Tips for using GravityRent
• Property management insights
• Special offers and promotions
• Company news and updates

Your Choices:
• Opt-in during registration or account setup
• Manage preferences in your account settings
• Unsubscribe via link in any marketing email
• Contact us to update communication preferences

We will continue sending:
• Essential service notifications
• Account and security alerts
• Transaction confirmations
• Legal and compliance notices

These cannot be opted out of as they are necessary for service delivery.`
    },
    {
      title: "14. Data Breach Notification",
      icon: AlertCircle,
      content: `In the event of a data breach that may affect your rights and freedoms:

Our Response:
• Immediate investigation and containment
• Assessment of impact and affected individuals
• Notification to affected users without undue delay
• Notification to the Office of the Data Protection Commissioner
• Implementation of remedial measures

What We'll Tell You:
• Nature of the breach and data affected
• Potential consequences and risks
• Measures taken to address the breach
• Recommended steps to protect yourself
• Contact information for questions

Your Actions:
• Change your password immediately
• Monitor your account for suspicious activity
• Review your financial statements
• Report any concerns to us

We maintain an incident response plan and conduct regular security training to prevent breaches.`
    },
    {
      title: "15. Automated Decision-Making",
      icon: Eye,
      content: `GravityRent uses limited automated processing for:
• Fraud detection and prevention
• Payment validation
• System performance optimization
• User experience personalization

These automated processes do not make decisions that significantly affect your rights without human oversight.

You have the right to:
• Request human review of automated decisions
• Express your point of view
• Contest automated decisions
• Request an explanation of the logic involved

Contact us if you have concerns about automated processing of your data.`
    },
    {
      title: "16. Changes to This Privacy Policy",
      icon: FileText,
      content: `We may update this Privacy Policy to reflect:
• Changes in our practices
• Legal or regulatory requirements
• New features or services
• User feedback

When We Update:
• Material changes: 30 days advance notice via email
• Non-material changes: Posted on our website
• Effective date clearly stated
• Previous versions available upon request

Your Choices:
• Review changes before they take effect
• Contact us with questions or concerns
• Continue using the service constitutes acceptance
• Close your account if you disagree with changes

We encourage you to review this Privacy Policy periodically to stay informed about how we protect your data.`
    },
    {
      title: "17. Contact Information",
      icon: Shield,
      content: `For privacy-related questions, concerns, or to exercise your rights:

Beyond Gravity Solutions
Data Protection Officer
Email: marketing@bgsolutions.co.ke
Phone: +254 719 408 098
WhatsApp: +254 719 408 098
Address: Juja, Kiambu County, Kenya
Website: https://www.bgsolutions.co.ke/

Office of the Data Protection Commissioner (ODPC):
If you believe we have not adequately addressed your concerns, you may contact:
Email: commissioner@odpc.go.ke
Website: www.odpc.go.ke
Phone: +254 20 2631 342

We are committed to resolving privacy concerns promptly and will respond to your inquiries within 30 days as required by law.`
    },
    {
      title: "18. Compliance and Regulatory Information",
      icon: CheckCircle,
      content: `GravityRent complies with:

Kenyan Legislation:
• Data Protection Act, 2019
• Computer Misuse and Cybercrimes Act, 2018
• Kenya Information and Communications Act
• Income Tax Act (for financial record retention)
• Anti-Money Laundering regulations

Industry Standards:
• ISO 27001 Information Security Management
• PCI-DSS for payment processing
• GDPR principles (where applicable)
• International best practices

Regular Audits:
• Annual data protection compliance reviews
• Security vulnerability assessments
• Third-party audits and certifications
• Staff training and awareness programs

We maintain documentation of our compliance activities and make them available to regulatory authorities upon request.`
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
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
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
          className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">
                Your Privacy Matters
              </h3>
              <p className="text-green-800 text-sm leading-relaxed">
                We are committed to protecting your privacy and complying with Kenya's Data Protection Act, 2019. 
                This policy explains how we collect, use, and protect your personal information. 
                We never sell your data to third parties.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Privacy Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-8 sm:p-12">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="mb-8 last:mb-0"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Icon className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                    {section.title}
                  </h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line pl-7">
                    {section.content}
                  </div>
                </motion.div>
              );
            })}
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
              to="/terms-of-service"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Terms of Service
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

export default PrivacyPolicy;