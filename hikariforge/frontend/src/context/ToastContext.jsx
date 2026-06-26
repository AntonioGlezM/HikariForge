import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

// Avisos breves ("toast") que aparecen abajo y desaparecen solos.
// Uso: const { toast } = useToast(); toast("Añadido a favoritos", "heart");
export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);
  const id = useRef(0);

  const toast = useCallback((texto, icono = "check") => {
    const key = ++id.current;
    setAvisos((xs) => [...xs, { key, texto, icono }]);
    // Se retira solo a los 2.2s
    setTimeout(() => setAvisos((xs) => xs.filter((a) => a.key !== key)), 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="hf-toasts" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.key} className="hf-toast">
            <i className={`ti ti-${a.icono}`} />{a.texto}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
