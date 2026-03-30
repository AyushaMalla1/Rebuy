# Payment Gateway Integration

## Overview
The payment system supports multiple payment gateways for Nepal market: eSewa, Khalti, Credit/Debit Cards, and Cash on Delivery (COD).

## Configuration

### Admin Dashboard Settings
1. Navigate to Admin Dashboard → Settings tab
2. Scroll to "Payment Gateway Configuration" section
3. Configure the following:
   - **Payment Provider**: Select from None, Stripe, PayPal, eSewa, Khalti
   - **Merchant ID**: Your merchant/business ID from the payment provider
   - **API Key**: Your API key from the payment provider
   - **Secret Key**: Your secret key (if required)
   - **Enable Payment Gateway**: Toggle to activate payments
   - **Test Mode**: Toggle for testing (uses sandbox/test URLs)

### Getting Merchant Accounts

#### eSewa
- Visit: https://esewa.com.np/merchant
- Register as a merchant
- Get your Merchant Code (scd)
- Test Mode URL: https://uat.esewa.com.np/epay/main
- Production URL: https://esewa.com.np/epay/main

#### Khalti
- Visit: https://khalti.com/join/merchant
- Register as a merchant
- Get your API Key from dashboard
- Test Mode URL: https://a.khalti.com/api/v2/epayment/
- Production URL: https://khalti.com/api/v2/epayment/

## Payment Flow

### 1. Order Creation
- Customer completes checkout form (shipping address)
- Selects payment method (eSewa, Khalti, Card, or COD)
- Reviews order and clicks "Place Order" or "Proceed to Payment"

### 2. Payment Processing

#### For COD:
- Order is created with status "Processing"
- Payment status set to "Pending"
- Customer completes order immediately

#### For eSewa/Khalti:
- Order is created in database first
- Backend `/api/payment/initiate` is called with orderId
- Payment gateway returns payment URL and data
- Customer is redirected to payment gateway
- After payment, gateway redirects to success/failure URL

### 3. Payment Verification
- Customer returns from payment gateway
- Backend `/api/payment/verify` is called
- Payment status is verified with gateway API
- Order status updated to "Processing" if successful
- Transaction ID saved to order

### 4. Order Completion
- Order appears in customer's order history
- Seller receives notification
- Admin can track in dashboard

## API Endpoints

### POST /api/payment/initiate
Initiates payment with selected gateway
- Request: `{ orderId: string }`
- Response: `{ success: boolean, paymentUrl: string, paymentData: object }`

### POST /api/payment/verify
Verifies payment completion
- Request: `{ orderId: string, ...gatewayParams }`
- Response: `{ success: boolean, transactionId: string }`

### GET /api/payment/success
Payment success callback (redirects to order status page)

### GET /api/payment/failure
Payment failure callback (redirects to order status page)

## Database Models

### Order Model
- `paymentMethod`: cod, esewa, khalti, card
- `paymentStatus`: Pending, Paid, Failed, Refunded
- `transactionId`: Gateway transaction reference

### Settings Model
- `paymentGateway.provider`: stripe, paypal, esewa, khalti, none
- `paymentGateway.apiKey`: API key
- `paymentGateway.secretKey`: Secret key
- `paymentGateway.merchantId`: Merchant ID
- `paymentGateway.isEnabled`: Enable/disable payments
- `paymentGateway.testMode`: Use test/sandbox environment

## Testing

### Development Mode
- Payment gateways work in test mode by default
- No real money is charged
- Use test credentials from payment provider

### Production Mode
- Set `testMode: false` in Settings
- Use production credentials
- Real transactions will be processed

## Notes
- Payment gateway must be configured in Admin Settings before customers can use it
- COD is always available regardless of gateway configuration
- All payment transactions are logged in Order model
- Failed payments can be retried from order status page
