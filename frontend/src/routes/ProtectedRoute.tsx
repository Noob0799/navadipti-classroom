import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth, type Role } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Restrict to specific roles; omit to just require any authenticated user. */
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/landing" replace />;
  }
  return <>{children}</>;
}
