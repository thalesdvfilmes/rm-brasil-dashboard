import { useState } from "react";
import { T } from "../tokens";
import { EDITORS, CATEGORIAS_ERRO } from "../data";

const INP = {
  background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.1)`,
  color: "#F0EDE6", padding: "10px 12px",
  fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
  width: "100%", outline: "none", transition: "border-color 0.15s",
};
const SEL = { ...INP, background: "#0D0D0D", cursor: "pointer" };
const LBL = {
  fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
  letterSpacing: 2, textTransform: "uppercase",
  color: "#5A5650", display: "block", marginBottom: 6,
};

export default function Modal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    editor: EDITORS[0], projeto: "", versao: 1,
    correcoes: 0, tipo_correcao: CATEGORIAS_ERRO[0].id,
    gravidade: "baixa", prazo: "sim",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fields = [
    ["Editor", <select value={form.editor} onChange={e => set("editor", e.target.value)} style={SEL}>
      {EDITORS.map(v => <option key={v}>{v}</option>)}
    </select>],
    ["Projeto", <input placeholder="ex: Spot Verão 2025" value={form.projeto} onChange={e => set("projeto", e.target.value)} style={INP} />],
    ["Versão", <input type="number" min={1} max={10} value={form.versao} onChange={e => set("versao", +e.target.value)} style={INP} />],
    ["Correções", <input type="number" min={0} value={form.correcoes} onChange={e => set("correcoes", +e.target.value)} style={INP} />],
    ["Tipo de erro", <select value={form.tipo_correcao} onChange={e => set("tipo_correcao", e.target.value)} style={SEL}>
      {CATEGORIAS_ERRO.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
    </select>],
    ["Gravidade", <select value={form.gravidade} onChange={e => set("gravidade", e.target.value)} style={SEL}>
      <option>baixa</option><option>média</option><option>alta</option>
    </select>],
    ["No prazo?", <select value={form.prazo} onChange={e => set("prazo", e.target.value)} style={SEL}>
      <option value="sim">Sim</option><option value="nao">Não</option>
    </select>],
  ];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.88)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, backdropFilter: "blur(6px)",
    }}>
      <div className="fade" style={{
        background: "#0A0A0A",
        border: `1px solid rgba(232,184,75,0.3)`,
        padding: 36, width: 440,
        maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 24, fontWeight: 900, letterSpacing: 3, color: "#E8B84B",
          }}>
            // NOVA ENTREGA
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none", border: `1px solid rgba(255,255,255,0.07)`,
              color: "#5A5650", width: 30, height: 30, cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#E8453C"; e.currentTarget.style.color = "#E8453C"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#5A5650"; }}
          >✕</button>
        </div>

        {fields.map(([l, el]) => (
          <div key={l} style={{ marginBottom: 18 }}>
            <label style={LBL}>{l}</label>
            {el}
          </div>
        ))}

        <button
          onClick={() => { onAdd(form); onClose(); }}
          style={{
            width: "100%", marginTop: 12,
            background: "#E8B84B", color: "#060606", border: "none",
            padding: "14px",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 16, fontWeight: 700, letterSpacing: 3,
            cursor: "pointer", transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#F0C862")}
          onMouseLeave={e => (e.currentTarget.style.background = "#E8B84B")}
        >
          REGISTRAR →
        </button>
      </div>
    </div>
  );
}
