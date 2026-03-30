# eSewa Payment Integration - Quick Start Guide

## Current Status
✅ eSewa v2 API integration complete
✅ Payment model and database setup complete
✅ Frontend checkout with eSewa option complete
✅ Success/Failure callback routes implemented
❌ Callbacks fail because eSewa cannot reach localhost

## Solution: Use Ngrok for Testing

### Quick Setup (5 minutes)

#### 1. Get Ngrok Auth Token
- Visit: https://dashboard.ngrok.com/signup
- Sign up (free account)
- Copy your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken

#### 2. Configure Ngrok (One-time setup)
```bash
C:\Users\Aayusha\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe config add-authtoken YOUR_TOKEN_HERE
```

#### 3. Configure Database Settings (One-time setup)
```bash
cd Backend
node setup-esewa-settings.js
```

#### 4. Start Ngrok (Keep this running)
Open a NEW terminal:
```bash
C:\Users\Aayusha\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe http 5000
```

Copy the HTTPS URL shown (e.g., `https://abc123.ngrok-free.app`)

#### 5. Update Backend .env
Edit `Backend/.env`:
```
BACKEND_URL=https://abc123.ngrok-free.app
```
(Replace with YOUR ngrok URL)

#### 6. Restart Backend
```bash
cd Backend
npm start
```

#### 7. Test Payment
1. Go to checkout page
2. Select eSewa payment
3. Place order
4. Complete payment on eSewa test page
5. Should redirect to success page automatically!

## Test Credentials
- Merchant ID: `EPAYTEST`
- Secret Key: `8gBm/:&EnhH.1/q`
- Test URL: https://rc-epay.esewa.com.np/api/epay/main/v2/form

## How It Works

### Payment Flow:
1. User clicks "Place Order" with eSewa selected
2. Backend creates order in database
3. Backend generates eSewa payment form with signature
4. User is redirected to eSewa payment page
5. User completes payment on eSewa
6. eSewa sends callback to: `https://YOUR-NGROK-URL.ngrok-free.app/api/payment/esewa/success`
7. Backend verifies payment signature
8. Backend updates order status to "Paid"
9. User is redirected to success page

### Why Ngrok?
- eSewa servers need to send callbacks to your backend
- `localhost:5000` is not accessible from the internet
- Ngrok creates a public URL that tunnels to your localhost
- In production, you'll deploy to a real server (no ngrok needed)

## Troubleshooting

### Payment redirects but callback fails
- Check if ngrok is still running
- Verify `BACKEND_URL` in `.env` matches ngrok URL
- Make sure you restarted backend after updating `.env`

### Ngrok URL changed
- Ngrok free tier gives you a new URL each restart
- Update `BACKEND_URL` in `.env` with new URL
- Restart backend server

### "Invalid signature" error
- Check `ESEWA_SECRET_KEY` in `.env` matches test credentials
- Run `node setup-esewa-settings.js` to reconfigure

### Order created but payment not recorded
- Check backend logs for errors
- Verify Payment model is properly imported in routes
- Check MongoDB connection

## Production Deployment

When deploying to production:
1. Deploy backend to a server with public URL (e.g., Heroku, DigitalOcean, AWS)
2. Update `BACKEND_URL` in production `.env` to your server URL
3. Get production eSewa credentials from eSewa
4. Update `ESEWA_MERCHANT_ID` and `ESEWA_SECRET_KEY`
5. Change `ESEWA_PAYMENT_URL` to production URL
6. No ngrok needed!

## Files Modified

### Backend:
- `Backend/routes/payment.js` - Payment routes with eSewa callbacks
- `Backend/utils/paymentService.js` - eSewa v2 API implementation
- `Backend/models/Payment.js` - Payment transaction model
- `Backend/.env` - Environment configuration

### Frontend:
- `Frontend/src/Checkout.js` - Checkout page with eSewa integration
- `Frontend/src/PaymentSuccess.js` - Success page
- `Frontend/src/PaymentFailed.js` - Failure page
- `Frontend/src/App.js` - Routes for payment pages

## Support
If you encounter issues, check:
1. Ngrok terminal - should show incoming requests
2. Backend terminal - should show payment route logs
3. Browser console - for any frontend errors
4. MongoDB - verify orders and payments are being created
