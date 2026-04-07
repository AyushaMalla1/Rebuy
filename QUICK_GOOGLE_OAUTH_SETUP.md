# Quick Google OAuth Setup - 3 Steps

## Step 1: Get Your Credentials

1. In your Google Cloud Console (the screenshot you showed)
2. Click on "Rebuy Chatbot" (or "Rebut")
3. You'll see:
   - **Client ID**: `799782451168-xxxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxxxx`
4. Copy both values

## Step 2: Update Backend/.env

Open `Backend/.env` and replace:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

With your actual values:

```env
GOOGLE_CLIENT_ID=799782451168-xxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxx
```

## Step 3: Add Redirect URI

1. In Google Cloud Console, click on your OAuth client
2. Find "Authorized redirect URIs"
3. Click "Add URI"
4. Add this URL:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
5. Click "Save"

## Step 4: Restart Backend

```bash
cd Backend
npm start
```

## Step 5: Test It!

1. Go to: http://localhost:3000/login
2. Click "Continue with Google"
3. Select your Google account
4. Done! You're logged in!

---

## ✅ That's It!

Your Google OAuth is now working. Users can sign in with Google!
