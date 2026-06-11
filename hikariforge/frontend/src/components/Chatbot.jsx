import { useEffect, useRef, useState } from "react";
import { useSettings } from "../context/SettingsContext";

// Chatbot fijo abajo a la derecha con respuestas guionizadas (demo).
export default function Chatbot() {
  const { tr } = useSettings();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [texto, setTexto] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    if (open && msgs.length === 0) setMsgs([{ who: "bot", txt: tr.chatHi }]);
  }, [open]); // eslint-disable-line

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [msgs]);

  const responder = (q) => {
    q = q.toLowerCase();
    const r = tr.chatReplies;
    if (/env[ií]o|entrega|ship|deliver/.test(q)) return r.ship;
    if (/garant|warrant/.test(q)) return r.warranty;
    if (/precio|cuesta|price|cost/.test(q)) return r.price;
    if (/hola|buenas|hey|hi|hello/.test(q)) return r.hi;
    if (/rat[oó]n|teclado|mouse|keyboard|audio|pad/.test(q)) return r.cat;
    return r.def;
  };

  const enviar = () => {
    const x = texto.trim();
    if (!x) return;
    setMsgs((m) => [...m, { who: "me", txt: x }]);
    setTexto("");
    setTimeout(() => setMsgs((m) => [...m, { who: "bot", txt: responder(x) }]), 500);
  };

  return (
    <>
      <button className="hf-chat-btn" onClick={() => setOpen((o) => !o)} aria-label="Chat">
        <i className="ti ti-message-circle" />
      </button>
      <div className={`hf-chat-panel ${open ? "open" : ""}`}>
        <div className="hf-chat-head">
          <div className="av">光</div>
          <div><b>Hikari</b><small>{tr.online}</small></div>
          <button className="hf-close-round" style={{ marginLeft: "auto", width: 38, height: 38 }}
                  onClick={() => setOpen(false)} aria-label="Cerrar"><i className="ti ti-x" /></button>
        </div>
        <div className="hf-chat-body" ref={bodyRef}>
          {msgs.map((m, i) => <div key={i} className={`hf-msg ${m.who}`}>{m.txt}</div>)}
        </div>
        <div className="hf-chat-input">
          <input value={texto} placeholder={tr.chatPh}
                 onChange={(e) => setTexto(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && enviar()} />
          <button onClick={enviar} aria-label="Enviar"><i className="ti ti-send" /></button>
        </div>
      </div>
    </>
  );
}
