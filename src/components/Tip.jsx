import { T } from "../tokens";

export default function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#111", border: `1px solid ${T.border}`,
      padding: "9px 12px",
      fontFamily: T.mono, fontSize: 11, color: T.white,
    }}>
      <div style={{ color: T.muted, marginBottom: 5, fontSize: 9, letterSpacing: 1 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || T.amber, lineHeight: 1.6 }}>
          {p.name}: <b>{p.value}</b>
        </div>
      ))}
    </div>
  );
}
