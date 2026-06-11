import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

// Página de soporte: Contacto, FAQ (acordeón) y Garantía.
// Se puede enlazar directamente a una sección con /soporte#faq, #contacto o #garantia.
export default function SoportePage() {
  const { tr } = useSettings();
  const { hash } = useLocation();

  // Al entrar con un hash (#faq...), hace scroll hasta esa sección.
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    const el = document.getElementById(hash.slice(1));
    el?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <main className="hf-wrap hf-section">
      <div className="hf-section-head">
        <span className="hf-eyebrow">{tr.navSupport}</span>
        <h2 className="hf-h2">{tr.navSupport}</h2>
      </div>

      <div className="hf-support">
        {/* Contacto */}
        <section id="contacto" className="hf-sup-card">
          <h3><i className="ti ti-mail" />{tr.ddContact[0]}</h3>
          <p>{tr.supContactBody}</p>
          <a className="hf-btn hf-btn-main" style={{ display: "inline-block" }}
             href="mailto:soporte@hikariforge.dev">{tr.supContactCta}</a>
        </section>

        {/* FAQ con acordeón */}
        <section id="faq" className="hf-sup-card">
          <h3><i className="ti ti-help-circle" />{tr.ddFaq[0]}</h3>
          <div className="hf-faq">
            {tr.supFaqs.map(([pregunta, respuesta]) => (
              <details key={pregunta}>
                <summary>{pregunta} <i className="ti ti-chevron-down" /></summary>
                <p>{respuesta}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Garantía */}
        <section id="garantia" className="hf-sup-card">
          <h3><i className="ti ti-shield-check" />{tr.ddWarranty[0]}</h3>
          <p>{tr.supWarrantyBody}</p>
        </section>
      </div>
    </main>
  );
}
