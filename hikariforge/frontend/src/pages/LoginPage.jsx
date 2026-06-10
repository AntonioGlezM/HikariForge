import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Formulario mínimo de login (sin diseño todavía). Al entrar, guarda el token
// y redirige al catálogo. El diseño llegará en el paso de "Login y registro".
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate("/"); // al catálogo tras iniciar sesión
    } catch (err) {
      setError(err.response?.data?.mensaje ?? "No se pudo iniciar sesión");
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
      <h2>Entrar</h2>
      <input type="email" placeholder="Email" value={email}
             onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Contraseña" value={password}
             onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Entrar</button>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </form>
  );
}
