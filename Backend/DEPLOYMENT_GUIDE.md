# Deployment Guide - Rebuy Customer/Buyer System

## Table of Contents
1. [Environment Configuration](#environment-configuration)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Payment Gateway Configuration](#payment-gateway-configuration)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Security Checklist](#security-checklist)

## Environment Configuration

### Production Environment Variables

Create a `.env` file in the Backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rebuy

# JWT
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=7d

# Payment Gateways
ESEWA_MERCHANT_CODE=<your-merchant-code>
KHALTI_SECRET_KEY=<your-secret-key>

# CORS
CORS_ORIGIN=https://yourdomain.com

# Frontend URL
FRONTEND_URL=https://yourdomain.com
```

### Generating Secure Secrets

```bash
# Generate JWT Secret (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 64
```

## MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Free Tier for development)

### Step 2: Configure Database Access
1. Go to Database Access
2. Add New Database User
   - Username: `rebuy_admin`
   - Password: Generate secure password
   - Database User Privileges: Read and write to any database

### Step 3: Configure Network Access
1. Go to Network Access
2. Add IP Address
   - For development: Add your current IP
   - For production: Add your server IP or `0.0.0.0/0` (allow from anywhere - less secure)

### Step 4: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `rebuy`

Example:
```
mongodb+srv://rebuy_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rebuy?retryWrites=true&w=majority
```

### Step 5: Test Connection
```bash
cd Backend
node test-connection.js
```

## Payment Gateway Configuration

### eSewa Configuration

#### Development (Test Environment)
```env
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_SUCCESS_URL=http://localhost:3000/payment-success
ESEWA_FAILURE_URL=http://localhost:3000/payment-failure
```

#### Production
1. Register for eSewa Merchant Account: https://esewa.com.np/merchant
2. Complete KYC verification
3. Get your Merchant Code
4. Update environment variables:

```env
ESEWA_MERCHANT_CODE=<your-merchant-code>
ESEWA_SUCCESS_URL=https://yourdomain.com/payment-success
ESEWA_FAILURE_URL=https://yourdomain.com/payment-failure
```

### Khalti Configuration

#### Development
```env
KHALTI_SECRET_KEY=test_secret_key_xxxxxxxxxxxxxxxx
KHALTI_PUBLIC_KEY=test_public_key_xxxxxxxxxxxxxxxx
```

#### Production
1. Register at: https://khalti.com/join/merchant
2. Complete merchant verification
3. Get API keys from dashboard
4. Update environment variables:

```env
KHALTI_SECRET_KEY=<your-secret-key>
KHALTI_PUBLIC_KEY=<your-public-key>
```

## Backend Deployment

### Option 1: Heroku

#### Prerequisites
- Heroku CLI installed
- Git repository initialized

#### Steps
```bash
# Login to Heroku
heroku login

# Create new app
heroku create rebuy-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="your-secret"
heroku config:set ESEWA_MERCHANT_CODE="your-code"
heroku config:set KHALTI_SECRET_KEY="your-key"
heroku config:set CORS_ORIGIN="https://yourdomain.com"

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Option 2: DigitalOcean

#### Prerequisites
- DigitalOcean account
- Droplet created (Ubuntu 20.04 LTS recommended)

#### Steps
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone your repository
git clone https://github.com/yourusername/rebuy.git
cd rebuy/Backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# (paste your production environment variables)

# Start with PM2
pm2 start server.js --name rebuy-backend
pm2 save
pm2 startup

# Setup Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/rebuy

# Add configuration:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/rebuy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Option 3: AWS EC2

Similar to DigitalOcean, but:
1. Launch EC2 instance (t2.micro for free tier)
2. Configure Security Groups (allow ports 22, 80, 443, 5000)
3. Follow DigitalOcean steps above

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### Prerequisites
- Vercel account
- GitHub repository

#### Steps
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from Frontend directory
cd Frontend
vercel

# Set environment variables in Vercel dashboard
# REACT_APP_API_URL=https://api.yourdomain.com
```

### Option 2: Netlify

#### Steps
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build
cd Frontend
npm run build

# Deploy
netlify deploy --prod --dir=build

# Set environment variables in Netlify dashboard
```

### Option 3: AWS S3 + CloudFront

```bash
# Build
cd Frontend
npm run build

# Install AWS CLI
pip install awscli

# Configure AWS
aws configure

# Create S3 bucket
aws s3 mb s3://rebuy-frontend

# Upload build
aws s3 sync build/ s3://rebuy-frontend --acl public-read

# Setup CloudFront distribution (via AWS Console)
```

## Security Checklist

### Backend Security

- [ ] Use strong JWT secret (64+ characters)
- [ ] Enable HTTPS only
- [ ] Set secure CORS origins (no wildcards in production)
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Add helmet.js for security headers
- [ ] Validate all user inputs
- [ ] Use parameterized queries (Mongoose does this)
- [ ] Keep dependencies updated
- [ ] Enable MongoDB authentication
- [ ] Use MongoDB Atlas IP whitelist
- [ ] Set up database backups
- [ ] Enable logging and monitoring
- [ ] Use PM2 for process management
- [ ] Set up SSL/TLS certificates

### Frontend Security

- [ ] Use HTTPS only
- [ ] Sanitize user inputs
- [ ] Don't store sensitive data in localStorage
- [ ] Use secure cookies for tokens (if applicable)
- [ ] Implement CSP headers
- [ ] Keep dependencies updated
- [ ] Minify and obfuscate production build
- [ ] Enable CORS properly
- [ ] Validate API responses

### Payment Security

- [ ] Never store card details
- [ ] Use official payment gateway SDKs
- [ ] Validate payment callbacks
- [ ] Log all transactions
- [ ] Implement fraud detection
- [ ] Use HTTPS for all payment pages
- [ ] Verify payment signatures
- [ ] Handle payment failures gracefully

## Monitoring and Maintenance

### Recommended Tools

1. **Error Tracking**: Sentry
2. **Performance Monitoring**: New Relic or DataDog
3. **Uptime Monitoring**: UptimeRobot or Pingdom
4. **Log Management**: Loggly or Papertrail
5. **Database Monitoring**: MongoDB Atlas built-in monitoring

### Setup Monitoring

```bash
# Install Sentry
npm install @sentry/node

# Add to server.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });
```

### Backup Strategy

1. **Database Backups**
   - MongoDB Atlas: Enable automated backups (daily)
   - Manual backups: `mongodump --uri="mongodb+srv://..."`

2. **Code Backups**
   - Use Git version control
   - Push to GitHub/GitLab regularly
   - Tag releases

3. **Environment Backups**
   - Store .env.example in repository
   - Keep actual .env in secure location (1Password, AWS Secrets Manager)

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```
Error: MongoNetworkError: failed to connect to server
```
**Solution**: Check IP whitelist in MongoDB Atlas, verify connection string

#### 2. CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Add frontend URL to CORS_ORIGIN in backend .env

#### 3. Payment Gateway Errors
```
eSewa: Invalid merchant code
```
**Solution**: Verify merchant code, check if using production vs test environment

#### 4. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill process on port 5000 or change PORT in .env

### Health Check Endpoint

Add to `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Test payment gateways (small test transactions)
- [ ] Verify email notifications
- [ ] Test user registration and login
- [ ] Test order placement flow
- [ ] Verify cart functionality
- [ ] Test condition verification
- [ ] Check loyalty points system
- [ ] Test on multiple devices
- [ ] Verify SSL certificates
- [ ] Check error logging
- [ ] Set up monitoring alerts
- [ ] Document API endpoints
- [ ] Train support team
- [ ] Prepare rollback plan

## Support

For issues or questions:
- Email: support@rebuy.com
- Documentation: https://docs.rebuy.com
- GitHub Issues: https://github.com/yourusername/rebuy/issues
