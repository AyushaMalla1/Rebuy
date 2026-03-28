import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import Shop from './components/Shop';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile" element={<BuyerProfile />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/seller" element={<BecomeASeller />} />
      <Route path="/seller/dashboard" element={<SellerDashboard />} />
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
    </Routes>
  );
}

export default App;
