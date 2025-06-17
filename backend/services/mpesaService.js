import axios from 'axios';

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackURL = process.env.MPESA_CALLBACK_URL;
    this.timeoutURL = process.env.MPESA_TIMEOUT_URL;
    
    // Sandbox URLs (change to production for live)
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
  }

  // Get OAuth token
  async getAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  // Generate timestamp for STK push
  generateTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  // Generate password for STK push
  generatePassword(timestamp) {
    const data = `${this.businessShortCode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  // Format phone number to 254 format
  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }

  // Initiate STK Push for rent payment
  async initiateSTKPush(phoneNumber, amount, accountNumber) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      // Clean phone number (ensure it starts with 254)
      const cleanedPhone = this.formatPhoneNumber(phoneNumber);

      const requestBody = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: cleanedPhone,
        PartyB: this.businessShortCode,
        PhoneNumber: cleanedPhone,
        CallBackURL: this.callbackURL,
        AccountReference: accountNumber,
        TransactionDesc: `Rent payment for account ${accountNumber}`
      };

      const response = await axios.post(`${this.baseURL}/mpesa/stkpush/v1/processrequest`, requestBody, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        checkoutRequestID: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage
      };

    } catch (error) {
      console.error('STK Push error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessage || 'Failed to initiate payment'
      };
    }
  }

  // Handle payment callback from M-Pesa
  async handleCallback(callbackData) {
    try {
      const { Body } = callbackData;
      
      if (!Body || !Body.stkCallback) {
        throw new Error('Invalid callback data structure');
      }

      const callback = Body.stkCallback;
      const { ResultCode, ResultDesc, CallbackMetadata } = callback;

      // Payment successful
      if (ResultCode === 0) {
        const metadata = CallbackMetadata.Item;
        
        const amount = metadata.find(item => item.Name === 'Amount')?.Value;
        const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
        const transactionDate = metadata.find(item => item.Name === 'TransactionDate')?.Value;
        const phoneNumber = metadata.find(item => item.Name === 'PhoneNumber')?.Value;

        const checkoutRequestID = callback.CheckoutRequestID;

        return {
          success: true,
          paymentData: {
            amount: parseFloat(amount),
            mpesaReceiptNumber,
            transactionDate: new Date(transactionDate.toString()),
            phoneNumber,
            checkoutRequestID,
            status: 'completed'
          }
        };

      } else {
        console.log('Payment failed:', ResultDesc);
        return { success: false, error: ResultDesc };
      }

    } catch (error) {
      console.error('Callback processing error:', error);
      return { success: false, error: 'Failed to process callback' };
    }
  }
}

export default new MpesaService();