import {
  LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { T } from "../../tokens";
import { DAILY, DAILY_DELIVERIES, getDayDetail } from "../../data";

const METRIC_CONFIG = {
  entregas:     { label: "ENTREGAS POR DIA",   cor: "#E8B84B", legendDia: d => `${(DAILY_DELIVERIES[d]||[]).length} entrega${(DAILY_DELIVERIES[d]||[]).length !== 1 ? "s" : ""}` },
  versoes:      { label: "VERSÕES ABERTAS",     cor: "#A78BFA", legendDia: d => `${(getDayDetail(d,"versoes")||[]).length} projeto${(getDayDetail(d,"versoes")||[]).length !== 1 ? "s" : ""} com nova versão` },
  correcoes:    { label: "CORREÇÕES POR DIA",   cor: "#E8453C", legendDia: d => `${(getDayDetail(d,"correcoes")||[]).length} projeto${(getDayDetail(d,"correcoes")||[]).length !== 1 ? "s" : ""} corrigido${(getDayDetail(d,"correcoes")||[]).length !== 1 ? "s" : ""}` },
  aprovacao_v1: { label: "APROVAÇÃO v1 (%)",    cor: "#2ECC71", legendDia: d => { const it = getDayDetail(d,"aprovacao_v1")||[]; const ok = it.filter(x => x.aprovado).length; return `${ok}/${it.length} aprovado${ok !== 1 ? "s" : ""}`; } },
};

function DetailPanel({ diaDetalhe, metric }) {
  const items = getDayDetail(diaDetalhe, metric);
  const cfg   = METRIC_CONFIG[metric];
  return (
    <div style={{
      padding: 20, background: "rgba(232,184,75,0.025)",
      animation: "fadeUp .25s ease both",
      overflowY: "auto", maxHeight: 400,
      borderLeft: `1px solid rgba(255,255,255,0.07)`,
    }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#5A5650", letterSpacing: 3, marginBottom: 4 }}>
        // {cfg.label}
      </div>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: 2, color: cfg.cor, lineHeight: 1, marginBottom: 6 }}>
        {diaDetalhe}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#5A5650", letterSpacing: 2, marginBottom: 16 }}>
        {cfg.legendDia(diaDetalhe).toUpperCase()}
      </div>
      {items.length === 0 && <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#5A5650" }}>Sem registros.</div>}
      {items.map((e, i) => (
        <div key={e.id || i} style={{
          borderBottom: `1px solid rgba(255,255,255,0.07)`,
          paddingBottom: 12, marginBottom: 12,
          animation: "fadeUp .3s ease both", animationDelay: `${i * 0.04}s`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <div style={{ width: 2, height: 28, background: e.cor, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 1, color: "#F0EDE6" }}>
                {e.editor.toUpperCase()}
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#5A5650", marginTop: 1 }}>{e.hora}</div>
            </div>
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#F0EDE6", marginBottom: 4, paddingLeft: 10 }}>
            {e.projeto}
          </div>
          <div style={{ display: "flex", gap: 8, paddingLeft: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#5A5650" }}>{e.cliente}</span>
            {metric === "entregas" && <>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#5A5650" }}>· V{e.versao} ·</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: e.status === "Aprovado" ? "#2ECC71" : e.status === "Em revisão" ? "#E8B84B" : "#E8453C" }}>
                {e.status?.toUpperCase()}
              </span>
            </>}
            {metric === "versoes" && <>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#5A5650" }}>·</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#A78BFA" }}>{e.detail}</span>
            </>}
            {metric === "correcoes" && <>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#5A5650" }}>·</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#E8453C" }}>{e.detail}</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: e.gravidade === "alta" ? "#E8453C" : e.gravidade === "média" ? "#E8B84B" : "#2ECC71" }}>
                · {e.gravidade?.toUpperCase()}
              </span>
            </>}
            {metric === "aprovacao_v1" && <>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#5A5650" }}>·</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, fontWeight: 700, color: e.aprovado ? "#2ECC71" : "#E8453C" }}>
                {e.aprovado ? "APROVADO V1" : "REPROVADO V1"}
              </span>
              {!e.aprovado && <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#E8453C" }}> · {e.motivo}</span>}
            </>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartBlock({ metric, height = 160, isFirst = false, diaDetalhe, setDiaDetalhe, metricDetalhe, setMetricDetalhe }) {
  const cfg  = METRIC_CONFIG[metric];
  const open = diaDetalhe && metricDetalhe === metric;

  const openDay = (dia, met) => {
    if (diaDetalhe === dia && metricDetalhe === met) { setDiaDetalhe(null); }
    else { setDiaDetalhe(dia); setMetricDetalhe(met); }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const items = getDayDetail(label, metric);
    return (
      <div style={{
        background: "#0E0E0E", border: `1px solid ${cfg.cor}55`,
        padding: "10px 12px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, minWidth: 170,
      }}>
        <div style={{ color: cfg.cor, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>{label}</div>
        <div style={{ color: "#5A5650", fontSize: 9, letterSpacing: 2, marginBottom: 5 }}>
          {payload[0]?.value}{metric === "aprovacao_v1" ? "%" : ""}
        </div>
        {items.slice(0, 3).map((e, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 2, height: 10, background: e.cor }} />
            <span style={{ color: "#F0EDE6", fontSize: 10 }}>{e.editor.split(" ")[0]} · {e.projeto}</span>
          </div>
        ))}
        {items.length > 3 && <div style={{ color: "#5A5650", fontSize: 9, marginTop: 3 }}>+ {items.length - 3} mais</div>}
        <div style={{ color: "#5A5650", fontSize: 9, marginTop: 6, borderTop: `1px solid rgba(255,255,255,0.07)`, paddingTop: 5 }}>CLIQUE PARA EXPANDIR</div>
      </div>
    );
  };

  return (
    <div style={{ background: isFirst ? "transparent" : "rgba(255,255,255,0.028)", borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
      <div style={{
        display: "flex", alignItems: "baseline", gap: 12,
        padding: "18px 24px 12px",
        borderBottom: open ? `1px solid rgba(255,255,255,0.07)` : "none",
      }}>
        <div style={{ width: 3, height: isFirst ? 22 : 18, background: cfg.cor }} />
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: isFirst ? 22 : 16, fontWeight: 700, letterSpacing: 2, color: "#F0EDE6" }}>
          {cfg.label}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#5A5650", letterSpacing: 2 }}>
          30 DIAS · CLIQUE PARA DETALHAR
        </span>
        {open && (
          <button onClick={() => setDiaDetalhe(null)} style={{
            marginLeft: "auto", background: "none", border: `1px solid rgba(255,255,255,0.07)`,
            color: "#5A5650", fontFamily: "'IBM Plex Mono',monospace", fontSize: 9,
            letterSpacing: 2, padding: "3px 9px", cursor: "pointer",
          }}>FECHAR ✕</button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: open ? "1fr 340px" : "1fr", transition: "grid-template-columns 0.25s ease" }}>
        <div style={{ padding: isFirst ? "0 24px 20px" : "16px 24px" }}>
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={DAILY}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              onClick={d => d?.activePayload && openDay(d.activePayload[0]?.payload?.dia, metric)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fill: "#5A5650", fontSize: 8, fontFamily: "'IBM Plex Mono',monospace" }} tickLine={false} axisLine={false} interval={isFirst ? 2 : 6} />
              <YAxis tick={{ fill: "#5A5650", fontSize: 8, fontFamily: "'IBM Plex Mono',monospace" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey={metric} stroke={cfg.cor} strokeWidth={2} dot={false} name={cfg.label}
                activeDot={{ r: 5, fill: cfg.cor, stroke: "#060606", strokeWidth: 2, cursor: "pointer",
                  onClick: (_, payload) => openDay(payload?.payload?.dia, metric) }}
              />
            </LineChart>
          </ResponsiveContainer>

          {isFirst && (
            <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
              {DAILY.map((d, i) => {
                const qtd   = (DAILY_DELIVERIES[d.dia] || []).length;
                const isSel = diaDetalhe === d.dia && metricDetalhe === metric;
                return (
                  <button key={i} onClick={() => openDay(d.dia, metric)} title={d.dia} style={{
                    background: isSel ? cfg.cor : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isSel ? cfg.cor : "rgba(255,255,255,0.09)"}`,
                    color: isSel ? "#060606" : "#8A8480",
                    fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: 0,
                    padding: "5px 9px", cursor: "pointer", transition: "all 0.12s",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <span>{d.dia.split("/")[0]}/{d.dia.split("/")[1]}</span>
                    {qtd > 0 && (
                      <span style={{
                        background: isSel ? "rgba(0,0,0,0.2)" : cfg.cor + "33",
                        color: isSel ? "#060606" : cfg.cor,
                        fontSize: 8, padding: "1px 4px", borderRadius: 2,
                      }}>{qtd}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {open && <DetailPanel diaDetalhe={diaDetalhe} metric={metric} />}
      </div>
    </div>
  );
}

export default function Historico({ diaDetalhe, setDiaDetalhe, metricDetalhe, setMetricDetalhe }) {
  const shared = { diaDetalhe, setDiaDetalhe, metricDetalhe, setMetricDetalhe };
  return (
    <div className="fade">
      <div style={{ border: `1px solid rgba(255,255,255,0.07)`, marginBottom: 1 }}>
        <ChartBlock metric="entregas" height={200} isFirst {...shared} />
      </div>
      <div style={{ border: `1px solid rgba(255,255,255,0.07)` }}>
        <ChartBlock metric="versoes"      height={90} {...shared} />
        <ChartBlock metric="correcoes"    height={90} {...shared} />
        <ChartBlock metric="aprovacao_v1" height={90} {...shared} />
      </div>
    </div>
  );
}
