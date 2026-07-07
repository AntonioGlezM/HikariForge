import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { restablecerPassword } from "../api/auth";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";
import Spinner from "../components/Spinner";

// Restablecer la contraseña desde el enlace del correo (?token=...).
export default function RestablecerPage() {
  const { tr } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [nueva, setNueva] = useState("");
  const [repetida, setRepetida] = useState("");
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (nueva !== repetida) { setError(tr.resetMismatch); return; }
    setEnviando(true);
    try {
      await restablecerPassword(token, nueva);
      toast(tr.resetDone, "check");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.mensaje ?? tr.resetError);
      setEnviando(false);
    }
  };

  // Sin token en la URL, el enlace está incompleto: mandamos a pedir otro.
  if (!token) {
    return (
      <main>
        <form className="hf-form">
          <h2>{tr.resetTitle}</h2>
          <p className="hf-error">{tr.resetNoToken}</p>
          <p className="alt"><Link to="/recuperar">{tr.recoverTitle}</Link></p>
        </form>
      </main>
    );
  }

  return (
    <main>
      <form className="hf-form" onSubmit={onSubmit}>
        <h2>{tr.resetTitle}</h2>
        <input className="hf-input" type="password" placeholder={tr.resetNew}
               value={nueva} onChange={(e) => setNueva(e.target.value)} required minLength={6} autoFocus />
        <input className="hf-input" type="password" placeholder={tr.resetRepeat}
               value={repetida} onChange={(e) => setRepetida(e.target.value)} required minLength={6} />
        <button className="hf-btn hf-btn-main" type="submit" disabled={enviando}>
          {enviando ? <><Spinner /> {tr.resetSending}</> : tr.resetBtn}
        </button>
        {error && <p className="hf-error">{error}</p>}
      </form>
    </main>
  );
}
