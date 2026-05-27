import { T } from "../../tokens";
import { getScoreColor } from "../../data";

export default function AoVivo({ editors, feed }) {
  return (
    <div className="fade" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, border: `1px solid ${T.border}` }}>

      {/* Live feed */}
      <div style={{ background: T.surface, padding: 28, borderRight: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: T.green, animation: "pulse 2s infinite",
          }} />
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
              <span style={{
                fontFamily: T.mono, fontSize: 10, color: T.muted,
                whiteSpace: "nowrap", letterSpacing: 1, marginTop: 1,
              }}>
                {item.time}
              </span>
              <div style={{ width: 1, background: item.cor, alignSelf: "stretch", flexShrink: 0 }} />
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.white, lineHeight: 1.55 }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Team status */}
      <div style={{ background: T.surface, padding: 28 }}>
        <div style={{
          fontFamily: T.mono, fontSize: 9, color: T.muted,
          letterSpacing: 3, marginBottom: 26,
        }}>
          STATUS DO TIME
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {editors.map(e => {
            const sc = getScoreColor(e.pontuacao);
            return (
              <div
                key={e.nome}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "15px 0", borderBottom: `1px solid ${T.border}`,
                }}
              >
                <div style={{ width: 2, height: 32, background: e.cor, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.font, fontSize: 15, fontWeight: 700, letterSpacing: 1, color: T.white }}>
                    {e.nome.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 3, letterSpacing: 1 }}>
                    {e.entregas} ENTREGAS · {e.taxa_aprovacao}% APROV.
                  </div>
                </div>
                <div style={{
                  fontFamily: T.font, fontSize: 28, fontWeight: 900,
                  color: sc, lineHeight: 1,
                }}>
                  {e.pontuacao}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
