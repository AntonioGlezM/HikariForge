import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

// Zona de administración (ruta protegida, solo ADMIN). La gestión completa
// del catálogo (crear/borrar) llegará en el siguiente paso.
export default function AdminPage() {
  const { user } = useAuth();
  const { tr } = useSettings();
  return (
    <main className="hf-wrap hf-section">
      <span className="hf-eyebrow">{tr.adminTitle}</span>
      <h2 className="hf-h2">{tr.adminTitle}</h2>
      <p className="hf-sub">{tr.adminSub} — {user?.email}</p>
    </main>
  );
}
