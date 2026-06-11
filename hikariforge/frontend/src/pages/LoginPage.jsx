import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import GoogleButton from "../components/GoogleButton";

// Login con email/contraseña y con Google.
export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const { tr } = useSettings();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.mensaje ?? tr.loginError);
    }
  };

  // Recibe el idToken del botón de Google y lo cambia por nuestro JWT.
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
        <h2>{tr.loginTitle}</h2>
        <input className="hf-input" type="email" placeholder={tr.email}
               value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="hf-input" type="password" placeholder={tr.password}
               value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="hf-btn hf-btn-main" type="submit">{tr.loginBtn}</button>
        {error && <p className="hf-error">{error}</p>}

        <div className="hf-divider">{tr.or}</div>
        <GoogleButton onCredential={onGoogle} />

        <p className="alt">{tr.noAccount} <Link to="/register">{tr.registerTitle}</Link></p>
      </form>
    </main>
  );
}
