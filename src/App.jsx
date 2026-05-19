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

// ── COMPONENTES AUXILIARES ───────────────────────────────────────────────────

const KPICard = ({ label, value, sub, accent, icon }) => (
  <div style={{
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
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
      background: accent,
    }} />
    <span style={{ fontSize: 22, marginBottom: 2 }}>{icon}</span>
    <span style={{ color: "#8899AA", fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
    <span style={{ color: "#F0F4F8", fontSize: 34, fontWeight: 700, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</span>
    <span style={{ color: accent, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{sub}</span>
  </div>
);

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
      fontFamily: "'DM Mono', monospace",
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
      fontFamily: "'DM Mono', monospace",
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
    fontFamily: "'DM Mono', monospace",
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
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#F0F4F8" }}>
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
            <div style={{ fontSize: 11, color: "#8899AA", fontFamily: "'DM Mono', monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
            {input}
          </div>
        ))}

        <button
          onClick={() => { onAdd(form); onClose(); }}
          style={{
            width: "100%", marginTop: 8,
            background: "#F5A623", color: "#0A0F1A",
            border: "none", borderRadius: 10, padding: "12px 0",
            fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif",
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
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        body { background: #070D16; }
        .tab-btn { background: none; border: none; cursor: pointer; transition: all 0.2s; }
        .tab-btn:hover { opacity: 0.8; }
        .editor-row:hover { background: rgba(255,255,255,0.04) !important; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .fade-in { animation: fadeIn 0.4s ease both; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#070D16", color: "#F0F4F8", fontFamily: "'DM Mono', monospace" }}>

        {/* HEADER */}
        <div style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "0 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 64,
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(7,13,22,0.95)",
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #F5A623, #E8453C)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800,
            }}>RM</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: 0.5 }}>RM Brasil Filmes</div>
              <div style={{ fontSize: 10, color: "#8899AA", letterSpacing: 1.5 }}>PERFORMANCE · EDITORIAL</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map(t => (
              <button key={t} className="tab-btn" onClick={() => setActiveTab(t)} style={{
                padding: "6px 16px", borderRadius: 8, fontSize: 11, letterSpacing: 1,
                textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                color: activeTab === t ? "#0A0F1A" : "#8899AA",
                background: activeTab === t ? "#F5A623" : "transparent",
                fontWeight: activeTab === t ? 700 : 400,
              }}>{t}</button>
            ))}
          </div>

          <button onClick={() => setShowModal(true)} style={{
            background: "linear-gradient(135deg, #F5A623, #E8453C)",
            border: "none", borderRadius: 10, padding: "8px 18px",
            color: "#0A0F1A", fontSize: 11, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Syne', sans-serif", letterSpacing: 1,
          }}>+ ENTREGA</button>
        </div>

        <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="fade-in">
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Dashboard Geral</div>
                <div style={{ fontSize: 12, color: "#8899AA", marginTop: 4 }}>Últimos 30 dias · {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</div>
              </div>

              {/* KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
                <KPICard label="Total de Entregas" value={totalEntregas} sub="▲ +12% vs mês anterior" accent="#F5A623" icon="🎬" />
                <KPICard label="Aprovação na v1" value={`${mediaAprovacao}%`} sub="Meta: 70%" accent="#34D399" icon="✅" />
                <KPICard label="Versões por projeto" value={mediaVersoes} sub="Ideal: abaixo de 2.5" accent="#A78BFA" icon="🔄" />
                <KPICard label="Editores ativos" value={EDITORS.length} sub="Todos com entrega este mês" accent="#4ECDC4" icon="👥" />
                <KPICard label="Projetos em aberto" value={8} sub="3 com prazo hoje" accent="#E8453C" icon="⏳" />
              </div>

              {/* GRÁFICOS PRINCIPAIS */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 20, color: "#F0F4F8" }}>
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

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 20, color: "#F0F4F8" }}>
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
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#F0F4F8" }}>Ranking de Editores</div>
                  <button onClick={() => setActiveTab("editores")} style={{
                    background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                    color: "#8899AA", fontSize: 10, padding: "4px 12px", cursor: "pointer",
                    fontFamily: "'DM Mono', monospace", letterSpacing: 1,
                  }}>VER DETALHES →</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                  {[...editors].sort((a, b) => b.pontuacao - a.pontuacao).map((e, i) => (
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
                          fontFamily: "'Syne', sans-serif",
                        }}>#{i + 1}</div>
                        <ScoreBadge score={e.pontuacao} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginTop: 10, color: "#F0F4F8" }}>{e.nome}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: e.cor, lineHeight: 1.1, marginTop: 4 }}>{e.pontuacao}</div>
                      <div style={{ fontSize: 10, color: "#8899AA", marginTop: 2 }}>pts · {e.entregas} entregas</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EDITORES */}
          {activeTab === "editores" && (
            <div className="fade-in">
              <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Análise por Editor</div>
                  <div style={{ fontSize: 12, color: "#8899AA", marginTop: 4 }}>Clique num editor para ver o radar de performance</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {EDITORS.map((nome, i) => (
                    <button key={nome} onClick={() => setSelectedEditor(selectedEditor === nome ? null : nome)} style={{
                      background: selectedEditor === nome ? COLORS[i] + "33" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${selectedEditor === nome ? COLORS[i] : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 8, padding: "6px 12px", color: selectedEditor === nome ? COLORS[i] : "#8899AA",
                      fontSize: 11, cursor: "pointer", fontFamily: "'DM Mono', monospace",
                    }}>{nome.split(" ")[0]}</button>
                  ))}
                </div>
              </div>

              {/* TABELA */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
                  padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)",
                  fontSize: 10, color: "#8899AA", letterSpacing: 1.5, textTransform: "uppercase",
                }}>
                  {["Editor", "Entregas", "Versões/proj", "Aprovação v1", "No Prazo", "Correções/proj", "Score"].map(h => <div key={h}>{h}</div>)}
                </div>
                {[...editors].sort((a, b) => b.pontuacao - a.pontuacao).map((e, i) => (
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
                      <span style={{ fontSize: 13, fontFamily: "'Syne', sans-serif", color: "#F0F4F8" }}>{e.nome}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#F0F4F8" }}>{e.entregas}</div>
                    <div style={{ fontSize: 13, color: e.versoes_media > 2.5 ? "#E8453C" : "#34D399" }}>{e.versoes_media}</div>
                    <div style={{ fontSize: 13, color: e.taxa_aprovacao >= 60 ? "#34D399" : "#F5A623" }}>{e.taxa_aprovacao}%</div>
                    <div style={{ fontSize: 13, color: e.prazo >= 80 ? "#34D399" : "#F5A623" }}>{e.prazo}%</div>
                    <div style={{ fontSize: 13, color: e.correcoes_media > 3 ? "#E8453C" : "#34D399" }}>{e.correcoes_media}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: e.cor }}>{e.pontuacao}</span>
                      <ScoreBadge score={e.pontuacao} />
                    </div>
                  </div>
                ))}
              </div>

              {/* RADAR */}
              {selectedEditor && (
                <div className="fade-in" style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16, padding: 24
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>
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
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Tendências & Histórico</div>
                <div style={{ fontSize: 12, color: "#8899AA", marginTop: 4 }}>Evolução das métricas nos últimos 30 dias</div>
              </div>

              <div style={{ display: "grid", gap: 20 }}>
                {[
                  { key: "entregas", label: "Entregas por dia", cor: "#F5A623" },
                  { key: "versoes", label: "Versões abertas por dia", cor: "#A78BFA" },
                  { key: "correcoes", label: "Correções por dia", cor: "#E8453C" },
                  { key: "aprovacao_v1", label: "Taxa de aprovação v1 (%)", cor: "#34D399" },
                ].map(({ key, label, cor }) => (
                  <div key={key} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 16, color: "#F0F4F8" }}>{label}</div>
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
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Feed Ao Vivo</div>
                  <div style={{ fontSize: 12, color: "#8899AA", marginTop: 4 }}>Atividade em tempo real do time</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#34D399" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399", animation: "pulse 2s infinite" }} />
                  AO VIVO
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* FEED */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 20 }}>Atividades Recentes</div>
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
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 14, padding: "16px 20px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: e.cor + "22",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, color: e.cor, fontFamily: "'Syne', sans-serif",
                        }}>{e.nome.split(" ").map(p => p[0]).join("")}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#F0F4F8" }}>{e.nome}</div>
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
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Ranking Anual — {new Date().getFullYear()}</div>
                  <div style={{ fontSize: 12, color: "#8899AA", marginTop: 4 }}>Pontuação acumulada mês a mês · time editorial</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["podio", "tabela", "evolução", "conquistas"].map(t => (
                    <button key={t} onClick={() => setRankingSubTab(t)} style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 11, letterSpacing: 0.5,
                      textTransform: "uppercase", fontFamily: "'DM Mono', monospace", cursor: "pointer",
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
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 32, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 16, marginBottom: 32 }}>
                      {[ranked[1], ranked[0], ranked[2]].map((ed, i) => {
                        const pos = [2, 1, 3][i];
                        const heights = [90, 130, 70];
                        const medals = ["🥈", "🥇", "🥉"];
                        const podiumColors = ["#94A3B8", "#F5A623", "#CD7F32"];
                        return ed ? (
                          <div key={ed.nome} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div style={{ fontSize: 11, color: "#8899AA", fontFamily: "'DM Mono', monospace" }}>{ed.nome.split(" ")[0]}</div>
                            <div style={{
                              width: 52, height: 52, borderRadius: "50%",
                              background: ed.cor + "22", border: `2px solid ${ed.cor}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 14, fontWeight: 700, color: ed.cor, fontFamily: "'Syne', sans-serif",
                            }}>{ed.nome.split(" ").map(p => p[0]).join("")}</div>
                            <div style={{ fontSize: 12, color: "#8899AA", fontFamily: "'DM Mono', monospace" }}>{ed.total} pts</div>
                            <div style={{
                              width: 110, height: heights[i],
                              background: podiumColors[i] + "18",
                              border: `1px solid ${podiumColors[i]}44`,
                              borderRadius: "10px 10px 0 0",
                              display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center", gap: 4,
                            }}>
                              <div style={{ fontSize: 28 }}>{medals[i]}</div>
                              <div style={{ fontSize: 11, color: podiumColors[i], fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>#{pos}</div>
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
                          <div style={{ width: 20, fontSize: 12, color: "#8899AA", textAlign: "center", fontFamily: "'DM Mono', monospace" }}>{i + 1}</div>
                          <div style={{
                            width: 34, height: 34, borderRadius: 8,
                            background: ed.cor + "22", color: ed.cor, fontSize: 11,
                            fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'Syne', sans-serif", flexShrink: 0,
                          }}>{ed.nome.split(" ").map(p => p[0]).join("")}</div>
                          <div style={{ flex: "0 0 90px", fontSize: 13, fontFamily: "'Syne', sans-serif", color: "#F0F4F8" }}>{ed.nome}</div>
                          <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: ed.cor, borderRadius: 99, transition: "width 0.8s ease" }} />
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: ed.cor, fontFamily: "'Syne', sans-serif", minWidth: 56, textAlign: "right" }}>{ed.total} pts</div>
                          <div style={{ fontSize: 11, color: i === 0 ? "#34D399" : "#8899AA", minWidth: 60, textAlign: "right", fontFamily: "'DM Mono', monospace" }}>
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
                <div className="fade-in" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, overflowX: "auto" }}>
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
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#F0F4F8", fontFamily: "'Syne', sans-serif" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[ei], flexShrink: 0 }} />
                            {nome}
                          </div>
                          {MONTHLY_SCORES[ei].slice(0, CURRENT_MONTH).map((s, mi) => {
                            const bg = s >= 85 ? "#34D39922" : s >= 70 ? "#F5A62322" : "#E8453C22";
                            const fg = s >= 85 ? "#34D399" : s >= 70 ? "#F5A623" : "#E8453C";
                            return (
                              <div key={mi} style={{ background: bg, color: fg, borderRadius: 6, padding: "5px 0", fontSize: 11, textAlign: "center", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                                {s}
                              </div>
                            );
                          })}
                          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS[ei], textAlign: "center", fontFamily: "'Syne', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>{total}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* EVOLUÇÃO */}
              {rankingSubTab === "evolução" && (
                <div className="fade-in" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 4, color: "#F0F4F8" }}>Pontos acumulados mês a mês</div>
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
                          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#F0F4F8" }}>{b.name}</div>
                          <div style={{ fontSize: 11, color: "#8899AA", lineHeight: 1.5 }}>{b.desc}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: owner.cor }} />
                            <span style={{ fontSize: 11, color: owner.cor, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{owner.nome}</span>
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
                        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#8899AA" }}>{b.name}</div>
                        <div style={{ fontSize: 11, color: "#8899AA", lineHeight: 1.5 }}>{b.desc}</div>
                        <div style={{ fontSize: 10, color: "#556677", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>🔒 Bloqueada</div>
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
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Análise de Erros</div>
                  <div style={{ fontSize: 12, color: "#8899AA", marginTop: 4 }}>Tipos de erro que geraram revisões · últimos 90 dias</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["overview", "por editor", "por cliente", "log"].map(v => (
                    <button key={v} onClick={() => setErroView(v)} style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 11, letterSpacing: 0.5,
                      textTransform: "uppercase", fontFamily: "'DM Mono', monospace", cursor: "pointer",
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
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
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
                    padding: "6px 10px", fontSize: 11, fontFamily: "'DM Mono', monospace", cursor: "pointer", outline: "none",
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
                          <div style={{ fontSize: 11, color: "#8899AA", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>{cat.label}</div>
                          <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: cat.cor, lineHeight: 1 }}>{cat.total}</div>
                          <div style={{ fontSize: 10, color: "#8899AA", marginTop: 4 }}>{pct}% do total</div>
                          <div style={{ marginTop: 10, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
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
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 4, color: "#F0F4F8" }}>Ocorrências por categoria</div>
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
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 4, color: "#F0F4F8" }}>Sub-tipos mais frequentes</div>
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
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 4, color: "#F0F4F8" }}>Evolução mensal por categoria</div>
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
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: ed.cor + "22", color: ed.cor, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif" }}>
                                {ed.nome.split(" ").map(p => p[0]).join("")}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#F0F4F8" }}>{ed.nome}</div>
                                <div style={{ fontSize: 10, color: "#8899AA" }}>{ed.total} erros registrados</div>
                              </div>
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: ed.cor }}>{ed.total}</div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                            {CATEGORIAS_ERRO.map(cat => {
                              const qtd = ed[cat.label] || 0;
                              const pct = Math.round((qtd / maxErro) * 100);
                              return (
                                <div key={cat.id} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "12px 12px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <span style={{ fontSize: 13 }}>{cat.icon}</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: cat.cor, fontFamily: "'Syne', sans-serif" }}>{qtd}</span>
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
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 20, color: "#F0F4F8" }}>Erros por cliente</div>
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
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 20, color: "#F0F4F8" }}>Detalhamento por cliente</div>
                      {erroPorCliente.map((cli, i) => {
                        const pct = errosFiltrados.length > 0 ? Math.round((cli.total / errosFiltrados.length) * 100) : 0;
                        const cor = COLORS[i % COLORS.length];
                        return (
                          <div key={cli.nome} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <div style={{ fontSize: 12, color: "#F0F4F8", fontFamily: "'Syne', sans-serif" }}>{cli.nome}</div>
                              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                {cli.alta > 0 && <span style={{ fontSize: 10, color: "#E8453C" }}>⚠ {cli.alta} alta</span>}
                                <span style={{ fontSize: 13, fontWeight: 700, color: cor, fontFamily: "'Syne', sans-serif" }}>{cli.total}</span>
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
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 4, color: "#F0F4F8" }}>Mapa cliente × categoria de erro</div>
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
                              <td style={{ padding: "8px 12px", color: "#F0F4F8", fontFamily: "'Syne', sans-serif", fontSize: 12, whiteSpace: "nowrap" }}>{cli}</td>
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
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{
                      display: "grid", gridTemplateColumns: "80px 1fr 1fr 100px 90px 80px",
                      padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)",
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
                          <div style={{ color: "#8899AA", fontFamily: "'DM Mono', monospace" }}>{e.data}</div>
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
