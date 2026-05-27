import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { T } from "../../tokens";
import {
  DAILY, DAILY_DELIVERIES, TIPO_RESUMO, CATEGORIAS_ERRO, COLORS, EDITORS,
  getScoreColor,
} from "../../data";
import BigNum from "../BigNum";

const SectionLabel = ({ top, title }) => (
  <div style={{ marginBottom: 4 }}>
    <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 3, color: T.muted }}>{top}</div>
    <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, letterSpacing: 1, color: T.white }}>{title}</div>
  </div>
);

export default function Resumo({ editors, setTab, setMetricDetalhe, setDiaDetalhe, setSelEditor, setErroView, setFiltCat }) {
  const [ovDia, setOvDia] = useState(null);

  const totalEntregas  = editors.reduce((s, e) => s + e.entregas, 0);
  const mediaAprovacao = Math.round(editors.reduce((s, e) => s + e.taxa_aprovacao, 0) / editors.length);
  const mediaVersoes   = (editors.reduce((s, e) => s + e.versoes_media, 0) / editors.length).toFixed(1);

  const navHistorico = (metric) => { setTab("histórico"); setMetricDetalhe(metric); setDiaDetalhe(null); };

  const OvTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const items = DAILY_DELIVERIES[label] || [];
    return (
      <div style={{
        background: "#0E0E0E", border: `1px solid ${T.amber}55`,
        padding: "10px 12px", fontFamily: T.mono, fontSize: 11, minWidth: 190,
      }}>
        <div style={{ color: T.amber, fontFamily: T.font, fontSize: 13, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.color, fontSize: 9, letterSpacing: 1, marginBottom: 2 }}>{p.name?.toUpperCase()}: {p.value}</div>)}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 6, marginTop: 6 }}>
          {items.slice(0, 3).map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <div style={{ width: 2, height: 10, background: e.cor }} />
              <span style={{ color: T.white, fontSize: 9 }}>{e.editor} · {e.projeto}</span>
            </div>
          ))}
          {items.length > 3 && <div style={{ color: T.muted, fontSize: 9, marginTop: 2 }}>+ {items.length - 3} mais · clique</div>}
        </div>
      </div>
    );
  };

  const ErrTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const cat = CATEGORIAS_ERRO.find(c => c.label === label);
    return (
      <div style={{
        background: "#0E0E0E", border: `1px solid ${cat?.cor || T.amber}55`,
        padding: "10px 12px", fontFamily: T.mono, fontSize: 11,
      }}>
        <div style={{ color: cat?.cor || T.amber, fontFamily: T.font, fontSize: 13, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
          {cat?.icon} {label}
        </div>
        <div style={{ color: T.white, marginBottom: 4 }}>{payload[0]?.value} ocorrências</div>
        <div style={{ color: T.muted, fontSize: 9, letterSpacing: 1, borderTop: `1px solid ${T.border}`, paddingTop: 5, marginTop: 5 }}>
          CLIQUE PARA VER NA ABA ERROS →
        </div>
      </div>
    );
  };

  return (
    <div className="fade">
      {/* KPIs */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5,1fr)",
        gap: 1, marginBottom: 28, border: `1px solid ${T.border}`,
      }}>
        <BigNum label="Entregas / mês"     value={totalEntregas}        sub="▲ +12% vs anterior"    accent={T.amber}  metaOk={totalEntregas >= 50} onClick={() => navHistorico("entregas")} />
        <BigNum label="Aprovação na v1"    value={`${mediaAprovacao}%`} sub="Meta: 70%"              accent={T.green}  metaOk={mediaAprovacao >= 70} onClick={() => navHistorico("aprovacao_v1")} />
        <BigNum label="Versões / projeto"  value={mediaVersoes}         sub="Ideal: < 2.5"           accent="#A78BFA"  metaOk={parseFloat(mediaVersoes) < 2.5} onClick={() => navHistorico("versoes")} />
        <BigNum label="Editores ativos"    value={EDITORS.length}       sub="todos com entrega"      accent="#4ECDC4"  metaOk={true} onClick={() => { setTab("editores"); setSelEditor(null); }} />
        <BigNum label="Projetos em aberto" value={8}                    sub="3 com prazo hoje"       accent={T.red}    metaOk={false} onClick={() => { setTab("erros"); setErroView("log"); }} />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 1, border: `1px solid ${T.border}`, marginBottom: 28 }}>

        {/* Line chart */}
        <div style={{ background: T.surface, padding: 24, borderRight: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <SectionLabel top="// entregas · correções · versões" title="ÚLTIMOS 14 DIAS" />
            {ovDia && (
              <button onClick={() => setOvDia(null)} style={{
                background: "none", border: `1px solid ${T.border}`, color: T.muted,
                fontFamily: T.mono, fontSize: 9, letterSpacing: 2,
                padding: "3px 9px", cursor: "pointer",
              }}>
                FECHAR ✕
              </button>
            )}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={DAILY.slice(-14)}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              onClick={d => d?.activePayload && setOvDia(
                prev => prev === d.activePayload[0]?.payload?.dia ? null : d.activePayload[0]?.payload?.dia
              )}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fill: T.muted, fontSize: 9, fontFamily: T.mono }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 9, fontFamily: T.mono }} tickLine={false} axisLine={false} />
              <Tooltip content={<OvTooltip />} />
              <Line type="monotone" dataKey="entregas" stroke={T.amber} strokeWidth={2} dot={false} name="Entregas"
                activeDot={{ r: 5, fill: T.amber, stroke: T.bg, strokeWidth: 2, cursor: "pointer" }} />
              <Line type="monotone" dataKey="correcoes" stroke={T.red} strokeWidth={1.5} dot={false} name="Correções" strokeDasharray="4 2"
                activeDot={{ r: 4, fill: T.red, stroke: T.bg, strokeWidth: 2, cursor: "pointer" }} />
              <Line type="monotone" dataKey="versoes" stroke="#A78BFA" strokeWidth={1.5} dot={false} name="Versões"
                activeDot={{ r: 4, fill: "#A78BFA", stroke: T.bg, strokeWidth: 2, cursor: "pointer" }} />
            </LineChart>
          </ResponsiveContainer>

          <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
            {[["Entregas", T.amber], ["Correções", T.red], ["Versões", "#A78BFA"]].map(([l, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>
                <div style={{ width: 16, height: 1.5, background: c }} />{l}
              </div>
            ))}
          </div>

          {/* Drill-down */}
          {ovDia && (
            <div className="fade" style={{ marginTop: 20, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ fontFamily: T.font, fontSize: 22, fontWeight: 900, color: T.amber, letterSpacing: 2 }}>{ovDia}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 2 }}>
                  {(DAILY_DELIVERIES[ovDia] || []).length} ENTREGA{(DAILY_DELIVERIES[ovDia] || []).length !== 1 ? "S" : ""}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
                {(DAILY_DELIVERIES[ovDia] || []).map((e, i) => (
                  <div key={e.id || i} className="fade" style={{
                    background: "rgba(255,255,255,0.025)", padding: "12px 14px",
                    borderLeft: `2px solid ${e.cor}`,
                    animationDelay: `${i * 0.04}s`,
                  }}>
                    <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 700, letterSpacing: 1, color: T.white, marginBottom: 2 }}>
                      {e.editor.toUpperCase()}
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.white, marginBottom: 6 }}>{e.projeto}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{e.hora}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>· V{e.versao} ·</span>
                      <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600, color: e.status === "Aprovado" ? T.green : e.status === "Em revisão" ? T.amber : T.red }}>
                        {e.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error bar chart */}
        <div style={{ background: T.surface, padding: 24 }}>
          <SectionLabel top="// tipos de erro · clique para detalhar" title="OCORRÊNCIAS" />
          <div style={{ marginTop: 20 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={TIPO_RESUMO} layout="vertical"
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                onClick={d => {
                  if (!d?.activePayload) return;
                  const label = d.activePayload[0]?.payload?.tipo;
                  const cat = CATEGORIAS_ERRO.find(c => c.label === label);
                  if (cat) { setFiltCat(cat.id); setErroView("overview"); setTab("erros"); }
                }}
              >
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="tipo" tick={{ fill: T.muted, fontSize: 9, fontFamily: T.mono }} tickLine={false} axisLine={false} width={75} />
                <Tooltip content={<ErrTooltip />} />
                <Bar dataKey="qtd" radius={[0, 2, 2, 0]} name="Total" cursor="pointer">
                  {TIPO_RESUMO.map((_, i) => <Cell key={i} fill={CATEGORIAS_ERRO[i]?.cor || T.amber} opacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 2, marginTop: 10, textAlign: "center" }}>
            CLIQUE NA BARRA → VER DETALHES
          </div>
        </div>
      </div>

      {/* Editor ranking strip */}
      <div style={{ border: `1px solid ${T.border}` }}>
        <div style={{ borderBottom: `1px solid ${T.border}`, padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SectionLabel top="// performance do time" title="RANKING DE EDITORES" />
          <button onClick={() => setTab("editores")} style={{
            background: "none", border: `1px solid ${T.border}`, color: T.muted,
            fontFamily: T.mono, fontSize: 9, letterSpacing: 2, padding: "5px 12px", cursor: "pointer",
            transition: `color ${T.fast}, border-color ${T.fast}`,
          }}
            onMouseEnter={e => { e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = T.borderHov; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
          >
            VER TUDO →
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 0 }}>
          {[...editors].sort((a, b) => b.pontuacao - a.pontuacao).map((e, i) => {
            const sc = getScoreColor(e.pontuacao, editors.map(x => x.pontuacao));
            return (
              <div
                key={e.nome}
                onClick={() => { setSelEditor(e.nome); setTab("editores"); }}
                style={{
                  borderRight: i < 4 ? `1px solid ${T.border}` : "none",
                  padding: "20px 22px 18px", cursor: "pointer",
                  transition: `background ${T.fast}`,
                }}
                onMouseEnter={ev => (ev.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 2 }}>#{i + 1}</span>
                  <div style={{ width: 6, height: 6, background: e.cor }} />
                </div>
                <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, letterSpacing: 1, color: T.white, marginBottom: 2 }}>{e.nome}</div>
                <div style={{ fontFamily: T.font, fontSize: 44, fontWeight: 900, lineHeight: 1, color: sc, letterSpacing: -1 }}>{e.pontuacao}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 6, letterSpacing: 1 }}>{e.entregas} ENTREGAS</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
