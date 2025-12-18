import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: "admin" | "client";
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    // Redireciona para a página apropriada baseado no role
    return <Navigate to={user?.role === "admin" ? "/admin" : "/"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
