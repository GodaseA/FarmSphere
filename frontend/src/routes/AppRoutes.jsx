import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import FarmerLayout from '../layouts/FarmerLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import BrowseListings from '../pages/public/BrowseListings';
import FarmerPublicProfile from '../pages/public/FarmerPublicProfile';
import Profile from '../pages/public/Profile';

// Farmer Pages
import FarmerDashboard from '../pages/farmer/Dashboard';
import Yields from '../pages/farmer/Yields';
import DiseaseCheck from '../pages/farmer/DiseaseCheck';
import MyListings from '../pages/farmer/MyListings';
import FarmerOrders from '../pages/farmer/FarmerOrders';
import PricePredictor from '../pages/farmer/PricePredictor';
import Reviews from '../pages/farmer/Reviews';

// Customer Pages
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import MyOrders from '../pages/customer/MyOrders';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import Verification from '../pages/admin/Verification';
import UsersPage from '../pages/admin/Users';
import Transactions from '../pages/admin/Transactions';
import Disputes from '../pages/admin/Disputes';
import Analytics from '../pages/admin/Analytics';
import Broadcast from '../pages/admin/Broadcast';
import Logs from '../pages/admin/Logs';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public storefront routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowseListings />} />
        <Route path="/farmers/:id" element={<FarmerPublicProfile />} />
        <Route path="/disease" element={<DiseaseCheck />} />
        <Route path="/prices" element={<PricePredictor />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* Customer Portal */}
        <Route path="/checkout" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/customer/orders" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MyOrders />
          </ProtectedRoute>
        } />
      </Route>

      {/* Farmer Portal routes */}
      <Route
        path="/farmer"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FarmerDashboard />} />
        <Route path="yields" element={<Yields />} />
        <Route path="disease" element={<DiseaseCheck />} />
        <Route path="listings" element={<MyListings />} />
        <Route path="orders" element={<FarmerOrders />} />
        <Route path="prices" element={<PricePredictor />} />
        <Route path="reviews" element={<Reviews />} />
      </Route>

      {/* Admin Portal routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="verification" element={<Verification />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="disputes" element={<Disputes />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="broadcast" element={<Broadcast />} />
        <Route path="logs" element={<Logs />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
