# Developer Guide - Rebuy Customer/Buyer System

## Project Overview

Full-stack thrift e-commerce platform with customer/buyer functionality.

**Tech Stack:**
- Frontend: React.js, React Router, Axios
- Backend: Node.js, Express.js, MongoDB
- Authentication: JWT
- Payments: eSewa, Khalti, COD, Card

---

## Setup Instructions

### Prerequisites
```bash
Node.js >= 14.x
MongoDB >= 4.x
npm or yarn
```

### Backend Setup
```bash
cd Backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values:
# MONGODB_URI=mongodb://localhost:27017/rebuy
# JWT_SECRET=your_secret_key
# PORT=5000

# Seed database
node seedProducts.js

# Start server
npm start
```

### Frontend Setup
```bash
cd Frontend
npm install

# Start development server
npm start
```

---

## Project Structure

```
Backend/
├── models/          # Mongoose schemas
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   ├── Cart.js
│   ├── LoyaltyPoints.js
│   ├── Review.js
│   └── Wishlist.js
├── routes/          # API endpoints
│   ├── auth.js
│   ├── products.js
│   ├── orders.js
│   ├── cart.js
│   ├── loyalty.js
│   ├── reviews.js
│   └── wishlist.js
├── utils/           # Utilities
│   └── emailService.js
├── config/          # Configuration
│   └── cloudinary.js
└── server.js        # Entry point

Frontend/
├── src/
│   ├── components/  # Reusable components
│   │   └── Chatbot.js
│   ├── services/    # API layer
│   │   └── api.js
│   ├── LandingPage.js
│   ├── ProductDetail.js
│   ├── Checkout.js
│   ├── BuyerProfile.js
│   ├── Login.js
│   ├── Signup.js
│   └── App.js
└── public/
```

---

## Code Conventions

### JavaScript/React
- Use functional components with hooks
- camelCase for variables and functions
- PascalCase for components
- Destructure props
- Use async/await for promises

### CSS
- BEM naming convention
- Mobile-first responsive design
- Use CSS variables for colors

### API
- RESTful endpoints
- Consistent error responses
- JWT in Authorization header

---

## Database Schema

### User
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  userType: Enum ['customer', 'seller', 'admin'],
  phone: String,
  address: String,
  city: String
}
```

### Product
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: Enum,
  condition: Enum,
  size: String,
  brand: String,
  stock: Number,
  images: [String],
  seller: ObjectId,
  status: Enum ['Pending', 'Approved', 'Rejected'],
  story: String,
  rating: Number,
  reviews: Number
}
```

### Order
```javascript
{
  customer: ObjectId,
  items: [{
    product: ObjectId,
    quantity: Number,
    price: Number
  }],
  shippingAddress: Object,
  paymentMethod: String,
  status: Enum,
  conditionVerification: Object,
  total: Number
}
```

---

## API Endpoints

### Authentication
```
POST /api/auth/signup
POST /api/auth/login
```

### Products
```
GET /api/products
GET /api/products/:id
```

### Cart
```
GET /api/cart/:customerId
POST /api/cart/:customerId/add
PUT /api/cart/:customerId/update
DELETE /api/cart/:customerId/remove/:productId
DELETE /api/cart/:customerId/clear
```

### Orders
```
POST /api/orders
GET /api/orders/customer/:customerId
GET /api/orders/:orderId
PUT /api/orders/:orderId/status
POST /api/orders/:orderId/verify-condition
PUT /api/orders/:orderId/cancel
```

### Loyalty
```
GET /api/loyalty/:customerId
POST /api/loyalty/:customerId/redeem
```

### Reviews
```
GET /api/reviews/product/:productId
POST /api/reviews
PUT /api/reviews/:reviewId/helpful
```

### Wishlist
```
GET /api/wishlist/:customerId
POST /api/wishlist/:customerId/add
DELETE /api/wishlist/:customerId/remove/:productId
```

---

## Testing

### Manual Testing
```bash
# Backend
cd Backend
npm test

# Frontend
cd Frontend
npm test
```

### Test User Flows
1. Registration → Login
2. Browse Products → Add to Cart
3. Checkout → Place Order
4. Track Order → Verify Condition
5. Earn Loyalty Points

---

## Deployment

See `PRODUCTION_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

### Quick Deploy

**Backend (Heroku)**
```bash
heroku create rebuy-backend
heroku addons:create mongolab
git push heroku main
```

**Frontend (Vercel)**
```bash
vercel --prod
```

---

## Common Issues

### CORS Errors
- Check CORS configuration in server.js
- Verify frontend origin is whitelisted

### Cart Sync Issues
- Ensure user is logged in
- Check localStorage and backend sync

### Payment Gateway
- Use test credentials in development
- Switch to production keys for live

---

## Performance Optimization

### Frontend
- Lazy load images
- Code splitting with React.lazy
- Debounce search input
- Minimize re-renders

### Backend
- Database indexing
- Query optimization
- Caching with Redis (optional)
- Rate limiting

---

## Security Best Practices

- Never commit .env files
- Use HTTPS in production
- Validate all inputs
- Sanitize user data
- Rate limit API endpoints
- Use secure JWT secrets

---

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## Support

For issues or questions:
- Check documentation
- Review API_DOCUMENTATION.md
- See TESTING_GUIDE.md

---

**Last Updated:** March 13, 2026
