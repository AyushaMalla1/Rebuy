import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Signup from './Signup';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import SellerDashboard from './SellerDashboard';
import AdminDashboard from './AdminDashboard';
import BecomeASeller from './BecomeASeller';
import BuyerProfile from './BuyerProfile';
import ProductDetail from './ProductDetail';
import Checkout from './Checkout';
import Cart from './Cart';
import About from './About';
import Contact from './Contact';
import Careers from './Careers';
import Press from './Press';
import Sustainability from './Sustainability';
import Affiliates from './Affiliates';
import FAQ from './FAQ';
import OrderStatus from './OrderStatus';
import PaymentOptions from './PaymentOptions';
import PaymentSuccess from './PaymentSuccess';
import PaymentFailed from './PaymentFailed';
import PaymentVerify from './PaymentVerify';
import Shop from './components/Shop';
import SellerProfile from './SellerProfile';
import MensOutlet from './MensOutlet';
import WomensOutlet from './WomensOutlet';
import MensJacket from './components/MensJacket';
import MensShirt from './components/MensShirt';
import MensPants from './components/MensPants';
import WomensJacket from './components/WomensJacket';
import WomensShirt from './components/WomensShirt';
import WomensPants from './components/WomensPants';

// Protected Landing Page - redirects admin/seller to their dashboards
function ProtectedLandingPage() {
  const userData = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  // Only redirect if both user data and token exist
  if (userData && token) {
    try {
      const parsedUser = JSON.parse(userData);
      
      // Check for admin - userType field is used in login
      if (parsedUser.userType === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      
      // Check for seller
      if (parsedUser.userType === 'seller') {
        return <Navigate to="/seller/dashboard" replace />;
      }
      
      // Customer stays on landing page
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear invalid data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
  
  return <LandingPage />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedLandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile" element={<BuyerProfile />} />
      <Route path="/buyer-profile" element={<BuyerProfile />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/seller" element={<BecomeASeller />} />
      <Route path="/seller/dashboard" element={<SellerDashboard />} />
      <Route path="/seller/:sellerId" element={<SellerProfile />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/press" element={<Press />} />
      <Route path="/sustainability" element={<Sustainability />} />
      <Route path="/affiliates" element={<Affiliates />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/order-status" element={<OrderStatus />} />
      <Route path="/payment-options" element={<PaymentOptions />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
      <Route path="/payment-verify" element={<PaymentVerify />} />
      <Route path="/mens-outlet" element={<MensOutlet />} />
      <Route path="/womens-outlet" element={<WomensOutlet />} />
      <Route path="/mens-jacket" element={<MensJacket />} />
      <Route path="/mens-shirt" element={<MensShirt />} />
      <Route path="/mens-pants" element={<MensPants />} />
      <Route path="/womens-jacket" element={<WomensJacket />} />
      <Route path="/womens-shirt" element={<WomensShirt />} />
      <Route path="/womens-pants" element={<WomensPants />} />
    </Routes>
  );
}

export default App;
