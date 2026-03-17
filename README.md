# Rebuy - Sustainable Fashion Marketplace

![Rebuy Logo](Frontend/public/logo.png)

## About Rebuy

Rebuy is a modern, sustainable marketplace for buying and selling pre-loved fashion. We believe in giving quality clothing a second life while reducing environmental impact.

## Features

### For Buyers
- Browse curated secondhand fashion collections
- Advanced search and filtering
- Secure checkout with multiple payment options (eSewa, Khalti, COD)
- Order tracking and management
- Wishlist and favorites
- Loyalty points system
- Product reviews and ratings
- Real-time chatbot support

### For Sellers
- Easy seller registration
- Comprehensive seller dashboard
- Product management with image uploads
- Order management and tracking
- Sales analytics and performance metrics
- Revenue tracking
- Inventory management

### For Admins
- Complete platform oversight
- User and seller management
- Product moderation
- Order monitoring
- Platform analytics

## Tech Stack

### Frontend
- React 18
- React Router v7
- Axios for API calls
- React Icons
- Recharts for analytics
- QR Code generation

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT authentication
- Bcrypt for password hashing
- Helmet for security
- Rate limiting
- CORS enabled

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Rebuy
```

2. Install backend dependencies
```bash
cd Backend
npm install
```

3. Install frontend dependencies
```bash
cd ../Frontend
npm install
```

4. Configure environment variables
```bash
cd ../Backend
cp .env.example .env
# Edit .env with your configuration
```

5. Start MongoDB
```bash
mongod
```

6. Start the backend server
```bash
cd Backend
npm start
# or for development with auto-reload
npm run dev
```

7. Start the frontend
```bash
cd Frontend
npm start
```

The application will open at `http://localhost:3000`

## Environment Variables

See `Backend/.env.example` for required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Backend server port (default: 5000)

## Testing

Run backend tests:
```bash
cd Backend
npm test
```

## Documentation

- [API Documentation](Backend/API_DOCUMENTATION.md)
- [Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Developer Guide](DEVELOPER_GUIDE.md)
- [User Guide](USER_GUIDE.md)
- [Testing Guide](TESTING_GUIDE.md)

## Project Structure

```
Rebuy/
├── Frontend/           # React frontend application
│   ├── public/        # Static assets
│   └── src/           # Source code
│       ├── components/    # Reusable components
│       └── services/      # API services
├── Backend/           # Express backend API
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── utils/        # Utility functions
│   └── config/       # Configuration files
└── docs/             # Documentation files
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@rebuy.com or join our community chat.

## Acknowledgments

- Built with sustainability in mind
- Inspired by the circular economy movement
- Designed for the modern conscious consumer

---

Made with ♻️ by the Rebuy Team
