import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Al cambiar de ruta: sube el scroll al principio y ajusta el título de la
// pestaña del navegador según la página (mejor navegación y SEO básico).
// El mapa relaciona el inicio de cada ruta con una clave de traducción.
export default function ScrollAndTitle({ tr }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Si hay ancla (#faq...), respetamos el scroll a esa sección (lo hace la página).
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const base = "HikariForge";
    const titulos = {
      "/catalogo": tr.navCatalog,
      "/producto": tr.navProducts,
      "/login": tr.loginTitle,
      "/register": tr.registerTitle,
      "/soporte": tr.navSupport,
      "/favoritos": tr.favsTitle,
      "/perfil": tr.profileTitle,
      "/pedidos": tr.ordersTitle,
      "/admin": tr.adminTitle,
    };
    const clave = Object.keys(titulos).find((k) => pathname.startsWith(k));
    document.title = clave ? `${titulos[clave]} · ${base}` : `${base} — ${tr.heroBadge ?? "Periféricos gaming"}`;
  }, [pathname, hash, tr]);

  return null;
}
