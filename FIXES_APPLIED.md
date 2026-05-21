# Console Error Fixes

## Issues Identified and Fixed

### 1. ✅ FIXED: React Key Prop Warnings

**Problem**: The console warning "Each child in a list should have a unique `key` prop" was appearing because several `.map()` functions were using array indices as keys, which is not stable.

**Root Causes**:
- Line 1985: Order items using `key={idx}`
- Line 2076: Modal product items using `key={index}`
- Line 2459: Cancelled order items using `key={idx}`
- Line 2698: Emoji picker buttons using `key={index}`

**Fixes Applied** (in `Frontend/src/BuyerProfile.jsx`):

1. **Order items list (line 1985)**: 
   - Changed from: `key={idx}`
   - Changed to: `key={item._id || item.productId || \`item-${order._id}-${idx}\`}`
   - This uses the item's unique ID first, then falls back to productId, then a composite key

2. **Modal product items (line 2076)**:
   - Changed from: `key={index}`
   - Changed to: `key={item._id || item.productId || \`modal-item-${selectedOrder._id}-${index}\`}`

3. **Cancelled orders items (line 2459)**:
   - Changed from: `key={idx}`
   - Changed to: `key={item._id || item.productId || \`cancelled-item-${order._id}-${idx}\`}`

4. **Emoji picker buttons (line 2698)**:
   - Changed from: `key={index}`
   - Changed to: `key={emoji}`
   - Since emojis are constant strings, using the emoji itself as the key is stable

**Result**: React key warnings should now be eliminated.

---

### 2. ⚠️ NEEDS INVESTIGATION: 500 Errors from Messages API

**Problem**: The console shows "Failed to load resource: the server responded with a status of 500 (Internal Server Error)" from the `/api/messages` endpoint.

**Possible Causes**:
1. MongoDB is not running or connection is failing
2. Backend server is not running
3. Validation errors in message data
4. Database connection timeout
5. Missing user/seller in database

**What I Verified**:
- ✅ Backend message route is correctly configured at `/api/messages`
- ✅ Message schema is properly defined with all required fields
- ✅ User and Seller models exist
- ✅ Frontend is sending correct data structure
- ✅ Error handling is in place

**Frontend Code Check**:
- `handleSendMessage()` correctly builds message payload with:
  - `senderId`: User's ID
  - `senderModel`: "User" (matches backend enum)
  - `receiverId`: Seller ID
  - `receiverModel`: "Seller" (matches backend enum)
  - `message`: Text content

**To Fix**:
1. Ensure MongoDB is running: `mongod`
2. Check backend logs when server is running
3. Verify connection string in `.env`: `MONGODB_URI=mongodb://localhost:27017/rebuy`
4. Test the API directly using Postman with sample data
5. Check if sender user exists in database

---

## Testing Steps

After applying these fixes:

1. **Test React Warnings**:
   - Open browser DevTools
   - Go to Console tab
   - Reload the page
   - Check that no "key prop" warnings appear

2. **Test Messages Feature**:
   - Ensure MongoDB is running
   - Ensure Backend server is running on port 5000
   - Try sending a message
   - Check backend console for error details if 500 error persists

---

## Files Modified

- `Frontend/src/BuyerProfile.jsx` (4 locations with key fixes)

---

## Notes

- The `/s8004/` prefix in the browser console is just the dev tools' internal hash identifier for the resource, not part of the actual URL
- The actual endpoint being called is `/api/messages` on `localhost:5000`
- All key fixes follow React best practices by using stable, unique identifiers
