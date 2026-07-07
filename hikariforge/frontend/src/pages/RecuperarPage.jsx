import { useState } from "react";
import { Link } from "react-router-dom";
import { recuperarPassword } from "../api/auth";
import { useSettings } from "../context/SettingsContext";
import Spinner from "../components/Spinner";

// Recuperación de contraseña: el usuario pide el enlace por email.
// La respuesta es siempre la misma, exista o no la cuenta (no revelamos nada).
export default function RecuperarPage() {
  const { tr } = useSettings();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await recuperarPassword(email);
    } finally {
      // Pase lo que pase, mostramos el mismo mensaje neutro.
      setEnviado(true);
      setEnviando(false);
    }
  };

  return (
    <main>
      <form className="hf-form" onSubmit={onSubmit}>
        <h2>{tr.recoverTitle}</h2>
        {enviado ? (
          <>
            <p className="hf-ok">{tr.recoverSent}</p>
            <p className="alt"><Link to="/login">{tr.backToLogin}</Link></p>
          </>
        ) : (
          <>
            <p className="hf-sub" style={{ marginTop: 0 }}>{tr.recoverText}</p>
            <input className="hf-input" type="email" placeholder={tr.email}
                   value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            <button className="hf-btn hf-btn-main" type="submit" disabled={enviando}>
              {enviando ? <><Spinner /> {tr.recoverSending}</> : tr.recoverBtn}
            </button>
            <p className="alt"><Link to="/login">{tr.backToLogin}</Link></p>
          </>
        )}
      </form>
    </main>
  );
}
