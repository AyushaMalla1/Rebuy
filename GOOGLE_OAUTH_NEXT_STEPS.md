# Google OAuth - What You Need to Do Now

## Current Status ✅
- Google OAuth code is installed and configured
- Client ID is already in Backend/.env: `799752451160-mfpmun0vc51khtrcsvntar2fsv74b4ib.apps.googleusercontent.com`
- "Continue with Google" button is on login page
- All routes are set up

## What You Need to Do (3 Steps)

### Step 1: Get Client Secret from Google Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client (should be named "Rebuy Chatbot" or similar)
3. Click on it
4. You'll see:
   - **Client ID**: (you already have this)
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxxx` ← Copy this!

### Step 2: Update Backend/.env

Open `Backend/.env` and find this line:
```
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

Replace it with your actual secret:
```
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
```

### Step 3: Add Redirect URI in Google Console

1. In the same OAuth client page in Google Console
2. Find "Authorized redirect URIs" section
3. Click "ADD URI"
4. Add exactly this:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
5. Click "SAVE" at the bottom

### Step 4: Restart Backend Server

```bash
cd Backend
npm start
```

## Test It!

1. Go to: http://localhost:3000/login
2. Click "Continue with Google" button
3. Choose your Google account
4. You should be logged in!

---

## What Google OAuth Does

When users click "Continue with Google":
1. They're redirected to Google's login page
2. They sign in with their Google account
3. Google sends their info (name, email, profile picture) back to your app
4. Your app creates a new user account OR logs them into existing account
5. User is logged in - no password needed!

**Benefits:**
- Users don't need to remember another password
- Faster signup/login process
- More secure (Google handles authentication)
- Gets user's name and profile picture automatically

---

## Troubleshooting

If it doesn't work:
1. Make sure Client Secret is correct in `.env`
2. Make sure redirect URI is exactly: `http://localhost:5000/api/auth/google/callback`
3. Restart backend server after changing `.env`
4. Check browser console for errors
