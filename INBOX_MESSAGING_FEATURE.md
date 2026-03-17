# Inbox & Messaging Feature

## Overview
Implemented a complete messaging system that allows customers to contact sellers directly about products. Sellers can view, manage, and respond to customer inquiries through their dashboard.

## Backend Implementation

### 1. Message Model (`Backend/models/Message.js`)
- **Fields:**
  - `senderId`: Reference to sender (User or Seller)
  - `senderModel`: Discriminator for sender type ('User' or 'Seller')
  - `receiverId`: Reference to seller receiving the message
  - `productId`: Optional reference to related product
  - `subject`: Message subject line
  - `message`: Message content
  - `read`: Boolean flag for read status
  - `replied`: Boolean flag for reply status
  - `timestamps`: Auto-generated createdAt and updatedAt

### 2. Message Routes (`Backend/routes/messages.js`)
- **POST `/api/messages`**: Send a new message to seller
- **GET `/api/messages/seller/:sellerId`**: Get all messages for a seller (with unread count)
- **PATCH `/api/messages/:messageId/read`**: Mark message as read
- **DELETE `/api/messages/:messageId`**: Delete a message

### 3. Server Configuration
- Added message routes to `Backend/server.js`
- Route: `/api/messages`

## Frontend Implementation

### 1. Seller Dashboard - Inbox Tab

#### Features:
- **Inbox Menu Item**: Added to sidebar with bell icon
- **Message List**: Displays all customer messages with:
  - Unread indicator (blue dot and border)
  - Sender information (name and email)
  - Product reference (with image if applicable)
  - Message content in styled box
  - Timestamp
  
#### Actions:
- **Mark as Read**: Updates message status
- **Reply via Email**: Opens default email client with pre-filled recipient and subject
- **Delete**: Removes message with confirmation

#### Empty State:
- Professional placeholder when no messages exist
- Bell icon with "No Messages Yet" message

#### State Management:
- `messages`: Array of message objects
- `unreadMessages`: Count of unread messages
- `loadingMessages`: Loading state
- `fetchMessages()`: Fetches messages from API
- `handleMarkAsRead()`: Marks message as read
- `handleDeleteMessage()`: Deletes message

### 2. Product Detail Page - Contact Seller

#### Features:
- **Contact Seller Button**: 
  - Positioned below action buttons
  - Message square icon
  - Hover effects (changes to cyan)
  - Full width design

#### Contact Modal:
- **Form Fields:**
  - Subject (required)
  - Message (required, textarea)
- **Actions:**
  - Send Message (submits to API)
  - Cancel (closes modal)
- **Authentication Check**: Redirects to login if not authenticated

#### State Management:
- `showContactModal`: Controls modal visibility
- `contactForm`: Object with subject and message fields
- `handleContactSeller()`: Sends message to API

## User Flow

### Customer Perspective:
1. Browse product on Product Detail page
2. Click "Contact Seller" button
3. Fill out subject and message in modal
4. Submit message
5. Receive success confirmation

### Seller Perspective:
1. Navigate to Inbox tab in Seller Dashboard
2. View list of customer messages
3. See unread count in tab title
4. Click "Mark as Read" for unread messages
5. Click "Reply via Email" to respond
6. Click "Delete" to remove messages

## Styling

### Inbox Tab:
- White background cards with shadows
- Color-coded unread messages (cyan border)
- Professional message layout with:
  - Gray background for message content
  - Cyan left border accent
  - Product info in light gray box
  - Action buttons with hover effects

### Contact Modal:
- Clean form design
- Consistent with existing modal styles
- Responsive layout
- Professional input fields

## API Integration

### Send Message:
```javascript
POST /api/messages
Body: {
  senderId: userId,
  senderModel: 'User',
  receiverId: sellerId,
  productId: productId,
  subject: string,
  message: string
}
```

### Get Seller Messages:
```javascript
GET /api/messages/seller/:sellerId
Response: {
  success: true,
  messages: [...],
  unreadCount: number
}
```

### Mark as Read:
```javascript
PATCH /api/messages/:messageId/read
Response: {
  success: true,
  message: 'Message marked as read'
}
```

### Delete Message:
```javascript
DELETE /api/messages/:messageId
Response: {
  success: true,
  message: 'Message deleted successfully'
}
```

## Security Features
- Authentication required for sending messages
- Seller ID validation
- User ID validation
- Authorization checks on all endpoints

## Future Enhancements
- In-app reply functionality (currently uses email)
- Real-time notifications using WebSockets
- Message threading/conversations
- File attachments
- Message search and filtering
- Archive functionality
- Bulk actions (mark all as read, delete multiple)
- Message templates for common responses
- Auto-responses for common questions

## Files Modified
1. `Backend/models/Message.js` (new)
2. `Backend/routes/messages.js` (new)
3. `Backend/server.js` (added message routes)
4. `Frontend/src/SellerDashboard.js` (added Inbox tab)
5. `Frontend/src/ProductDetail.js` (added Contact Seller button and modal)

## Testing Checklist
- [ ] Customer can send message from product page
- [ ] Message appears in seller's inbox
- [ ] Unread count updates correctly
- [ ] Mark as read functionality works
- [ ] Delete message works with confirmation
- [ ] Reply via email opens email client
- [ ] Authentication checks work properly
- [ ] Empty states display correctly
- [ ] Product information displays in messages
- [ ] Timestamps format correctly
- [ ] Modal forms validate required fields
- [ ] Success/error messages display properly
