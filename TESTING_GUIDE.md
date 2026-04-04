# ReBuy Testing Guide

This document provides instructions for running all automated tests for the ReBuy platform.

## Testing Frameworks Used

1. **Jest** - JavaScript/Node.js unit and integration testing
2. **Postman** - API endpoint testing
3. **PyTest** - Python AI Chatbot testing
4. **Manual Testing** - UI/UX and end-to-end testing

---

## 1. Jest Testing (Backend & Frontend)

### Setup
```bash
cd Backend
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- models/Order.test.js
npm test -- utils/discount.test.js
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Current Test Files
- `models/Order.test.js` - Order model validation tests
- `models/Product.test.js` - Product model validation tests
- `models/Seller.test.js` - Seller model validation tests
- `utils/discount.test.js` - Discount calculation tests
- `utils/paymentOptions.test.js` - Payment options validation tests
- `routes/auth.test.js` - Authentication API tests
- `routes/products.test.js` - Product API tests

### Test Results Summary
- **Total Tests**: 109
- **Passing**: 95 ✅
- **Failing**: 14 ❌ (mostly database connection issues)

---

## 2. Postman API Testing

### Setup
1. Install Postman from https://www.postman.com/downloads/
2. Import the collection file: `Backend/postman_collection.json`

### Import Collection
1. Open Postman
2. Click "Import" button
3. Select `Backend/postman_collection.json`
4. Collection will appear in your workspace

### Environment Variables
Set these variables in Postman:
- `base_url`: http://localhost:5000
- `auth_token`: (obtained from login request)
- `admin_token`: (obtained from admin login)
- `customer_id`: (obtained from registration)
- `seller_id`: (obtained from seller registration)
- `product_id`: (obtained from product creation)
- `order_id`: (obtained from order creation)

### Test Endpoints

#### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

#### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get product by ID
- POST `/api/products` - Create product (requires auth)
- PUT `/api/products/:id` - Update product (requires auth)
- DELETE `/api/products/:id` - Delete product (requires auth)

#### Orders
- POST `/api/orders` - Create order
- GET `/api/orders/customer/:customerId` - Get customer orders
- PATCH `/api/orders/:id/status` - Update order status

#### Payment
- POST `/api/payment/initiate` - Initiate eSewa payment

#### Admin
- GET `/api/admin/users` - Get all users (admin only)
- PATCH `/api/admin/sellers/:id/verify` - Verify seller (admin only)
- GET `/api/admin/stats` - Get platform statistics (admin only)

#### Chatbot
- POST `/api/chatbot/query` - Send message to chatbot

### Running Tests
1. Start the backend server: `cd Backend && npm run dev`
2. Open Postman
3. Select a request from the collection
4. Click "Send"
5. Verify response status and data

---

## 3. PyTest (AI Chatbot Testing)

### Setup
```bash
cd AIChatbot
pip install -r requirements.txt
pip install pytest requests
```

### Run All Tests
```bash
pytest test_chatbot.py -v
```

### Run Specific Test Class
```bash
pytest test_chatbot.py::TestChatbotAPI -v
pytest test_chatbot.py::TestChatbotAccuracy -v
pytest test_chatbot.py::TestChatbotPerformance -v
```

### Run with Coverage
```bash
pytest test_chatbot.py --cov=chatbot_server --cov-report=html
```

### Test Categories

#### API Tests
- Server health check
- Query endpoint validation
- Role-based queries (customer, seller, admin)
- Response time validation
- Error handling (empty messages, invalid roles, etc.)

#### Accuracy Tests
- Payment options accuracy
- Shipping information accuracy
- Product recommendation accuracy

#### Performance Tests
- Concurrent request handling
- Average response time
- Load testing

### Prerequisites
- Chatbot server must be running on port 5001
- Backend server must be running on port 5000

### Start Chatbot Server
```bash
cd AIChatbot
python chatbot_server.py
```

---

## 4. Manual Testing Checklist

### User Management
- [ ] Register as customer
- [ ] Register as seller
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Password reset functionality
- [ ] Profile image upload
- [ ] 2FA enable/disable
- [ ] Account deactivation
- [ ] Account deletion

### Product Management
- [ ] Create product listing
- [ ] Upload product images
- [ ] Add condition tags
- [ ] Set discount
- [ ] Update product
- [ ] Delete product
- [ ] Search products
- [ ] Filter by category

### Order Management
- [ ] Add items to cart
- [ ] Update cart quantities
- [ ] Remove from cart
- [ ] Checkout process
- [ ] eSewa payment
- [ ] Cash on Delivery
- [ ] Order tracking
- [ ] Order cancellation

### Admin Features
- [ ] Seller verification
- [ ] User management
- [ ] Platform statistics
- [ ] Fraud detection
- [ ] Announcements

### AI Chatbot
- [ ] Customer queries
- [ ] Seller queries
- [ ] Admin queries
- [ ] Product recommendations
- [ ] Order tracking assistance

---

## Test Coverage Goals

### Current Coverage
- **Backend Models**: 85%
- **Backend Routes**: 70%
- **Backend Utils**: 90%
- **Frontend Components**: 60%
- **AI Chatbot**: 75%

### Target Coverage
- **Backend Models**: 95%
- **Backend Routes**: 85%
- **Backend Utils**: 95%
- **Frontend Components**: 80%
- **AI Chatbot**: 90%

---

## Common Issues & Solutions

### Jest Tests Failing
**Issue**: Database connection timeout
**Solution**: Ensure MongoDB is running or mock database calls

**Issue**: Email service errors
**Solution**: Mock email service in tests or configure SMTP properly

### Postman Tests Failing
**Issue**: 401 Unauthorized
**Solution**: Ensure auth_token is set in environment variables

**Issue**: 404 Not Found
**Solution**: Verify backend server is running and base_url is correct

### PyTest Failing
**Issue**: Connection refused
**Solution**: Ensure chatbot server is running on port 5001

**Issue**: Timeout errors
**Solution**: Increase timeout values or check server performance

---

## Continuous Integration

### GitHub Actions (Future)
```yaml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run Jest tests
        run: npm test
      - name: Run PyTest
        run: pytest AIChatbot/test_chatbot.py
```

---

## Test Reports

### Generate Jest Coverage Report
```bash
cd Backend
npm test -- --coverage --coverageReporters=html
```
Report will be in `Backend/coverage/index.html`

### Generate PyTest Coverage Report
```bash
cd AIChatbot
pytest test_chatbot.py --cov=chatbot_server --cov-report=html
```
Report will be in `AIChatbot/htmlcov/index.html`

---

## Contact

For testing issues or questions:
- Email: A.Malla@wlv.ac.uk
- Supervisor: Niraj Singh

---

**Last Updated**: March 6, 2026
**Version**: 1.0
