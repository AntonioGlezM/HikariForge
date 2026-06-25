import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import GoogleButton from "../components/GoogleButton";
import Spinner from "../components/Spinner";

// Registro con formulario o directamente con Google (crea la cuenta si no existe).
export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const { tr } = useSettings();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await register({ nombre, email, password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.mensaje ?? tr.registerError);
      setEnviando(false);
    }
  };

  const onGoogle = useCallback(async (idToken) => {
    try {
      await loginWithGoogle(idToken);
      navigate("/");
    } catch {
      setError(tr.googleError);
    }
  }, [loginWithGoogle, navigate, tr]);

  return (
    <main>
      <form className="hf-form" onSubmit={onSubmit}>
        <h2>{tr.registerTitle}</h2>
        <input className="hf-input" placeholder={tr.nombre}
               value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input className="hf-input" type="email" placeholder={tr.email}
               value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="hf-input" type="password" placeholder={tr.password}
               value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="hf-btn hf-btn-main" type="submit" disabled={enviando}>
          {enviando ? <><Spinner /> {tr.registerSending}</> : tr.registerBtn}
        </button>
        {error && <p className="hf-error">{error}</p>}

        <div className="hf-divider">{tr.or}</div>
        <GoogleButton onCredential={onGoogle} />

        <p className="alt">{tr.haveAccount} <Link to="/login">{tr.loginTitle}</Link></p>
      </form>
    </main>
  );
}
