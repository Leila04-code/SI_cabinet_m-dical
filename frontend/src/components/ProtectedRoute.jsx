// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Si pas connecté, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si des rôles sont spécifiés, vérifier que l'utilisateur a le bon rôle
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Rediriger vers son propre dashboard
      switch(user.role) {
        case 'PATIENT':
          return <Navigate to="/dashboard/patient" replace />;
        case 'MEDECIN':
          return <Navigate to="/dashboard/medecin" replace />;
        case 'RECEPTIONNISTE':
          return <Navigate to="/dashboard/receptionniste" replace />;
        case 'ADMIN':
          return <Navigate to="/dashboard/admin" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
  }

  return children;
}

export default ProtectedRoute;