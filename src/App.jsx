import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PolarRadiusAxis, Cell, AreaChart, Area
} from "recharts";

// ── DADOS SIMULADOS ──────────────────────────────────────────────────────────

const EDITORS = ["Lucas M.", "Fernanda R.", "João P.", "Camila S.", "Rafael T."];

const COLORS = ["#F5A623", "#E8453C", "#4ECDC4", "#A78BFA", "#34D399"];

const generateDaily = () => {
  const days = [];
  const labels = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));
    days.push({
      dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      entregas: Math.floor(Math.random() * 6) + 1,
      versoes: Math.floor(Math.random() * 10) + 2,
      correcoes: Math.floor(Math.random() * 8) + 1,
      aprovacao_v1: Math.floor(Math.random() * 40) + 40,
    });
  }
  return days;
};

const generateEditorStats = () =>
  EDITORS.map((nome, i) => ({
    nome,
    entregas: Math.floor(Math.random() * 30) + 15,
    versoes_media: +(Math.random() * 2 + 1.2).toFixed(1),
    taxa_aprovacao: Math.floor(Math.random() * 35) + 50,
    prazo: Math.floor(Math.random() * 30) + 65,
    correcoes_media: +(Math.random() * 3 + 0.5).toFixed(1),
    pontuacao: Math.floor(Math.random() * 30) + 60,
    cor: COLORS[i],
  }));

const generateRadar = (editor) => [
  { metric: "Prazo", value: Math.floor(Math.random() * 30) + 65 },
  { metric: "Qualidade", value: Math.floor(Math.random() * 30) + 55 },
  { metric: "Aprovação v1", value: Math.floor(Math.random() * 35) + 45 },
  { metric: "Volume", value: Math.floor(Math.random() * 40) + 50 },
  { metric: "Velocidade", value: Math.floor(Math.random() * 30) + 60 },
  { metric: "Revisões", value: Math.floor(Math.random() * 25) + 60 },
];

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const CURRENT_MONTH = new Date().getMonth();

const generateMonthlyScores = () =>
  EDITORS.map(() => MONTHS.map((_, i) => i < CURRENT_MONTH ? Math.floor(Math.random() * 35) + 58 : null));

const MONTHLY_SCORES = generateMonthlyScores();

const getAccumulated = (scores) =>
  scores.map(edScores => {
    let acc = 0;
    return edScores.map(s => s !== null ? (acc += s, acc) : null);
  });

const ACCUMULATED = getAccumulated(MONTHLY_SCORES);

const BADGES_DATA = [
  { icon: "🎯", name: "Sniper",        desc: "Aprovação na v1 por 3 meses seguidos" },
  { icon: "⚡", name: "Relâmpago",     desc: "Entregou antes do prazo o mês inteiro" },
  { icon: "📈", name: "Em ascensão",   desc: "Maior evolução de pontos em abril" },
  { icon: "🔥", name: "Em chamas",     desc: "Melhor pontuação do mês" },
  { icon: "🛡️", name: "Zero erros",    desc: "Mês completo sem correções de áudio" },
  { icon: "🏆", name: "Líder do ano",  desc: "Maior pontuação acumulada até agora" },
];

const BADGES_LOCKED = [
  { icon: "💎", name: "Diamante",       desc: "Atingir 500 pts acumulados no ano" },
  { icon: "🎬", name: "Prolífico",      desc: "30 entregas em um único mês" },
  { icon: "✨", name: "Perfeccionista", desc: "10 aprovações consecutivas na v1" },
];

const TIPO_CORRECAO = [
  { tipo: "Áudio/Mix", qtd: 34 },
  { tipo: "Corte/Ritmo", qtd: 28 },
  { tipo: "Cor/Grade", qtd: 22 },
  { tipo: "Legenda", qtd: 19 },
  { tipo: "Motion", qtd: 14 },
  { tipo: "Exportação", qtd: 8 },
];

const CLIENTES = ["Banco Digital", "Saúde Total", "Varejo XYZ", "Construtora Sul", "Agência Nova"];

const CATEGORIAS_ERRO = [
  { id: "audio",     label: "Áudio",       icon: "🎧", sub: ["Mix/Volume", "Sincronia A/V", "Ruído de fundo", "Música alta demais"], cor: "#4ECDC4" },
  { id: "corte",     label: "Corte/Ritmo", icon: "✂️",  sub: ["Timing errado", "Pacing lento", "Corte abrupto", "Falta transição"], cor: "#F5A623" },
  { id: "cor",       label: "Cor/Gradação",icon: "🎨", sub: ["Exposição", "Balanço de branco", "Inconsistência entre cenas", "Saturação"], cor: "#A78BFA" },
  { id: "legenda",   label: "Legenda",     icon: "💬", sub: ["Erro ortográfico", "Fora de sincronia", "Formatação errada", "Falta legenda"], cor: "#34D399" },
  { id: "motion",    label: "Motion/GFX",  icon: "✨", sub: ["Lower third errado", "Animação travada", "Vinheta desatualizada", "Logo errado"], cor: "#E8453C" },
  { id: "export",    label: "Exportação",  icon: "📦", sub: ["Codec incorreto", "Resolução errada", "Proporção errada", "Arquivo corrompido"], cor: "#FF8C42" },
  { id: "conteudo",  label: "Conteúdo",    icon: "🎬", sub: ["Falta cena", "Sequência errada", "Take errado", "Falta produto"], cor: "#45B7D1" },
];

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateErros = () => {
  const erros = [];
  const projetos = [
    "Spot TV Verão", "Vídeo Institucional", "Teaser Lançamento", "Série Episódio",
    "Case Cliente", "Reel Instagram", "Apresentação Evento", "Campanha Digital",
  ];
  for (let i = 0; i < 120; i++) {
    const d = new Date();
    d.setDate(d.getDate() - rnd(0, 89));
    const cat = CATEGORIAS_ERRO[rnd(0, CATEGORIAS_ERRO.length - 1)];
    erros.push({
      id: i,
      data: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      dataObj: new Date(d),
      mes: d.getMonth(),
      editor: EDITORS[rnd(0, EDITORS.length - 1)],
      cliente: CLIENTES[rnd(0, CLIENTES.length - 1)],
      projeto: projetos[rnd(0, projetos.length - 1)] + " " + rnd(1, 5),
      categoria: cat.id,
      categoriaLabel: cat.label,
      subTipo: cat.sub[rnd(0, cat.sub.length - 1)],
      versao: rnd(1, 4),
      gravidade: ["baixa", "média", "alta"][rnd(0, 2)],
    });
  }
  return erros.sort((a, b) => b.dataObj - a.dataObj);
};

const ERROS_DATA = generateErros();

const getScoreColor = (score, allScores) => {
  const avg = allScores.reduce((s, v) => s + v, 0) / allScores.length;
  const std = Math.sqrt(allScores.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / allScores.length);
  if (score >= avg + std * 0.4) return "#34D399";
  if (score >= avg - std * 0.4) return "#F5A623";
  return "#E8453C";
};

// ── COMPONENTES AUXILIARES ───────────────────────────────────────────────────

const KPICard = ({ label, value, sub, accent, icon, meta, metaOk }) => {
  const dentroMeta = metaOk !== undefined ? metaOk : null;
  const valueColor = dentroMeta === true ? "#34D399" : dentroMeta === false ? "#E8453C" : "#F0F4F8";
  const borderColor = dentroMeta === true ? "#34D39944" : dentroMeta === false ? "#E8453C44" : "rgba(255,255,255,0.08)";
  return (
    <div style={{
      background: dentroMeta === true ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.035)",
      border: `1px solid ${borderColor}`,
      borderRadius: 16,
      padding: "22px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: dentroMeta === true ? "#34D399" : dentroMeta === false ? "#E8453C" : accent,
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 22, marginBottom: 2 }}>{icon}</span>
        {dentroMeta === true && (
          <span style={{ fontSize: 9, fontWeight: 700, color: "#34D399", background: "#34D39922", border: "1px solid #34D39944", borderRadius: 20, padding: "2px 8px", fontFamily: "'Montserrat', sans-serif", letterSpacing: 0.5 }}>✓ META</span>
        )}
        {dentroMeta === false && (
          <span style={{ fontSize: 9, fontWeight: 700, color: "#E8453C", background: "#E8453C22", border: "1px solid #E8453C44", borderRadius: 20, padding: "2px 8px", fontFamily: "'Montserrat', sans-serif", letterSpacing: 0.5 }}>✗ ABAIXO</span>
        )}
      </div>
      <span style={{ color: "#8899AA", fontSize: 11, fontFamily: "'Montserrat', sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <span style={{ color: valueColor, fontSize: 34, fontWeight: 800, fontFamily: "'Montserrat', sans-serif", letterSpacing: -1, lineHeight: 1 }}>{value}</span>
      <span style={{ color: dentroMeta === true ? "#34D399" : dentroMeta === false ? "#E8453C" : accent, fontSize: 12, fontFamily: "'Montserrat', sans-serif" }}>{sub}</span>
    </div>
  );
};

const ScoreBadge = ({ score }) => {
  const color = score >= 80 ? "#34D399" : score >= 65 ? "#F5A623" : "#E8453C";
  const label = score >= 80 ? "Excelente" : score >= 65 ? "Regular" : "Atenção";
  return (
    <span style={{
      background: color + "22",
      color,
      border: `1px solid ${color}55`,
      borderRadius: 20,
      padding: "2px 10px",
      fontSize: 11,
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 600,
    }}>{label}</span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0D1B2A",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 12,
      fontFamily: "'Montserrat', sans-serif",
      color: "#F0F4F8",
    }}>
      <div style={{ marginBottom: 4, color: "#8899AA" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#F5A623" }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ── MODAL DE ADICIONAR ENTRADA ───────────────────────────────────────────────

const AddEntryModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    editor: EDITORS[0],
    projeto: "",
    versao: 1,
    correcoes: 0,
    tipo_correcao: "Áudio/Mix",
    prazo: "sim",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    color: "#F0F4F8",
    padding: "8px 12px",
    fontSize: 13,
    fontFamily: "'Montserrat', sans-serif",
    width: "100%",
    outline: "none",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
    }}>
      <div style={{
        background: "#0D1B2A",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 20,
        padding: 32,
        width: 420,
        maxWidth: "90vw",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", color: "#F0F4F8" }}>
            + Nova Entrega
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8899AA", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {[
          ["Editor", <select value={form.editor} onChange={e => set("editor", e.target.value)} style={inputStyle}>
            {EDITORS.map(e => <option key={e}>{e}</option>)}
          </select>],
          ["Projeto", <input placeholder="Ex: Spot TV Verão 2025" value={form.projeto} onChange={e => set("projeto", e.target.value)} style={inputStyle} />],
          ["Versão", <input type="number" min={1} max={10} value={form.versao} onChange={e => set("versao", +e.target.value)} style={inputStyle} />],
          ["Correções", <input type="number" min={0} value={form.correcoes} onChange={e => set("correcoes", +e.target.value)} style={inputStyle} />],
          ["Tipo principal", <select value={form.tipo_correcao} onChange={e => set("tipo_correcao", e.target.value)} style={inputStyle}>
            {TIPO_CORRECAO.map(t => <option key={t.tipo}>{t.tipo}</option>)}
          </select>],
          ["Entregue no prazo?", <select value={form.prazo} onChange={e => set("prazo", e.target.value)} style={inputStyle}>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>],
        ].map(([label, input]) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#8899AA", fontFamily: "'Montserrat', sans-serif", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
            {input}
          </div>
        ))}

        <button
          onClick={() => { onAdd(form); onClose(); }}
          style={{
            width: "100%", marginTop: 8,
            background: "#F5A623", color: "#070D16",
            border: "none", borderRadius: 10, padding: "12px 0",
            fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2,
            cursor: "pointer", letterSpacing: 0.5,
          }}>
          REGISTRAR ENTREGA
        </button>
      </div>
    </div>
  );
};

// ── APP PRINCIPAL ────────────────────────────────────────────────────────────

export default function App() {
  const [daily] = useState(generateDaily);
  const [editors, setEditors] = useState(generateEditorStats);
  const [selectedEditor, setSelectedEditor] = useState(null);
  const [radarData] = useState(() => Object.fromEntries(EDITORS.map(e => [e, generateRadar(e)])));
  const [activeTab, setActiveTab] = useState("overview");
  const [showModal, setShowModal] = useState(false);
  const [feed, setFeed] = useState([
    { time: "14:32", text: "Lucas M. entregou v2 — Spot Banco Digital", cor: COLORS[0] },
    { time: "13:15", text: "Fernanda R. aprovada na v1 — Institucional Saúde", cor: COLORS[1] },
    { time: "11:48", text: "João P. recebeu 3 correções — Teaser Filme", cor: COLORS[2] },
    { time: "10:20", text: "Camila S. entregou no prazo — Série Episódio 4", cor: COLORS[3] },
  ]);

  const handleAdd = (form) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const editorIdx = EDITORS.indexOf(form.editor);
    setFeed(f => [{
      time,
      text: `${form.editor} entregou v${form.versao}${form.projeto ? ` — ${form.projeto}` : ""}`,
      cor: COLORS[editorIdx] || "#F5A623",
    }, ...f.slice(0, 9)]);
    setEditors(eds => eds.map(e =>
      e.nome === form.editor
        ? { ...e, entregas: e.entregas + 1, pontuacao: Math.min(100, e.pontuacao + (form.versao <= 2 ? 3 : 1)) }
        : e
    ));
  };

  const [rankingSubTab, setRankingSubTab] = useState("podio");
  const [erroFiltroEditor, setErroFiltroEditor] = useState("todos");
  const [erroFiltroCliente, setErroFiltroCliente] = useState("todos");
  const [erroFiltroCategoria, setErroFiltroCategoria] = useState("todos");
  const [erroFiltroGravidade, setErroFiltroGravidade] = useState("todos");
  const [erroView, setErroView] = useState("overview");

  const errosFiltrados = ERROS_DATA.filter(e =>
    (erroFiltroEditor === "todos" || e.editor === erroFiltroEditor) &&
    (erroFiltroCliente === "todos" || e.cliente === erroFiltroCliente) &&
    (erroFiltroCategoria === "todos" || e.categoria === erroFiltroCategoria) &&
    (erroFiltroGravidade === "todos" || e.gravidade === erroFiltroGravidade)
  );

  const erroPorCategoria = CATEGORIAS_ERRO.map(cat => ({
    label: cat.label,
    icon: cat.icon,
    cor: cat.cor,
    total: errosFiltrados.filter(e => e.categoria === cat.id).length,
    alta: errosFiltrados.filter(e => e.categoria === cat.id && e.gravidade === "alta").length,
  })).sort((a, b) => b.total - a.total);

  const erroPorEditor = EDITORS.map((nome, i) => {
    const errs = errosFiltrados.filter(e => e.editor === nome);
    const obj = { nome, cor: COLORS[i], total: errs.length };
    CATEGORIAS_ERRO.forEach(c => { obj[c.label] = errs.filter(e => e.categoria === c.id).length; });
    return obj;
  }).sort((a, b) => b.total - a.total);

  const erroPorCliente = CLIENTES.map(cli => ({
    nome: cli,
    total: errosFiltrados.filter(e => e.cliente === cli).length,
    alta: errosFiltrados.filter(e => e.cliente === cli && e.gravidade === "alta").length,
  })).sort((a, b) => b.total - a.total);

  const erroSubTipos = (() => {
    const map = {};
    errosFiltrados.forEach(e => { map[e.subTipo] = (map[e.subTipo] || 0) + 1; });
    return Object.entries(map).map(([sub, qtd]) => ({ sub, qtd })).sort((a, b) => b.qtd - a.qtd).slice(0, 10);
  })();

  const gravidadeCount = {
    alta:  errosFiltrados.filter(e => e.gravidade === "alta").length,
    média: errosFiltrados.filter(e => e.gravidade === "média").length,
    baixa: errosFiltrados.filter(e => e.gravidade === "baixa").length,
  };

  const totals = ACCUMULATED.map(a => a.filter(Boolean).pop() || 0);
  const ranked = editors.map((e, i) => ({ ...e, total: totals[i] })).sort((a, b) => b.total - a.total);

  const evolucaoData = MONTHS.slice(0, CURRENT_MONTH).map((mes, mi) => {
    const obj = { mes };
    EDITORS.forEach((nome, ei) => { obj[nome] = ACCUMULATED[ei][mi]; });
    return obj;
  });

  const totalEntregas = editors.reduce((s, e) => s + e.entregas, 0);
  const mediaAprovacao = Math.round(editors.reduce((s, e) => s + e.taxa_aprovacao, 0) / editors.length);
  const mediaVersoes = (editors.reduce((s, e) => s + e.versoes_media, 0) / editors.length).toFixed(1);

  const tabs = ["overview", "editores", "tendências", "ao vivo", "ranking", "erros"];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        body { background: #070D16; font-family: 'Montserrat', sans-serif; }
        .tab-btn { background: none; border: none; cursor: pointer; transition: all 0.2s; }
        .tab-btn:hover { opacity: 0.8; }
        .editor-row:hover { background: rgba(255,255,255,0.04) !important; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .fade-in { animation: fadeIn 0.4s ease both; }
        /* Montserrat hierarchy */
        .rm-h1 { font-family: 'Montserrat', sans-serif; font-weight: 800; letter-spacing: -0.5px; }
        .rm-h2 { font-family: 'Montserrat', sans-serif; font-weight: 700; letter-spacing: -0.3px; }
        .rm-label { font-family: 'Montserrat', sans-serif; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; }
        .rm-body { font-family: 'Montserrat', sans-serif; font-weight: 400; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#070D16", color: "#F0F4F8", fontFamily: "'Montserrat', sans-serif" }}>

        {/* HEADER */}
        <div style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "0 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 64,
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(7,13,22,0.95)",
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAQ4BDgDASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAAgJBQYHBAMCAf/EAF0QAQABAwMCAwMECQ8ICAMIAwABAgMEBQYRByEIEjETQVEJFCJhFTI3OHF1gZGzFhgjNUJSVnN0laGxtMHSJDM2YpSy0fBTVXKSwtPh4kOCwxcmNGN2hZPxRUai/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AIZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9k=" alt="RM Brasil Filmes" style={{ height: 38, width: "auto", objectFit: "contain" }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: 0.5 }}>RM Brasil Filmes</div>
              <div style={{ fontSize: 10, color: "#8899AA", letterSpacing: 1.5 }}>PERFORMANCE · EDITORIAL</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map(t => (
              <button key={t} className="tab-btn" onClick={() => setActiveTab(t)} style={{
                padding: "6px 16px", borderRadius: 8, fontSize: 10, letterSpacing: 1.5,
                textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", fontWeight: 600,
                color: activeTab === t ? "#070D16" : "#8899AA",
                background: activeTab === t ? "#F5A623" : "transparent",
                fontWeight: activeTab === t ? 700 : 400,
              }}>{t}</button>
            ))}
          </div>

          <button onClick={() => setShowModal(true)} style={{
            background: "linear-gradient(135deg, #F5A623, #E8453C)",
            border: "none", borderRadius: 10, padding: "8px 18px",
            color: "#070D16", fontSize: 10, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Montserrat', sans-serif", letterSpacing: 1.5,
          }}>+ ENTREGA</button>
        </div>

        <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="fade-in">
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.5 }}>Dashboard Geral</div>
                <div style={{ fontSize: 12, color: "#8899AA", marginTop: 4 }}>Últimos 30 dias · {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</div>
              </div>

              {/* KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
                <KPICard label="Total de Entregas" value={totalEntregas} sub="▲ +12% vs mês anterior" accent="#F5A623" icon="🎬" metaOk={totalEntregas >= 50} />
                <KPICard label="Aprovação na v1" value={`${mediaAprovacao}%`} sub="Meta: 70%" accent="#34D399" icon="✅" metaOk={mediaAprovacao >= 70} />
                <KPICard label="Versões por projeto" value={mediaVersoes} sub="Ideal: abaixo de 2.5" accent="#A78BFA" icon="🔄" metaOk={parseFloat(mediaVersoes) < 2.5} />
                <KPICard label="Editores ativos" value={EDITORS.length} sub="Todos com entrega este mês" accent="#4ECDC4" icon="👥" metaOk={true} />
                <KPICard label="Projetos em aberto" value={8} sub="3 com prazo hoje" accent="#E8453C" icon="⏳" metaOk={false} />
              </div>

              {/* GRÁFICOS PRINCIPAIS */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, marginBottom: 20, color: "#F0F4F8" }}>
                    Entregas & Correções — 30 dias
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={daily.slice(-14)} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="dia" tick={{ fill: "#8899AA", fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: "#8899AA", fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="entregas" stroke="#F5A623" strokeWidth={2.5} dot={false} name="Entregas" />
                      <Line type="monotone" dataKey="correcoes" stroke="#E8453C" strokeWidth={2} dot={false} name="Correções" strokeDasharray="4 2" />
                      <Line type="monotone" dataKey="versoes" stroke="#A78BFA" strokeWidth={2} dot={false} name="Versões" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                    {[["Entregas", "#F5A623"], ["Correções", "#E8453C"], ["Versões", "#A78BFA"]].map(([l, c]) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8899AA" }}>
                        <div style={{ width: 24, height: 2, background: c, borderRadius: 2 }} />
                        {l}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, marginBottom: 20, color: "#F0F4F8" }}>
                    Tipo de Correção
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={TIPO_CORRECAO} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="tipo" tick={{ fill: "#8899AA", fontSize: 10 }} tickLine={false} axisLine={false} width={70} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="qtd" radius={[0, 6, 6, 0]} name="Ocorrências">
                        {TIPO_CORRECAO.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RANKING EDITORES */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, color: "#F0F4F8" }}>Ranking de Editores</div>
                  <button onClick={() => setActiveTab("editores")} style={{
                    background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                    color: "#8899AA", fontSize: 10, padding: "4px 12px", cursor: "pointer",
                    fontFamily: "'Montserrat', sans-serif", letterSpacing: 1,
                  }}>VER DETALHES →</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                  {[...editors].sort((a, b) => b.pontuacao - a.pontuacao).map((e, i) => {
                    const allScores = editors.map(ed => ed.pontuacao);
                    const scoreColor = getScoreColor(e.pontuacao, allScores);
                    return (
                    <div key={e.nome} style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${e.cor}33`,
                      borderRadius: 12, padding: "16px",
                      cursor: "pointer",
                    }} onClick={() => { setSelectedEditor(e.nome); setActiveTab("editores"); }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: e.cor + "22", color: e.cor,
                          fontSize: 12, fontWeight: 700, display: "flex",
                          alignItems: "center", justifyContent: "center",
                          fontFamily: "'Montserrat', sans-serif",
                        }}>#{i + 1}</div>
                        <ScoreBadge score={e.pontuacao} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, marginTop: 10, color: "#F0F4F8" }}>{e.nome}</div>
                      <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.5, color: scoreColor, lineHeight: 1.1, marginTop: 4 }}>{e.pontuacao}</div>
                      <div style={{ fontSize: 10, color: "#8899AA", marginTop: 2 }}>pts · {e.entregas} entregas</div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* EDITORES */}
          {activeTab === "editores" && (
            <div className="fade-in">
              <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.5 }}>Análise por Editor</div>
                  <div style={{ fontSize: 12, color: "#8899AA", marginTop: 4 }}>Clique num editor para ver o radar de performance</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {EDITORS.map((nome, i) => (
                    <button key={nome} onClick={() => setSelectedEditor(selectedEditor === nome ? null : nome)} style={{
                      background: selectedEditor === nome ? COLORS[i] + "33" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${selectedEditor === nome ? COLORS[i] : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 8, padding: "6px 12px", color: selectedEditor === nome ? COLORS[i] : "#8899AA",
                      fontSize: 11, cursor: "pointer", fontFamily: "'Montserrat', sans-serif",
                    }}>{nome.split(" ")[0]}</button>
                  ))}
                </div>
              </div>

              {/* TABELA */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
                  padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)",
                  fontSize: 10, color: "#8899AA", letterSpacing: 1.5, textTransform: "uppercase",
                }}>
                  {["Editor", "Entregas", "Versões/proj", "Aprovação v1", "No Prazo", "Correções/proj", "Score"].map(h => <div key={h}>{h}</div>)}
                </div>
                {[...editors].sort((a, b) => b.pontuacao - a.pontuacao).map((e, i) => {
                  const allScores = editors.map(ed => ed.pontuacao);
                  const scoreColor = getScoreColor(e.pontuacao, allScores);
                  return (
                  <div key={e.nome} className="editor-row" onClick={() => setSelectedEditor(selectedEditor === e.nome ? null : e.nome)} style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
                    padding: "14px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    background: selectedEditor === e.nome ? "rgba(255,255,255,0.04)" : "transparent",
                    transition: "background 0.15s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.cor }} />
                      <span style={{ fontSize: 13, fontFamily: "'Montserrat', sans-serif", color: "#F0F4F8", fontWeight: 600 }}>{e.nome}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#F0F4F8" }}>{e.entregas}</div>
                    <div style={{ fontSize: 13, color: e.versoes_media > 2.5 ? "#E8453C" : "#34D399" }}>{e.versoes_media}</div>
                    <div style={{ fontSize: 13, color: e.taxa_aprovacao >= 60 ? "#34D399" : "#F5A623" }}>{e.taxa_aprovacao}%</div>
                    <div style={{ fontSize: 13, color: e.prazo >= 80 ? "#34D399" : "#F5A623" }}>{e.prazo}%</div>
                    <div style={{ fontSize: 13, color: e.correcoes_media > 3 ? "#E8453C" : "#34D399" }}>{e.correcoes_media}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", color: scoreColor }}>{e.pontuacao}</span>
                      <ScoreBadge score={e.pontuacao} />
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* RADAR */}
              {selectedEditor && (
                <div className="fade-in" style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16, padding: 24
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, marginBottom: 4 }}>
                    Radar de Performance — {selectedEditor}
                  </div>
                  <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 20 }}>Índice 0–100 por dimensão</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData[selectedEditor]}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: "#8899AA", fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#8899AA", fontSize: 9 }} />
                      <Radar
                        name={selectedEditor}
                        dataKey="value"
                        stroke={COLORS[EDITORS.indexOf(selectedEditor)]}
                        fill={COLORS[EDITORS.indexOf(selectedEditor)]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* TENDÊNCIAS */}
          {activeTab === "tendências" && (
            <div className="fade-in">
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.5 }}>Tendências & Histórico</div>
                <div style={{ fontSize: 12, color: "#8899AA", marginTop: 4 }}>Evolução das métricas nos últimos 30 dias</div>
              </div>

              <div style={{ display: "grid", gap: 20 }}>
                {[
                  { key: "entregas", label: "Entregas por dia", cor: "#F5A623" },
                  { key: "versoes", label: "Versões abertas por dia", cor: "#A78BFA" },
                  { key: "correcoes", label: "Correções por dia", cor: "#E8453C" },
                  { key: "aprovacao_v1", label: "Taxa de aprovação v1 (%)", cor: "#34D399" },
                ].map(({ key, label, cor }) => (
                  <div key={key} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, marginBottom: 16, color: "#F0F4F8" }}>{label}</div>
                    <ResponsiveContainer width="100%" height={130}>
                      <LineChart data={daily} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="dia" tick={{ fill: "#8899AA", fontSize: 9 }} tickLine={false} axisLine={false}
                          interval={Math.floor(daily.length / 7)} />
                        <YAxis tick={{ fill: "#8899AA", fontSize: 9 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey={key} stroke={cor} strokeWidth={2.5} dot={false} name={label} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AO VIVO */}
          {activeTab === "ao vivo" && (
            <div className="fade-in">
              <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.5 }}>Feed Ao Vivo</div>
                  <div style={{ fontSize: 12, color: "#8899AA", marginTop: 4 }}>Atividade em tempo real do time</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#34D399" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399", animation: "pulse 2s infinite" }} />
                  AO VIVO
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* FEED */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, marginBottom: 20 }}>Atividades Recentes</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {feed.map((item, i) => (
                      <div key={i} className="fade-in" style={{
                        display: "flex", gap: 14, alignItems: "flex-start",
                        padding: "12px 14px",
                        background: "rgba(255,255,255,0.025)",
                        borderRadius: 10,
                        borderLeft: `3px solid ${item.cor}`,
                      }}>
                        <div style={{ fontSize: 10, color: "#8899AA", whiteSpace: "nowrap", marginTop: 1 }}>{item.time}</div>
                        <div style={{ fontSize: 12, color: "#D0DCE8" }}>{item.text}</div>
                      </div>
                    ))}
                    {feed.length === 0 && (
                      <div style={{ color: "#8899AA", fontSize: 12, textAlign: "center", padding: 32 }}>
                        Nenhuma atividade registrada ainda.<br />Use o botão + ENTREGA para registrar.
                      </div>
                    )}
                  </div>
                </div>

                {/* STATUS DO TIME */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {editors.map((e, i) => (
                    <div key={e.nome} style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 14, padding: "16px 20px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: e.cor + "22",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, color: e.cor, fontFamily: "'Montserrat', sans-serif",
                        }}>{e.nome.split(" ").map(p => p[0]).join("")}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, color: "#F0F4F8" }}>{e.nome}</div>
                          <div style={{ fontSize: 10, color: "#8899AA" }}>{e.entregas} entregas · Score {e.pontuacao}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <ScoreBadge score={e.pontuacao} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* RANKING ANUAL */}
          {activeTab === "ranking" && (
            <div className="fade-in">
              <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.5 }}>Ranking Anual — {new Date().getFullYear()}</div>
                  <div style={{ fontSize: 12, color: "#8899AA", marginTop: 4 }}>Pontuação acumulada mês a mês · time editorial</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["podio", "tabela", "evolução", "conquistas"].map(t => (
                    <button key={t} onClick={() => setRankingSubTab(t)} style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 11, letterSpacing: 0.5,
                      textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", cursor: "pointer",
                      border: `1px solid ${rankingSubTab === t ? "#F5A623" : "rgba(255,255,255,0.1)"}`,
                      color: rankingSubTab === t ? "#F5A623" : "#8899AA",
                      background: rankingSubTab === t ? "#F5A62318" : "transparent",
                    }}>{t}</button>
                  ))}
                </div>
              </div>

              {/* PÓDIO */}
              {rankingSubTab === "podio" && (
                <div className="fade-in">
                  {/* pódio visual */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 16, marginBottom: 32 }}>
                      {[ranked[1], ranked[0], ranked[2]].map((ed, i) => {
                        const pos = [2, 1, 3][i];
                        const heights = [90, 130, 70];
                        const medals = ["🥈", "🥇", "🥉"];
                        const podiumColors = ["#94A3B8", "#F5A623", "#CD7F32"];
                        return ed ? (
                          <div key={ed.nome} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div style={{ fontSize: 11, color: "#8899AA", fontFamily: "'Montserrat', sans-serif" }}>{ed.nome.split(" ")[0]}</div>
                            <div style={{
                              width: 52, height: 52, borderRadius: "50%",
                              background: ed.cor + "22", border: `2px solid ${ed.cor}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 14, fontWeight: 700, color: ed.cor, fontFamily: "'Montserrat', sans-serif",
                            }}>{ed.nome.split(" ").map(p => p[0]).join("")}</div>
                            <div style={{ fontSize: 12, color: "#8899AA", fontFamily: "'Montserrat', sans-serif" }}>{ed.total} pts</div>
                            <div style={{
                              width: 110, height: heights[i],
                              background: podiumColors[i] + "18",
                              border: `1px solid ${podiumColors[i]}44`,
                              borderRadius: "10px 10px 0 0",
                              display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center", gap: 4,
                            }}>
                              <div style={{ fontSize: 28 }}>{medals[i]}</div>
                              <div style={{ fontSize: 11, color: podiumColors[i], fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>#{pos}</div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>

                    {/* classificação completa */}
                    <div style={{ fontSize: 10, color: "#8899AA", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Classificação completa</div>
                    {ranked.map((ed, i) => {
                      const pct = Math.round((ed.total / (ranked[0].total || 1)) * 100);
                      return (
                        <div key={ed.nome} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                          <div style={{ width: 20, fontSize: 12, color: "#8899AA", textAlign: "center", fontFamily: "'Montserrat', sans-serif" }}>{i + 1}</div>
                          <div style={{
                            width: 34, height: 34, borderRadius: 8,
                            background: ed.cor + "22", color: ed.cor, fontSize: 11,
                            fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'Montserrat', sans-serif", flexShrink: 0,
                          }}>{ed.nome.split(" ").map(p => p[0]).join("")}</div>
                          <div style={{ flex: "0 0 90px", fontSize: 13, fontFamily: "'Montserrat', sans-serif", color: "#F0F4F8", fontWeight: 600 }}>{ed.nome}</div>
                          <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: ed.cor, borderRadius: 99, transition: "width 0.8s ease" }} />
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: ed.cor, fontFamily: "'Montserrat', sans-serif", minWidth: 56, textAlign: "right" }}>{ed.total} pts</div>
                          <div style={{ fontSize: 11, color: i === 0 ? "#34D399" : "#8899AA", minWidth: 60, textAlign: "right", fontFamily: "'Montserrat', sans-serif" }}>
                            {i === 0 ? "🏆 líder" : `-${ranked[0].total - ed.total}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TABELA MENSAL */}
              {rankingSubTab === "tabela" && (
                <div className="fade-in" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, overflowX: "auto" }}>
                  <div style={{ minWidth: 700 }}>
                    {/* header */}
                    <div style={{ display: "grid", gridTemplateColumns: `140px repeat(${CURRENT_MONTH}, 1fr) 80px`, gap: 4, marginBottom: 8 }}>
                      <div />
                      {MONTHS.slice(0, CURRENT_MONTH).map(m => (
                        <div key={m} style={{ fontSize: 10, color: "#8899AA", textAlign: "center", letterSpacing: 1, textTransform: "uppercase" }}>{m}</div>
                      ))}
                      <div style={{ fontSize: 10, color: "#8899AA", textAlign: "center", letterSpacing: 1, textTransform: "uppercase" }}>Total</div>
                    </div>
                    {/* linhas */}
                    {EDITORS.map((nome, ei) => {
                      const total = totals[ei];
                      return (
                        <div key={nome} style={{ display: "grid", gridTemplateColumns: `140px repeat(${CURRENT_MONTH}, 1fr) 80px`, gap: 4, marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#F0F4F8", fontFamily: "'Montserrat', sans-serif" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[ei], flexShrink: 0 }} />
                            {nome}
                          </div>
                          {MONTHLY_SCORES[ei].slice(0, CURRENT_MONTH).map((s, mi) => {
                            const bg = s >= 85 ? "#34D39922" : s >= 70 ? "#F5A62322" : "#E8453C22";
                            const fg = s >= 85 ? "#34D399" : s >= 70 ? "#F5A623" : "#E8453C";
                            return (
                              <div key={mi} style={{ background: bg, color: fg, borderRadius: 6, padding: "5px 0", fontSize: 11, textAlign: "center", fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>
                                {s}
                              </div>
                            );
                          })}
                          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS[ei], textAlign: "center", fontFamily: "'Montserrat', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>{total}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* EVOLUÇÃO */}
              {rankingSubTab === "evolução" && (
                <div className="fade-in" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, marginBottom: 4, color: "#F0F4F8" }}>Pontos acumulados mês a mês</div>
                  <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 20 }}>Quanto cada editor somou ao longo do ano</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={evolucaoData} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="mes" tick={{ fill: "#8899AA", fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: "#8899AA", fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      {EDITORS.map((nome, i) => (
                        <Line key={nome} type="monotone" dataKey={nome} stroke={COLORS[i]} strokeWidth={2.5} dot={{ r: 3, fill: COLORS[i] }} name={nome} connectNulls={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
                    {EDITORS.map((nome, i) => (
                      <div key={nome} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8899AA" }}>
                        <div style={{ width: 20, height: 2.5, background: COLORS[i], borderRadius: 2 }} />
                        {nome}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONQUISTAS */}
              {rankingSubTab === "conquistas" && (
                <div className="fade-in">
                  <div style={{ fontSize: 10, color: "#8899AA", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Conquistas desbloqueadas — {new Date().getFullYear()}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
                    {BADGES_DATA.map((b, i) => {
                      const owner = ranked[i % ranked.length];
                      return (
                        <div key={b.name} style={{
                          background: "rgba(255,255,255,0.03)", border: `1px solid ${owner.cor}33`,
                          borderRadius: 14, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 8,
                        }}>
                          <div style={{ fontSize: 26 }}>{b.icon}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, color: "#F0F4F8" }}>{b.name}</div>
                          <div style={{ fontSize: 11, color: "#8899AA", lineHeight: 1.5 }}>{b.desc}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: owner.cor }} />
                            <span style={{ fontSize: 11, color: owner.cor, fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>{owner.nome}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 10, color: "#8899AA", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Próximas conquistas</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                    {BADGES_LOCKED.map(b => (
                      <div key={b.name} style={{
                        background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 14, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 8, opacity: 0.5,
                      }}>
                        <div style={{ fontSize: 26 }}>{b.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, color: "#8899AA" }}>{b.name}</div>
                        <div style={{ fontSize: 11, color: "#8899AA", lineHeight: 1.5 }}>{b.desc}</div>
                        <div style={{ fontSize: 10, color: "#556677", fontFamily: "'Montserrat', sans-serif", marginTop: 4 }}>🔒 Bloqueada</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ERROS */}
          {activeTab === "erros" && (
            <div className="fade-in">

              {/* HEADER DA ABA */}
              <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.5 }}>Análise de Erros</div>
                  <div style={{ fontSize: 12, color: "#8899AA", marginTop: 4 }}>Tipos de erro que geraram revisões · últimos 90 dias</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["overview", "por editor", "por cliente", "log"].map(v => (
                    <button key={v} onClick={() => setErroView(v)} style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 11, letterSpacing: 0.5,
                      textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", cursor: "pointer",
                      border: `1px solid ${erroView === v ? "#E8453C" : "rgba(255,255,255,0.1)"}`,
                      color: erroView === v ? "#E8453C" : "#8899AA",
                      background: erroView === v ? "#E8453C18" : "transparent",
                    }}>{v}</button>
                  ))}
                </div>
              </div>

              {/* FILTROS */}
              <div style={{
                display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "14px 18px", alignItems: "center",
              }}>
                <span style={{ fontSize: 10, color: "#8899AA", letterSpacing: 1.5, textTransform: "uppercase", marginRight: 4 }}>Filtros</span>
                {[
                  { label: "Editor", val: erroFiltroEditor, set: setErroFiltroEditor, opts: ["todos", ...EDITORS] },
                  { label: "Cliente", val: erroFiltroCliente, set: setErroFiltroCliente, opts: ["todos", ...CLIENTES] },
                  { label: "Categoria", val: erroFiltroCategoria, set: setErroFiltroCategoria, opts: ["todos", ...CATEGORIAS_ERRO.map(c => c.id)], labels: ["todos", ...CATEGORIAS_ERRO.map(c => c.label)] },
                  { label: "Gravidade", val: erroFiltroGravidade, set: setErroFiltroGravidade, opts: ["todos", "alta", "média", "baixa"] },
                ].map(({ label, val, set, opts, labels }) => (
                  <select key={label} value={val} onChange={e => set(e.target.value)} style={{
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8, color: val === "todos" ? "#8899AA" : "#F0F4F8",
                    padding: "6px 10px", fontSize: 11, fontFamily: "'Montserrat', sans-serif", cursor: "pointer", outline: "none",
                  }}>
                    {opts.map((o, i) => <option key={o} value={o}>{(labels || opts)[i] === "todos" ? `Todos os ${label}s` : (labels || opts)[i]}</option>)}
                  </select>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
                  {[
                    { label: `${gravidadeCount.alta} alta`, cor: "#E8453C" },
                    { label: `${gravidadeCount.média} média`, cor: "#F5A623" },
                    { label: `${gravidadeCount.baixa} baixa`, cor: "#34D399" },
                  ].map(({ label, cor }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: cor }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: cor }} />
                      {label}
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: "#8899AA", marginLeft: 6 }}>{errosFiltrados.length} ocorrências</div>
                </div>
              </div>

              {/* VIEW: OVERVIEW */}
              {erroView === "overview" && (
                <div className="fade-in">
                  {/* Cards por categoria */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
                    {erroPorCategoria.map((cat, i) => {
                      const pct = errosFiltrados.length > 0 ? Math.round((cat.total / errosFiltrados.length) * 100) : 0;
                      return (
                        <div key={cat.label} onClick={() => { setErroFiltroCategoria(CATEGORIAS_ERRO.find(c => c.label === cat.label)?.id || "todos"); }}
                          style={{
                            background: "rgba(255,255,255,0.03)", border: `1px solid ${cat.cor}33`,
                            borderRadius: 14, padding: "18px 16px", cursor: "pointer", position: "relative", overflow: "hidden",
                          }}>
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: cat.cor }} />
                          <div style={{ fontSize: 22, marginBottom: 8 }}>{cat.icon}</div>
                          <div style={{ fontSize: 11, color: "#8899AA", fontFamily: "'Montserrat', sans-serif", marginBottom: 4 }}>{cat.label}</div>
                          <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "'Montserrat', sans-serif", color: cat.cor, lineHeight: 1 }}>{cat.total}</div>
                          <div style={{ fontSize: 10, color: "#8899AA", marginTop: 4 }}>{pct}% do total</div>
                          <div style={{ marginTop: 10, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: cat.cor, borderRadius: 99 }} />
                          </div>
                          {cat.alta > 0 && (
                            <div style={{ marginTop: 8, fontSize: 10, color: "#E8453C" }}>⚠ {cat.alta} alta gravidade</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Gráficos lado a lado */}
                  <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20, marginBottom: 20 }}>
                    {/* Barras por categoria */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, marginBottom: 4, color: "#F0F4F8" }}>Ocorrências por categoria</div>
                      <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 20 }}>Distribuição total com detalhe de gravidade</div>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={erroPorCategoria} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="label" tick={{ fill: "#8899AA", fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="total" radius={[0, 6, 6, 0]} name="Total">
                            {erroPorCategoria.map((cat, i) => <Cell key={i} fill={cat.cor} opacity={0.85} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Sub-tipos mais comuns */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, marginBottom: 4, color: "#F0F4F8" }}>Sub-tipos mais frequentes</div>
                      <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 16 }}>Top 10 erros específicos</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {erroSubTipos.map((s, i) => {
                          const maxQtd = erroSubTipos[0]?.qtd || 1;
                          const pct = Math.round((s.qtd / maxQtd) * 100);
                          const cor = COLORS[i % COLORS.length];
                          return (
                            <div key={s.sub} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ fontSize: 10, color: "#8899AA", minWidth: 14, textAlign: "right" }}>{i + 1}</div>
                              <div style={{ flex: "0 0 120px", fontSize: 10, color: "#D0DCE8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.sub}</div>
                              <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", background: cor, borderRadius: 99 }} />
                              </div>
                              <div style={{ fontSize: 11, color: cor, fontWeight: 700, minWidth: 20, textAlign: "right" }}>{s.qtd}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Erros por mês */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, marginBottom: 4, color: "#F0F4F8" }}>Evolução mensal por categoria</div>
                    <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 20 }}>Ocorrências acumuladas nos últimos 3 meses</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={MONTHS.slice(Math.max(0, CURRENT_MONTH - 3), CURRENT_MONTH).map(mes => {
                        const mesIdx = MONTHS.indexOf(mes);
                        const obj = { mes };
                        CATEGORIAS_ERRO.forEach(c => {
                          obj[c.label] = errosFiltrados.filter(e => e.mes === mesIdx && e.categoria === c.id).length;
                        });
                        return obj;
                      })} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="mes" tick={{ fill: "#8899AA", fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: "#8899AA", fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        {CATEGORIAS_ERRO.map(c => (
                          <Bar key={c.id} dataKey={c.label} stackId="a" fill={c.cor} opacity={0.85} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 12 }}>
                      {CATEGORIAS_ERRO.map(c => (
                        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8899AA" }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: c.cor }} />
                          {c.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: POR EDITOR */}
              {erroView === "por editor" && (
                <div className="fade-in">
                  <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
                    {erroPorEditor.map(ed => {
                      const maxErro = Math.max(...CATEGORIAS_ERRO.map(c => ed[c.label] || 0), 1);
                      return (
                        <div key={ed.nome} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${ed.cor}22`, borderRadius: 16, padding: 22 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: ed.cor + "22", color: ed.cor, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Montserrat', sans-serif" }}>
                                {ed.nome.split(" ").map(p => p[0]).join("")}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", color: "#F0F4F8" }}>{ed.nome}</div>
                                <div style={{ fontSize: 10, color: "#8899AA" }}>{ed.total} erros registrados</div>
                              </div>
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.5, color: ed.cor }}>{ed.total}</div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                            {CATEGORIAS_ERRO.map(cat => {
                              const qtd = ed[cat.label] || 0;
                              const pct = Math.round((qtd / maxErro) * 100);
                              return (
                                <div key={cat.id} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "12px 12px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <span style={{ fontSize: 13 }}>{cat.icon}</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: cat.cor, fontFamily: "'Montserrat', sans-serif" }}>{qtd}</span>
                                  </div>
                                  <div style={{ fontSize: 10, color: "#8899AA", marginBottom: 6 }}>{cat.label}</div>
                                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                                    <div style={{ width: `${pct}%`, height: "100%", background: cat.cor, borderRadius: 99 }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW: POR CLIENTE */}
              {erroView === "por cliente" && (
                <div className="fade-in">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, marginBottom: 20, color: "#F0F4F8" }}>Erros por cliente</div>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={erroPorCliente} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="nome" tick={{ fill: "#8899AA", fontSize: 9 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fill: "#8899AA", fontSize: 10 }} tickLine={false} axisLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="total" name="Total" radius={[6, 6, 0, 0]}>
                            {erroPorCliente.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, marginBottom: 20, color: "#F0F4F8" }}>Detalhamento por cliente</div>
                      {erroPorCliente.map((cli, i) => {
                        const pct = errosFiltrados.length > 0 ? Math.round((cli.total / errosFiltrados.length) * 100) : 0;
                        const cor = COLORS[i % COLORS.length];
                        return (
                          <div key={cli.nome} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <div style={{ fontSize: 12, color: "#F0F4F8", fontFamily: "'Montserrat', sans-serif" }}>{cli.nome}</div>
                              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                {cli.alta > 0 && <span style={{ fontSize: 10, color: "#E8453C" }}>⚠ {cli.alta} alta</span>}
                                <span style={{ fontSize: 13, fontWeight: 700, color: cor, fontFamily: "'Montserrat', sans-serif" }}>{cli.total}</span>
                              </div>
                            </div>
                            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: cor, borderRadius: 99 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Mapa cliente x categoria */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", letterSpacing: -0.2, marginBottom: 4, color: "#F0F4F8" }}>Mapa cliente × categoria de erro</div>
                    <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 20 }}>Quantidade de erros por cruzamento</div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 500 }}>
                        <thead>
                          <tr>
                            <td style={{ padding: "6px 12px", color: "#8899AA" }}></td>
                            {CATEGORIAS_ERRO.map(c => (
                              <td key={c.id} style={{ padding: "6px 8px", textAlign: "center", color: "#8899AA", fontSize: 10 }}>{c.icon}<br />{c.label}</td>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {CLIENTES.map((cli, ci) => (
                            <tr key={cli}>
                              <td style={{ padding: "8px 12px", color: "#F0F4F8", fontFamily: "'Montserrat', sans-serif", fontSize: 12, whiteSpace: "nowrap" }}>{cli}</td>
                              {CATEGORIAS_ERRO.map(cat => {
                                const qtd = errosFiltrados.filter(e => e.cliente === cli && e.categoria === cat.id).length;
                                const intensity = qtd === 0 ? 0 : Math.min(0.9, 0.15 + (qtd / 12));
                                return (
                                  <td key={cat.id} style={{ padding: "8px", textAlign: "center" }}>
                                    <div style={{
                                      background: qtd > 0 ? cat.cor + Math.round(intensity * 255).toString(16).padStart(2, "0") : "transparent",
                                      borderRadius: 6, padding: "4px 0",
                                      color: qtd > 0 ? "#F0F4F8" : "#556677",
                                      fontWeight: qtd > 5 ? 700 : 400,
                                      fontSize: 12,
                                    }}>{qtd || "—"}</div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: LOG */}
              {erroView === "log" && (
                <div className="fade-in">
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{
                      display: "grid", gridTemplateColumns: "80px 1fr 1fr 100px 90px 80px",
                      padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)",
                      fontSize: 9, color: "#8899AA", letterSpacing: 1.5, textTransform: "uppercase",
                    }}>
                      {["Data", "Projeto · Editor", "Sub-tipo de erro", "Categoria", "Cliente", "Gravidade"].map(h => <div key={h}>{h}</div>)}
                    </div>
                    {errosFiltrados.slice(0, 40).map((e, i) => {
                      const cat = CATEGORIAS_ERRO.find(c => c.id === e.categoria);
                      const gravCor = e.gravidade === "alta" ? "#E8453C" : e.gravidade === "média" ? "#F5A623" : "#34D399";
                      const editorCor = COLORS[EDITORS.indexOf(e.editor)];
                      return (
                        <div key={e.id} style={{
                          display: "grid", gridTemplateColumns: "80px 1fr 1fr 100px 90px 80px",
                          padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)",
                          fontSize: 11, alignItems: "center",
                          background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                        }}>
                          <div style={{ color: "#8899AA", fontFamily: "'Montserrat', sans-serif" }}>{e.data}</div>
                          <div>
                            <div style={{ color: "#F0F4F8", fontSize: 11 }}>{e.projeto}</div>
                            <div style={{ color: editorCor, fontSize: 10 }}>{e.editor}</div>
                          </div>
                          <div style={{ color: "#D0DCE8" }}>{e.subTipo}</div>
                          <div>
                            <span style={{ background: (cat?.cor || "#888") + "22", color: cat?.cor, borderRadius: 6, padding: "2px 8px", fontSize: 10 }}>
                              {cat?.icon} {cat?.label}
                            </span>
                          </div>
                          <div style={{ color: "#8899AA", fontSize: 10 }}>{e.cliente}</div>
                          <div>
                            <span style={{ background: gravCor + "22", color: gravCor, borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 600 }}>
                              {e.gravidade}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {errosFiltrados.length > 40 && (
                      <div style={{ padding: "14px 20px", fontSize: 11, color: "#8899AA", textAlign: "center" }}>
                        + {errosFiltrados.length - 40} registros ocultos · use os filtros para refinar
                      </div>
                    )}
                    {errosFiltrados.length === 0 && (
                      <div style={{ padding: "40px 20px", fontSize: 12, color: "#8899AA", textAlign: "center" }}>
                        Nenhum erro encontrado com os filtros selecionados.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {showModal && <AddEntryModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </>
  );
}
