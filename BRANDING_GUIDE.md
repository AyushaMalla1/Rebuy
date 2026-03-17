# Rebuy Branding Guide

## Logo Usage

### Logo Location
The Rebuy logo is located at: `Frontend/public/logo.png`

### Logo Implementation

The logo is consistently used across the platform:

1. **Main Header** (LandingPage.js, Shop.js)
   - Height: 60px
   - Alt text: "Rebuy"
   - Location: Top left of navigation bar

2. **Sidebar Headers** (SellerDashboard.js, SellerProfile.js, AdminDashboard.js)
   - Class: `sidebar-logo`
   - Alt text: "Rebuy"
   - Accompanied by section title (e.g., "Seller Center", "Admin Panel")

3. **Footer** (LandingPage.js, Shop.js)
   - Height: 80px
   - Alt text: "Rebuy"
   - Accompanied by "THRIFT SHOP" tagline

### Logo Styling

```css
.logo img {
  height: 60px;
  margin-bottom: 1px;
}

.sidebar-logo {
  /* Defined in respective component CSS files */
}
```

## Brand Colors

### Primary Colors
- **Cyan/Teal**: `#00bcd4` - Primary brand color, used for CTAs and highlights
- **Dark Text**: `#333` - Main text color
- **White**: `#fff` - Background and contrast

### Secondary Colors
- **Light Gray**: `#f8f9fa` - Backgrounds and subtle sections
- **Medium Gray**: `#e0e0e0` - Borders and dividers
- **Success Green**: `#4caf50` - Success states
- **Warning Orange**: `#ff9800` - Warnings
- **Error Red**: `#f44336` - Errors and destructive actions

### Gradients
- Hero gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Card hover effects: Subtle shadows and transforms

## Typography

### Font Family
- Primary: System fonts stack for optimal performance
- Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`

### Font Weights
- Regular: 400
- Medium: 500
- Semi-bold: 600
- Bold: 700

### Headings
- H1: 32px - 48px (responsive)
- H2: 24px - 32px
- H3: 20px - 24px
- Body: 14px - 16px

## Brand Voice

### Tone
- **Sustainable**: Emphasize environmental impact and circular economy
- **Friendly**: Warm, approachable, and supportive
- **Modern**: Clean, contemporary design language
- **Trustworthy**: Professional and reliable

### Messaging
- "Your Sustainable Marketplace for Pre-loved Fashion"
- "Buy and sell quality secondhand clothing with confidence"
- "Giving quality clothing a second life"
- "Made with ♻️ by the Rebuy Team"

## Icons

### Icon Library
Using React Icons (react-icons) with Feather Icons (Fi prefix):
- `FiShoppingCart` - Cart
- `FiUser` - User profile
- `FiHeart` - Favorites/Wishlist
- `FiSearch` - Search
- `FiMenu` - Mobile menu
- `FiPackage` - Orders
- And more...

### Icon Sizing
- Small: 16px
- Medium: 20px
- Large: 24px
- Extra Large: 48px (empty states)

## UI Components

### Buttons
- Primary: Cyan background with white text
- Secondary: White background with cyan border
- Danger: Red for destructive actions
- Border radius: 4px - 8px
- Padding: 10px 20px (standard)

### Cards
- Background: White
- Border: 1px solid #e0e0e0
- Border radius: 8px
- Box shadow: Subtle on hover
- Padding: 20px

### Forms
- Input border: 1px solid #ddd
- Focus state: Cyan border
- Border radius: 4px
- Padding: 10px

## Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Considerations
- Hamburger menu for navigation
- Stacked layouts
- Touch-friendly button sizes (min 44px)
- Simplified navigation

## Accessibility

### Standards
- WCAG 2.1 Level AA compliance target
- Semantic HTML elements
- Proper alt text for images
- Keyboard navigation support
- Sufficient color contrast ratios

### Alt Text Guidelines
- Logo: "Rebuy"
- Product images: Product name
- Decorative images: Empty alt text
- Functional images: Describe function

## File Naming Conventions

### Images
- Lowercase with hyphens: `product-image.jpg`
- Logo: `logo.png`
- Icons: Use React Icons library

### Components
- PascalCase: `ProductCard.js`
- Styles: Match component name: `ProductCard.css`

## Meta Information

### Page Titles
Format: `[Page Name] - Rebuy - Sustainable Fashion Marketplace`

Examples:
- Home: "Rebuy - Sustainable Fashion Marketplace"
- Shop: "Shop - Rebuy - Sustainable Fashion Marketplace"
- Product: "[Product Name] - Rebuy"

### Meta Descriptions
- Length: 150-160 characters
- Include keywords: sustainable, secondhand, pre-loved, fashion
- Call to action when appropriate

### Favicon
- Location: `Frontend/public/logo.png`
- Format: PNG
- Sizes: Multiple sizes for different devices

## Social Media

### Hashtags
- #Rebuy
- #SustainableFashion
- #SecondhandStyle
- #ThriftShop
- #CircularEconomy

### Tone
- Engaging and conversational
- Focus on sustainability impact
- Showcase community stories
- Highlight unique finds

## Brand Assets

All brand assets should be:
- High resolution
- Properly licensed
- Optimized for web
- Accessible with proper alt text

### Logo Variations
- Full color (primary)
- White (for dark backgrounds)
- Monochrome (when needed)

### Usage Guidelines
- Maintain clear space around logo
- Don't distort or rotate
- Don't change colors
- Don't add effects or shadows

---

For questions about branding, contact the design team.
Last updated: March 2026
