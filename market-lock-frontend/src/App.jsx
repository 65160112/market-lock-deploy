import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import MapPage        from './pages/MapPage';
import BookingPage    from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import Layout         from './components/Layout';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#16a34a',fontSize:18}}>กำลังโหลด...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/map" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  
  // ถ้ายัง loading อยู่ ให้แสดง Landing Page ไปก่อน ไม่ต้องรอ
  if (loading) return <LandingPage />;
  
  return (
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={!user ? <LoginPage />    : <Navigate to="/map" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/map" />} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/map"             element={<MapPage />} />
        <Route path="/booking/:lockId" element={<BookingPage />} />
        <Route path="/admin"           element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}