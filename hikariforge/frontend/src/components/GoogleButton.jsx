import { useEffect, useRef } from "react";

// Botón oficial de "Iniciar sesión con Google" (Google Identity Services).
// Carga el script de Google una sola vez y entrega el idToken por onCredential.
export default function GoogleButton({ onCredential }) {
  const ref = useRef(null);

  useEffect(() => {
    const iniciar = () => {
      if (!window.google || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (resp) => onCredential(resp.credential), // credential = idToken
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: "outline", size: "large", shape: "pill", width: 320,
      });
    };

    if (document.getElementById("google-gsi")) { iniciar(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.id = "google-gsi";
    s.async = true;
    s.onload = iniciar;
    document.head.appendChild(s);
  }, [onCredential]);

  return <div ref={ref} className="hf-google-btn" />;
}
