import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import CatalogoPage from "./pages/CatalogoPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";

// Define la navegación y el mapa de rutas. El diseño es mínimo a propósito:
// solo sirve para comprobar que el esqueleto (rutas + sesión) funciona.
export default function App() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <div>
      <nav style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, borderBottom: "1px solid #ddd" }}>
        <Link to="/">Catálogo</Link>
        {isAdmin && <Link to="/admin">Admin</Link>}
        <span style={{ marginLeft: "auto" }} />
        {isAuthenticated ? (
          <>
            <span>{user?.email} ({user?.rol})</span>
            <button onClick={logout}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/register">Registro</Link>
          </>
        )}
      </nav>

      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Zona solo para ADMIN */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}
