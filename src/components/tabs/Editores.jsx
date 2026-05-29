import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
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
      src={`/avatars/${nome.toLowerCase()}.jpg`}
      alt={nome}
      onError={e => { e.currentTarget.style.display = "none"; }}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover", objectPosition: "center top",
      }}
    />
  </div>
);

// ScoreTag usa SCORE_LEVELS importado de data.js — fonte única de verdade
const ScoreTag = ({ score }) => {
  const level = SCORE_LEVELS.find(l => score >= l.min) ?? SCORE_LEVELS[SCORE_LEVELS.length - 1];
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 9, color: level.color, letterSpacing: 2,
      border: `1px solid ${level.color}55`, padding: "2px 6px", whiteSpace: "nowrap",
    }}>{level.label}</span>
  );
};

// pctColor = getScoreColor (mesmos limiares, reutilizado de data.js)
// Versões/proj — menor é melhor
const versoesColor   = v => v <= 1.5 ? T.greenLight : v <= 2.2 ? T.green : v <= 3.0 ? T.amber : T.red;
// Correções/proj — menor é melhor
const correcoesColor = v => v <= 0.8 ? T.greenLight : v <= 1.5 ? T.green : v <= 3.0 ? T.amber : T.red;

const MetricCell = ({ value, color }) => (
  <div style={{ fontFamily: T.mono, fontSize: 12, color, alignSelf: "center" }}>{value}</div>
);

export default function Editores({ editors, radarData, selEditor, setSelEditor }) {

  return (
    <div className="fade">
      {/* Filter chips */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {EDITORS.map((n, i) => {
          const active = selEditor === n;
          return (
            <button
              key={n}
              onClick={() => setSelEditor(active ? null : n)}
              style={{
                background: active ? `${COLORS[i]}18` : "none",
                border: `1px solid ${active ? COLORS[i] : T.border}`,
                color: active ? COLORS[i] : T.muted,
                fontFamily: T.mono, fontSize: 10, letterSpacing: 2,
                padding: "6px 14px", cursor: "pointer",
                transition: `all ${T.fast}`,
                display: "flex", alignItems: "center", gap: 8,
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = T.borderHov; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; } }}
            >
              <Avatar nome={n} cor={COLORS[i]} size={20} />
              {n.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Comparison table */}
      <div style={{ border: `1px solid ${T.border}`, marginBottom: 24 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
          padding: "10px 22px", borderBottom: `1px solid ${T.border}`,
          fontFamily: T.mono, fontSize: 9, letterSpacing: 2,
          textTransform: "uppercase", color: T.muted,
        }}>
          {["Editor", "Entregas", "Versões/proj", "Aprov. v1", "No prazo", "Correç./proj", "Score"].map(h => (
            <div key={h}>{h}</div>
          ))}
        </div>

        {[...editors].sort((a, b) => b.pontuacao - a.pontuacao).map(e => {
          const sc      = getScoreColor(e.pontuacao);
          const isActive = selEditor === e.nome;
          return (
            <div
              key={e.nome}
              className="row-hover"
              onClick={() => setSelEditor(isActive ? null : e.nome)}
              style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
                padding: "14px 22px", borderBottom: `1px solid ${T.border}`,
                cursor: "pointer",
                background: isActive ? T.surfaceAct : "transparent",
                transition: `background ${T.fast}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar nome={e.nome} cor={e.cor} size={36} />
                <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, letterSpacing: 1, color: T.white }}>
                  {e.nome.toUpperCase()}
                </span>
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 12, color: T.white, alignSelf: "center" }}>{e.entregas}</div>
              <MetricCell value={e.versoes_media}        color={versoesColor(e.versoes_media)} />
              <MetricCell value={`${e.taxa_aprovacao}%`} color={getScoreColor(e.taxa_aprovacao)} />
              <MetricCell value={`${e.prazo}%`}          color={getScoreColor(e.prazo)} />
              <MetricCell value={e.correcoes_media}      color={correcoesColor(e.correcoes_media)} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, alignSelf: "center" }}>
                <span style={{ fontFamily: T.font, fontSize: 26, fontWeight: 900, color: sc, lineHeight: 1 }}>{e.pontuacao}</span>
                <ScoreTag score={e.pontuacao} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Radar chart */}
      {selEditor && (
        <div className="fade" style={{ border: `1px solid ${T.border}`, padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: T.muted, marginBottom: 4 }}>
            // radar de performance
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <Avatar nome={selEditor} cor={COLORS[EDITORS.indexOf(selEditor)]} size={56} />
            <span style={{ fontFamily: T.font, fontSize: 24, fontWeight: 700, letterSpacing: 2, color: T.white }}>
              {selEditor.toUpperCase()}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData[selEditor]}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: T.muted, fontSize: 10, fontFamily: T.mono }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: T.muted, fontSize: 8, fontFamily: T.mono }} />
              <Radar
                name={selEditor}
                dataKey="value"
                stroke={COLORS[EDITORS.indexOf(selEditor)]}
                fill={COLORS[EDITORS.indexOf(selEditor)]}
                fillOpacity={0.14}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
