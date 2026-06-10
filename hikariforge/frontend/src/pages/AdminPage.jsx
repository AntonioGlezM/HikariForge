import { useAuth } from "../context/AuthContext";

// Placeholder de la zona de administración. La ruta está protegida (solo ADMIN);
// aquí irá luego la gestión de productos (crear/borrar).
export default function AdminPage() {
  const { user } = useAuth();
  return (
    <div>
      <h2>Administración (placeholder)</h2>
      <p>Acceso concedido como {user?.email}. Aquí irá la gestión del catálogo.</p>
    </div>
  );
}
