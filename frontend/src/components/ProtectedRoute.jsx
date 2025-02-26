import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // For routes that require authentication (like Profile)
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // For routes that should not be accessible when authenticated (like Login/Register)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};