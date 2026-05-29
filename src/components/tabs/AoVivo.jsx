import { T } from "../../tokens";
import { EDITORS, COLORS, SCORE_LEVELS, getScoreColor } from "../../data";

const Avatar = ({ nome, cor, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    border: `2px solid ${cor}`, overflow: "hidden",
    background: `${cor}22`,
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative",
  }}>
    <span style={{ fontFamily: T.font, fontSize: size * 0.4, fontWeight: 700, color: cor }}>
      {(nome?.[0] ?? "?").toUpperCase()}
    </span>
    <img
      src={`/avatars/${nome?.toLowerCase()}.jpg`}
      alt={nome}
      onError={e => { e.currentTarget.style.display = "none"; }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
    />
  </div>
);

const ScoreTag = ({ score }) => {
  const level = SCORE_LEVELS.find(l => score >= l.min) ?? SCORE_LEVELS[SCORE_LEVELS.length - 1];
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 8, color: level.color, letterSpacing: 2,
      border: `1px solid ${level.color}55`, padding: "2px 5px", whiteSpace: "nowrap",
    }}>{level.label}</span>
  );
};

export default function AoVivo({ editors, feed }) {
  const sorted = [...editors].sort((a, b) => b.pontuacao - a.pontuacao);

  return (
    <div className="fade" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, border: `1px solid ${T.border}` }}>

      {/* Live feed */}
      <div style={{ background: T.surface, padding: 28, borderRight: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, animation: "pulse 2s infinite" }} />
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.green, letterSpacing: 3 }}>
            TRANSMISSÃO AO VIVO
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {feed.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex", gap: 12,
                padding: "13px 0", borderBottom: `1px solid ${T.border}`,
                alignItems: "flex-start",
                animation: "ticker .4s ease both",
                animationDelay: `${i * 0.06}s`,
              }}
            >
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, whiteSpace: "nowrap", letterSpacing: 1, marginTop: 2 }}>
                {item.time}
              </span>
              <div style={{ width: 3, background: item.cor, alignSelf: "stretch", flexShrink: 0, borderRadius: 2 }} />
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.white, lineHeight: 1.55 }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Team status */}
      <div style={{ background: T.surface, padding: 28 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 3, marginBottom: 26 }}>
          STATUS DO TIME
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {sorted.map((e, idx) => {
            const sc  = getScoreColor(e.pontuacao);
            const cor = COLORS[EDITORS.indexOf(e.nome)];
            return (
              <div
                key={e.nome}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 0", borderBottom: `1px solid ${T.border}`,
                }}
              >
                {/* Rank badge */}
                <span style={{
                  fontFamily: T.mono, fontSize: 10, color: idx === 0 ? T.amber : T.muted,
                  minWidth: 18, textAlign: "right",
                }}>
                  {idx + 1}
                </span>

                <Avatar nome={e.nome} cor={cor} size={38} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.font, fontSize: 15, fontWeight: 700, letterSpacing: 1, color: T.white }}>
                    {e.nome.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 3, letterSpacing: 1 }}>
                    {e.entregas} entregas · {e.taxa_aprovacao}% aprov. v1
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                  <div style={{ fontFamily: T.font, fontSize: 28, fontWeight: 900, color: sc, lineHeight: 1 }}>
                    {e.pontuacao}
                  </div>
                  <ScoreTag score={e.pontuacao} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
