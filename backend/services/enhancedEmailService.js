// backend/services/enhancedEmailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EnhancedEmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }

  // Base email sending function
  async sendEmail({ to, subject, html, attachments = [] }) {
    try {
      const mailOptions = {
        from: `"RentFlow Property Management" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  // 1. Welcome email for new landlord accounts
  async sendLandlordWelcomeEmail(landlordData) {
    const { name, email } = landlordData;
    
    const subject = 'Welcome to RentFlow - Start Managing Your Properties Today!';
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to RentFlow</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px 20px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; }
            .feature { margin: 15px 0; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #3b82f6; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏢 Welcome to RentFlow!</h1>
                <p>Your Property Management Journey Starts Here</p>
            </div>
            
            <div class="content">
                <h2>Hello ${name}!</h2>
                
                <p>Thank you for joining RentFlow, Kenya's most comprehensive property management platform. We're excited to help you streamline your rental business and maximize your income.</p>
                
                <div class="feature">
                    <h3>🚀 Quick Start Guide:</h3>
                    <ol>
                        <li><strong>Add Your Properties</strong> - Set up properties with unit types and M-Pesa integration</li>
                        <li><strong>Create Tenant Profiles</strong> - Auto-assign tenants to available units</li>
                        <li><strong>Configure M-Pesa</strong> - Enable automatic rent collection</li>
                        <li><strong>Monitor Analytics</strong> - Track occupancy and revenue in real-time</li>
                    </ol>
                </div>

                <div class="feature">
                    <h3>✨ Key Features Available:</h3>
                    <ul>
                        <li>Smart unit-based property management</li>
                        <li>Automated M-Pesa rent collection</li>
                        <li>Real-time payment tracking</li>
                        <li>Comprehensive analytics dashboard</li>
                        <li>Automated tenant communication</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Access Your Dashboard</a>
                </div>

                <p><strong>Need Help?</strong></p>
                <p>Our team is here to support you:</p>
                <ul>
                    <li>📧 Email: support@rentflow.co.ke</li>
                    <li>📱 WhatsApp: +254 700 123 456</li>
                    <li>🌐 Help Center: ${process.env.FRONTEND_URL}/help</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>© 2024 RentFlow. Making property management simple and efficient.</p>
                <p>This email was sent to ${email}. If you didn't create this account, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>`;

    return await this.sendEmail({ to: email, subject, html });
  }

  // 2. Welcome email for new tenants (sent to tenant when landlord adds them)
  async sendTenantWelcomeEmail(tenantData, propertyData, landlordData) {
    const { name, email, unitNumber, unitType, rentAmount, accountNumber } = tenantData;
    const { name: propertyName, location } = propertyData;
    const { name: landlordName, phone: landlordPhone } = landlordData;
    
    const subject = `Welcome to ${propertyName} - Your New Home Details`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Your New Home</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f0fdf4; padding: 30px 20px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .payment-box { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3b82f6; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; }
            .highlight { background: #fef3c7; padding: 8px 12px; border-radius: 6px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏠 Welcome to Your New Home!</h1>
                <p>Everything you need to know about your new residence</p>
            </div>
            
            <div class="content">
                <h2>Hello ${name}!</h2>
                
                <p>Welcome to <strong>${propertyName}</strong> located in ${location}. We're pleased to have you as our new tenant!</p>
                
                <div class="info-box">
                    <h3>🏡 Your Unit Details:</h3>
                    <ul>
                        <li><strong>Property:</strong> ${propertyName}</li>
                        <li><strong>Unit Number:</strong> ${unitNumber}</li>
                        <li><strong>Unit Type:</strong> ${unitType.charAt(0).toUpperCase() + unitType.slice(1)}</li>
                        <li><strong>Monthly Rent:</strong> KES ${rentAmount.toLocaleString()}</li>
                        <li><strong>Location:</strong> ${location}</li>
                    </ul>
                </div>

                <div class="payment-box">
                    <h3>💳 M-Pesa Payment Information:</h3>
                    <p>Pay your rent easily using M-Pesa:</p>
                    <div class="highlight">
                        <p><strong>Account Number:</strong> ${accountNumber}</p>
                    </div>
                    <p><strong>Payment Instructions:</strong></p>
                    <ol>
                        <li>Go to M-Pesa on your phone</li>
                        <li>Select "Pay Bill"</li>
                        <li>Enter the Paybill number provided by your landlord</li>
                        <li>Enter Account Number: <strong>${accountNumber}</strong></li>
                        <li>Enter Amount: <strong>KES ${rentAmount.toLocaleString()}</strong></li>
                        <li>Enter your M-Pesa PIN and confirm</li>
                    </ol>
                </div>

                <div class="info-box">
                    <h3>📞 Contact Information:</h3>
                    <p><strong>Landlord:</strong> ${landlordName}</p>
                    <p><strong>Phone:</strong> ${landlordPhone}</p>
                    <p>For any questions or issues, please contact your landlord directly.</p>
                </div>

                <div class="info-box">
                    <h3>📅 Important Reminders:</h3>
                    <ul>
                        <li>Rent is due monthly</li>
                        <li>Always use your account number: <strong>${accountNumber}</strong></li>
                        <li>Keep your M-Pesa transaction receipts as proof of payment</li>
                        <li>Report any maintenance issues promptly</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated message from the property management system.</p>
                <p>Please save this email for your records.</p>
            </div>
        </div>
    </body>
    </html>`;

    return await this.sendEmail({ to: email, subject, html });
  }

  // 3. Monthly rent reminder (28th of each month)
  async sendMonthlyRentReminder(tenantData, propertyData, isFirstReminder = true) {
    const { name, email, unitNumber, rentAmount, accountNumber, accountBalance = 0 } = tenantData;
    const { name: propertyName, paybill } = propertyData;
    
    const amountDue = Math.max(0, rentAmount - Math.max(0, accountBalance));
    const hasCredit = accountBalance > 0;
    
    const subject = isFirstReminder 
      ? `Rent Reminder: ${propertyName} Unit ${unitNumber} - Due Soon`
      : `Final Reminder: Rent Payment Due - ${propertyName} Unit ${unitNumber}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rent Payment Reminder</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fffbeb; padding: 30px 20px; }
            .payment-box { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3b82f6; }
            .amount-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; }
            .urgent { color: #dc2626; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⏰ Rent Payment Reminder</h1>
                <p>${isFirstReminder ? 'Your rent is due soon' : 'Final reminder - Action required'}</p>
            </div>
            
            <div class="content">
                <h2>Hello ${name}!</h2>
                
                <p>This is a ${isFirstReminder ? 'friendly' : '<span class="urgent">final</span>'} reminder that your rent payment is due.</p>
                
                <div class="amount-box">
                    <h3>💰 Payment Details:</h3>
                    <p><strong>Property:</strong> ${propertyName}</p>
                    <p><strong>Unit:</strong> ${unitNumber}</p>
                    <p><strong>Monthly Rent:</strong> KES ${rentAmount.toLocaleString()}</p>
                    ${hasCredit ? `<p><strong>Account Credit:</strong> KES ${accountBalance.toLocaleString()}</p>` : ''}
                    <p><strong>Amount Due:</strong> <span style="font-size: 24px; color: #dc2626;">KES ${amountDue.toLocaleString()}</span></p>
                </div>

                <div class="payment-box">
                    <h3>📱 Pay via M-Pesa:</h3>
                    <ol>
                        <li>Go to M-Pesa menu on your phone</li>
                        <li>Select "Pay Bill"</li>
                        <li>Enter Paybill Number: <strong>${paybill}</strong></li>
                        <li>Enter Account Number: <strong>${accountNumber}</strong></li>
                        <li>Enter Amount: <strong>KES ${amountDue.toLocaleString()}</strong></li>
                        <li>Enter your M-Pesa PIN to complete</li>
                    </ol>
                </div>

                ${!isFirstReminder ? `
                <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
                    <h3 style="color: #dc2626;">⚠️ Urgent Action Required</h3>
                    <p>This is your final reminder. Please make your payment immediately to avoid any inconvenience.</p>
                </div>
                ` : ''}

                <p><strong>Important:</strong> Always use your account number <strong>${accountNumber}</strong> when making payments to ensure proper crediting.</p>
                
                <p>If you have already made the payment, please disregard this message. Payments may take a few minutes to reflect in our system.</p>
            </div>
            
            <div class="footer">
                <p>This is an automated reminder from the property management system.</p>
                <p>For payment issues, please contact your landlord.</p>
            </div>
        </div>
    </body>
    </html>`;

    return await this.sendEmail({ to: email, subject, html });
  }

  // 4. Payment confirmation email
  async sendPaymentConfirmationEmail(tenantData, propertyData, paymentData) {
    const { name, email, unitNumber } = tenantData;
    const { name: propertyName } = propertyData;
    const { 
      amount, 
      mpesaReceiptNumber, 
      paymentType = 'exact',
      overpaymentAmount = 0,
      shortfallAmount = 0,
      createdAt 
    } = paymentData;

    const subject = `Payment Confirmed - ${propertyName} Unit ${unitNumber}`;
    const paymentDate = new Date(createdAt).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f0fdf4; padding: 30px 20px; }
            .success-box { background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981; text-align: center; }
            .receipt-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #d1d5db; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; }
            .amount { font-size: 28px; font-weight: bold; color: #10b981; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Payment Received!</h1>
                <p>Thank you for your payment</p>
            </div>
            
            <div class="content">
                <h2>Hello ${name}!</h2>
                
                <div class="success-box">
                    <h3>🎉 Payment Successful</h3>
                    <p class="amount">KES ${amount.toLocaleString()}</p>
                    <p>Your payment has been received and processed successfully.</p>
                </div>

                <div class="receipt-box">
                    <h3>📄 Payment Receipt</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 10px 0; font-weight: bold;">Property:</td>
                            <td style="padding: 10px 0;">${propertyName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 10px 0; font-weight: bold;">Unit:</td>
                            <td style="padding: 10px 0;">${unitNumber}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 10px 0; font-weight: bold;">Amount Paid:</td>
                            <td style="padding: 10px 0;">KES ${amount.toLocaleString()}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 10px 0; font-weight: bold;">Date & Time:</td>
                            <td style="padding: 10px 0;">${paymentDate}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 10px 0; font-weight: bold;">M-Pesa Receipt:</td>
                            <td style="padding: 10px 0;">${mpesaReceiptNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; font-weight: bold;">Status:</td>
                            <td style="padding: 10px 0; color: #10b981; font-weight: bold;">CONFIRMED</td>
                        </tr>
                    </table>
                </div>

                ${paymentType === 'overpayment' ? `
                <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <h3>💰 Overpayment Credit</h3>
                    <p>You paid KES ${overpaymentAmount.toLocaleString()} more than required. This amount has been credited to your account and will be applied to next month's rent.</p>
                </div>
                ` : paymentType === 'underpayment' ? `
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <h3>⚠️ Partial Payment</h3>
                    <p>Thank you for your payment. You still have an outstanding balance of KES ${shortfallAmount.toLocaleString()}. Please make the remaining payment when convenient.</p>
                </div>
                ` : `
                <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                    <h3>✅ Full Payment Received</h3>
                    <p>Perfect! You have paid the exact amount due. Your rent is fully paid for this month.</p>
                </div>
                `}

                <p><strong>Keep this email</strong> as your payment receipt for your records.</p>
                
                <p>Thank you for being a valued tenant!</p>
            </div>
            
            <div class="footer">
                <p>This is an automated confirmation from the property management system.</p>
                <p>If you have any questions about this payment, please contact your landlord.</p>
            </div>
        </div>
    </body>
    </html>`;

    return await this.sendEmail({ to: email, subject, html });
  }

  // 5. Overdue payment notice (5th of month if not paid)
  async sendOverduePaymentNotice(tenantData, propertyData, daysOverdue) {
    const { name, email, unitNumber, rentAmount, accountNumber, accountBalance = 0 } = tenantData;
    const { name: propertyName, paybill } = propertyData;
    
    const amountDue = Math.max(0, rentAmount - Math.max(0, accountBalance));
    
    const subject = `URGENT: Overdue Rent Payment - ${propertyName} Unit ${unitNumber}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Overdue Payment Notice</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fef2f2; padding: 30px 20px; }
            .urgent-box { background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #dc2626; }
            .payment-box { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3b82f6; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; }
            .urgent-text { color: #dc2626; font-weight: bold; font-size: 18px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 OVERDUE PAYMENT NOTICE</h1>
                <p>Immediate action required</p>
            </div>
            
            <div class="content">
                <h2>Hello ${name},</h2>
                
                <div class="urgent-box">
                    <h3>⚠️ Payment ${daysOverdue} Days Overdue</h3>
                    <p class="urgent-text">Your rent payment for ${propertyName}, Unit ${unitNumber} is now ${daysOverdue} days overdue.</p>
                    <p><strong>Amount Due:</strong> <span style="font-size: 24px; color: #dc2626;">KES ${amountDue.toLocaleString()}</span></p>
                </div>

                <p>We have not received your rent payment for this month. To avoid any further complications, please make your payment immediately.</p>

                <div class="payment-box">
                    <h3>📱 Pay Now via M-Pesa:</h3>
                    <ol>
                        <li>Go to M-Pesa menu</li>
                        <li>Select "Pay Bill"</li>
                        <li>Paybill Number: <strong>${paybill}</strong></li>
                        <li>Account Number: <strong>${accountNumber}</strong></li>
                        <li>Amount: <strong>KES ${amountDue.toLocaleString()}</strong></li>
                        <li>Complete with your M-Pesa PIN</li>
                    </ol>
                </div>

                <div style="background: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                    <h3>📞 Need to Discuss Payment?</h3>
                    <p>If you're experiencing financial difficulties, please contact your landlord immediately to discuss payment arrangements.</p>
                </div>

                <p><strong>Important:</strong> Continued delay in payment may result in additional charges or further action as per your tenancy agreement.</p>
                
                <p>Please treat this matter with urgency.</p>
            </div>
            
            <div class="footer">
                <p>This is an automated notice from the property management system.</p>
                <p>If you have recently made payment, please contact your landlord to confirm.</p>
            </div>
        </div>
    </body>
    </html>`;

    return await this.sendEmail({ to: email, subject, html });
  }

  // Bulk email function for monthly reminders
  async sendBulkMonthlyReminders(tenantsData) {
    const results = [];
    
    for (const tenantData of tenantsData) {
      try {
        const result = await this.sendMonthlyRentReminder(
          tenantData.tenant, 
          tenantData.property, 
          true
        );
        results.push({
          tenant: tenantData.tenant.name,
          email: tenantData.tenant.email,
          success: result.success,
          messageId: result.messageId
        });
      } catch (error) {
        results.push({
          tenant: tenantData.tenant.name,
          email: tenantData.tenant.email,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Bulk email function for overdue notices
  async sendBulkOverdueNotices(tenantsData) {
    const results = [];
    
    for (const tenantData of tenantsData) {
      try {
        const result = await this.sendOverduePaymentNotice(
          tenantData.tenant, 
          tenantData.property,
          tenantData.daysOverdue
        );
        results.push({
          tenant: tenantData.tenant.name,
          email: tenantData.tenant.email,
          success: result.success,
          messageId: result.messageId,
          daysOverdue: tenantData.daysOverdue
        });
      } catch (error) {
        results.push({
          tenant: tenantData.tenant.name,
          email: tenantData.tenant.email,
          success: false,
          error: error.message,
          daysOverdue: tenantData.daysOverdue
        });
      }
    }
    
    return results;
  }
}

export default new EnhancedEmailService();