# eSewa Payment Gateway Setup with Ngrok

## Why Ngrok is Needed
eSewa payment gateway needs to send callbacks to your backend server after payment is completed. Since your backend is running on `localhost:5000`, eSewa servers cannot reach it from the internet. Ngrok creates a secure tunnel that gives your localhost a public URL.

## Setup Steps

### Step 1: Get Ngrok Auth Token
1. Go to https://dashboard.ngrok.com/signup
2. Sign up for a free account (it's free forever for basic use)
3. After signing in, go to https://dashboard.ngrok.com/get-started/your-authtoken
4. Copy your authtoken (it looks like: `2abc123def456ghi789jkl012mno345_6pqr789stu012vwx345yz`)

### Step 2: Configure Ngrok
Open your terminal (Command Prompt or PowerShell) and run:

```bash
C:\Users\Aayusha\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe config add-authtoken YOUR_AUTH_TOKEN_HERE
```

Replace `YOUR_AUTH_TOKEN_HERE` with the token you copied from step 1.

### Step 3: Start Ngrok Tunnel
In a NEW terminal window, run:

```bash
C:\Users\Aayusha\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe http 5000
```

This will show output like:
```
Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:5000
```

### Step 4: Update Backend Environment Variables
1. Copy the HTTPS forwarding URL (e.g., `https://abc123def456.ngrok-free.app`)
2. Open `Backend/.env` file
3. Update the `BACKEND_URL` line:
   ```
   BACKEND_URL=https://abc123def456.ngrok-free.app
   ```
4. Save the file

### Step 5: Restart Backend Server
1. Stop your backend server (Ctrl+C in the terminal where it's running)
2. Start it again:
   ```bash
   cd Backend
   npm start
   ```

### Step 6: Test eSewa Payment
1. Go to your checkout page
2. Select eSewa as payment method
3. Place an order
4. Complete payment on eSewa test page
5. You should be redirected back to success page automatically!

## Important Notes

- Keep the ngrok terminal window open while testing - if you close it, the tunnel stops
- The free ngrok URL changes every time you restart ngrok
- Each time you restart ngrok, you need to update `BACKEND_URL` in `.env` and restart your backend
- For production deployment, you won't need ngrok - deploy your backend to a real server with a public URL

## Troubleshooting

### If payment still fails:
1. Check ngrok terminal - you should see incoming requests when eSewa sends callbacks
2. Check backend terminal - you should see logs for `/api/payment/esewa/success` or `/api/payment/esewa/failure`
3. Make sure `BACKEND_URL` in `.env` matches the ngrok URL exactly (with https://)
4. Make sure you restarted the backend server after updating `.env`

### If ngrok shows "ERR_NGROK_108":
Your authtoken is invalid. Go back to step 1 and get a fresh token.

### If ngrok shows "ERR_NGROK_105":
You're already running ngrok somewhere else. Close other ngrok instances first.
