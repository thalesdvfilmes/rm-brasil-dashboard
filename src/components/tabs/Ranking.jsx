import { useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { T } from "../../tokens";
import { EDITORS, COLORS, MONTHS, CUR_M, MONTHLY_SCORES, ACCUMULATED, SCORE_LEVELS } from "../../data";
import Tip from "../Tip";

const SUB_TABS = ["podio", "tabela", "evolução", "conquistas"];

export default function Ranking({ editors }) {
  const [rankSub, setRankSub] = useState("podio");

  const totals  = ACCUMULATED.map(a => a.filter(Boolean).pop() || 0);
  const ranked  = editors.map((e, i) => ({ ...e, total: totals[i] })).sort((a, b) => b.total - a.total);
  const evolData = MONTHS.slice(0, CUR_M).map((mes, mi) => {
    const o = { mes };
    EDITORS.forEach((n, ei) => { o[n] = ACCUMULATED[ei][mi]; });
    return o;
  });

  return (
    <div className="fade">
      {/* Sub-tab bar */}
      <div style={{ display: "flex", gap: 2, marginBottom: 24 }}>
        {SUB_TABS.map(v => (
          <button key={v} onClick={() => setRankSub(v)} style={{
            background: rankSub === v ? T.amberDim : "none",
            border: `1px solid ${rankSub === v ? T.amber : T.border}`,
            color: rankSub === v ? T.amber : T.muted,
            fontFamily: T.mono, fontSize: 10, letterSpacing: 2,
            textTransform: "uppercase", padding: "7px 18px", cursor: "pointer",
            transition: `all ${T.fast}`,
          }}>
            {v}
          </button>
        ))}
      </div>

      {/* Pódio */}
      {rankSub === "podio" && (
        <div style={{ border: `1px solid ${T.border}` }}>
          <div style={{ borderBottom: `1px solid ${T.border}`, padding: "36px 0 0", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            {[ranked[1], ranked[0], ranked[2]].map((v, i) => {
              if (!v) return null;
              const h       = [140, 180, 110][i];
              const medals  = ["🥈", "🥇", "🥉"];
              const accents = [T.muted, T.amber, "#CD7F32"];
              const ac      = accents[i];
              return (
                <div key={v.nome} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1 }}>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 2 }}>{v.nome.toUpperCase()}</div>
                  <div style={{ fontFamily: T.font, fontSize: 52, fontWeight: 900, color: ac, lineHeight: 1, letterSpacing: -1 }}>{v.total}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>PTS ACUMULADOS</div>
                  <div style={{
                    width: "100%", height: h,
                    background: `linear-gradient(to top, ${ac}28 0%, ${ac}08 60%, transparent 100%)`,
                    borderTop: `2px solid ${ac}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 36 }}>{medals[i]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: "24px 28px" }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 3, marginBottom: 16 }}>
              CLASSIFICAÇÃO COMPLETA
            </div>
            {ranked.map((v, i) => {
              const pct = Math.round((v.total / (ranked[0]?.total || 1)) * 100);
              return (
                <div key={v.nome} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, minWidth: 20 }}>{i + 1}</span>
                  <div style={{ width: 2, height: 24, background: v.cor }} />
                  <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, letterSpacing: 1, minWidth: 100, color: T.white }}>
                    {v.nome.toUpperCase()}
                  </span>
                  <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.05)" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: v.cor, transition: "width 1s ease" }} />
                  </div>
                  <span style={{ fontFamily: T.font, fontSize: 22, fontWeight: 900, color: v.cor, minWidth: 60, textAlign: "right" }}>{v.total}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: i === 0 ? T.green : T.muted, minWidth: 56, textAlign: "right", letterSpacing: 1 }}>
                    {i === 0 ? "★ LÍDER" : `-${ranked[0].total - v.total}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabela */}
      {rankSub === "tabela" && (
        <div style={{ border: `1px solid ${T.border}`, overflowX: "auto" }}>
          <div style={{ minWidth: 600, padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: `140px repeat(${CUR_M},1fr) 80px`, gap: 4, marginBottom: 10 }}>
              <div />
              {MONTHS.slice(0, CUR_M).map(m => (
                <div key={m} style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, textAlign: "center", letterSpacing: 2 }}>{m}</div>
              ))}
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, textAlign: "center", letterSpacing: 2 }}>TOTAL</div>
            </div>
            {EDITORS.map((nome, ei) => (
              <div key={nome} style={{ display: "grid", gridTemplateColumns: `140px repeat(${CUR_M},1fr) 80px`, gap: 4, marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 2, height: 20, background: COLORS[ei] }} />
                  <span style={{ fontFamily: T.font, fontSize: 13, fontWeight: 700, letterSpacing: 1, color: T.white }}>{nome.toUpperCase()}</span>
                </div>
                {MONTHLY_SCORES[ei].slice(0, CUR_M).map((s, mi) => {
                  const level = SCORE_LEVELS.find(l => s >= l.min) ?? SCORE_LEVELS[SCORE_LEVELS.length - 1];
                  const fg = level.color;
                  const bg = `${fg}22`;
                  return (
                    <div key={mi} style={{ background: bg, color: fg, padding: "5px 0", fontFamily: T.mono, fontSize: 10, textAlign: "center", fontWeight: 500 }}>
                      {s}
                    </div>
                  );
                })}
                <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 900, color: COLORS[ei], textAlign: "center", alignSelf: "center" }}>
                  {totals[ei]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evolução */}
      {rankSub === "evolução" && (
        <div style={{ border: `1px solid ${T.border}`, padding: 28 }}>
          <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, letterSpacing: 2, marginBottom: 24, color: T.white }}>
            PONTOS ACUMULADOS — {new Date().getFullYear()}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolData} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="mes" tick={{ fill: T.muted, fontSize: 9, fontFamily: T.mono }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 9, fontFamily: T.mono }} tickLine={false} axisLine={false} />
              <Tooltip content={<Tip />} />
              {EDITORS.map((n, i) => <Line key={n} type="monotone" dataKey={n} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 3, fill: COLORS[i] }} />)}
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
            {EDITORS.map((n, i) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>
                <div style={{ width: 16, height: 2, background: COLORS[i] }} />{n.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conquistas */}
      {rankSub === "conquistas" && (
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 3, marginBottom: 16 }}>
            CONQUISTAS DESBLOQUEADAS — {new Date().getFullYear()}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 1, border: `1px solid ${T.border}`, marginBottom: 24 }}>
            {[
              { icon: "🎯", name: "SNIPER",      desc: "Aprovação na v1 por 3 meses" },
              { icon: "⚡", name: "RELÂMPAGO",   desc: "Entregas no prazo o mês todo" },
              { icon: "📈", name: "EM ASCENSÃO", desc: "Maior evolução de pontos" },
              { icon: "🔥", name: "EM CHAMAS",   desc: "Melhor nota do mês" },
              { icon: "🛡️", name: "ZERO ERROS",  desc: "Sem correções de áudio" },
              { icon: "🏆", name: "LÍDER DO ANO",desc: "Maior pontuação acumulada" },
            ].map((b, i) => {
              const owner = ranked[i % ranked.length];
              return (
                <div key={b.name} style={{
                  background: T.surface, padding: 20,
                  borderRight: i % 3 < 2 ? `1px solid ${T.border}` : "none",
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{b.icon}</div>
                  <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, letterSpacing: 2, color: T.white, marginBottom: 4 }}>{b.name}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 12, lineHeight: 1.5 }}>{b.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 2, height: 14, background: owner?.cor }} />
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: owner?.cor, letterSpacing: 1 }}>{owner?.nome?.toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 3, marginBottom: 16 }}>
            PRÓXIMAS CONQUISTAS — BLOQUEADAS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 1, border: `1px solid ${T.border}`, opacity: 0.4 }}>
            {[
              { icon: "💎", name: "DIAMANTE",   desc: "500 pts acumulados no ano" },
              { icon: "🎬", name: "PROLÍFICO",  desc: "30 entregas num único mês" },
              { icon: "✨", name: "IMPECÁVEL",  desc: "10 aprovações consecutivas v1" },
            ].map((b, i) => (
              <div key={b.name} style={{
                background: T.surface, padding: 20,
                borderRight: i < 2 ? `1px solid ${T.border}` : "none",
              }}>
                <div style={{ fontSize: 24, marginBottom: 10, filter: "grayscale(1)" }}>{b.icon}</div>
                <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, letterSpacing: 2, color: T.muted, marginBottom: 4 }}>{b.name}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 12, lineHeight: 1.5 }}>{b.desc}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 2 }}>🔒 BLOQUEADA</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
