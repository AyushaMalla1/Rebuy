# Google OAuth Setup Guide

## ✅ What Was Implemented

1. **Backend**:
   - Passport.js with Google OAuth 2.0 strategy
   - Google authentication routes
   - User model updated to support Google ID
   - Session management

2. **Frontend**:
   - "Continue with Google" button on login page
   - Google Auth success handler
   - Automatic token and user data storage

---

## 🔧 Setup Instructions

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing):
   - Click "Select a project" → "New Project"
   - Name: "Rebuy"
   - Click "Create"

3. **Enable Google+ API:**
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Rebuy Web Client"

5. **Configure OAuth Consent Screen** (if prompted):
   - User Type: "External"
   - App name: "Rebuy"
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
   - Click "Save and Continue"
   - Scopes: Add "email" and "profile"
   - Test users: Add your email
   - Click "Save and Continue"

6. **Add Authorized Redirect URIs:**
   ```
   http://localhost:5000/api/auth/google/callback
   http://localhost:3000/auth/google/success
   ```

7. **Copy Credentials:**
   - Client ID: `123456789-abcdefg.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-abc123def456`

### Step 2: Update Backend .env File

Open `Backend/.env` and update:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Session Secret (generate a random string)
SESSION_SECRET=your-random-secret-key-here
```

### Step 3: Restart Backend Server

```bash
cd Backend
npm start
```

You should see:
```
✅ Email service ready
MongoDB connected successfully
Server running on port 5000
```

### Step 4: Test Google OAuth

1. Go to: http://localhost:3000/login
2. Click "Continue with Google"
3. Select your Google account
4. Grant permissions
5. You'll be redirected back and logged in!

---

## 🎯 How It Works

### Flow Diagram:

```
User clicks "Continue with Google"
    ↓
Redirects to Google OAuth consent screen
    ↓
User grants permissions
    ↓
Google redirects to: /api/auth/google/callback
    ↓
Backend creates/finds user in database
    ↓
Backend generates JWT token
    ↓
Redirects to: /auth/google/success?token=...&user=...
    ↓
Frontend saves token and user to localStorage
    ↓
User is logged in!
```

### Database Changes:

When a user signs in with Google:
- If email exists: Links Google ID to existing account
- If new user: Creates new account with Google data
- Password: Random (not used for Google users)
- Profile image: Uses Google profile picture

---

## 🧪 Testing

### Test 1: New Google User
1. Use a Google account not registered on Rebuy
2. Click "Continue with Google"
3. Should create new account and log in

### Test 2: Existing Email
1. Create account with email: test@gmail.com
2. Sign in with Google using same email
3. Should link Google account to existing user

### Test 3: Returning Google User
1. Sign out
2. Click "Continue with Google" again
3. Should log in immediately (no signup)

---

## 📊 Features

✅ One-click sign in with Google
✅ No password required
✅ Auto-fills name and email
✅ Uses Google profile picture
✅ Links to existing accounts
✅ Secure JWT authentication
✅ Works with existing login system

---

## 🔒 Security

- OAuth 2.0 protocol (industry standard)
- JWT tokens for session management
- Secure session cookies
- HTTPS required in production
- No password storage for Google users

---

## 🚀 Production Deployment

### Update .env for Production:

```env
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
SESSION_SECRET=generate-strong-random-secret
NODE_ENV=production
```

### Update Google Cloud Console:

Add production URLs to Authorized Redirect URIs:
```
https://yourdomain.com/api/auth/google/callback
https://yourdomain.com/auth/google/success
```

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** Make sure redirect URI in Google Console matches exactly:
```
http://localhost:5000/api/auth/google/callback
```

### Error: "Access blocked: This app's request is invalid"
**Solution:** 
1. Enable Google+ API in Google Cloud Console
2. Configure OAuth consent screen
3. Add your email as test user

### Error: "Invalid client"
**Solution:** Check that Client ID and Secret are correct in `.env`

### User not logging in
**Solution:** 
1. Check backend console for errors
2. Verify MongoDB is connected
3. Check that session secret is set

---

## 📁 Files Created/Modified

### Backend:
- ✅ `Backend/config/passport.js` - Passport configuration
- ✅ `Backend/routes/auth.js` - Added Google OAuth routes
- ✅ `Backend/models/User.js` - Added googleId field
- ✅ `Backend/server.js` - Added passport middleware
- ✅ `Backend/.env` - Added Google OAuth credentials

### Frontend:
- ✅ `Frontend/src/GoogleAuthSuccess.js` - Success handler
- ✅ `Frontend/src/Login.js` - Added Google button
- ✅ `Frontend/src/App.js` - Added success route

---

## ✨ Next Steps

1. **Get Google OAuth Credentials** (Step 1 above)
2. **Update .env file** with your credentials
3. **Restart backend server**
4. **Test login** with Google account

---

## 📞 Support

### Google Cloud Console:
- Credentials: https://console.cloud.google.com/apis/credentials
- OAuth Consent: https://console.cloud.google.com/apis/credentials/consent

### Documentation:
- Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2
- Passport.js: http://www.passportjs.org/packages/passport-google-oauth20/

---

**Status:** ✅ Google OAuth implementation complete
**Next:** Get credentials from Google Cloud Console and test!
