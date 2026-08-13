import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Restricts a route to specific roles (e.g. seller-only, admin-only).
 * Assumes ProtectedRoute has already confirmed the user is logged in.
 */
const RoleRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;