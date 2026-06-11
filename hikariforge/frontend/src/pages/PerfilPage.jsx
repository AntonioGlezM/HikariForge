import { useEffect, useState } from "react";
import { miPerfil, actualizarPerfil, cambiarPassword } from "../api/usuarios";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

// Perfil del usuario: editar nombre/email y cambiar la contraseña.
export default function PerfilPage() {
  const { tr } = useSettings();
  const { refrescarSesion } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [msgDatos, setMsgDatos] = useState(null);   // { ok, texto }
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [msgPass, setMsgPass] = useState(null);

  useEffect(() => {
    miPerfil().then(({ data }) => { setNombre(data.nombre ?? ""); setEmail(data.email); });
  }, []);

  const guardarDatos = async (e) => {
    e.preventDefault();
    setMsgDatos(null);
    try {
      // El backend devuelve un token nuevo porque el email forma parte del JWT.
      const { data } = await actualizarPerfil({ nombre, email });
      refrescarSesion(data);
      setMsgDatos({ ok: true, texto: tr.profileSaved });
    } catch (err) {
      setMsgDatos({ ok: false, texto: err.response?.data?.mensaje ?? tr.loadError });
    }
  };

  const guardarPass = async (e) => {
    e.preventDefault();
    setMsgPass(null);
    try {
      await cambiarPassword({ actual, nueva });
      setActual(""); setNueva("");
      setMsgPass({ ok: true, texto: tr.passSaved });
    } catch (err) {
      setMsgPass({ ok: false, texto: err.response?.data?.mensaje ?? tr.loadError });
    }
  };

  return (
    <main className="hf-wrap hf-section">
      <div className="hf-section-head">
        <span className="hf-eyebrow">{tr.accProfile}</span>
        <h2 className="hf-h2">{tr.profileTitle}</h2>
      </div>

      <div className="hf-support">
        <section className="hf-sup-card">
          <h3><i className="ti ti-user" />{tr.profileData}</h3>
          <form className="hf-profile-form" onSubmit={guardarDatos}>
            <input className="hf-input" placeholder={tr.nombre} value={nombre}
                   onChange={(e) => setNombre(e.target.value)} required />
            <input className="hf-input" type="email" placeholder={tr.email} value={email}
                   onChange={(e) => setEmail(e.target.value)} required />
            <button className="hf-btn hf-btn-main" type="submit">{tr.profileSave}</button>
            {msgDatos && <p className={msgDatos.ok ? "hf-ok" : "hf-error"}>{msgDatos.texto}</p>}
          </form>
        </section>

        <section className="hf-sup-card">
          <h3><i className="ti ti-lock" />{tr.passTitle}</h3>
          <form className="hf-profile-form" onSubmit={guardarPass}>
            <input className="hf-input" type="password" placeholder={tr.passCurrent} value={actual}
                   onChange={(e) => setActual(e.target.value)} required />
            <input className="hf-input" type="password" placeholder={tr.passNew} value={nueva}
                   onChange={(e) => setNueva(e.target.value)} required minLength={6} />
            <button className="hf-btn hf-btn-main" type="submit">{tr.passSave}</button>
            {msgPass && <p className={msgPass.ok ? "hf-ok" : "hf-error"}>{msgPass.texto}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
