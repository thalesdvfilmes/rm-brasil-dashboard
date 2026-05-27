import { T } from "../tokens";

export default function BigNum({ value, label, sub, accent = T.amber, metaOk, onClick }) {
  const lineColor = metaOk === true ? T.green : metaOk === false ? T.red : accent;
  const valColor  = metaOk === true ? T.green : metaOk === false ? T.red : T.white;
  const subColor  = metaOk === true ? T.green : metaOk === false ? T.red : T.muted;

  return (
    <div
      onClick={onClick}
      style={{
        borderTop: `2px solid ${lineColor}`,
        padding: "22px 22px 18px",
        background: T.surface,
        position: "relative", overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: `background ${T.fast}`,
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = T.surfaceHov; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.background = T.surface; }}
    >
      <div style={{
        position: "absolute", top: 0, right: 0, width: 90, height: 90,
        background: `radial-gradient(circle at top right, ${lineColor}18, transparent 60%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        fontFamily: T.mono, fontSize: 9, letterSpacing: 3,
        textTransform: "uppercase", color: T.muted, marginBottom: 14,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: T.font, fontSize: 52, fontWeight: 900,
        lineHeight: 1, color: valColor, letterSpacing: -1,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{
          fontFamily: T.mono, fontSize: 10, color: subColor,
          marginTop: 10, letterSpacing: 1,
        }}>
          {metaOk === true  && "▲ "}
          {metaOk === false && "▼ "}
          {sub}
        </div>
      )}
    </div>
  );
}
