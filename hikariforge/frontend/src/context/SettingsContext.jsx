import { createContext, useContext, useEffect, useState } from "react";
import { I18N } from "../i18n/translations";

const SettingsContext = createContext(null);

// Idioma (ES/EN) y tema (claro/oscuro), persistidos en el navegador.
export function SettingsProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") ?? "es");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") ?? "light");

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    // El CSS aplica la paleta oscura cuando html tiene data-theme="dark".
    document.documentElement.dataset.theme = theme === "dark" ? "dark" : "";
  }, [theme]);

  const value = {
    lang, setLang,
    theme, toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    tr: I18N[lang], // diccionario de textos del idioma activo
    // Traduce un nombre de categoría de la BD si hay traducción; si no, lo deja igual.
    trCat: (nombre) => I18N[lang].catMap?.[nombre] ?? nombre,
  };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings debe usarse dentro de <SettingsProvider>");
  return ctx;
}
