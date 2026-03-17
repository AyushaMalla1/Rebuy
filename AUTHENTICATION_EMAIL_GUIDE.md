# Authentication & Email Setup Guide

## ✅ COMPLETED

### 1. Authentication Fixed
All user passwords have been reset to: `password123`

**Your Accounts:**

**Customers:**
- sa@gmail.com
- ape@gmail.com
- aayushamalla077@gmail.com
- anki@gmail.com
- aae1@gmail.com
- ayu@gmail.com
- test@example.com

**Sellers:**
- ayushamalla09@gmail.com
- apekshaaaa@gmail.com
- ga@gmail.com
- seller@example.com

### 2. Email Service Integrated
- Welcome emails on signup
- Order confirmation emails
- Order shipped notifications
- Order delivered notifications

## 🔧 EMAIL CONFIGURATION NEEDED

To enable email sending, you need to set up Gmail App Password:

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

### Step 2: Create App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Rebuy App"
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Update Backend/.env
Replace these lines in `Backend/.env`:
```
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

With your actual Gmail and app password:
```
SMTP_USER=aayushamalla077@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

### Step 4: Restart Backend Server
```bash
cd Backend
npm start
```

## 📧 Email Features

### Welcome Email
Sent automatically when:
- New customer signs up
- New seller registers

### Order Emails
Sent automatically when:
- Order is placed (confirmation)
- Order is shipped (tracking info)
- Order is delivered (verification request)

### Password Reset Email
Sent when user requests password reset via "Forgot Password"

## 🧪 Testing

### Test Login:
1. Go to http://localhost:3000/login
2. Use any account above with password: `password123`
3. Should login successfully

### Test Email (after configuration):
1. Sign up a new account
2. Check email inbox for welcome message
3. Place an order
4. Check for order confirmation email

## 🔒 Security Notes

- Never commit `.env` file to Git (already in .gitignore)
- Use App Password, not your actual Gmail password
- In production, use a dedicated email service like SendGrid or AWS SES
- Current setup is for development only

## 📝 Summary

✅ All passwords reset to `password123`
✅ Email service code integrated
⏳ Waiting for Gmail App Password configuration
⏳ Need to restart backend after adding credentials

Once you add your Gmail credentials to `.env`, all email features will work automatically!
