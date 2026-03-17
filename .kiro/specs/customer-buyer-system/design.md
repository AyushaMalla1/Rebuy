# Design Document: Customer/Buyer System

## 1. System Overview

The Customer/Buyer System is the core customer-facing subsystem of the Rebuy multi-vendor thrift e-commerce platform. It enables customers to discover sustainable thrift fashion from multiple vendors, make purchases through various payment methods, track orders, verify product conditions post-purchase, and earn loyalty rewards.

### 1.1 Technology Stack
- **Frontend:** React.js with React Router
- **Backend:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Payment Integration:** eSewa, Khalti, COD, Card payments
- **State Management:** React Hooks (useState, useEffect)
- **Styling:** CSS3 with modular component styles

### 1.2 Key Design Principles
- **Trust & Transparency:** Post-purchase condition verification builds trust
- **Sustainability Focus:** Emphasize thrift fashion and second-hand marketplace
- **User-Centric:** Intuitive navigation and seamless shopping experience
- **Scalability:** Multi-vendor architecture supporting multiple sellers
- **Security:** Secure authentication, payment processing, and data protection

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer (React)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │ Product  │  │ Checkout │  │  Buyer   │   │
│  │   Page   │  │  Detail  │  │   Page   │  │ Profile  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │   API Layer   │
                    │ (services/api)│
                    └───────┬───────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Backend Layer (Express)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │ Products │  │  Orders  │  │ Loyalty  │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer (MongoDB)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │ Products │  │  Orders  │  │ Loyalty  │   │
│  │Collection│  │Collection│  │Collection│  │ Points   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```


### 2.2 Component Architecture

#### Frontend Components Hierarchy
```
App.js (Root Router)
├── LandingPage.js (Product Discovery)
│   ├── Header (Navigation, Search, Cart)
│   ├── Hero Section
│   ├── Product Grid
│   ├── Category Sections
│   ├── FAQ Section
│   ├── Footer
│   └── Chatbot Component
├── ProductDetail.js (Single Product View)
├── Checkout.js (Multi-step Checkout)
│   ├── Shipping Address Form
│   ├── Payment Method Selection
│   └── Order Review
└── BuyerProfile.js (Customer Dashboard)
    ├── Profile Tab
    ├── Orders Tab
    ├── Wishlist Tab
    ├── Messages Tab
    └── Settings Tab
```

## 3. Data Models

### 3.1 User Model
```javascript
{
  fullName: String (required),
  email: String (required, unique, validated),
  password: String (required, hashed with bcrypt),
  userType: Enum ['customer', 'buyer', 'admin'],
  phone: String,
  address: String,
  city: String,
  createdAt: Date
}
```

**Key Features:**
- Password hashing with bcrypt (salt rounds: 10)
- Email validation with regex
- Role-based access control
- comparePassword method for authentication

### 3.2 Product Model
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required, min: 0),
  category: Enum ['Men', 'Women', 'Kids', 'Accessories', 'Shoes', 'Bags', 'Other'],
  condition: Enum ['New', 'Like New', 'Slightly Used', 'Vintage'],
  size: String (required),
  brand: String (default: 'Unbranded'),
  stock: Number (required, min: 0),
  images: [String] (required),
  seller: ObjectId (ref: 'User'),
  sellerName: String,
  storeName: String,
  status: Enum ['Pending', 'Approved', 'Rejected'],
  story: String (product history/background),
  rating: Number (0-5),
  reviews: Number,
  sold: Number,
  featured: Boolean,
  tags: [String],
  timestamps: true
}
```

**Key Features:**
- Text search index on name, description, brand
- Multi-vendor support with seller reference
- Product storytelling for authenticity
- Condition transparency


### 3.3 Order Model
```javascript
{
  // Customer Information
  customer: ObjectId (ref: 'User', required),
  customerName: String (required),
  customerEmail: String (required),
  customerPhone: String (required),
  
  // Order Items
  items: [{
    product: ObjectId (ref: 'Product'),
    productName: String,
    productImage: String,
    seller: ObjectId (ref: 'User'),
    sellerName: String,
    storeName: String,
    quantity: Number (min: 1),
    price: Number,
    subtotal: Number
  }],
  
  // Shipping Information
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String
  },
  
  // Payment Information
  paymentMethod: Enum ['cod', 'esewa', 'khalti', 'card'],
  paymentStatus: Enum ['Pending', 'Paid', 'Failed', 'Refunded'],
  transactionId: String,
  
  // Order Totals
  subtotal: Number (required),
  shippingCost: Number (default: 0),
  total: Number (required),
  
  // Order Status
  status: Enum ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
  trackingNumber: String,
  estimatedDelivery: Date,
  
  // Condition Verification (Post-Purchase)
  conditionVerification: {
    verified: Boolean (default: false),
    verifiedAt: Date,
    matchesDescription: Boolean,
    customerNotes: String,
    images: [String]
  },
  
  // Timestamps
  orderDate: Date (default: now),
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  
  // Notes
  customerNotes: String,
  adminNotes: String
}
```

**Key Features:**
- Multi-item orders from multiple sellers
- Complete order lifecycle tracking
- Post-purchase condition verification
- Flexible payment methods
- Comprehensive audit trail

### 3.4 Cart Model
```javascript
{
  customer: ObjectId (ref: 'User', required, unique),
  items: [{
    product: ObjectId (ref: 'Product', required),
    quantity: Number (min: 1, default: 1),
    addedAt: Date (default: now)
  }],
  updatedAt: Date (default: now)
}
```

**Key Features:**
- One cart per customer
- Persistent cart storage
- Automatic timestamp updates


### 3.5 LoyaltyPoints Model
```javascript
{
  customer: ObjectId (ref: 'User', required, unique),
  totalPoints: Number (default: 0, min: 0),
  pointsHistory: [{
    points: Number (required),
    type: Enum ['earned', 'redeemed', 'expired'],
    reason: String (required),
    order: ObjectId (ref: 'Order'),
    date: Date (default: now)
  }],
  tier: Enum ['Bronze', 'Silver', 'Gold', 'Platinum'] (default: 'Bronze')
}
```

**Key Features:**
- Automatic tier calculation based on points
- Complete points history tracking
- Order reference for earned points
- Tier thresholds:
  - Bronze: 0-999 points
  - Silver: 1,000-2,999 points
  - Gold: 3,000-4,999 points
  - Platinum: 5,000+ points

## 4. API Design

### 4.1 Authentication Endpoints

#### POST /api/auth/signup
**Purpose:** Register new customer account

**Request Body:**
```javascript
{
  fullName: String,
  email: String,
  password: String,
  userType: String (default: 'customer')
}
```

**Response:**
```javascript
{
  success: true,
  message: "User registered successfully",
  user: { _id, fullName, email, userType },
  token: "JWT_TOKEN"
}
```

**Business Logic:**
- Validate email format
- Check for duplicate email
- Hash password with bcrypt
- Award 500 welcome bonus points
- Generate JWT token

#### POST /api/auth/login
**Purpose:** Authenticate customer

**Request Body:**
```javascript
{
  email: String,
  password: String
}
```

**Response:**
```javascript
{
  success: true,
  message: "Login successful",
  user: { _id, fullName, email, userType },
  token: "JWT_TOKEN"
}
```

**Business Logic:**
- Validate credentials
- Compare hashed password
- Generate JWT token
- Return user data


### 4.2 Product Endpoints

#### GET /api/products
**Purpose:** Browse all approved products

**Query Parameters:**
```javascript
{
  category: String (optional),
  condition: String (optional),
  minPrice: Number (optional),
  maxPrice: Number (optional),
  search: String (optional),
  limit: Number (optional),
  page: Number (optional)
}
```

**Response:**
```javascript
{
  success: true,
  products: [Product],
  total: Number,
  page: Number,
  pages: Number
}
```

**Business Logic:**
- Filter by status: 'Approved' only
- Apply category/condition filters
- Price range filtering
- Text search on name, description, brand
- Pagination support

#### GET /api/products/:id
**Purpose:** Get single product details

**Response:**
```javascript
{
  success: true,
  product: Product (with populated seller info)
}
```

**Business Logic:**
- Populate seller information
- Return 404 if not found
- Only show approved products

### 4.3 Cart Endpoints

#### GET /api/cart/:customerId
**Purpose:** Get customer's cart

**Response:**
```javascript
{
  success: true,
  cart: Cart (with populated product details)
}
```

#### POST /api/cart/:customerId/add
**Purpose:** Add item to cart

**Request Body:**
```javascript
{
  productId: String,
  quantity: Number
}
```

**Response:**
```javascript
{
  success: true,
  message: "Item added to cart",
  cart: Cart
}
```

**Business Logic:**
- Check product stock availability
- If item exists, increment quantity
- If new item, add to cart
- Update cart timestamp

#### PUT /api/cart/:customerId/update
**Purpose:** Update item quantity

**Request Body:**
```javascript
{
  productId: String,
  quantity: Number
}
```

**Business Logic:**
- Validate stock availability
- Update quantity or remove if 0
- Return updated cart

#### DELETE /api/cart/:customerId/remove/:productId
**Purpose:** Remove item from cart

**Response:**
```javascript
{
  success: true,
  message: "Item removed from cart",
  cart: Cart
}
```

#### DELETE /api/cart/:customerId/clear
**Purpose:** Clear entire cart

**Response:**
```javascript
{
  success: true,
  message: "Cart cleared"
}
```


### 4.4 Order Endpoints

#### POST /api/orders
**Purpose:** Create new order

**Request Body:**
```javascript
{
  customerId: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  items: [{
    product: String,
    productName: String,
    productImage: String,
    seller: String,
    sellerName: String,
    storeName: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String
  },
  paymentMethod: String,
  subtotal: Number,
  shippingCost: Number,
  total: Number,
  customerNotes: String
}
```

**Response:**
```javascript
{
  success: true,
  message: "Order placed successfully",
  order: Order,
  pointsEarned: Number
}
```

**Business Logic:**
1. Validate product stock for all items
2. Reduce product stock
3. Increment product sold count
4. Generate tracking number
5. Calculate estimated delivery (7 days)
6. Set payment status based on method
7. Award loyalty points (1 point per Rs. 100)
8. Clear customer's cart
9. Return order details

#### GET /api/orders/customer/:customerId
**Purpose:** Get all customer orders

**Response:**
```javascript
{
  success: true,
  orders: [Order] (sorted by orderDate desc)
}
```

**Business Logic:**
- Populate product and seller details
- Sort by most recent first
- Return all orders for customer

#### GET /api/orders/:orderId
**Purpose:** Get single order details

**Response:**
```javascript
{
  success: true,
  order: Order (with populated details)
}
```

#### PUT /api/orders/:orderId/status
**Purpose:** Update order status (Admin/Seller)

**Request Body:**
```javascript
{
  status: String,
  trackingNumber: String (optional)
}
```

**Response:**
```javascript
{
  success: true,
  message: "Order status updated",
  order: Order
}
```

**Business Logic:**
- Update status
- Set appropriate timestamp (confirmedAt, shippedAt, deliveredAt)
- Update tracking number if provided


#### POST /api/orders/:orderId/verify-condition
**Purpose:** Post-purchase condition verification

**Request Body:**
```javascript
{
  matchesDescription: Boolean,
  customerNotes: String,
  images: [String] (optional)
}
```

**Response:**
```javascript
{
  success: true,
  message: "Condition verified successfully",
  order: Order,
  bonusPointsAwarded: Number (50 if positive)
}
```

**Business Logic:**
1. Verify order is delivered
2. Check not already verified
3. Update conditionVerification object
4. If matchesDescription is true:
   - Award 50 bonus loyalty points
   - Add to points history
5. If false:
   - Flag for admin review
   - No bonus points
6. Return updated order

#### PUT /api/orders/:orderId/cancel
**Purpose:** Cancel order (customer-initiated)

**Request Body:**
```javascript
{
  reason: String (optional)
}
```

**Response:**
```javascript
{
  success: true,
  message: "Order cancelled successfully",
  order: Order
}
```

**Business Logic:**
- Only allow if status is 'Processing' or 'Confirmed'
- Restore product stock
- Update status to 'Cancelled'
- Set cancelledAt timestamp
- Refund loyalty points if already awarded

### 4.5 Loyalty Points Endpoints

#### GET /api/loyalty/:customerId
**Purpose:** Get customer loyalty points

**Response:**
```javascript
{
  success: true,
  loyaltyData: {
    totalPoints: Number,
    tier: String,
    pointsHistory: [History]
  }
}
```

**Business Logic:**
- Create loyalty record if doesn't exist
- Calculate and update tier
- Return complete loyalty data

#### POST /api/loyalty/:customerId/redeem
**Purpose:** Redeem loyalty points

**Request Body:**
```javascript
{
  points: Number,
  reason: String
}
```

**Response:**
```javascript
{
  success: true,
  message: "Points redeemed successfully",
  remainingPoints: Number,
  tier: String
}
```

**Business Logic:**
- Validate sufficient points
- Deduct points from total
- Add to points history (type: 'redeemed')
- Recalculate tier
- Return updated balance


## 5. User Interface Design

### 5.1 Landing Page (Product Discovery)

**Layout:**
- Header with logo, search bar, navigation links, cart icon, user menu
- Collections navigation (Men's, Women's, Kid's, Sportswear, Vintage)
- Hero section with call-to-action
- Trending products grid with filters (All, New Arrivals, Best Seller, Top Rated)
- Category sections
- FAQ section
- Footer with links and information
- Floating chatbot

**Key Features:**
- Real-time product search
- Cart dropdown with quantity controls
- Favorite/wishlist toggle
- Product cards with image, name, rating, price
- "Add to Cart" functionality
- Responsive grid layout
- Loading states

**User Interactions:**
- Click product card → Navigate to ProductDetail
- Click "Add to Cart" → Add item and show confirmation
- Click cart icon → Show cart dropdown
- Click heart icon → Toggle wishlist
- Search → Filter products in real-time
- Filter tabs → Show filtered products

### 5.2 Product Detail Page

**Layout:**
- Product image gallery
- Product information (name, price, condition, size, brand)
- Product story/history
- Seller information
- Stock availability
- Add to cart button
- Related products

**Key Features:**
- Image zoom/carousel
- Condition badge
- Seller profile link
- Stock indicator
- Size guide
- Share buttons


### 5.3 Checkout Page (Multi-Step Process)

**Step 1: Shipping Address**
- Form fields: Full Name, Phone, Address, City, Postal Code
- Address validation
- Save address option
- Continue to payment button

**Step 2: Payment Method**
- Payment options:
  - eSewa (with logo)
  - Khalti (with logo)
  - Credit/Debit Card
  - Cash on Delivery
- Radio button selection
- Payment method descriptions
- Back and Continue buttons

**Step 3: Review Order**
- Shipping address summary (with edit button)
- Payment method summary (with edit button)
- Order items list
- Order summary sidebar
- Place Order button

**Sidebar (All Steps):**
- Order summary card
- Item thumbnails with quantities
- Subtotal calculation
- Shipping cost (free over Rs. 2000)
- Total amount
- Free shipping indicator

**Payment Modal (eSewa/Khalti):**
- Payment gateway logo
- Amount to pay
- Payment information
- QR code or payment button
- Instructions
- Close button

**Success State:**
- Success icon
- Confirmation message
- Order ID
- Redirect countdown

### 5.4 Buyer Profile Dashboard

**Sidebar Navigation:**
- Profile
- Orders
- Wishlist
- Messages
- Settings
- Back to Home
- Logout

**Profile Tab:**
- User info card (avatar, name, email, phone)
- Order status cards (To Pay, To Ship, To Receive, To Review)
- Wishlist preview (first 3 items)
- Return & Cancellation options
- Loyalty points & rewards display
  - Points circle with total
  - Rewards list (Welcome Bonus, Purchase Rewards)
  - Redeem button


**Orders Tab:**
- Order cards grid
- Each card shows:
  - Order ID and date
  - Status badge (color-coded)
  - Number of items
  - Total amount
  - Payment method
  - Tracking number
  - Estimated delivery
  - Action buttons:
    - View Details
    - Verify Condition (if delivered and not verified)
    - Cancel Order (if processing)
    - Verified badge (if already verified)

**Order Details Modal:**
- Order status timeline (visual progress)
  - Order Placed → Shipped → Delivered
- Products list with quantities and prices
- Shipping address
- Payment method
- Close button

**Wishlist Tab:**
- Product cards grid
- Each card shows:
  - Product image
  - Product name
  - Price
  - Add to Cart button
  - Remove button

**Messages Tab:**
- Two-column layout
- Left: Chat list
  - Seller avatar
  - Seller name
  - Last message preview
  - Timestamp
  - Unread badge
- Right: Chat window
  - Seller info header
  - Message bubbles (buyer/seller)
  - Message timestamps
  - Input field with send button
  - Empty state when no chat selected

**Settings Tab:**
- Personal Information section
  - Editable form fields
  - Edit/Save/Cancel buttons
- Address Book section
  - Saved addresses list
  - Add new address button
  - Edit/Delete/Set Default actions
  - Address form modal
- Password & Security section
- Notifications preferences
- Privacy settings
- Payment methods management


## 6. Business Logic & Workflows

### 6.1 User Registration & Authentication Flow

```
1. User visits /signup
2. Fills registration form (fullName, email, password)
3. Frontend validates input
4. POST /api/auth/signup
5. Backend:
   - Validates email format
   - Checks for duplicate email
   - Hashes password with bcrypt
   - Creates user record
   - Creates loyalty points record with 500 welcome bonus
   - Generates JWT token
6. Frontend:
   - Stores token in localStorage
   - Stores user data in localStorage
   - Redirects to landing page
7. User is now authenticated
```

### 6.2 Product Browsing & Search Flow

```
1. User lands on homepage
2. Frontend calls GET /api/products
3. Backend:
   - Queries products with status: 'Approved'
   - Applies filters if provided
   - Returns paginated results
4. Frontend:
   - Displays products in grid
   - Shows loading state during fetch
   - Falls back to demo products if empty
5. User can:
   - Search products (real-time filtering)
   - Filter by category tabs
   - Click product to view details
   - Add to cart
   - Add to wishlist
```

### 6.3 Shopping Cart Flow

```
1. User clicks "Add to Cart" on product
2. Frontend:
   - Checks if user is logged in
   - Updates local cart state
   - Saves to localStorage
3. If logged in:
   - POST /api/cart/:customerId/add
   - Backend syncs cart to database
4. Cart dropdown shows:
   - All cart items
   - Quantity controls (+/-)
   - Remove button
   - Total price
   - Checkout button
5. User can:
   - Update quantities
   - Remove items
   - Proceed to checkout
```


### 6.4 Checkout & Order Placement Flow

```
Step 1: Shipping Address
1. User navigates to /checkout
2. Form pre-filled with user data if available
3. User enters/confirms shipping details
4. Validates required fields
5. Proceeds to Step 2

Step 2: Payment Method
1. User selects payment method:
   - eSewa
   - Khalti
   - Credit/Debit Card
   - Cash on Delivery
2. Proceeds to Step 3

Step 3: Review Order
1. Displays order summary
2. Shows shipping address (editable)
3. Shows payment method (editable)
4. Shows all cart items
5. Calculates:
   - Subtotal
   - Shipping cost (Rs. 100 or FREE if > Rs. 2000)
   - Total
6. User clicks "Place Order" or "Proceed to Payment"

Order Creation:
1. POST /api/orders
2. Backend:
   - Validates product stock
   - Reduces stock for each item
   - Increments sold count
   - Generates tracking number (TRK + timestamp)
   - Calculates estimated delivery (+7 days)
   - Sets payment status based on method
   - Calculates loyalty points (1 per Rs. 100)
   - Awards points to customer
   - Clears customer cart
   - Returns order details
3. Frontend:
   - Shows success message
   - Displays order ID
   - Clears local cart
   - Redirects to orders page

Payment Processing (eSewa/Khalti):
1. Opens payment modal
2. Shows payment details
3. User clicks "Pay with eSewa/Khalti"
4. Redirects to payment gateway
5. User completes payment
6. Gateway redirects back with status
7. Updates order payment status
8. Shows confirmation
```


### 6.5 Order Tracking Flow

```
1. User navigates to Profile → Orders tab
2. GET /api/orders/customer/:customerId
3. Backend:
   - Fetches all customer orders
   - Populates product and seller details
   - Sorts by most recent first
4. Frontend displays order cards with:
   - Order ID, date, status
   - Items count, total amount
   - Payment method
   - Tracking number
   - Estimated delivery
5. User clicks "View Details"
6. Modal shows:
   - Visual timeline (Order Placed → Shipped → Delivered)
   - Product list
   - Shipping address
   - Payment method
7. Status updates:
   - Processing → Confirmed → Shipped → Delivered
   - Each status has timestamp
   - Color-coded badges
```

### 6.6 Post-Purchase Condition Verification Flow

```
1. Order status changes to "Delivered"
2. "Verify Condition" button appears on order card
3. User clicks "Verify Condition"
4. System prompts:
   - "Does the item match the seller's description?" (Yes/No)
   - "Any additional notes about the condition?" (Text input)
5. POST /api/orders/:orderId/verify-condition
6. Backend:
   - Validates order is delivered
   - Checks not already verified
   - Updates conditionVerification object
   - If matchesDescription = true:
     * Awards 50 bonus loyalty points
     * Adds to points history
     * Shows success message
   - If matchesDescription = false:
     * Flags for admin review
     * No bonus points
     * Shows feedback acknowledgment
7. Frontend:
   - Shows confirmation message
   - Updates order card with "Verified" badge
   - Refreshes loyalty points
   - Removes "Verify Condition" button
```


### 6.7 Loyalty Points System Flow

```
Points Earning:
1. Welcome Bonus (Registration):
   - User signs up
   - System automatically awards 500 points
   - Type: 'earned', Reason: 'Welcome bonus'

2. Purchase Rewards (Order Placement):
   - User places order
   - System calculates: totalAmount / 100 = points
   - Example: Rs. 5000 order = 50 points
   - Type: 'earned', Reason: 'Purchase reward'

3. Condition Verification Bonus:
   - User verifies delivered order positively
   - System awards 50 bonus points
   - Type: 'earned', Reason: 'Condition verification bonus'

Points Redemption:
1. User navigates to Profile → Loyalty section
2. Clicks "Redeem Points"
3. Enters points to redeem
4. POST /api/loyalty/:customerId/redeem
5. Backend:
   - Validates sufficient points
   - Deducts points from total
   - Adds to history (type: 'redeemed')
   - Recalculates tier
6. Frontend:
   - Shows updated balance
   - Displays new tier if changed

Tier Calculation:
- Bronze: 0-999 points
- Silver: 1,000-2,999 points
- Gold: 3,000-4,999 points
- Platinum: 5,000+ points
- Automatically updated on points change
```

### 6.8 Order Cancellation Flow

```
1. User views order in Orders tab
2. Order status is "Processing" or "Confirmed"
3. "Cancel Order" button is visible
4. User clicks "Cancel Order"
5. Confirmation dialog appears
6. User confirms cancellation
7. PUT /api/orders/:orderId/cancel
8. Backend:
   - Validates order can be cancelled
   - Restores product stock
   - Updates status to 'Cancelled'
   - Sets cancelledAt timestamp
   - Refunds loyalty points if awarded
9. Frontend:
   - Shows cancellation confirmation
   - Updates order card status
   - Removes action buttons
   - Refreshes loyalty points
```


## 7. Security Considerations

### 7.1 Authentication & Authorization
- **Password Security:**
  - Bcrypt hashing with salt rounds: 10
  - Minimum password length: 6 characters
  - Never store plain text passwords
  
- **JWT Tokens:**
  - Signed with secret key
  - Stored in localStorage
  - Included in Authorization header
  - Expiration time: 7 days (configurable)
  
- **Role-Based Access:**
  - Customer can only access own data
  - Middleware validates user ownership
  - Admin/Seller have elevated permissions

### 7.2 Data Validation
- **Input Validation:**
  - Email format validation (regex)
  - Required field checks
  - Data type validation
  - Mongoose schema validation
  
- **API Validation:**
  - Request body validation
  - Parameter validation
  - Stock availability checks
  - Duplicate prevention

### 7.3 Payment Security
- **Payment Gateway Integration:**
  - Use official eSewa/Khalti SDKs
  - HTTPS only for payment pages
  - No storage of card details
  - Transaction ID tracking
  
- **Order Integrity:**
  - Validate stock before order creation
  - Atomic operations for stock updates
  - Transaction rollback on failure

### 7.4 Data Protection
- **Sensitive Data:**
  - Passwords hashed
  - Payment info not stored
  - Personal data encrypted in transit
  
- **CORS Configuration:**
  - Whitelist allowed origins
  - Credentials support enabled
  - Secure headers


## 8. Performance Optimization

### 8.1 Frontend Optimization
- **Code Splitting:**
  - React.lazy for route-based splitting
  - Lazy load heavy components
  
- **State Management:**
  - Local state for UI interactions
  - localStorage for persistence
  - Minimize re-renders
  
- **Asset Optimization:**
  - Image lazy loading
  - Compressed images
  - CDN for static assets
  
- **Caching:**
  - Cache product listings
  - Cache user data
  - Service worker for offline support

### 8.2 Backend Optimization
- **Database Indexing:**
  - Index on user email (unique)
  - Index on product name, description, brand (text search)
  - Index on order customer and date
  - Index on order status
  
- **Query Optimization:**
  - Populate only required fields
  - Pagination for large datasets
  - Limit results appropriately
  
- **Caching Strategy:**
  - Cache frequently accessed products
  - Cache user sessions
  - Redis for session storage (future)

### 8.3 API Optimization
- **Response Optimization:**
  - Return only necessary fields
  - Compress responses (gzip)
  - Batch operations where possible
  
- **Rate Limiting:**
  - Prevent API abuse
  - Throttle requests per user
  - DDoS protection


## 9. Error Handling

### 9.1 Frontend Error Handling
- **User-Friendly Messages:**
  - Clear error descriptions
  - Actionable suggestions
  - No technical jargon
  
- **Error States:**
  - Loading states
  - Empty states
  - Error boundaries
  - Fallback UI
  
- **Network Errors:**
  - Retry mechanisms
  - Offline detection
  - Graceful degradation

### 9.2 Backend Error Handling
- **HTTP Status Codes:**
  - 200: Success
  - 201: Created
  - 400: Bad Request (validation errors)
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Internal Server Error
  
- **Error Response Format:**
```javascript
{
  success: false,
  message: "User-friendly error message",
  error: "Technical error details" (dev mode only)
}
```

- **Validation Errors:**
  - Field-specific error messages
  - Multiple error aggregation
  - Clear validation rules

### 9.3 Common Error Scenarios
- **Authentication Errors:**
  - Invalid credentials
  - Expired token
  - Missing token
  
- **Order Errors:**
  - Insufficient stock
  - Invalid product
  - Payment failure
  
- **Cart Errors:**
  - Product not found
  - Stock unavailable
  - Invalid quantity


## 10. Testing Strategy

### 10.1 Unit Testing
- **Backend:**
  - Model validation tests
  - Utility function tests
  - Middleware tests
  
- **Frontend:**
  - Component rendering tests
  - State management tests
  - Utility function tests

### 10.2 Integration Testing
- **API Testing:**
  - Endpoint functionality
  - Request/response validation
  - Error handling
  - Authentication flow
  
- **Database Testing:**
  - CRUD operations
  - Relationships
  - Constraints

### 10.3 End-to-End Testing
- **User Flows:**
  - Registration → Login → Browse → Add to Cart → Checkout → Order
  - Order Tracking → Condition Verification
  - Loyalty Points Earning → Redemption
  
- **Payment Testing:**
  - Test payment gateways
  - Success/failure scenarios
  - Refund flows

### 10.4 Manual Testing Checklist
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Add to cart functionality
- [ ] Cart updates (quantity, remove)
- [ ] Checkout process (all steps)
- [ ] Order placement (all payment methods)
- [ ] Order tracking
- [ ] Condition verification
- [ ] Loyalty points earning
- [ ] Points redemption
- [ ] Order cancellation
- [ ] Profile updates
- [ ] Address management
- [ ] Wishlist functionality
- [ ] Responsive design (mobile, tablet, desktop)


## 11. Deployment Architecture

### 11.1 Development Environment
- **Frontend:** localhost:3000 (React dev server)
- **Backend:** localhost:5000 (Node.js Express)
- **Database:** MongoDB local instance or MongoDB Atlas
- **Environment Variables:**
  - MONGODB_URI
  - JWT_SECRET
  - PORT
  - ESEWA_MERCHANT_CODE
  - KHALTI_SECRET_KEY

### 11.2 Production Environment
- **Frontend Hosting:**
  - Vercel / Netlify / AWS S3 + CloudFront
  - Build: `npm run build`
  - Static file serving
  
- **Backend Hosting:**
  - Heroku / AWS EC2 / DigitalOcean
  - Process manager: PM2
  - Load balancing
  
- **Database:**
  - MongoDB Atlas (managed)
  - Automated backups
  - Replica sets for high availability
  
- **CDN:**
  - CloudFlare for static assets
  - Image optimization
  - Caching

### 11.3 CI/CD Pipeline
- **Version Control:** Git (GitHub/GitLab)
- **Automated Testing:** Run tests on push
- **Build Process:** Automated builds
- **Deployment:** Automated deployment on merge to main
- **Monitoring:** Error tracking (Sentry), Performance monitoring


## 12. Future Enhancements

### 12.1 Phase 2 Features
- **Advanced Search:**
  - Filters by size, brand, price range
  - Sort options (price, rating, newest)
  - Saved searches
  
- **Product Reviews:**
  - Customer reviews and ratings
  - Photo reviews
  - Verified purchase badge
  
- **Wishlist Sync:**
  - Backend persistence
  - Share wishlist
  - Price drop notifications
  
- **Order Notifications:**
  - Email notifications
  - SMS notifications
  - Push notifications
  - Real-time order updates

### 12.2 Phase 3 Features
- **Social Features:**
  - Follow sellers
  - Share products on social media
  - User profiles
  
- **Recommendation Engine:**
  - Personalized product recommendations
  - "Customers also bought"
  - AI-powered suggestions
  
- **Advanced Loyalty:**
  - Referral program
  - Birthday rewards
  - Tier-specific benefits
  - Points expiration
  
- **Mobile App:**
  - React Native app
  - Native payment integration
  - Push notifications
  - Offline mode

### 12.3 Analytics & Reporting
- **Customer Analytics:**
  - Purchase history analysis
  - Behavior tracking
  - Conversion funnel
  
- **Business Intelligence:**
  - Sales reports
  - Popular products
  - Revenue analytics
  - Customer lifetime value


## 13. Maintenance & Support

### 13.1 Monitoring
- **Application Monitoring:**
  - Uptime monitoring
  - Error tracking (Sentry)
  - Performance metrics
  - API response times
  
- **Database Monitoring:**
  - Query performance
  - Connection pool
  - Storage usage
  - Backup status

### 13.2 Logging
- **Application Logs:**
  - Request/response logs
  - Error logs
  - Authentication logs
  - Payment transaction logs
  
- **Log Management:**
  - Centralized logging (ELK stack)
  - Log rotation
  - Log retention policy

### 13.3 Backup & Recovery
- **Database Backups:**
  - Daily automated backups
  - Point-in-time recovery
  - Backup testing
  
- **Disaster Recovery:**
  - Recovery plan documentation
  - Regular DR drills
  - Data replication

### 13.4 Support Channels
- **Customer Support:**
  - In-app chatbot
  - Email support
  - FAQ section
  - Help center
  
- **Technical Support:**
  - Bug reporting system
  - Feature request tracking
  - Documentation updates


## 14. Compliance & Legal

### 14.1 Data Privacy
- **GDPR Compliance:**
  - User consent for data collection
  - Right to access personal data
  - Right to deletion
  - Data portability
  
- **Data Protection:**
  - Encryption in transit (HTTPS)
  - Encryption at rest
  - Secure data storage
  - Access controls

### 14.2 Terms & Policies
- **Terms of Service:**
  - User responsibilities
  - Platform rules
  - Dispute resolution
  
- **Privacy Policy:**
  - Data collection practices
  - Data usage
  - Third-party sharing
  - Cookie policy
  
- **Return & Refund Policy:**
  - Return conditions
  - Refund process
  - Timeframes

### 14.3 Payment Compliance
- **PCI DSS:**
  - No card data storage
  - Use certified payment gateways
  - Secure transmission
  
- **Local Regulations:**
  - Nepal payment regulations
  - Tax compliance
  - Consumer protection laws

## 15. Conclusion

The Customer/Buyer System design provides a comprehensive, scalable, and user-friendly platform for thrift fashion e-commerce. Key highlights include:

- **Complete Shopping Experience:** From discovery to delivery
- **Trust Building:** Post-purchase condition verification
- **Customer Engagement:** Loyalty rewards and gamification
- **Multi-Vendor Support:** Scalable architecture for multiple sellers
- **Security First:** Robust authentication and payment security
- **Performance Optimized:** Fast, responsive, and reliable

This design document serves as the blueprint for implementation, ensuring all stakeholders understand the system architecture, data flows, and business logic. The modular design allows for incremental development and future enhancements while maintaining system integrity.

