# Product Image Upload Guide

## Current Situation
Right now, products use Pinterest URLs for images. For a real thrift website, you need proper image hosting.

## Recommended Solution: Cloudinary

Cloudinary is free for up to 25GB storage and perfect for e-commerce.

### Step 1: Setup Cloudinary Account
1. Go to https://cloudinary.com/
2. Sign up for free account
3. Get your credentials:
   - Cloud Name
   - API Key
   - API Secret

### Step 2: Install Dependencies

```bash
cd Backend
npm install cloudinary multer multer-storage-cloudinary
```

### Step 3: Add to Backend/.env

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Create Image Upload Route

I'll create this file for you: `Backend/config/cloudinary.js`

### Step 5: Update Product Routes

Add image upload to product creation route.

## Alternative: Local Storage (Development Only)

For testing, you can store images locally:

```bash
cd Backend
npm install multer
```

Create `Backend/uploads/` folder for images.

## For Production:

Use Cloudinary or AWS S3 for:
- ✅ Fast image delivery (CDN)
- ✅ Automatic image optimization
- ✅ Responsive images
- ✅ Secure storage
- ✅ No server storage limits

## Current Demo Products

The demo products in LandingPage.js use Pinterest URLs. Once sellers upload real products with Cloudinary, those will replace the demo products.

## Product Image Flow:

1. **Seller uploads product** → Images go to Cloudinary
2. **Cloudinary returns URL** → Saved in MongoDB
3. **Customer browses** → Images load from Cloudinary CDN
4. **Fast & Secure** → Professional image hosting

Would you like me to implement the Cloudinary integration now?
