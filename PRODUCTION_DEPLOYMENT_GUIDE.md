# Production Deployment Guide

This guide covers the complete setup for deploying the Rebuy Customer/Buyer System to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Payment Gateway Configuration](#payment-gateway-configuration)
4. [Environment Variables](#environment-variables)
5. [Security Configuration](#security-configuration)
6. [Backend Deployment](#backend-deployment)
7. [Frontend Deployment](#frontend-deployment)
8. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

Before deploying to production, ensure you have:

- [ ] MongoDB Atlas account (free tier available)
- [ ] eSewa merchant account (for Nepal-based payments)
- [ ] Khalti merchant account (for Nepal-based payments)
- [ ] Cloudinary account (for image hosting)
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (Let's Encrypt or cloud provider)
- [ ] Node.js 14+ installed on production server

---

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click "Build a Database"
4. Choose deployment option:
   - **Free Tier (M0)**: Good for testing and small apps
   - **Shared (M2/M5)**: Better performance for production
   - **Dedicated**: For high-traffic applications

### 2. Configure Database Access

1. Navigate to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Create a user with:
   - Username: `rebuy-admin` (or your choice)
   - Password: Generate a strong password
   - Database User Privileges: **Read and write to any database**
4. Save the credentials securely

### 3. Configure Network Access

1. Navigate to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Options:
   - **Allow Access from Anywhere**: `0.0.0.0/0` (easier but less secure)
   - **Add Current IP Address**: Your server's IP
   - **Add Multiple IPs**: For multiple servers
4. Click **Confirm**

### 4. Get Connection String

1. Navigate to **Database** → **Connect**
2. Choose **Connect your application**
3. Select **Node.js** driver
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your credentials
6. Add database name: `rebuy-production`
   ```
   mongodb+srv://rebuy-admin:your-password@cluster0.xxxxx.mongodb.net/rebuy-production?retryWrites=true&w=majority
   ```

### 5. Database Indexes (Important for Performance)

After deployment, create these indexes in MongoDB Atlas:

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true })

// Products collection
db.products.createIndex({ name: "text", description: "text", brand: "text" })
db.products.createIndex({ status: 1 })
db.products.createIndex({ category: 1 })
db.products.createIndex({ seller: 1 })

// Orders collection
db.orders.createIndex({ customer: 1, orderDate: -1 })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ trackingNumber: 1 })

// Cart collection
db.carts.createIndex({ customer: 1 }, { unique: true })

// LoyaltyPoints collection
db.loyaltypoints.createIndex({ customer: 1 }, { unique: true })
```

---

## Payment Gateway Configuration

### eSewa Integration

1. **Register as Merchant**
   - Visit [eSewa Merchant Portal](https://esewa.com.np/)
   - Complete merchant registration
   - Submit required documents

2. **Get Credentials**
   - Merchant Code (Service Code)
   - Merchant Secret Key
   - Test vs Production URLs

3. **Configuration**
   ```env
   ESEWA_MERCHANT_CODE=EPAYTEST
   ESEWA_SUCCESS_URL=https://yourdomain.com/payment/success
   ESEWA_FAILURE_URL=https://yourdomain.com/payment/failure
   ESEWA_PAYMENT_URL=https://esewa.com.np/epay/main
   ```

4. **Testing**
   - Use test credentials for development
   - Test with eSewa test account
   - Verify success/failure callbacks

### Khalti Integration

1. **Register as Merchant**
   - Visit [Khalti Merchant Portal](https://khalti.com/)
   - Complete merchant registration
   - Submit required documents

2. **Get API Keys**
   - Public Key (for frontend)
   - Secret Key (for backend)
   - Test vs Live keys

3. **Configuration**
   ```env
   KHALTI_SECRET_KEY=live_secret_key_xxxxxxxxxx
   KHALTI_PUBLIC_KEY=live_public_key_xxxxxxxxxx
   KHALTI_PAYMENT_URL=https://khalti.com/api/v2/payment/verify/
   ```

4. **Testing**
   - Use test keys for development
   - Test with Khalti test credentials
   - Verify payment verification endpoint

---

## Environment Variables

### Backend Environment Variables

1. **Copy the example file**
   ```bash
   cd Backend
   cp .env.production.example .env.production
   ```

2. **Fill in all values** (see `.env.production.example` for template)

3. **Generate JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Critical Variables Checklist**
   - [ ] `MONGODB_URI` - MongoDB Atlas connection string
   - [ ] `JWT_SECRET` - Strong random secret (min 32 chars)
   - [ ] `FRONTEND_URL` - Your production frontend URL
   - [ ] `ESEWA_MERCHANT_CODE` - eSewa merchant code
   - [ ] `KHALTI_SECRET_KEY` - Khalti secret key
   - [ ] `CLOUDINARY_*` - Cloudinary credentials

### Frontend Environment Variables

1. **Create `.env.production` in Frontend folder**
   ```env
   REACT_APP_API_URL=https://api.yourdomain.com
   REACT_APP_KHALTI_PUBLIC_KEY=your-khalti-public-key
   ```

2. **Update API base URL in `src/services/api.js`**
   ```javascript
   const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
   ```

---

## Security Configuration

### 1. Update CORS Settings

Edit `Backend/server.js`:

```javascript
const cors = require('cors');

// Production CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 2. Add Security Headers

Install helmet:
```bash
cd Backend
npm install helmet
```

Update `Backend/server.js`:
```javascript
const helmet = require('helmet');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 3. Add Rate Limiting

Install express-rate-limit:
```bash
npm install express-rate-limit
```

Update `Backend/server.js`:
```javascript
const rateLimit = require('express-rate-limit');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
```

### 4. Environment-Specific Configuration

Create `Backend/config/config.js`:
```javascript
module.exports = {
  development: {
    port: 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rebuy',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret',
    frontendUrl: 'http://localhost:3000'
  },
  production: {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    frontendUrl: process.env.FRONTEND_URL
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = module.exports[env];
```

### 5. Secure Password Requirements

Update `Backend/routes/auth.js` to enforce strong passwords:
```javascript
// Password validation
const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};
```

---

## Backend Deployment

### Option 1: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd Backend
   heroku create rebuy-api
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="your-mongodb-uri"
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set FRONTEND_URL="https://your-frontend.com"
   # ... set all other variables
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Production deployment"
   git push heroku main
   ```

6. **View Logs**
   ```bash
   heroku logs --tail
   ```

### Option 2: Deploy to VPS (Ubuntu)

1. **Connect to Server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/your-repo/rebuy.git
   cd rebuy/Backend
   ```

5. **Install Dependencies**
   ```bash
   npm install --production
   ```

6. **Create .env.production**
   ```bash
   nano .env.production
   # Paste your environment variables
   ```

7. **Start with PM2**
   ```bash
   pm2 start server.js --name rebuy-api --env production
   pm2 save
   pm2 startup
   ```

8. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/rebuy-api
   ```

   Add configuration:
   ```nginx
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
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/rebuy-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

## Frontend Deployment

### Option 1: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd Frontend
   vercel --prod
   ```

4. **Set Environment Variables** (in Vercel Dashboard)
   - `REACT_APP_API_URL`
   - `REACT_APP_KHALTI_PUBLIC_KEY`

### Option 2: Deploy to Netlify

1. **Build the app**
   ```bash
   cd Frontend
   npm run build
   ```

2. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=build
   ```

4. **Set Environment Variables** (in Netlify Dashboard)
   - `REACT_APP_API_URL`
   - `REACT_APP_KHALTI_PUBLIC_KEY`

### Option 3: Deploy to VPS with Nginx

1. **Build the app**
   ```bash
   cd Frontend
   npm run build
   ```

2. **Copy build to server**
   ```bash
   scp -r build/* user@your-server:/var/www/rebuy
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/rebuy;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Setup SSL**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Post-Deployment Checklist

### Functionality Testing
- [ ] User registration works
- [ ] User login works
- [ ] Product browsing works
- [ ] Add to cart works
- [ ] Checkout process completes
- [ ] Order creation works
- [ ] Payment gateways work (eSewa, Khalti)
- [ ] Order tracking works
- [ ] Condition verification works
- [ ] Loyalty points system works

### Security Testing
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is active
- [ ] Security headers are set
- [ ] JWT tokens are secure
- [ ] Passwords are hashed
- [ ] Environment variables are not exposed

### Performance Testing
- [ ] Page load times are acceptable (<3s)
- [ ] API response times are fast (<500ms)
- [ ] Images are optimized
- [ ] Database queries are indexed
- [ ] No memory leaks

### Monitoring Setup
- [ ] Setup error logging (e.g., Sentry)
- [ ] Setup uptime monitoring (e.g., UptimeRobot)
- [ ] Setup performance monitoring (e.g., New Relic)
- [ ] Setup database monitoring (MongoDB Atlas)
- [ ] Configure email alerts for errors

### Backup Strategy
- [ ] Enable MongoDB Atlas automated backups
- [ ] Setup regular database exports
- [ ] Backup environment variables securely
- [ ] Document recovery procedures

### Documentation
- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document API endpoints
- [ ] Create user guide

---

## Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
- Check connection string format
- Verify IP whitelist in MongoDB Atlas
- Confirm username/password are correct
- Check network connectivity

**2. CORS Errors**
- Verify `FRONTEND_URL` in backend .env
- Check CORS configuration in server.js
- Ensure credentials are enabled

**3. Payment Gateway Errors**
- Verify merchant codes/keys are correct
- Check callback URLs are accessible
- Test with sandbox/test credentials first
- Review payment gateway logs

**4. JWT Token Issues**
- Verify `JWT_SECRET` is set
- Check token expiration time
- Ensure token is sent in Authorization header
- Verify token format: `Bearer <token>`

**5. Build Errors**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all environment variables are set
- Review build logs for specific errors

---

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/your-repo/rebuy/issues)
- Review the [API Documentation](./API_DOCUMENTATION.md)
- Contact support: support@rebuy.com

---

## License

This project is licensed under the MIT License.
