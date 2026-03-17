# Testing Guide - Customer/Buyer System

## ✅ System is Ready!

All backend and frontend files have been updated to work together.

## 🚀 Start the Application

### 1. Start Backend Server
```bash
cd Backend
npm start
```
Server will run on: http://localhost:5000

### 2. Start Frontend (New Terminal)
```bash
cd Frontend
npm start
```
App will run on: http://localhost:3000

## 📝 Test the Complete Customer Journey

### Step 1: Create Customer Account
1. Go to http://localhost:3000/signup
2. Fill in:
   - Full Name: Test Customer
   - Email: test@gmail.com
   - Password: 123456
   - Confirm Password: 123456
   - Check "I agree to Terms & Conditions"
3. Click "Create Account"
4. You should see "Account created successfully!"
5. You'll be redirected to the landing page

### Step 2: Browse Products
1. On landing page, you'll see products
2. Products are fetched from backend (or demo products if DB is empty)
3. Try filtering: ALL, NEW ARRIVALS, BEST SELLER, TOP RATED
4. Click heart icon to add to favorites

### Step 3: Add to Cart
1. Click "Add to Cart" on any product
2. Cart icon in header shows item count
3. Click cart icon to see cart dropdown
4. Adjust quantities with +/- buttons

### Step 4: Checkout
1. Click "Proceed to Checkout" in cart dropdown
2. Fill shipping address:
   - Full Name
   - Phone Number
   - Address
   - City
3. Click "Continue to Payment"
4. Select payment method (COD, eSewa, Khalti, or Card)
5. Click "Review Order"
6. Click "Place Order"

### Step 5: View Orders
1. After order placed, you'll be redirected to profile
2. Go to "Orders" tab
3. See your order with:
   - Order ID
   - Status (Processing)
   - Tracking number
   - Estimated delivery
4. Click "View Details" to see full order info

### Step 6: Verify Condition (After Delivery)
1. When order status is "Delivered"
2. Click "Verify Condition" button
3. Confirm if item matches description
4. Add notes if needed
5. Earn 50 bonus loyalty points!

### Step 7: Check Loyalty Points
1. Go to Profile tab
2. See loyalty points display
3. Points earned:
   - 500 welcome bonus
   - 1 point per Rs. 100 spent
   - 50 bonus for condition verification

## 🎯 What's Working

### Backend:
- ✅ User signup/login with JWT authentication
- ✅ Product API (get all, search, filter)
- ✅ Cart API (add, update, remove)
- ✅ Order API (create, get, update status, verify condition)
- ✅ Loyalty API (get points, redeem)

### Frontend:
- ✅ Signup page (creates customer account)
- ✅ Login page (customer/seller tabs)
- ✅ Landing page (fetches real products)
- ✅ Shopping cart (syncs with backend)
- ✅ Checkout (creates orders in DB)
- ✅ Buyer profile (shows real orders & loyalty points)
- ✅ Condition verification (earns bonus points)

### Database Collections:
- ✅ users - Customer accounts
- ✅ sellers - Seller accounts (separate)
- ✅ products - Product listings
- ✅ orders - Order records
- ✅ carts - Shopping carts
- ✅ loyaltypoints - Points tracking

## 🔍 Check Backend Logs

Watch the backend terminal for:
```
MongoDB connected successfully
Server running on port 5000
POST /api/auth/signup 201
POST /api/orders 201
GET /api/products 200
```

## 🐛 Troubleshooting

### "Server error" on signup:
- Check backend is running
- Check MongoDB is connected
- Check backend terminal for errors

### Products not showing:
- Backend might have no products
- Demo products will show as fallback
- Check browser console for errors

### Cart not syncing:
- Make sure you're logged in
- Check localStorage has user data
- Check network tab for API calls

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ Signup creates account in MongoDB users collection
2. ✅ Login returns JWT token
3. ✅ Products load on landing page
4. ✅ Cart shows items
5. ✅ Checkout creates order in MongoDB orders collection
6. ✅ Profile shows real orders from database
7. ✅ Loyalty points display correctly
8. ✅ Condition verification awards bonus points

## 📊 Check MongoDB

Open MongoDB Compass and check:
- **users** collection - Should have your test customer
- **orders** collection - Should have your test order
- **loyaltypoints** collection - Should have your points record
- **carts** collection - Should have your cart items

## 🎁 Features to Test

1. **Browse & Search** - Filter products, search by name
2. **Shopping Cart** - Add, update quantities, remove items
3. **Checkout** - Multiple payment methods
4. **Order Tracking** - View order status and details
5. **Condition Verification** - Verify delivered items
6. **Loyalty Rewards** - Earn and track points
7. **Profile Management** - Update personal info
8. **Wishlist** - Save favorite products

## ✨ Everything is Connected!

Frontend → API Service → Backend Routes → MongoDB

The complete customer/buyer system is fully functional!
