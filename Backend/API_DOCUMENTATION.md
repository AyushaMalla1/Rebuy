# Rebuy API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.yourdomain.com/api`

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "userType": "customer"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "userType": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400`: Email already exists
- `400`: Invalid email format
- `400`: Missing required fields

---

### POST /auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "userType": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401`: Invalid credentials
- `404`: User not found

---

## Product Endpoints

### GET /products
Get all approved products with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by category (Men, Women, Kids, etc.)
- `condition` (optional): Filter by condition (New, Like New, etc.)
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `search` (optional): Search in name, description, brand
- `limit` (optional): Number of results (default: 20)
- `page` (optional): Page number (default: 1)

**Example:**
```
GET /products?category=Men&minPrice=1000&maxPrice=5000&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Vintage Jacket",
      "description": "Classic denim jacket",
      "price": 8000,
      "category": "Men",
      "condition": "Like New",
      "size": "M",
      "brand": "Levi's",
      "stock": 5,
      "images": ["https://..."],
      "seller": "507f1f77bcf86cd799439012",
      "sellerName": "Fashion Store",
      "rating": 4.5,
      "reviews": 128
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 5
}
```

---

### GET /products/:id
Get single product details.

**Response (200):**
```json
{
  "success": true,
  "product": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Vintage Jacket",
    "description": "Classic denim jacket from the 90s",
    "price": 8000,
    "category": "Men",
    "condition": "Like New",
    "size": "M",
    "brand": "Levi's",
    "stock": 5,
    "images": ["https://..."],
    "seller": {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "Fashion Store",
      "storeName": "Vintage Closet"
    },
    "story": "This jacket has a rich history...",
    "rating": 4.5,
    "reviews": 128,
    "sold": 45
  }
}
```

**Errors:**
- `404`: Product not found

---

## Cart Endpoints

### GET /cart/:customerId
Get customer's cart.

**Response (200):**
```json
{
  "customer": "507f1f77bcf86cd799439011",
  "items": [
    {
      "product": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Vintage Jacket",
        "price": 8000,
        "images": ["https://..."],
        "stock": 5
      },
      "quantity": 2,
      "addedAt": "2026-03-12T10:30:00.000Z"
    }
  ],
  "updatedAt": "2026-03-12T10:30:00.000Z"
}
```

---

### POST /cart/:customerId/add
Add item to cart.

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439012",
  "quantity": 1
}
```

**Response (200):**
```json
{
  "message": "Item added to cart",
  "cart": { /* cart object */ }
}
```

**Errors:**
- `400`: Insufficient stock
- `404`: Product not found

---

### PATCH /cart/:customerId/update
Update item quantity in cart.

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439012",
  "quantity": 3
}
```

**Response (200):**
```json
{
  "message": "Cart updated",
  "cart": { /* cart object */ }
}
```

---

### DELETE /cart/:customerId/remove/:productId
Remove item from cart.

**Response (200):**
```json
{
  "message": "Item removed from cart",
  "cart": { /* cart object */ }
}
```

---

### DELETE /cart/:customerId/clear
Clear entire cart.

**Response (200):**
```json
{
  "message": "Cart cleared",
  "cart": { /* empty cart */ }
}
```

---

## Order Endpoints

### POST /orders
Create new order.

**Request Body:**
```json
{
  "customerId": "507f1f77bcf86cd799439011",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+9779812345678",
  "items": [
    {
      "product": "507f1f77bcf86cd799439012",
      "productName": "Vintage Jacket",
      "productImage": "https://...",
      "seller": "507f1f77bcf86cd799439013",
      "sellerName": "Fashion Store",
      "storeName": "Vintage Closet",
      "quantity": 1,
      "price": 8000,
      "subtotal": 8000
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+9779812345678",
    "address": "Thamel, Kathmandu",
    "city": "Kathmandu",
    "postalCode": "44600"
  },
  "paymentMethod": "cod",
  "subtotal": 8000,
  "shippingCost": 0,
  "total": 8000,
  "customerNotes": "Please deliver before 5 PM"
}
```

**Response (201):**
```json
{
  "message": "Order placed successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "customer": "507f1f77bcf86cd799439011",
    "items": [...],
    "status": "Processing",
    "paymentStatus": "Pending",
    "trackingNumber": "TRK1710234567890",
    "estimatedDelivery": "2026-03-19T00:00:00.000Z",
    "total": 8000
  },
  "pointsEarned": 80
}
```

**Errors:**
- `400`: Insufficient stock
- `400`: Missing required fields
- `404`: Product not found

---

### GET /orders/customer/:customerId
Get all orders for a customer.

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "customer": "507f1f77bcf86cd799439011",
    "items": [...],
    "status": "Delivered",
    "paymentStatus": "Paid",
    "trackingNumber": "TRK1710234567890",
    "total": 8000,
    "orderDate": "2026-03-12T10:30:00.000Z",
    "deliveredAt": "2026-03-18T14:20:00.000Z"
  }
]
```

---

### GET /orders/:orderId
Get single order details.

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "customer": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  "items": [
    {
      "product": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Vintage Jacket",
        "images": ["https://..."]
      },
      "quantity": 1,
      "price": 8000
    }
  ],
  "shippingAddress": {...},
  "status": "Delivered",
  "trackingNumber": "TRK1710234567890",
  "total": 8000
}
```

---

### PATCH /orders/:orderId/status
Update order status (Admin/Seller only).

**Request Body:**
```json
{
  "status": "Shipped",
  "trackingNumber": "TRK1710234567890"
}
```

**Response (200):**
```json
{
  "message": "Order status updated",
  "order": { /* updated order */ }
}
```

---

### POST /orders/:orderId/verify-condition
Post-purchase condition verification.

**Request Body:**
```json
{
  "matchesDescription": true,
  "customerNotes": "Product is exactly as described",
  "images": ["https://..."]
}
```

**Response (200):**
```json
{
  "message": "Condition verification submitted",
  "order": { /* updated order */ },
  "bonusPoints": 50
}
```

**Errors:**
- `400`: Order not delivered yet
- `400`: Already verified

---

### POST /orders/:orderId/cancel
Cancel order (customer-initiated).

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Response (200):**
```json
{
  "message": "Order cancelled successfully",
  "order": { /* cancelled order */ }
}
```

**Errors:**
- `400`: Cannot cancel at this stage (only Processing/Confirmed can be cancelled)

---

## Loyalty Points Endpoints

### GET /loyalty/:customerId
Get customer loyalty points and history.

**Response (200):**
```json
{
  "success": true,
  "loyaltyData": {
    "customer": "507f1f77bcf86cd799439011",
    "totalPoints": 1250,
    "tier": "Silver",
    "pointsHistory": [
      {
        "points": 500,
        "type": "earned",
        "reason": "Welcome bonus",
        "date": "2026-03-01T00:00:00.000Z"
      },
      {
        "points": 80,
        "type": "earned",
        "reason": "Purchase - Order 507f1f77bcf86cd799439014",
        "order": "507f1f77bcf86cd799439014",
        "date": "2026-03-12T10:30:00.000Z"
      },
      {
        "points": 50,
        "type": "earned",
        "reason": "Condition verification bonus",
        "order": "507f1f77bcf86cd799439014",
        "date": "2026-03-18T15:00:00.000Z"
      }
    ]
  }
}
```

---

### POST /loyalty/:customerId/redeem
Redeem loyalty points.

**Request Body:**
```json
{
  "points": 100,
  "reason": "Discount on next purchase"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Points redeemed successfully",
  "remainingPoints": 1150,
  "tier": "Silver"
}
```

**Errors:**
- `400`: Insufficient points

---

## Loyalty Tiers

| Tier | Points Required | Benefits |
|------|----------------|----------|
| Bronze | 0 - 999 | Basic rewards |
| Silver | 1,000 - 2,999 | 5% discount |
| Gold | 3,000 - 4,999 | 10% discount + free shipping |
| Platinum | 5,000+ | 15% discount + priority support |

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

When rate limit is exceeded:
```json
{
  "message": "Too many requests, please try again later."
}
```

---

## Postman Collection

Import this collection to test all endpoints:

[Download Postman Collection](./postman_collection.json)

---

## Webhooks (Future Feature)

Coming soon: Webhooks for order status updates, payment confirmations, and inventory changes.

---

## Support

For API support:
- Email: api-support@rebuy.com
- Documentation: https://docs.rebuy.com
- Status Page: https://status.rebuy.com
