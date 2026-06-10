import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Formulario mínimo de registro (sin diseño todavía). Crea el usuario, guarda el
// token y redirige al catálogo.
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register({ nombre, email, password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.mensaje ?? "No se pudo completar el registro");
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
      <h2>Registro</h2>
      <input placeholder="Nombre" value={nombre}
             onChange={(e) => setNombre(e.target.value)} />
      <input type="email" placeholder="Email" value={email}
             onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Contraseña (mín. 6)" value={password}
             onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Crear cuenta</button>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </form>
  );
}
