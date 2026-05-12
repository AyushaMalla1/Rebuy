# ReBuy CSS Architecture

## File Structure
```
Frontend/src/
├── *.css (Component-specific styles)
└── components/
    └── *.css (Shared component styles)
```

## Major Style Files

### 1. SellerDashboard.css (8,293 lines)
**Sections:**
- Layout (Container, Sidebar, Header)
- Dashboard Stats Cards
- Notifications System
- Products Table
- Orders Management
- Messages/Inbox
- Profile Settings
- Modals & Overlays
- Responsive Breakpoints

### 2. BuyerProfile.css (4,236 lines)
**Sections:**
- Profile Layout
- Order History
- Wishlist
- Address Book
- Messages
- Loyalty Points
- Settings
- Modals

### 3. AdminDashboard.css (3,448 lines)
**Sections:**
- Admin Layout
- Analytics Dashboard
- User Management
- Seller Approvals
- Product Moderation
- Fraud Detection
- System Settings

## Design System

### Colors
- **Primary**: #00bcd4 (Cyan)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Orange)
- **Error**: #ef4444 (Red)
- **Gray Scale**: #f9fafb to #111827

### Spacing Scale
- 4px, 8px, 12px, 16px, 20px, 24px, 32px, 36px

### Border Radius
- Small: 6px
- Medium: 8px, 10px, 12px
- Large: 16px
- Circle: 50%

### Shadows
- Light: `0 1px 3px rgba(0, 0, 0, 0.06)`
- Medium: `0 4px 12px rgba(0, 0, 0, 0.1)`
- Heavy: `0 20px 60px rgba(0, 0, 0, 0.2)`

### Typography
- **Font Family**: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI'
- **Sizes**: 11px - 32px
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## Common Patterns

### Flexbox Layouts
```css
/* Center content */
display: flex;
align-items: center;
justify-content: center;

/* Space between */
display: flex;
justify-content: space-between;
align-items: center;

/* Column layout */
display: flex;
flex-direction: column;
gap: 12px;
```

### Card Component
```css
background: #ffffff;
border: 1px solid #e5e7eb;
border-radius: 16px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
transition: all 0.2s ease;
```

### Button Styles
```css
padding: 10px 20px;
border-radius: 6px;
font-weight: 600;
cursor: pointer;
transition: all 0.2s ease;
```

## Responsive Breakpoints
- **Desktop**: > 1200px
- **Tablet**: 768px - 1200px
- **Mobile**: < 768px

## Notes for Maintenance
1. **Duplication**: Many styles are repeated - consider CSS variables
2. **Organization**: Styles are component-scoped but could benefit from utility classes
3. **Performance**: Large file sizes - consider code splitting
4. **Consistency**: Manual color/spacing values - use design tokens

## Future Improvements
- [ ] Extract CSS variables for colors and spacing
- [ ] Create utility class system
- [ ] Split large files into logical modules
- [ ] Implement CSS-in-JS or CSS modules
- [ ] Add CSS linting and formatting
