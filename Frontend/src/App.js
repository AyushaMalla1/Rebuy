import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Signup from './Signup';
import Login from './Login';
import SellerDashboard from './SellerDashboard';
import SellerProfile from './SellerProfile';
import AdminDashboard from './AdminDashboard';
import BecomeASeller from './BecomeASeller';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/seller" element={<BecomeASeller />} />
      <Route path="/seller/dashboard" element={<SellerDashboard />} />
      <Route path="/seller/profile" element={<SellerProfile />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
