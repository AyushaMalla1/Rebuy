const axios = require('axios');
const crypto = require('crypto');

// eSewa v2 Configuration
const ESEWA_CONFIG = {
  merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
  secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  paymentUrl: process.env.ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
  successUrl: process.env.ESEWA_SUCCESS_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/esewa/success`,
  failureUrl: process.env.ESEWA_FAILURE_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/esewa/failure`
};

// Generate random transaction UUID
const generateTransactionUUID = () => {
  return crypto.randomBytes(10).toString('hex');
};

// Generate eSewa signature using HMAC-SHA256
const generateEsewaSignature = (message, secretKey) => {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  return hmac.digest('base64');
};

// eSewa Payment Integration (v2 API)
const initiateEsewaPayment = async (orderData, settings) => {
  try {
    const { orderId, amount } = orderData;
    
    const amountStr = amount.toString();
    const taxAmount = '0';
    const totalAmount = amountStr;
    const transactionUuid = generateTransactionUUID();
    const productCode = settings?.paymentGateway?.esewaConfig?.merchantId || ESEWA_CONFIG.merchantId;
    const secretKey = settings?.paymentGateway?.esewaConfig?.secretKey || ESEWA_CONFIG.secretKey;
    const productServiceCharge = '0';
    const productDeliveryCharge = '0';

    // Generate signature
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const signature = generateEsewaSignature(message, secretKey);

    // Prepare payment data
    const paymentData = {
      amount: amountStr,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: productServiceCharge,
      product_delivery_charge: productDeliveryCharge,
      success_url: `${ESEWA_CONFIG.successUrl}?order_id=${orderId}`,
      failure_url: `${ESEWA_CONFIG.failureUrl}?order_id=${orderId}`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature
    };

    return {
      success: true,
      paymentUrl: ESEWA_CONFIG.paymentUrl,
      paymentData,
      transactionUuid
    };
  } catch (error) {
    console.error('eSewa payment initiation error:', error);
    return { success: false, message: 'Failed to initiate eSewa payment' };
  }
};

// Khalti Payment Integration
const initiateKhaltiPayment = async (orderData, settings) => {
  try {
    const { orderId, amount, productName, customerEmail } = orderData;
    const { apiKey, testMode } = settings.paymentGateway;
    
    const khaltiUrl = testMode
      ? 'https://a.khalti.com/api/v2/epayment/initiate/'
      : 'https://khalti.com/api/v2/epayment/initiate/';
    
    const response = await axios.post(khaltiUrl, {
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
      website_url: process.env.FRONTEND_URL || 'http://localhost:3000',
      amount: amount * 100, // Khalti uses paisa (1 rupee = 100 paisa)
      purchase_order_id: orderId,
      purchase_order_name: productName,
      customer_info: {
        email: customerEmail
      }
    }, {
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      paymentUrl: response.data.payment_url,
      pidx: response.data.pidx
    };
  } catch (error) {
    console.error('Khalti payment initiation error:', error);
    return { success: false, message: 'Failed to initiate Khalti payment' };
  }
};

// Verify eSewa Payment (v2 API)
const verifyEsewaPayment = async (params, settings) => {
  try {
    const { data } = params;
    
    if (!data) {
      return {
        success: false,
        message: 'No payment data received'
      };
    }

    // Decode the Base64 encoded data
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('ascii'));
    
    const secretKey = settings?.paymentGateway?.esewaConfig?.secretKey || ESEWA_CONFIG.secretKey;

    // Verify signature
    const message = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${decodedData.total_amount},transaction_uuid=${decodedData.transaction_uuid},product_code=${decodedData.product_code},signed_field_names=${decodedData.signed_field_names}`;
    const expectedSignature = generateEsewaSignature(message, secretKey);

    if (decodedData.signature !== expectedSignature) {
      return {
        success: false,
        message: 'Invalid signature'
      };
    }

    // Check if payment is complete
    if (decodedData.status !== 'COMPLETE') {
      return {
        success: false,
        message: 'Payment not completed'
      };
    }

    return {
      success: true,
      transactionId: decodedData.transaction_code,
      transactionUuid: decodedData.transaction_uuid,
      amount: decodedData.total_amount,
      status: decodedData.status,
      message: 'Payment verified successfully'
    };
  } catch (error) {
    console.error('eSewa verification error:', error);
    return { success: false, message: 'Payment verification failed' };
  }
};

// Verify Khalti Payment
const verifyKhaltiPayment = async (pidx, settings) => {
  try {
    const { apiKey, testMode } = settings.paymentGateway;
    
    const verifyUrl = testMode
      ? 'https://a.khalti.com/api/v2/epayment/lookup/'
      : 'https://khalti.com/api/v2/epayment/lookup/';
    
    const response = await axios.post(verifyUrl, {
      pidx
    }, {
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const isSuccess = response.data.status === 'Completed';
    
    return {
      success: isSuccess,
      transactionId: response.data.transaction_id,
      message: isSuccess ? 'Payment verified' : 'Payment not completed'
    };
  } catch (error) {
    console.error('Khalti verification error:', error);
    return { success: false, message: 'Payment verification failed' };
  }
};

module.exports = {
  initiateEsewaPayment,
  initiateKhaltiPayment,
  verifyEsewaPayment,
  verifyKhaltiPayment
};
