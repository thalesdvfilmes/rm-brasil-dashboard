import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PolarRadiusAxis, Cell,
} from "recharts";

// ─────────────────────────────────────────────
// DATA LAYER — unchanged structure
// ─────────────────────────────────────────────

const EDITORS  = ["Thales", "Enzo", "Renan", "Mazala", "Matheus"];
const COLORS   = ["#E8B84B", "#E8453C", "#4ECDC4", "#A78BFA", "#2ECC71"];
const CLIENTES = ["Banco Digital","Saúde Total","Varejo XYZ","Construtora Sul","Agência Nova"];
const MONTHS   = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
const CUR_M    = new Date().getMonth();
const rnd      = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

const CATEGORIAS_ERRO = [
  { id:"audio",    label:"Áudio",       icon:"🎧", cor:"#4ECDC4", sub:["Mix/Volume","Sincronia A/V","Ruído","Música alta"] },
  { id:"corte",    label:"Corte/Ritmo", icon:"✂️",  cor:"#E8B84B", sub:["Timing","Pacing","Corte abrupto","Transição"] },
  { id:"cor",      label:"Cor/Gradação",icon:"🎨", cor:"#A78BFA", sub:["Exposição","Balanço","Inconsistência","Saturação"] },
  { id:"legenda",  label:"Legenda",     icon:"💬", cor:"#2ECC71", sub:["Ortografia","Sincronia","Formatação","Falta legenda"] },
  { id:"motion",   label:"Motion/GFX",  icon:"✨", cor:"#E8453C", sub:["Lower third","Animação","Vinheta","Logo errado"] },
  { id:"export",   label:"Exportação",  icon:"📦", cor:"#FF8C42", sub:["Codec","Resolução","Proporção","Corrompido"] },
  { id:"conteudo", label:"Conteúdo",    icon:"🎬", cor:"#45B7D1", sub:["Falta cena","Sequência","Take errado","Produto"] },
];

const generateDaily = () => {
  const r = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    r.push({ dia: d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}), entregas: rnd(1,6), versoes: rnd(2,11), correcoes: rnd(1,8), aprovacao_v1: rnd(40,80) });
  }
  return r;
};

const generateEditors = () => EDITORS.map((nome,i) => ({
  nome, cor: COLORS[i],
  entregas:        i===0 ? rnd(35,40)  : rnd(15,35),
  versoes_media:   i===0 ? +(Math.random()*0.6+1.0).toFixed(1) : +(Math.random()*2+1.4).toFixed(1),
  taxa_aprovacao:  i===0 ? rnd(80,95)  : rnd(48,82),
  prazo:           i===0 ? rnd(92,99)  : rnd(62,95),
  correcoes_media: i===0 ? +(Math.random()*0.8+0.2).toFixed(1) : +(Math.random()*3+0.8).toFixed(1),
  pontuacao:       i===0 ? rnd(90,99)  : rnd(58,88),
}));

const generateRadar = () => [
  {metric:"Prazo",value:rnd(60,95)},{metric:"Qualidade",value:rnd(55,95)},
  {metric:"Aprovação v1",value:rnd(45,90)},{metric:"Volume",value:rnd(50,90)},
  {metric:"Velocidade",value:rnd(60,95)},{metric:"Revisões",value:rnd(60,94)},
];

const MONTHLY_SCORES = EDITORS.map(() => MONTHS.map((_,i)=>i<CUR_M?rnd(58,97):null));
const ACCUMULATED    = MONTHLY_SCORES.map(s=>{let a=0;return s.map(v=>v!==null?(a+=v,a):null);});

const generateErros = () => {
  const projs=["Spot TV","Institucional","Teaser","Série","Reel","Case","Apresentação","Campanha"];
  return Array.from({length:120},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-rnd(0,89));
    const cat=CATEGORIAS_ERRO[rnd(0,CATEGORIAS_ERRO.length-1)];
    return { id:i, data:d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}),
      mes:d.getMonth(), editor:EDITORS[rnd(0,4)], cliente:CLIENTES[rnd(0,4)],
      projeto:projs[rnd(0,projs.length-1)]+" "+rnd(1,5),
      categoria:cat.id, categoriaLabel:cat.label, subTipo:cat.sub[rnd(0,cat.sub.length-1)],
      versao:rnd(1,4), gravidade:["baixa","média","alta"][rnd(0,2)] };
  }).sort((a,b)=>b.id-a.id);
};


// ── Detailed daily deliveries for the drill-down chart ───────────────────────
const PROJETOS_POOL = [
  "Spot TV Verão","Institucional Saúde","Teaser Lançamento","Série Episódio",
  "Reel Instagram","Case Cliente","Apresentação Evento","Campanha Digital",
  "Spot Rádio","Vídeo Produto","Manifesto Marca","Viral Social",
];

const generateDailyDeliveries = () => {
  const map = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
    const qtd = rnd(1, 5);
    map[key] = Array.from({length: qtd}, (_, j) => {
      const edIdx = rnd(0, EDITORS.length - 1);
      return {
        id: `${key}-${j}`,
        editor: EDITORS[edIdx],
        cor: COLORS[edIdx],
        projeto: PROJETOS_POOL[rnd(0, PROJETOS_POOL.length - 1)],
        cliente: CLIENTES[rnd(0, CLIENTES.length - 1)],
        versao: rnd(1, 4),
        status: ["Aprovado","Em revisão","Corrigido"][rnd(0, 2)],
        hora: `${rnd(8,18).toString().padStart(2,"0")}:${["00","15","30","45"][rnd(0,3)]}`,
      };
    });
  }
  return map;
};

const DAILY_DELIVERIES = generateDailyDeliveries();


// ── Detail generators for secondary metrics ──────────────────────────────────
const getDayDetail = (dia, metric) => {
  const base = DAILY_DELIVERIES[dia] || [];
  if (metric === "entregas") return base;

  if (metric === "versoes") {
    // Return projects that opened new versions that day
    return base.map(e => ({
      ...e,
      versao: rnd(2,4),
      detail: `Abriu v${rnd(2,4)} após ${rnd(1,3)} rodada${rnd(1,3)>1?"s":""} de revisão`,
    })).filter((_,i) => i < rnd(2, base.length));
  }

  if (metric === "correcoes") {
    // Return projects that received corrections
    const tipos = ["Áudio","Corte","Cor","Legenda","Motion","Exportação"];
    return base.map(e => ({
      ...e,
      detail: `${rnd(1,4)} correç${rnd(1,4)>1?"ões":"ão"} · ${tipos[rnd(0,tipos.length-1)]}`,
      gravidade: ["baixa","média","alta"][rnd(0,2)],
    })).filter((_,i) => i < rnd(1, Math.max(1,base.length-1)));
  }

  if (metric === "aprovacao_v1") {
    const aprovados = base.filter((_,i)=>i % 2 === 0).map(e => ({...e, aprovado: true}));
    const reprovados = base.filter((_,i)=>i % 2 !== 0).map(e => ({...e, aprovado: false, motivo: ["Áudio","Corte","Cor"][rnd(0,2)]}));
    return [...aprovados, ...reprovados];
  }
  return base;
};

const DAILY  = generateDaily();
const ERROS  = generateErros();
const TIPO_RESUMO = CATEGORIAS_ERRO.map(c=>({tipo:c.label,qtd:ERROS.filter(e=>e.categoria===c.id).length}));

const getScoreColor = (score, all) => {
  const avg = all.reduce((s,v)=>s+v,0)/all.length;
  const std = Math.sqrt(all.reduce((s,v)=>s+Math.pow(v-avg,2),0)/all.length);
  if(score >= avg+std*0.4) return "#2ECC71";
  if(score >= avg-std*0.4) return "#E8B84B";
  return "#E8453C";
};

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const T = {
  bg:      "#060606",
  surface: "rgba(255,255,255,0.028)",
  border:  "rgba(255,255,255,0.07)",
  amber:   "#E8B84B",
  amberDim:"rgba(232,184,75,0.12)",
  red:     "#E8453C",
  green:   "#2ECC71",
  white:   "#F0EDE6",
  muted:   "#5A5650",
  font:    "'Barlow Condensed', sans-serif",
  mono:    "'IBM Plex Mono', monospace",
};

// ─────────────────────────────────────────────
// REUSABLE COMPONENTS
// ─────────────────────────────────────────────

const Tip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:"#111",border:`1px solid ${T.border}`,borderRadius:4,padding:"8px 12px",fontFamily:T.mono,fontSize:11,color:T.white}}>
      <div style={{color:T.muted,marginBottom:4}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{color:p.color||T.amber}}>{p.name}: <b>{p.value}</b></div>)}
    </div>
  );
};

// Timecode-style big number
const BigNum = ({value,label,sub,accent="#E8B84B",metaOk}) => {
  const borderTop = metaOk===true?T.green:metaOk===false?T.red:accent;
  const valColor  = metaOk===true?T.green:metaOk===false?T.red:T.white;
  return (
    <div style={{borderTop:`2px solid ${borderTop}`,padding:"18px 20px",background:T.surface,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,right:0,width:60,height:60,background:`radial-gradient(circle at top right, ${borderTop}10, transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.muted,marginBottom:10}}>{label}</div>
      <div style={{fontFamily:T.font,fontSize:48,fontWeight:700,lineHeight:1,color:valColor,letterSpacing:-1}}>{value}</div>
      {sub && <div style={{fontFamily:T.mono,fontSize:10,color:metaOk===true?T.green:metaOk===false?T.red:T.muted,marginTop:8,letterSpacing:1}}>
        {metaOk===true&&"▲ "}{metaOk===false&&"▼ "}{sub}
      </div>}
    </div>
  );
};

const ScoreTag = ({score}) => {
  const c = score>=80?T.green:score>=65?T.amber:T.red;
  const l = score>=80?"ACIMA":"";
  return l ? <span style={{fontFamily:T.mono,fontSize:9,color:c,letterSpacing:2,border:`1px solid ${c}55`,padding:"2px 6px"}}>{l}</span> : null;
};

// ─────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────
const Modal = ({onClose,onAdd}) => {
  const [form,setForm]=useState({editor:EDITORS[0],projeto:"",versao:1,correcoes:0,tipo_correcao:CATEGORIAS_ERRO[0].id,gravidade:"baixa",prazo:"sim"});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const inp={background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.white,padding:"9px 12px",fontFamily:T.mono,fontSize:12,width:"100%",outline:"none",borderRadius:0};
  const lbl={fontFamily:T.mono,fontSize:9,letterSpacing:2,textTransform:"uppercase",color:T.muted,display:"block",marginBottom:6};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:"#0E0E0E",border:`1px solid ${T.amber}44`,padding:32,width:420,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
          <span style={{fontFamily:T.font,fontSize:22,fontWeight:700,letterSpacing:2,color:T.amber}}>// NOVA ENTREGA</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer"}}>✕</button>
        </div>
        {[
          ["Editor",<select value={form.editor} onChange={e=>set("editor",e.target.value)} style={{...inp,background:"#111"}}>{EDITORS.map(v=><option key={v}>{v}</option>)}</select>],
          ["Projeto",<input placeholder="ex: Spot Verão 2025" value={form.projeto} onChange={e=>set("projeto",e.target.value)} style={inp}/>],
          ["Versão",<input type="number" min={1} max={10} value={form.versao} onChange={e=>set("versao",+e.target.value)} style={inp}/>],
          ["Correções",<input type="number" min={0} value={form.correcoes} onChange={e=>set("correcoes",+e.target.value)} style={inp}/>],
          ["Tipo de erro",<select value={form.tipo_correcao} onChange={e=>set("tipo_correcao",e.target.value)} style={{...inp,background:"#111"}}>{CATEGORIAS_ERRO.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select>],
          ["Gravidade",<select value={form.gravidade} onChange={e=>set("gravidade",e.target.value)} style={{...inp,background:"#111"}}><option>baixa</option><option>média</option><option>alta</option></select>],
          ["No prazo?",<select value={form.prazo} onChange={e=>set("prazo",e.target.value)} style={{...inp,background:"#111"}}><option value="sim">Sim</option><option value="nao">Não</option></select>],
        ].map(([l,el])=>(
          <div key={l} style={{marginBottom:16}}>
            <label style={lbl}>{l}</label>{el}
          </div>
        ))}
        <button onClick={()=>{onAdd(form);onClose();}} style={{width:"100%",marginTop:8,background:T.amber,color:"#060606",border:"none",padding:"13px",fontFamily:T.font,fontSize:16,fontWeight:700,letterSpacing:3,cursor:"pointer"}}>
          REGISTRAR →
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App() {
  const [editors,setEditors]       = useState(generateEditors);
  const [radarData]                = useState(()=>Object.fromEntries(EDITORS.map(e=>[e,generateRadar()])));
  const [tab,setTab]               = useState("overview");
  const [modal,setModal]           = useState(false);
  const [selEditor,setSelEditor]   = useState(null);
  const [rankSub,setRankSub]       = useState("podio");
  const [erroView,setErroView]     = useState("overview");
  const [filtVM,setFiltVM]         = useState("todos");
  const [filtCli,setFiltCli]       = useState("todos");
  const [filtCat,setFiltCat]       = useState("todos");
  const [filtGrav,setFiltGrav]     = useState("todos");
  const [diaDetalhe,setDiaDetalhe]       = useState(null);
  const [metricDetalhe,setMetricDetalhe] = useState("entregas");
  const [ovDia,setOvDia]                 = useState(null);
  const [feed,setFeed]             = useState([
    {time:"14:32",text:"Lucas M. entregou v2 — Spot Banco Digital",cor:COLORS[0]},
    {time:"13:15",text:"Fernanda R. aprovada na v1 — Institucional Saúde",cor:COLORS[1]},
    {time:"11:48",text:"João P. recebeu 3 correções — Teaser Filme",cor:COLORS[2]},
    {time:"10:20",text:"Camila S. entregou no prazo — Série Ep.4",cor:COLORS[3]},
  ]);

  const totalEntregas = editors.reduce((s,e)=>s+e.entregas,0);
  const mediaAprovacao= Math.round(editors.reduce((s,e)=>s+e.taxa_aprovacao,0)/editors.length);
  const mediaVersoes  = (editors.reduce((s,e)=>s+e.versoes_media,0)/editors.length).toFixed(1);

  const totals  = ACCUMULATED.map(a=>a.filter(Boolean).pop()||0);
  const ranked  = editors.map((e,i)=>({...e,total:totals[i]})).sort((a,b)=>b.total-a.total);
  const evolData= MONTHS.slice(0,CUR_M).map((mes,mi)=>{const o={mes};EDITORS.forEach((n,ei)=>{o[n]=ACCUMULATED[ei][mi];});return o;});

  const ef = ERROS.filter(e=>
    (filtVM==="todos"||e.editor===filtVM)&&
    (filtCli==="todos"||e.cliente===filtCli)&&
    (filtCat==="todos"||e.categoria===filtCat)&&
    (filtGrav==="todos"||e.gravidade===filtGrav));

  const errCat = CATEGORIAS_ERRO.map(c=>({
    label:c.label,icon:c.icon,cor:c.cor,
    total:ef.filter(e=>e.categoria===c.id).length,
    alta:ef.filter(e=>e.categoria===c.id&&e.gravidade==="alta").length,
  })).sort((a,b)=>b.total-a.total);

  const errEditor = EDITORS.map((n,i)=>{
    const ex=ef.filter(e=>e.editor===n);
    const o={nome:n,cor:COLORS[i],total:ex.length};
    CATEGORIAS_ERRO.forEach(c=>{o[c.label]=ex.filter(e=>e.categoria===c.id).length;});
    return o;
  }).sort((a,b)=>b.total-a.total);

  const errCli = CLIENTES.map(c=>({nome:c,total:ef.filter(e=>e.cliente===c).length,alta:ef.filter(e=>e.cliente===c&&e.gravidade==="alta").length})).sort((a,b)=>b.total-a.total);
  const gravCount = {alta:ef.filter(e=>e.gravidade==="alta").length,média:ef.filter(e=>e.gravidade==="média").length,baixa:ef.filter(e=>e.gravidade==="baixa").length};
  const subTipos  = (()=>{const m={};ef.forEach(e=>{m[e.subTipo]=(m[e.subTipo]||0)+1;});return Object.entries(m).map(([sub,qtd])=>({sub,qtd})).sort((a,b)=>b.qtd-a.qtd).slice(0,10);})();

  const handleAdd = (form) => {
    const now=new Date();
    const time=`${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
    setFeed(f=>[{time,text:`${form.editor} entregou v${form.versao}${form.projeto?` — ${form.projeto}`:""}`,cor:COLORS[EDITORS.indexOf(form.editor)]||T.amber},...f.slice(0,9)]);
    setEditors(ed=>ed.map(e=>e.nome===form.editor?{...e,entregas:e.entregas+1,pontuacao:Math.min(100,e.pontuacao+(form.versao<=2?3:1))}:e));
  };

  const TABS = ["overview","editores","histórico","ao vivo","ranking","erros"];

  const selStyle = {
    background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
    color:T.white,padding:"7px 10px",fontFamily:T.mono,fontSize:11,
    outline:"none",cursor:"pointer",
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html,body{background:${T.bg};color:${T.white}}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1)}
        select option{background:#111}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes ticker{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
        .fade{animation:fadeUp .35s ease both}
        .row-hover:hover{background:rgba(232,184,75,0.04)!important}

        /* FILM GRAIN overlay */
        body::after{
          content:'';position:fixed;inset:0;pointer-events:none;z-index:200;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          opacity:.4;mix-blend-mode:overlay;
        }
      `}</style>

      <div style={{minHeight:"100vh",fontFamily:T.font,background:T.bg}}>

        {/* ── HEADER ── */}
        <header style={{
          borderBottom:`1px solid ${T.border}`,
          display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"0 28px",height:56,
          position:"sticky",top:0,zIndex:100,
          background:"rgba(6,6,6,0.96)",backdropFilter:"blur(12px)",
        }}>
          {/* Logo + Brand */}
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAQ4BDgDASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAAgJBQYHBAMCAf/EAF0QAQABAwMCAwMECQ8ICAMIAwABAgMEBQYRByEIEjETQVEJFCJhFTI3OHF1gZGzFhgjNUJSVnN0laGxtMHSJDM2YpSy0fBTVXKSwtPh4kOCwxcmNGN2hZPxRUai/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AIZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9k=" alt="RM" style={{height:32,width:"auto",objectFit:"contain",filter:"brightness(1.05)"}}/>
            <div style={{borderLeft:`1px solid ${T.border}`,paddingLeft:14}}>
              <div style={{fontFamily:T.font,fontSize:18,fontWeight:700,letterSpacing:3,color:T.white,lineHeight:1}}>RM BRASIL FILMES</div>
              <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:3,color:T.amber,marginTop:2}}>PERFORMANCE · EDITORIAL · {new Date().getFullYear()}</div>
            </div>
          </div>

          {/* TABS */}
          <nav style={{display:"flex",gap:0}}>
            {TABS.map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                background:"none",border:"none",
                borderBottom:tab===t?`2px solid ${T.amber}`:"2px solid transparent",
                color:tab===t?T.amber:T.muted,
                fontFamily:T.font,fontSize:14,fontWeight:700,letterSpacing:2,
                textTransform:"uppercase",padding:"0 18px",height:56,cursor:"pointer",
                transition:"color .15s",
              }}>{t}</button>
            ))}
          </nav>

          {/* CTA */}
          <button onClick={()=>setModal(true)} style={{
            background:"none",border:`1px solid ${T.amber}`,
            color:T.amber,fontFamily:T.font,fontSize:13,fontWeight:700,
            letterSpacing:2,padding:"7px 16px",cursor:"pointer",
            transition:"background .15s",
          }} onMouseEnter={e=>e.target.style.background=T.amberDim}
             onMouseLeave={e=>e.target.style.background="none"}>
            + ENTREGA
          </button>
        </header>

        {/* ── CONTENT ── */}
        <main style={{padding:"28px 28px 60px",maxWidth:1440,margin:"0 auto"}}>

          {/* PAGE TITLE BAR */}
          <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:28,borderBottom:`1px solid ${T.border}`,paddingBottom:16}}>
            <span style={{fontFamily:T.font,fontSize:40,fontWeight:900,letterSpacing:2,color:T.white,lineHeight:1,textTransform:"uppercase"}}>
              {tab === "overview" && "Dashboard Geral"}
              {tab === "editores" && "Análise por Editor"}
              {tab === "histórico" && "Histórico de Entregas"}
              {tab === "ao vivo" && "Feed Ao Vivo"}
              {tab === "ranking" && "Ranking Anual"}
              {tab === "erros" && "Análise de Erros"}
            </span>
            <span style={{fontFamily:T.mono,fontSize:11,color:T.muted,letterSpacing:1}}>
              {new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </span>
            <span style={{marginLeft:"auto",fontFamily:T.mono,fontSize:10,color:T.muted,display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:T.green,display:"inline-block",animation:"pulse 2s infinite"}}/>
              SISTEMA ATIVO
            </span>
          </div>

          {/* ───────────── OVERVIEW ───────────── */}
          {tab==="overview" && (
            <div className="fade">
              {/* KPI ROW */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:1,marginBottom:28,border:`1px solid ${T.border}`}}>
                <BigNum label="Entregas / mês"     value={totalEntregas}         sub={`▲ +12% vs anterior`}     accent={T.amber}  metaOk={totalEntregas>=50}/>
                <BigNum label="Aprovação na v1"    value={`${mediaAprovacao}%`}  sub="Meta: 70%"                accent={T.green}  metaOk={mediaAprovacao>=70}/>
                <BigNum label="Versões / projeto"  value={mediaVersoes}          sub="Ideal: < 2.5"             accent="#A78BFA"  metaOk={parseFloat(mediaVersoes)<2.5}/>
                <BigNum label="Editores ativos"    value={EDITORS.length}        sub="todos com entrega"        accent="#4ECDC4"  metaOk={true}/>
                <BigNum label="Projetos em aberto" value={8}                     sub="3 com prazo hoje"         accent={T.red}    metaOk={false}/>
              </div>

              {/* CHARTS ROW */}
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:1,border:`1px solid ${T.border}`,marginBottom:28}}>
                <div style={{background:T.surface,padding:24}}>
                  <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.muted,marginBottom:4}}>// entregas · correções · versões</div>
                  <div style={{fontFamily:T.font,fontSize:20,fontWeight:700,letterSpacing:1,marginBottom:20,color:T.white}}>ÚLTIMOS 14 DIAS</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={DAILY.slice(-14)} margin={{top:4,right:4,bottom:0,left:-20}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                      <XAxis dataKey="dia" tick={{fill:T.muted,fontSize:9,fontFamily:T.mono}} tickLine={false} axisLine={false}/>
                      <YAxis tick={{fill:T.muted,fontSize:9,fontFamily:T.mono}} tickLine={false} axisLine={false}/>
                      <Tooltip content={<Tip/>}/>
                      <Line type="monotone" dataKey="entregas"  stroke={T.amber} strokeWidth={2} dot={false} name="Entregas"/>
                      <Line type="monotone" dataKey="correcoes" stroke={T.red}   strokeWidth={1.5} dot={false} name="Correções" strokeDasharray="4 2"/>
                      <Line type="monotone" dataKey="versoes"   stroke="#A78BFA" strokeWidth={1.5} dot={false} name="Versões"/>
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{display:"flex",gap:20,marginTop:12}}>
                    {[["Entregas",T.amber],["Correções",T.red],["Versões","#A78BFA"]].map(([l,c])=>(
                      <div key={l} style={{display:"flex",alignItems:"center",gap:6,fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:1}}>
                        <div style={{width:16,height:1.5,background:c}}/>{l}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{background:T.surface,padding:24,borderLeft:`1px solid ${T.border}`}}>
                  <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.muted,marginBottom:4}}>// tipos de erro</div>
                  <div style={{fontFamily:T.font,fontSize:20,fontWeight:700,letterSpacing:1,marginBottom:20,color:T.white}}>OCORRÊNCIAS</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={TIPO_RESUMO} layout="vertical" margin={{top:0,right:0,left:0,bottom:0}}>
                      <XAxis type="number" hide/>
                      <YAxis type="category" dataKey="tipo" tick={{fill:T.muted,fontSize:9,fontFamily:T.mono}} tickLine={false} axisLine={false} width={75}/>
                      <Tooltip content={<Tip/>}/>
                      <Bar dataKey="qtd" radius={[0,2,2,0]} name="Total">
                        {TIPO_RESUMO.map((_,i)=><Cell key={i} fill={CATEGORIAS_ERRO[i]?.cor||T.amber} opacity={0.8}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* EDITOR RANKING STRIP */}
              <div style={{border:`1px solid ${T.border}`}}>
                <div style={{borderBottom:`1px solid ${T.border}`,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.muted}}>// performance do time</div>
                    <div style={{fontFamily:T.font,fontSize:20,fontWeight:700,letterSpacing:1,color:T.white}}>RANKING DE EDITORES</div>
                  </div>
                  <button onClick={()=>setTab("editores")} style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,fontFamily:T.mono,fontSize:9,letterSpacing:2,padding:"5px 12px",cursor:"pointer"}}>VER TUDO →</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:0}}>
                  {[...editors].sort((a,b)=>b.pontuacao-a.pontuacao).map((e,i)=>{
                    const sc = getScoreColor(e.pontuacao,editors.map(x=>x.pontuacao));
                    return (
                      <div key={e.nome} onClick={()=>{setSelEditor(e.nome);setTab("editores");}}
                        style={{borderRight:i<4?`1px solid ${T.border}`:"none",padding:"20px 20px 16px",cursor:"pointer",transition:"background .15s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                          <span style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:2}}>#{i+1}</span>
                          <div style={{width:6,height:6,borderRadius:"50%",background:e.cor}}/>
                        </div>
                        <div style={{fontFamily:T.font,fontSize:16,fontWeight:700,letterSpacing:1,color:T.white,marginBottom:2}}>{e.nome}</div>
                        <div style={{fontFamily:T.font,fontSize:42,fontWeight:900,lineHeight:1,color:sc,letterSpacing:-1}}>{e.pontuacao}</div>
                        <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginTop:6,letterSpacing:1}}>{e.entregas} ENTREGAS</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ───────────── EDITORES ───────────── */}
          {tab==="editores" && (
            <div className="fade">
              <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
                {EDITORS.map((n,i)=>(
                  <button key={n} onClick={()=>setSelEditor(selEditor===n?null:n)} style={{
                    background:selEditor===n?`${COLORS[i]}18`:"none",
                    border:`1px solid ${selEditor===n?COLORS[i]:T.border}`,
                    color:selEditor===n?COLORS[i]:T.muted,
                    fontFamily:T.mono,fontSize:10,letterSpacing:2,padding:"6px 14px",cursor:"pointer",
                  }}>{n.toUpperCase()}</button>
                ))}
              </div>

              {/* TABLE */}
              <div style={{border:`1px solid ${T.border}`,marginBottom:24}}>
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr",padding:"10px 20px",borderBottom:`1px solid ${T.border}`,fontFamily:T.mono,fontSize:9,letterSpacing:2,textTransform:"uppercase",color:T.muted}}>
                  {["Editor","Entregas","Versões/proj","Aprov. v1","No prazo","Correç./proj","Score"].map(h=><div key={h}>{h}</div>)}
                </div>
                {[...editors].sort((a,b)=>b.pontuacao-a.pontuacao).map((e,i)=>{
                  const sc=getScoreColor(e.pontuacao,editors.map(x=>x.pontuacao));
                  return (
                    <div key={e.nome} className="row-hover" onClick={()=>setSelEditor(selEditor===e.nome?null:e.nome)} style={{
                      display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr",
                      padding:"14px 20px",borderBottom:`1px solid ${T.border}`,cursor:"pointer",
                      background:selEditor===e.nome?"rgba(232,184,75,0.04)":"transparent",transition:"background .15s",
                    }}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:2,height:24,background:e.cor}}/>
                        <span style={{fontFamily:T.font,fontSize:16,fontWeight:700,letterSpacing:1,color:T.white}}>{e.nome.toUpperCase()}</span>
                      </div>
                      <div style={{fontFamily:T.mono,fontSize:12,color:T.white,alignSelf:"center"}}>{e.entregas}</div>
                      <div style={{fontFamily:T.mono,fontSize:12,color:e.versoes_media>2.5?T.red:T.green,alignSelf:"center"}}>{e.versoes_media}</div>
                      <div style={{fontFamily:T.mono,fontSize:12,color:e.taxa_aprovacao>=60?T.green:T.amber,alignSelf:"center"}}>{e.taxa_aprovacao}%</div>
                      <div style={{fontFamily:T.mono,fontSize:12,color:e.prazo>=80?T.green:T.amber,alignSelf:"center"}}>{e.prazo}%</div>
                      <div style={{fontFamily:T.mono,fontSize:12,color:e.correcoes_media>3?T.red:T.green,alignSelf:"center"}}>{e.correcoes_media}</div>
                      <div style={{display:"flex",alignItems:"center",gap:10,alignSelf:"center"}}>
                        <span style={{fontFamily:T.font,fontSize:24,fontWeight:900,color:sc,lineHeight:1}}>{e.pontuacao}</span>
                        <ScoreTag score={e.pontuacao}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RADAR */}
              {selEditor && (
                <div className="fade" style={{border:`1px solid ${T.border}`,padding:28}}>
                  <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.muted,marginBottom:4}}>// radar de performance</div>
                  <div style={{fontFamily:T.font,fontSize:24,fontWeight:700,letterSpacing:2,color:T.white,marginBottom:24}}>{selEditor.toUpperCase()}</div>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData[selEditor]}>
                      <PolarGrid stroke="rgba(255,255,255,0.06)"/>
                      <PolarAngleAxis dataKey="metric" tick={{fill:T.muted,fontSize:10,fontFamily:T.mono}}/>
                      <PolarRadiusAxis angle={30} domain={[0,100]} tick={{fill:T.muted,fontSize:8,fontFamily:T.mono}}/>
                      <Radar name={selEditor} dataKey="value"
                        stroke={COLORS[EDITORS.indexOf(selEditor)]}
                        fill={COLORS[EDITORS.indexOf(selEditor)]}
                        fillOpacity={0.12} strokeWidth={2}/>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* ───────────── HISTÓRICO ───────────── */}
          {tab==="histórico" && (() => {

            const METRIC_CONFIG = {
              entregas:    { label:"ENTREGAS POR DIA",    cor:T.amber,   legendDia:(d)=>`${(DAILY_DELIVERIES[d]||[]).length} entrega${(DAILY_DELIVERIES[d]||[]).length!==1?"s":""}` },
              versoes:     { label:"VERSÕES ABERTAS",     cor:"#A78BFA", legendDia:(d)=>`${(getDayDetail(d,"versoes")||[]).length} projeto${(getDayDetail(d,"versoes")||[]).length!==1?"s":""} com nova versão` },
              correcoes:   { label:"CORREÇÕES POR DIA",   cor:T.red,     legendDia:(d)=>`${(getDayDetail(d,"correcoes")||[]).length} projeto${(getDayDetail(d,"correcoes")||[]).length!==1?"s":""} corrigido${(getDayDetail(d,"correcoes")||[]).length!==1?"s":""}` },
              aprovacao_v1:{ label:"APROVAÇÃO v1 (%)",    cor:T.green,   legendDia:(d)=>{ const i=getDayDetail(d,"aprovacao_v1")||[]; const ok=i.filter(x=>x.aprovado).length; return `${ok}/${i.length} aprovado${ok!==1?"s":""}`;} },
            };

            const openDay = (dia, metric) => {
              if(diaDetalhe===dia && metricDetalhe===metric) { setDiaDetalhe(null); }
              else { setDiaDetalhe(dia); setMetricDetalhe(metric); }
            };

            const DetailPanel = ({metric}) => {
              const items = getDayDetail(diaDetalhe, metric);
              const cfg   = METRIC_CONFIG[metric];
              return (
                <div style={{padding:"20px",background:"rgba(232,184,75,0.03)",animation:"fadeUp .25s ease both",overflowY:"auto",maxHeight:400,borderLeft:`1px solid ${T.border}`}}>
                  <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:3,marginBottom:4}}>// {cfg.label}</div>
                  <div style={{fontFamily:T.font,fontSize:28,fontWeight:900,letterSpacing:2,color:cfg.cor,lineHeight:1,marginBottom:6}}>{diaDetalhe}</div>
                  <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:2,marginBottom:16}}>{cfg.legendDia(diaDetalhe).toUpperCase()}</div>
                  {items.length===0 && <div style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>Sem registros.</div>}
                  {items.map((e,i)=>(
                    <div key={e.id||i} style={{borderBottom:`1px solid ${T.border}`,paddingBottom:12,marginBottom:12,animation:"fadeUp .3s ease both",animationDelay:`${i*0.04}s`}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                        <div style={{width:2,height:28,background:e.cor,flexShrink:0}}/>
                        <div>
                          <div style={{fontFamily:T.font,fontSize:14,fontWeight:700,letterSpacing:1,color:T.white}}>{e.editor.toUpperCase()}</div>
                          <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginTop:1}}>{e.hora}</div>
                        </div>
                      </div>
                      <div style={{fontFamily:T.mono,fontSize:11,color:T.white,marginBottom:4,paddingLeft:10}}>{e.projeto}</div>
                      <div style={{display:"flex",gap:8,paddingLeft:10,flexWrap:"wrap"}}>
                        <span style={{fontFamily:T.mono,fontSize:9,color:T.muted}}>{e.cliente}</span>
                        {metric==="entregas" && <>
                          <span style={{fontFamily:T.mono,fontSize:9,color:T.muted}}>·</span>
                          <span style={{fontFamily:T.mono,fontSize:9,color:T.muted}}>V{e.versao}</span>
                          <span style={{fontFamily:T.mono,fontSize:9,color:T.muted}}>·</span>
                          <span style={{fontFamily:T.mono,fontSize:9,color:e.status==="Aprovado"?T.green:e.status==="Em revisão"?T.amber:T.red}}>{e.status?.toUpperCase()}</span>
                        </>}
                        {metric==="versoes" && <>
                          <span style={{fontFamily:T.mono,fontSize:9,color:T.muted}}>·</span>
                          <span style={{fontFamily:T.mono,fontSize:9,color:"#A78BFA"}}>{e.detail}</span>
                        </>}
                        {metric==="correcoes" && <>
                          <span style={{fontFamily:T.mono,fontSize:9,color:T.muted}}>·</span>
                          <span style={{fontFamily:T.mono,fontSize:9,color:T.red}}>{e.detail}</span>
                          <span style={{fontFamily:T.mono,fontSize:9,color:T.muted}}>·</span>
                          <span style={{fontFamily:T.mono,fontSize:9,color:e.gravidade==="alta"?T.red:e.gravidade==="média"?T.amber:T.green}}>{e.gravidade?.toUpperCase()}</span>
                        </>}
                        {metric==="aprovacao_v1" && <>
                          <span style={{fontFamily:T.mono,fontSize:9,color:T.muted}}>·</span>
                          <span style={{fontFamily:T.mono,fontSize:9,fontWeight:700,color:e.aprovado?T.green:T.red}}>{e.aprovado?"APROVADO V1":"REPROVADO V1"}</span>
                          {!e.aprovado && <><span style={{fontFamily:T.mono,fontSize:9,color:T.muted}}>·</span><span style={{fontFamily:T.mono,fontSize:9,color:T.red}}>{e.motivo}</span></>}
                        </>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            };

            const ChartBlock = ({metric,height=160,isFirst=false}) => {
              const cfg  = METRIC_CONFIG[metric];
              const open = diaDetalhe && metricDetalhe===metric;
              return (
                <div style={{background:isFirst?"transparent":T.surface,borderBottom:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:12,padding:"18px 24px 12px",borderBottom:open?`1px solid ${T.border}`:"none"}}>
                    <div style={{width:3,height:isFirst?22:18,background:cfg.cor}}/>
                    <span style={{fontFamily:T.font,fontSize:isFirst?22:16,fontWeight:700,letterSpacing:2,color:T.white}}>{cfg.label}</span>
                    <span style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:2}}>30 DIAS · CLIQUE PARA DETALHAR</span>
                    {open && (
                      <button onClick={()=>setDiaDetalhe(null)} style={{marginLeft:"auto",background:"none",border:`1px solid ${T.border}`,color:T.muted,fontFamily:T.mono,fontSize:9,letterSpacing:2,padding:"3px 9px",cursor:"pointer"}}>FECHAR ✕</button>
                    )}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:open?"1fr 340px":"1fr",transition:"grid-template-columns .25s ease"}}>
                    <div style={{padding:isFirst?"0 24px 20px":"16px 24px"}}>
                      <ResponsiveContainer width="100%" height={height}>
                        <LineChart data={DAILY} margin={{top:4,right:4,bottom:0,left:-20}}
                          onClick={d=>d?.activePayload && openDay(d.activePayload[0]?.payload?.dia, metric)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false}/>
                          <XAxis dataKey="dia" tick={{fill:T.muted,fontSize:8,fontFamily:T.mono}} tickLine={false} axisLine={false} interval={isFirst?2:6}/>
                          <YAxis tick={{fill:T.muted,fontSize:8,fontFamily:T.mono}} tickLine={false} axisLine={false}/>
                          <Tooltip content={({active,payload,label})=>{
                            if(!active||!payload?.length) return null;
                            const items = getDayDetail(label, metric);
                            return (
                              <div style={{background:"#0E0E0E",border:`1px solid ${cfg.cor}55`,padding:"10px 12px",fontFamily:T.mono,fontSize:11,minWidth:170}}>
                                <div style={{color:cfg.cor,fontFamily:T.font,fontSize:13,fontWeight:700,letterSpacing:2,marginBottom:6}}>{label}</div>
                                <div style={{color:T.muted,fontSize:9,letterSpacing:2,marginBottom:5}}>{payload[0]?.value} {metric==="aprovacao_v1"?"%":""}</div>
                                {items.slice(0,3).map((e,i)=>(
                                  <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                                    <div style={{width:2,height:10,background:e.cor}}/>
                                    <span style={{color:T.white,fontSize:10}}>{e.editor.split(" ")[0]} · {e.projeto}</span>
                                  </div>
                                ))}
                                {items.length>3&&<div style={{color:T.muted,fontSize:9,marginTop:3}}>+ {items.length-3} mais</div>}
                                <div style={{color:T.muted,fontSize:9,marginTop:6,borderTop:`1px solid ${T.border}`,paddingTop:5}}>CLIQUE PARA EXPANDIR</div>
                              </div>
                            );
                          }}/>
                          <Line type="monotone" dataKey={metric} stroke={cfg.cor} strokeWidth={2} dot={false} name={cfg.label}
                            activeDot={{r:5,fill:cfg.cor,stroke:T.bg,strokeWidth:2,cursor:"pointer",
                              onClick:(_,payload)=>openDay(payload?.payload?.dia, metric)}}/>
                        </LineChart>
                      </ResponsiveContainer>
                      {isFirst && (
                        <div style={{display:"flex",gap:4,marginTop:12,flexWrap:"wrap"}}>
                          {DAILY.map((d,i)=>{
                            const qtd=(DAILY_DELIVERIES[d.dia]||[]).length;
                            const isSel=diaDetalhe===d.dia&&metricDetalhe===metric;
                            return (
                              <button key={i} onClick={()=>openDay(d.dia,metric)} style={{
                                background:isSel?cfg.cor:"rgba(255,255,255,0.04)",
                                border:`1px solid ${isSel?cfg.cor:T.border}`,
                                color:isSel?"#060606":T.muted,
                                fontFamily:T.mono,fontSize:8,letterSpacing:1,
                                padding:"3px 6px",cursor:"pointer",transition:"all .12s",
                              }}>
                                {d.dia.split("/")[0]}<span style={{opacity:.7,marginLeft:3}}>{qtd}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {open && <DetailPanel metric={metric}/>}
                  </div>
                </div>
              );
            };

            return (
              <div className="fade">
                <div style={{border:`1px solid ${T.border}`,marginBottom:1}}>
                  <ChartBlock metric="entregas" height={200} isFirst={true}/>
                </div>
                <div style={{border:`1px solid ${T.border}`}}>
                  <ChartBlock metric="versoes"      height={90}/>
                  <ChartBlock metric="correcoes"    height={90}/>
                  <div style={{background:T.surface}}>
                    <ChartBlock metric="aprovacao_v1" height={90}/>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ───────────── AO VIVO ───────────── */}
          {tab==="ao vivo" && (
            <div className="fade" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,border:`1px solid ${T.border}`}}>
              {/* Feed */}
              <div style={{background:T.surface,padding:24,borderRight:`1px solid ${T.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:T.green,animation:"pulse 2s infinite"}}/>
                  <span style={{fontFamily:T.mono,fontSize:9,color:T.green,letterSpacing:3}}>TRANSMISSÃO AO VIVO</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:1}}>
                  {feed.map((item,i)=>(
                    <div key={i} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.border}`,alignItems:"flex-start",animation:"ticker .4s ease both",animationDelay:`${i*0.06}s`}}>
                      <span style={{fontFamily:T.mono,fontSize:10,color:T.muted,whiteSpace:"nowrap",letterSpacing:1,marginTop:1}}>{item.time}</span>
                      <div style={{width:1,background:item.cor,alignSelf:"stretch",flexShrink:0}}/>
                      <span style={{fontFamily:T.mono,fontSize:11,color:T.white,lineHeight:1.5}}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Team status */}
              <div style={{background:T.surface,padding:24}}>
                <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:3,marginBottom:24}}>STATUS DO TIME</div>
                <div style={{display:"flex",flexDirection:"column",gap:1}}>
                  {editors.map(e=>{
                    const sc=getScoreColor(e.pontuacao,editors.map(x=>x.pontuacao));
                    return (
                      <div key={e.nome} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
                        <div style={{width:2,height:32,background:e.cor,flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:T.font,fontSize:15,fontWeight:700,letterSpacing:1,color:T.white}}>{e.nome.toUpperCase()}</div>
                          <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginTop:2,letterSpacing:1}}>{e.diarias||e.entregas} ENTREGAS · {e.aproveitamento||e.aproveitamento}% APROV.</div>
                        </div>
                        <div style={{fontFamily:T.font,fontSize:26,fontWeight:900,color:sc,lineHeight:1}}>{e.pontuacao}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ───────────── RANKING ───────────── */}
          {tab==="ranking" && (
            <div className="fade">
              <div style={{display:"flex",gap:2,marginBottom:24}}>
                {["podio","tabela","evolução","conquistas"].map(v=>(
                  <button key={v} onClick={()=>setRankSub(v)} style={{
                    background:rankSub===v?T.amberDim:"none",
                    border:`1px solid ${rankSub===v?T.amber:T.border}`,
                    color:rankSub===v?T.amber:T.muted,
                    fontFamily:T.mono,fontSize:10,letterSpacing:2,textTransform:"uppercase",padding:"7px 18px",cursor:"pointer",
                  }}>{v}</button>
                ))}
              </div>

              {rankSub==="podio" && (
                <div style={{border:`1px solid ${T.border}`}}>
                  {/* PODIUM VISUAL */}
                  <div style={{borderBottom:`1px solid ${T.border}`,padding:"36px 0 0",display:"flex",alignItems:"flex-end",justifyContent:"center",gap:0}}>
                    {[ranked[1],ranked[0],ranked[2]].map((v,i)=>{
                      if(!v) return null;
                      const pos=[2,1,3][i];
                      const h=[120,160,90][i];
                      const medals=["🥈","🥇","🥉"];
                      const accents=[T.muted,T.amber,"#CD7F32"];
                      return (
                        <div key={v.nome} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,flex:1}}>
                          <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:2}}>{v.nome.toUpperCase()}</div>
                          <div style={{fontFamily:T.font,fontSize:48,fontWeight:900,color:accents[i],lineHeight:1,letterSpacing:-1}}>{v.total}</div>
                          <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:1}}>PTS ACUMULADOS</div>
                          <div style={{
                            width:"100%",height:h,
                            background:`linear-gradient(to top, ${accents[i]}18, transparent)`,
                            borderTop:`2px solid ${accents[i]}`,
                            display:"flex",alignItems:"center",justifyContent:"center",
                          }}>
                            <span style={{fontSize:32}}>{medals[i]}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* FULL LIST */}
                  <div style={{padding:24}}>
                    <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:3,marginBottom:16}}>CLASSIFICAÇÃO COMPLETA</div>
                    {ranked.map((v,i)=>{
                      const pct=Math.round((v.total/(ranked[0]?.total||1))*100);
                      return (
                        <div key={v.nome} style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
                          <span style={{fontFamily:T.mono,fontSize:11,color:T.muted,minWidth:20}}>{i+1}</span>
                          <div style={{width:2,height:24,background:v.cor}}/>
                          <span style={{fontFamily:T.font,fontSize:16,fontWeight:700,letterSpacing:1,minWidth:100,color:T.white}}>{v.nome.toUpperCase()}</span>
                          <div style={{flex:1,height:2,background:"rgba(255,255,255,0.05)"}}>
                            <div style={{width:`${pct}%`,height:"100%",background:v.cor,transition:"width 1s ease"}}/>
                          </div>
                          <span style={{fontFamily:T.font,fontSize:22,fontWeight:900,color:v.cor,minWidth:60,textAlign:"right"}}>{v.total}</span>
                          <span style={{fontFamily:T.mono,fontSize:9,color:i===0?T.green:T.muted,minWidth:56,textAlign:"right",letterSpacing:1}}>
                            {i===0?"★ LÍDER":`-${ranked[0].total-v.total}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {rankSub==="tabela" && (
                <div style={{border:`1px solid ${T.border}`,overflowX:"auto"}}>
                  <div style={{minWidth:600,padding:24}}>
                    <div style={{display:"grid",gridTemplateColumns:`140px repeat(${CUR_M},1fr) 80px`,gap:4,marginBottom:10}}>
                      <div/>
                      {MONTHS.slice(0,CUR_M).map(m=><div key={m} style={{fontFamily:T.mono,fontSize:9,color:T.muted,textAlign:"center",letterSpacing:2}}>{m}</div>)}
                      <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,textAlign:"center",letterSpacing:2}}>TOTAL</div>
                    </div>
                    {EDITORS.map((nome,ei)=>(
                      <div key={nome} style={{display:"grid",gridTemplateColumns:`140px repeat(${CUR_M},1fr) 80px`,gap:4,marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:2,height:20,background:COLORS[ei]}}/>
                          <span style={{fontFamily:T.font,fontSize:13,fontWeight:700,letterSpacing:1,color:T.white}}>{nome.toUpperCase()}</span>
                        </div>
                        {MONTHLY_SCORES[ei].slice(0,CUR_M).map((s,mi)=>{
                          const bg=s>=85?"rgba(46,204,113,0.15)":s>=70?"rgba(232,184,75,0.15)":"rgba(232,69,60,0.15)";
                          const fg=s>=85?T.green:s>=70?T.amber:T.red;
                          return <div key={mi} style={{background:bg,color:fg,borderRadius:2,padding:"5px 0",fontFamily:T.mono,fontSize:10,textAlign:"center",fontWeight:500}}>{s}</div>;
                        })}
                        <div style={{fontFamily:T.font,fontSize:18,fontWeight:900,color:COLORS[ei],textAlign:"center",alignSelf:"center"}}>{totals[ei]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rankSub==="evolução" && (
                <div style={{border:`1px solid ${T.border}`,padding:28}}>
                  <div style={{fontFamily:T.font,fontSize:20,fontWeight:700,letterSpacing:2,marginBottom:24,color:T.white}}>PONTOS ACUMULADOS — {new Date().getFullYear()}</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={evolData} margin={{top:4,right:16,bottom:0,left:-10}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                      <XAxis dataKey="mes" tick={{fill:T.muted,fontSize:9,fontFamily:T.mono}} tickLine={false} axisLine={false}/>
                      <YAxis tick={{fill:T.muted,fontSize:9,fontFamily:T.mono}} tickLine={false} axisLine={false}/>
                      <Tooltip content={<Tip/>}/>
                      {EDITORS.map((n,i)=><Line key={n} type="monotone" dataKey={n} stroke={COLORS[i]} strokeWidth={2} dot={{r:3,fill:COLORS[i]}}/>)}
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{display:"flex",gap:20,marginTop:16,flexWrap:"wrap"}}>
                    {EDITORS.map((n,i)=>(
                      <div key={n} style={{display:"flex",alignItems:"center",gap:6,fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:1}}>
                        <div style={{width:16,height:2,background:COLORS[i]}}/>{n.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rankSub==="conquistas" && (
                <div>
                  <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:3,marginBottom:16}}>CONQUISTAS DESBLOQUEADAS — {new Date().getFullYear()}</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:1,border:`1px solid ${T.border}`,marginBottom:24}}>
                    {[
                      {icon:"🎯",name:"SNIPER",desc:"Aprovação na v1 por 3 meses"},
                      {icon:"⚡",name:"RELÂMPAGO",desc:"Entregas no prazo o mês todo"},
                      {icon:"📈",name:"EM ASCENSÃO",desc:"Maior evolução de pontos"},
                      {icon:"🔥",name:"EM CHAMAS",desc:"Melhor nota do mês"},
                      {icon:"🛡️",name:"ZERO ERROS",desc:"Sem correções de áudio"},
                      {icon:"🏆",name:"LÍDER DO ANO",desc:"Maior pontuação acumulada"},
                    ].map((b,i)=>{
                      const owner=ranked[i%ranked.length];
                      return (
                        <div key={b.name} style={{background:T.surface,padding:20,borderRight:i%3<2?`1px solid ${T.border}`:"none",borderBottom:`1px solid ${T.border}`}}>
                          <div style={{fontSize:24,marginBottom:10}}>{b.icon}</div>
                          <div style={{fontFamily:T.font,fontSize:16,fontWeight:700,letterSpacing:2,color:T.white,marginBottom:4}}>{b.name}</div>
                          <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginBottom:12,lineHeight:1.5}}>{b.desc}</div>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:2,height:14,background:owner?.cor}}/>
                            <span style={{fontFamily:T.mono,fontSize:10,color:owner?.cor,letterSpacing:1}}>{owner?.nome?.toUpperCase()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:3,marginBottom:16}}>PRÓXIMAS CONQUISTAS — BLOQUEADAS</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:1,border:`1px solid ${T.border}`,opacity:0.4}}>
                    {[
                      {icon:"💎",name:"DIAMANTE",desc:"500 pts acumulados no ano"},
                      {icon:"🎬",name:"PROLÍFICO",desc:"30 entregas num único mês"},
                      {icon:"✨",name:"IMPECÁVEL",desc:"10 aprovações consecutivas v1"},
                    ].map((b,i)=>(
                      <div key={b.name} style={{background:T.surface,padding:20,borderRight:i<2?`1px solid ${T.border}`:"none"}}>
                        <div style={{fontSize:24,marginBottom:10,filter:"grayscale(1)"}}>{b.icon}</div>
                        <div style={{fontFamily:T.font,fontSize:16,fontWeight:700,letterSpacing:2,color:T.muted,marginBottom:4}}>{b.name}</div>
                        <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginBottom:12,lineHeight:1.5}}>{b.desc}</div>
                        <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:2}}>🔒 BLOQUEADA</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ───────────── ERROS ───────────── */}
          {tab==="erros" && (
            <div className="fade">
              {/* SUB-TABS */}
              <div style={{display:"flex",gap:2,marginBottom:20}}>
                {["overview","por editor","por cliente","log"].map(v=>(
                  <button key={v} onClick={()=>setErroView(v)} style={{
                    background:erroView===v?"rgba(232,69,60,0.12)":"none",
                    border:`1px solid ${erroView===v?T.red:T.border}`,
                    color:erroView===v?T.red:T.muted,
                    fontFamily:T.mono,fontSize:10,letterSpacing:2,textTransform:"uppercase",padding:"7px 16px",cursor:"pointer",
                  }}>{v}</button>
                ))}
              </div>

              {/* FILTROS */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:20,padding:"14px 16px",border:`1px solid ${T.border}`,background:T.surface}}>
                <span style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:3,marginRight:4}}>FILTROS:</span>
                {[
                  {val:filtVM,set:setFiltVM,opts:["todos",...EDITORS],lbl:"todos editores"},
                  {val:filtCli,set:setFiltCli,opts:["todos",...CLIENTES],lbl:"todos clientes"},
                  {val:filtCat,set:setFiltCat,opts:["todos",...CATEGORIAS_ERRO.map(c=>c.id)],display:["todos",...CATEGORIAS_ERRO.map(c=>c.label)],lbl:"categorias"},
                  {val:filtGrav,set:setFiltGrav,opts:["todos","alta","média","baixa"],lbl:"gravidade"},
                ].map((f,i)=>(
                  <select key={i} value={f.val} onChange={e=>f.set(e.target.value)} style={{...selStyle}}>
                    {f.opts.map((o,j)=><option key={o} value={o}>{(f.display||f.opts)[j]==="todos"?f.lbl.toUpperCase():(f.display||f.opts)[j]}</option>)}
                  </select>
                ))}
                <div style={{marginLeft:"auto",display:"flex",gap:12,fontFamily:T.mono,fontSize:10,alignItems:"center"}}>
                  {[["alta",T.red],["média",T.amber],["baixa",T.green]].map(([g,c])=>(
                    <div key={g} style={{display:"flex",alignItems:"center",gap:5,color:c}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:c}}/>
                      {gravCount[g]} {g}
                    </div>
                  ))}
                  <div style={{color:T.muted,borderLeft:`1px solid ${T.border}`,paddingLeft:12}}>{ef.length} REGISTROS</div>
                </div>
              </div>

              {/* OVERVIEW */}
              {erroView==="overview" && (
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:1,border:`1px solid ${T.border}`,marginBottom:1}}>
                    {errCat.map((cat,i)=>{
                      const pct=ef.length>0?Math.round((cat.total/ef.length)*100):0;
                      return (
                        <div key={cat.label} onClick={()=>setFiltCat(CATEGORIAS_ERRO.find(c=>c.label===cat.label)?.id||"todos")}
                          style={{padding:"18px 16px",borderRight:i<errCat.length-1?`1px solid ${T.border}`:"none",cursor:"pointer",position:"relative",overflow:"hidden",background:T.surface}}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}
                          onMouseLeave={e=>e.currentTarget.style.background=T.surface}>
                          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:cat.cor}}/>
                          <div style={{fontSize:18,marginBottom:8}}>{cat.icon}</div>
                          <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:2,marginBottom:6}}>{cat.label.toUpperCase()}</div>
                          <div style={{fontFamily:T.font,fontSize:40,fontWeight:900,color:cat.cor,lineHeight:1,letterSpacing:-1}}>{cat.total}</div>
                          <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginTop:6}}>{pct}% DO TOTAL</div>
                          <div style={{marginTop:10,height:1,background:"rgba(255,255,255,0.05)"}}>
                            <div style={{width:`${pct}%`,height:"100%",background:cat.cor}}/>
                          </div>
                          {cat.alta>0&&<div style={{fontFamily:T.mono,fontSize:9,color:T.red,marginTop:6,letterSpacing:1}}>⚠ {cat.alta} ALTA</div>}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:1,border:`1px solid ${T.border}`,marginBottom:1}}>
                    <div style={{background:T.surface,padding:24}}>
                      <div style={{fontFamily:T.font,fontSize:18,fontWeight:700,letterSpacing:2,marginBottom:20,color:T.white}}>OCORRÊNCIAS POR CATEGORIA</div>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={errCat} layout="vertical" margin={{top:0,right:16,left:0,bottom:0}}>
                          <XAxis type="number" hide/>
                          <YAxis type="category" dataKey="label" tick={{fill:T.muted,fontSize:9,fontFamily:T.mono}} tickLine={false} axisLine={false} width={85}/>
                          <Tooltip content={<Tip/>}/>
                          <Bar dataKey="total" radius={[0,2,2,0]} name="Total">
                            {errCat.map((c,i)=><Cell key={i} fill={c.cor} opacity={0.8}/>)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{background:T.surface,padding:24,borderLeft:`1px solid ${T.border}`}}>
                      <div style={{fontFamily:T.font,fontSize:18,fontWeight:700,letterSpacing:2,marginBottom:16,color:T.white}}>SUB-TIPOS</div>
                      {subTipos.map((s,i)=>{
                        const pct=Math.round((s.qtd/(subTipos[0]?.qtd||1))*100);
                        return (
                          <div key={s.sub} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                            <span style={{fontFamily:T.mono,fontSize:9,color:T.muted,minWidth:16,textAlign:"right"}}>{i+1}</span>
                            <span style={{flex:"0 0 120px",fontFamily:T.mono,fontSize:10,color:T.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.sub}</span>
                            <div style={{flex:1,height:2,background:"rgba(255,255,255,0.05)"}}>
                              <div style={{width:`${pct}%`,height:"100%",background:COLORS[i%COLORS.length]}}/>
                            </div>
                            <span style={{fontFamily:T.mono,fontSize:10,color:COLORS[i%COLORS.length],fontWeight:500,minWidth:20,textAlign:"right"}}>{s.qtd}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* POR EDITOR */}
              {erroView==="por editor" && (
                <div style={{display:"grid",gap:1}}>
                  {errEditor.map(ed=>(
                    <div key={ed.nome} style={{border:`1px solid ${T.border}`,padding:22,background:T.surface}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <div style={{width:3,height:36,background:ed.cor}}/>
                          <div>
                            <div style={{fontFamily:T.font,fontSize:20,fontWeight:700,letterSpacing:2,color:T.white}}>{ed.nome.toUpperCase()}</div>
                            <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:2}}>{ed.total} ERROS REGISTRADOS</div>
                          </div>
                        </div>
                        <div style={{fontFamily:T.font,fontSize:48,fontWeight:900,color:ed.cor,lineHeight:1,letterSpacing:-2}}>{ed.total}</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:1}}>
                        {CATEGORIAS_ERRO.map(cat=>{
                          const qtd=ed[cat.label]||0;
                          const pct=Math.round((qtd/Math.max(...CATEGORIAS_ERRO.map(c=>ed[c.label]||0),1))*100);
                          return (
                            <div key={cat.id} style={{background:"rgba(255,255,255,0.025)",padding:12}}>
                              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                                <span style={{fontSize:14}}>{cat.icon}</span>
                                <span style={{fontFamily:T.font,fontSize:20,fontWeight:900,color:cat.cor}}>{qtd}</span>
                              </div>
                              <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginBottom:6,letterSpacing:1}}>{cat.label.toUpperCase()}</div>
                              <div style={{height:2,background:"rgba(255,255,255,0.05)"}}>
                                <div style={{width:`${pct}%`,height:"100%",background:cat.cor}}/>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* POR CLIENTE */}
              {erroView==="por cliente" && (
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,border:`1px solid ${T.border}`,marginBottom:1}}>
                    <div style={{background:T.surface,padding:24}}>
                      <div style={{fontFamily:T.font,fontSize:18,fontWeight:700,letterSpacing:2,marginBottom:20,color:T.white}}>ERROS POR CLIENTE</div>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={errCli} margin={{top:0,right:8,left:-20,bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                          <XAxis dataKey="nome" tick={{fill:T.muted,fontSize:9,fontFamily:T.mono}} tickLine={false} axisLine={false}/>
                          <YAxis tick={{fill:T.muted,fontSize:9,fontFamily:T.mono}} tickLine={false} axisLine={false}/>
                          <Tooltip content={<Tip/>}/>
                          <Bar dataKey="total" name="Total" radius={[2,2,0,0]}>
                            {errCli.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} opacity={0.8}/>)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{background:T.surface,padding:24,borderLeft:`1px solid ${T.border}`}}>
                      <div style={{fontFamily:T.font,fontSize:18,fontWeight:700,letterSpacing:2,marginBottom:20,color:T.white}}>DETALHAMENTO</div>
                      {errCli.map((c,i)=>{
                        const pct=ef.length>0?Math.round((c.total/ef.length)*100):0;
                        return (
                          <div key={c.nome} style={{marginBottom:14}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                              <span style={{fontFamily:T.font,fontSize:14,fontWeight:700,letterSpacing:1,color:T.white}}>{c.nome.toUpperCase()}</span>
                              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                                {c.alta>0&&<span style={{fontFamily:T.mono,fontSize:9,color:T.red,letterSpacing:1}}>⚠ {c.alta}</span>}
                                <span style={{fontFamily:T.font,fontSize:18,fontWeight:900,color:COLORS[i%COLORS.length]}}>{c.total}</span>
                              </div>
                            </div>
                            <div style={{height:2,background:"rgba(255,255,255,0.05)"}}>
                              <div style={{width:`${pct}%`,height:"100%",background:COLORS[i%COLORS.length]}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* HEATMAP */}
                  <div style={{border:`1px solid ${T.border}`,padding:24,background:T.surface}}>
                    <div style={{fontFamily:T.font,fontSize:18,fontWeight:700,letterSpacing:2,marginBottom:20,color:T.white}}>MAPA CLIENTE × CATEGORIA</div>
                    <div style={{overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontFamily:T.mono,fontSize:10}}>
                        <thead>
                          <tr>
                            <td style={{padding:"6px 12px",color:T.muted}}/>
                            {CATEGORIAS_ERRO.map(c=><td key={c.id} style={{padding:"6px 8px",textAlign:"center",color:T.muted,fontSize:9,letterSpacing:1}}>{c.icon}<br/>{c.label.toUpperCase()}</td>)}
                          </tr>
                        </thead>
                        <tbody>
                          {CLIENTES.map((cli,ci)=>(
                            <tr key={cli}>
                              <td style={{padding:"8px 12px",color:T.white,fontFamily:T.font,fontSize:13,fontWeight:700,letterSpacing:1,whiteSpace:"nowrap"}}>{cli.toUpperCase()}</td>
                              {CATEGORIAS_ERRO.map(cat=>{
                                const qtd=ef.filter(e=>e.cliente===cli&&e.categoria===cat.id).length;
                                const intensity=qtd===0?0:Math.min(0.85,0.15+(qtd/12));
                                return (
                                  <td key={cat.id} style={{padding:"8px",textAlign:"center"}}>
                                    <div style={{background:qtd>0?cat.cor+Math.round(intensity*255).toString(16).padStart(2,"0"):"transparent",padding:"4px 0",color:qtd>0?T.white:T.muted,fontWeight:qtd>5?700:400,borderRadius:2,fontFamily:T.mono,fontSize:11}}>
                                      {qtd||"—"}
                                    </div>
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

              {/* LOG */}
              {erroView==="log" && (
                <div style={{border:`1px solid ${T.border}`}}>
                  <div style={{display:"grid",gridTemplateColumns:"80px 1fr 1fr 100px 90px 80px",padding:"10px 20px",borderBottom:`1px solid ${T.border}`,fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:2,textTransform:"uppercase"}}>
                    {["Data","Projeto · Editor","Sub-tipo","Categoria","Cliente","Grav."].map(h=><div key={h}>{h}</div>)}
                  </div>
                  {ef.slice(0,40).map((e,i)=>{
                    const cat=CATEGORIAS_ERRO.find(c=>c.id===e.categoria);
                    const gc=e.gravidade==="alta"?T.red:e.gravidade==="média"?T.amber:T.green;
                    const ec=COLORS[EDITORS.indexOf(e.editor)];
                    return (
                      <div key={e.id} className="row-hover" style={{display:"grid",gridTemplateColumns:"80px 1fr 1fr 100px 90px 80px",padding:"12px 20px",borderBottom:`1px solid ${T.border}`,fontSize:11,alignItems:"center",background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
                        <div style={{fontFamily:T.mono,color:T.muted}}>{e.data}</div>
                        <div>
                          <div style={{fontFamily:T.font,fontSize:13,fontWeight:700,letterSpacing:1,color:T.white}}>{e.projeto.toUpperCase()}</div>
                          <div style={{fontFamily:T.mono,fontSize:9,color:ec,letterSpacing:1}}>{e.editor.toUpperCase()}</div>
                        </div>
                        <div style={{fontFamily:T.mono,color:T.white}}>{e.subTipo}</div>
                        <div><span style={{background:`${cat?.cor}22`,color:cat?.cor,padding:"2px 8px",fontFamily:T.mono,fontSize:9,letterSpacing:1}}>{cat?.label.toUpperCase()}</span></div>
                        <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:1}}>{e.cliente}</div>
                        <div><span style={{background:`${gc}22`,color:gc,padding:"2px 6px",fontFamily:T.mono,fontSize:9,fontWeight:600,letterSpacing:1}}>{e.gravidade.toUpperCase()}</span></div>
                      </div>
                    );
                  })}
                  {ef.length>40&&<div style={{padding:"14px 20px",fontFamily:T.mono,fontSize:10,color:T.muted,textAlign:"center",letterSpacing:2}}>+ {ef.length-40} REGISTROS — USE OS FILTROS PARA REFINAR</div>}
                  {ef.length===0&&<div style={{padding:"40px 20px",fontFamily:T.mono,fontSize:11,color:T.muted,textAlign:"center",letterSpacing:2}}>NENHUM REGISTRO COM OS FILTROS SELECIONADOS</div>}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
      {modal && <Modal onClose={()=>setModal(false)} onAdd={handleAdd}/>}
    </>
  );
}
