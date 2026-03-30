# eSewa Payment Setup - Final Steps

## ✅ What's Already Done
- eSewa v2 API integration complete
- Payment database model created
- Frontend checkout with eSewa option ready
- Success/Failure pages created
- Database configured for eSewa
- All backend routes working

## ⚠️ What's Missing
Your `BACKEND_URL` is set to `http://localhost:5000`, which eSewa servers cannot reach from the internet. You need to use ngrok to create a public URL.

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Ngrok Auth Token (2 minutes)
1. Open browser: https://dashboard.ngrok.com/signup
2. Sign up (it's FREE forever)
3. After login, go to: https://dashboard.ngrok.com/get-started/your-authtoken
4. Copy your authtoken

### Step 2: Configure Ngrok (30 seconds)
Open Command Prompt or PowerShell and run:
```bash
C:\Users\Aayusha\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe config add-authtoken YOUR_TOKEN_HERE
```
Replace `YOUR_TOKEN_HERE` with the token from Step 1.

### Step 3: Start Testing (1 minute)

#### Option A: Use the Batch File (Easiest)
1. Double-click `start-ngrok.bat` in your project folder
2. Copy the HTTPS URL shown (e.g., `https://abc123.ngrok-free.app`)
3. Edit `Backend/.env` and change:
   ```
   BACKEND_URL=https://abc123.ngrok-free.app
   ```
4. Restart your backend server
5. Test eSewa payment!

#### Option B: Manual Start
1. Open a NEW terminal
2. Run:
   ```bash
   C:\Users\Aayusha\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe http 5000
   ```
3. Copy the HTTPS forwarding URL
4. Update `Backend/.env` with the URL
5. Restart backend server

## 🧪 Testing eSewa Payment

1. Make sure backend server is running
2. Make sure frontend is running
3. Make sure ngrok is running (keep the window open!)
4. Go to checkout page
5. Add items to cart
6. Select eSewa as payment method
7. Click "Place Order"
8. You'll be redirected to eSewa test page
9. Complete the payment
10. You should be automatically redirected back to success page!

## 📊 Check Configuration Status

Run this anytime to check if everything is configured:
```bash
cd Backend
node check-esewa-config.js
```

## 🔧 Troubleshooting

### "Payment failed" after completing eSewa payment
- Check if ngrok is still running
- Verify `BACKEND_URL` in `.env` matches your ngrok URL
- Make sure you restarted backend after updating `.env`
- Check backend terminal for error logs

### Ngrok URL changed
- Free ngrok gives you a new URL each time you restart it
- Update `BACKEND_URL` in `.env` with the new URL
- Restart backend server

### "Invalid signature" error
- Your eSewa credentials might be wrong
- Run: `node setup-esewa-settings.js` to reconfigure

## 📝 Important Notes

- Keep ngrok terminal open while testing (closing it stops the tunnel)
- Ngrok free tier gives you a new URL each restart
- Each time ngrok restarts, update `.env` and restart backend
- For production, deploy to a real server (no ngrok needed)

## 🎯 Current Test Credentials
- Merchant ID: `EPAYTEST`
- Secret Key: `8gBm/:&EnhH.1/q`
- Payment URL: https://rc-epay.esewa.com.np/api/epay/main/v2/form

## 📞 Need Help?
If you're stuck, check:
1. Ngrok terminal - should show incoming requests when eSewa sends callbacks
2. Backend terminal - should show logs for payment routes
3. Browser console - for any frontend errors
4. Run `node check-esewa-config.js` to verify configuration

## 🚀 Production Deployment (Later)
When you're ready to deploy:
1. Deploy backend to Heroku/DigitalOcean/AWS/etc.
2. Get production eSewa credentials from eSewa
3. Update `.env` with production credentials and server URL
4. No ngrok needed in production!
