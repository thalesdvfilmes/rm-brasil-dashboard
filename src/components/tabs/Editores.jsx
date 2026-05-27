import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { T } from "../../tokens";
import { EDITORS, COLORS, getScoreColor } from "../../data";

const Avatar = ({ nome, cor, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    border: `2px solid ${cor}`, overflow: "hidden",
    background: `${cor}22`,
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative",
  }}>
    <span style={{ fontFamily: T.font, fontSize: size * 0.4, fontWeight: 700, color: cor }}>
      {nome[0].toUpperCase()}
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

const SCORE_LEVELS = [
  { min: 85,  label: "EXCELENTE",   color: "#6AE68A" },
  { min: 70,  label: "ACIMA",       color: T.green   },
  { min: 40,  label: "ABAIXO",      color: T.amber   },
  { min: 0,   label: "MUITO ABAIXO", color: T.red    },
];

const ScoreTag = ({ score }) => {
  const { label, color } = SCORE_LEVELS.find(l => score >= l.min);
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 9, color, letterSpacing: 2,
      border: `1px solid ${color}55`, padding: "2px 6px", whiteSpace: "nowrap",
    }}>{label}</span>
  );
};

const MetricCell = ({ value, good, bad }) => {
  const color = value >= good ? T.green : value <= bad ? T.red : T.amber;
  return <div style={{ fontFamily: T.mono, fontSize: 12, color, alignSelf: "center" }}>{value}</div>;
};

export default function Editores({ editors, radarData, selEditor, setSelEditor }) {
  const scores = editors.map(x => x.pontuacao);

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
              <MetricCell value={e.versoes_media} good={0} bad={2.5} />
              <MetricCell value={`${e.taxa_aprovacao}%`} good={60} bad={40} />
              <MetricCell value={`${e.prazo}%`} good={80} bad={60} />
              <MetricCell value={e.correcoes_media} good={0} bad={3} />
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
