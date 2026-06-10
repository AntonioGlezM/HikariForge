import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Ruta envolvente que protege a sus hijas (<Outlet/>).
// - Si no hay sesión, redirige al login.
// - Si adminOnly=true, además exige rol ADMIN.
export default function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
