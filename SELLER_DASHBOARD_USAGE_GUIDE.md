# Seller Dashboard - Usage Guide

## Getting Started

### Prerequisites
✅ Recharts is already installed (v3.8.0)
✅ All dependencies are in place
✅ No additional installation needed

### Starting the Application

1. **Start Backend Server**
```bash
cd Backend
npm start
```
Server runs on: `http://localhost:5000`

2. **Start Frontend**
```bash
cd Frontend
npm start
```
App opens at: `http://localhost:3000`

---

## Features Overview

### 1. Dashboard Overview
**Route**: `/seller/dashboard`

**What You'll See**:
- 4 stat cards showing:
  - Total Products
  - Total Stock
  - Total Revenue
  - Total Sold
- Quick action buttons for common tasks

**Actions**:
- Click any quick action to navigate to that section
- View real-time statistics

---

### 2. Product Management
**Tab**: Products

**Features**:
- View all your products in a table
- Add new products with the "+ Add Product" button
- Edit existing products (click edit icon)
- Delete products (click trash icon)
- See low stock warnings (red badge for < 5 items)

**Adding a Product**:
1. Click "+ Add Product"
2. Fill in all required fields:
   - Product Name
   - Price
   - Stock Quantity
   - Category
   - Condition
   - Size
   - Brand (optional)
   - Images (at least 1 URL)
   - Description
   - Story (optional)
3. Click "Add Product"

**Product Table Columns**:
- Image thumbnail
- Product name
- Category
- Price (Rs.)
- Stock (with color badge)
- Status (Active/Inactive)
- Actions (Edit/Delete)

---

### 3. Orders Management
**Tab**: Orders

**Features**:
- View all orders for your products
- Update order status
- Filter orders by status
- Export orders to CSV

**Order Information Displayed**:
- Order ID (unique identifier)
- Customer name
- Product name
- Quantity
- Total amount
- Order date
- Current status

**Updating Order Status**:
1. Find the order in the table
2. Click the status dropdown
3. Select new status:
   - Pending (initial state)
   - Confirmed (order accepted)
   - Packed (ready to ship)
   - Out for Delivery (in transit)
   - Delivered (completed)
   - Cancelled (order cancelled)
4. Status updates automatically

**Filtering Orders**:
- Use the dropdown at the top
- Select: All Orders, Pending, Confirmed, etc.
- Table updates instantly

**Exporting Orders**:
- Click "Export Orders" button
- Downloads CSV file with all order data
- Filename: `orders_report.csv`

---

### 4. Revenue Analytics
**Tab**: Revenue

**Features**:
- Revenue summary cards
- Revenue trend chart (7 days)
- Top-selling products chart
- Export revenue report

**Summary Cards**:
1. **Total Revenue**: All-time earnings
2. **Total Orders**: Number of orders
3. **Average Order Value**: Revenue ÷ Orders
4. **Items Sold**: Total units sold

**Charts**:

1. **Revenue Trend (Line Chart)**
   - Shows last 7 days
   - Hover to see exact values
   - Visualizes sales patterns

2. **Top Selling Products (Bar Chart)**
   - Top 5 products by sales
   - Horizontal bars
   - Compare product performance

**Exporting Revenue Report**:
- Click "Export Report" button
- Downloads CSV with:
  - Total Revenue
  - Total Products
  - Total Sold
  - Total Stock
- Filename: `revenue_report.csv`

---

### 5. Performance Analytics
**Tab**: Performance

**Features**:
- Key performance metrics
- Low stock alerts
- Category performance chart
- Product insights

**Key Metrics**:
1. **Conversion Rate**: 3.2%
   - Percentage of views that become sales
   - Shows trend (up/down)

2. **Total Views**: 1,234
   - How many times products were viewed

3. **Cart Additions**: 89
   - Products added to cart this month

4. **Average Rating**: 4.5 ⭐
   - Customer satisfaction score

**Low Stock Alert**:
- Yellow warning banner appears when products < 5 stock
- Shows count of low stock products
- Dedicated table lists all low stock items
- "Restock" button for quick action

**Low Stock Products Table**:
- Product name
- Category
- Current stock count
- Status badge (Low Stock)
- Restock action button

**Category Performance (Pie Chart)**:
- Visual breakdown of products by category
- Categories: Men, Women, Kids, Accessories, Other
- Hover to see exact counts
- Helps identify inventory distribution

---

## Navigation

### Sidebar Menu

**Main Menu**:
- 🏠 Dashboard - Overview and stats
- 📦 Products - Manage inventory
- 🛍️ Orders - Process orders

**Analytics**:
- 💰 Revenue - Financial insights
- 📈 Performance - Store metrics

**Account**:
- 👤 Profile - Edit seller info
- 🏠 Back to Store - Return to main site
- 🚪 Logout - Sign out

---

## Tips & Best Practices

### Product Management
✅ Keep stock updated regularly
✅ Add high-quality image URLs
✅ Write detailed descriptions
✅ Include product stories for engagement
✅ Monitor low stock alerts

### Order Management
✅ Update order status promptly
✅ Confirm orders within 24 hours
✅ Mark as "Packed" when ready to ship
✅ Update to "Delivered" after confirmation
✅ Use "Cancelled" only when necessary

### Revenue Tracking
✅ Check revenue trends weekly
✅ Identify top-selling products
✅ Export reports for records
✅ Monitor average order value
✅ Track growth indicators

### Performance Monitoring
✅ Address low stock immediately
✅ Monitor conversion rate trends
✅ Balance category distribution
✅ Respond to customer ratings
✅ Track cart additions

---

## Keyboard Shortcuts

- `Ctrl + Click` on product - Quick view
- `Tab` - Navigate form fields
- `Enter` - Submit forms
- `Esc` - Close modals

---

## Troubleshooting

### Charts Not Showing?
**Solution**: 
- Recharts is already installed
- Refresh the page
- Check browser console for errors
- Ensure you have products/orders data

### Orders Not Loading?
**Solution**:
- Check backend is running (port 5000)
- Verify you're logged in as seller
- Check network tab for API errors
- Mock data will show if backend unavailable

### Export Not Working?
**Solution**:
- Ensure you have data to export
- Check browser download settings
- Try different browser
- Check console for errors

### Low Stock Alert Not Showing?
**Solution**:
- Alert only shows when products < 5 stock
- Add products or reduce stock to test
- Check Performance tab

---

## Data Flow

### How Orders Work
1. Customer places order on main site
2. Order appears in seller's Orders tab
3. Seller updates status through dropdown
4. Customer sees updated status
5. Order contributes to revenue stats

### How Stats Update
1. Products added → Total Products increases
2. Stock added → Total Stock increases
3. Orders completed → Total Revenue increases
4. Items sold → Total Sold increases
5. Charts update with new data

---

## API Endpoints Used

```javascript
// Products
GET    /api/sellers/:id/products
POST   /api/products
DELETE /api/products/:id

// Stats
GET    /api/sellers/:id/stats

// Orders
GET    /api/orders/seller/:id
PUT    /api/orders/:id/status
```

---

## Color Coding Guide

### Status Colors
- 🟡 **Pending**: Yellow - Awaiting confirmation
- 🔵 **Confirmed**: Cyan - Order accepted
- 🟢 **Packed**: Green - Ready to ship
- 🔵 **Out for Delivery**: Blue - In transit
- 🟢 **Delivered**: Green - Completed
- 🔴 **Cancelled**: Red - Order cancelled

### Stock Colors
- 🟢 **Good Stock**: ≥ 5 items
- 🔴 **Low Stock**: < 5 items

### Metric Colors
- 🔵 **Blue**: Products, Views
- 🟢 **Green**: Revenue, Stock
- 🟠 **Orange**: Orders, Value
- 🟣 **Purple**: Sold, Rating

---

## Mobile Usage

The dashboard is responsive and works on mobile:
- Sidebar collapses to hamburger menu
- Tables scroll horizontally
- Charts adapt to screen size
- Touch-friendly buttons

---

## Demo Mode

If backend is not connected:
- Mock order data will display
- Charts show sample data
- All UI features work
- Perfect for demonstration

---

## Support

For issues or questions:
1. Check this guide first
2. Review console errors
3. Check API connectivity
4. Verify user permissions
5. Contact support team

---

## Quick Reference

| Action | Location | Button/Tab |
|--------|----------|------------|
| Add Product | Products Tab | "+ Add Product" |
| Update Order | Orders Tab | Status Dropdown |
| View Revenue | Revenue Tab | Charts Section |
| Check Low Stock | Performance Tab | Alert Banner |
| Export Data | Any Tab | "Export" Button |
| Edit Profile | Sidebar | "Profile" Link |

---

**Happy Selling! 🎉**

Your Seller Dashboard is now a complete, professional e-commerce management system.
