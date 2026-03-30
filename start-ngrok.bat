@echo off
echo ========================================
echo Starting Ngrok Tunnel for eSewa Testing
echo ========================================
echo.
echo This will create a public URL for your localhost:5000
echo Keep this window open while testing eSewa payments
echo.
echo After ngrok starts:
echo 1. Copy the HTTPS forwarding URL (e.g., https://abc123.ngrok-free.app)
echo 2. Update Backend/.env file: BACKEND_URL=YOUR_NGROK_URL
echo 3. Restart your backend server
echo.
echo Press Ctrl+C to stop ngrok
echo.
C:\Users\Aayusha\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe http 5000
