import { useSettings } from "../context/SettingsContext";

// Barra superior: iconos sociales a la izquierda y marquesina capada en el centro.
export default function AnnounceBar() {
  const { tr } = useSettings();
  const piezas = Array.from({ length: 12 }); // repeticiones para el bucle continuo

  return (
    <div className="hf-announce">
      <div className="socials">
        <a href="#" aria-label="X"><i className="ti ti-brand-x" /></a>
        <a href="#" aria-label="Instagram"><i className="ti ti-brand-instagram" /></a>
        <a href="#" aria-label="YouTube"><i className="ti ti-brand-youtube" /></a>
        <a href="#" aria-label="TikTok"><i className="ti ti-brand-tiktok" /></a>
        <a href="#" aria-label="Discord"><i className="ti ti-brand-discord" /></a>
      </div>
      <div className="hf-marquee">
        <div className="hf-marquee-track">
          {piezas.map((_, i) => (
            <span key={i}>
              <span>{i % 2 ? tr.marq2 : tr.marq1}</span>
              <span className="dot"> ◆ </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
