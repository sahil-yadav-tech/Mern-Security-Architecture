import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const auth = useAuth();
  if (!auth?.isAuthenticated) {
    return <Navigate to="/unauthorized" replace />;
  }

  const hasAccess = allowedRoles.some((role) => auth?.user?.roles?.includes(role));
  return hasAccess ? children : <Navigate to="/unauthorized" replace />;
};

export default RoleBasedRoute;
