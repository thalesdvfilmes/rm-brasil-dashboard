import { T } from "./tokens";

export const EDITORS  = ["Thales", "Enzo", "Renan", "Mazala", "Matheus"];
export const COLORS   = ["#E8B84B", "#E8453C", "#4ECDC4", "#A78BFA", "#2ECC71"];
export const CLIENTES = ["Banco Digital", "Saúde Total", "Varejo XYZ", "Construtora Sul", "Agência Nova"];
export const MONTHS   = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
export const CUR_M    = new Date().getMonth();
export const rnd      = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

export const CATEGORIAS_ERRO = [
  { id: "audio",    label: "Áudio",        icon: "🎧", cor: "#4ECDC4", sub: ["Mix/Volume", "Sincronia A/V", "Ruído", "Música alta"] },
  { id: "corte",    label: "Corte/Ritmo",  icon: "✂️",  cor: "#E8B84B", sub: ["Timing", "Pacing", "Corte abrupto", "Transição"] },
  { id: "cor",      label: "Cor/Gradação", icon: "🎨", cor: "#A78BFA", sub: ["Exposição", "Balanço", "Inconsistência", "Saturação"] },
  { id: "legenda",  label: "Legenda",      icon: "💬", cor: "#2ECC71", sub: ["Ortografia", "Sincronia", "Formatação", "Falta legenda"] },
  { id: "motion",   label: "Motion/GFX",   icon: "✨", cor: "#E8453C", sub: ["Lower third", "Animação", "Vinheta", "Logo errado"] },
  { id: "export",   label: "Exportação",   icon: "📦", cor: "#FF8C42", sub: ["Codec", "Resolução", "Proporção", "Corrompido"] },
  { id: "conteudo", label: "Conteúdo",     icon: "🎬", cor: "#45B7D1", sub: ["Falta cena", "Sequência", "Take errado", "Produto"] },
];

const PROJETOS_POOL = [
  "Spot TV Verão", "Institucional Saúde", "Teaser Lançamento", "Série Episódio",
  "Reel Instagram", "Case Cliente", "Apresentação Evento", "Campanha Digital",
  "Spot Rádio", "Vídeo Produto", "Manifesto Marca", "Viral Social",
];

// Pesos: aprovação v1 35% | prazo 25% | versões (invertido) 20% | correções (invertido) 20%
export const calcPontuacao = (e) => {
  const aprovScore    = e.taxa_aprovacao;
  const prazoScore    = e.prazo;
  const versoesScore  = Math.max(0, Math.min(100, (3.5 - e.versoes_media) / 2.5 * 100));
  const correcoesScore = Math.max(0, Math.min(100, (4 - e.correcoes_media) / 4 * 100));
  return Math.round(
    aprovScore     * 0.35 +
    prazoScore     * 0.25 +
    versoesScore   * 0.20 +
    correcoesScore * 0.20
  );
};

export const generateEditors = () => EDITORS.map((nome, i) => {
  const e = {
    nome, cor: COLORS[i],
    entregas:        i === 0 ? rnd(35, 40)  : rnd(15, 35),
    versoes_media:   i === 0 ? +(Math.random() * 0.6 + 1.0).toFixed(1) : +(Math.random() * 2 + 1.4).toFixed(1),
    taxa_aprovacao:  i === 0 ? rnd(80, 95)  : rnd(48, 82),
    prazo:           i === 0 ? rnd(92, 99)  : rnd(62, 95),
    correcoes_media: i === 0 ? +(Math.random() * 0.8 + 0.2).toFixed(1) : +(Math.random() * 3 + 0.8).toFixed(1),
  };
  return { ...e, pontuacao: calcPontuacao(e) };
});

export const generateRadar = () => [
  { metric: "Prazo",        value: rnd(60, 95) },
  { metric: "Qualidade",    value: rnd(55, 95) },
  { metric: "Aprovação v1", value: rnd(45, 90) },
  { metric: "Volume",       value: rnd(50, 90) },
  { metric: "Velocidade",   value: rnd(60, 95) },
  { metric: "Revisões",     value: rnd(60, 94) },
];

export const generateDaily = () => {
  const r = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    r.push({
      dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      entregas: rnd(1, 6), versoes: rnd(2, 11), correcoes: rnd(1, 8), aprovacao_v1: rnd(40, 80),
    });
  }
  return r;
};

const generateDailyDeliveries = () => {
  const map = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    map[key] = Array.from({ length: rnd(1, 5) }, (_, j) => {
      const edIdx = rnd(0, EDITORS.length - 1);
      return {
        id: `${key}-${j}`, editor: EDITORS[edIdx], cor: COLORS[edIdx],
        projeto: PROJETOS_POOL[rnd(0, PROJETOS_POOL.length - 1)],
        cliente: CLIENTES[rnd(0, CLIENTES.length - 1)],
        versao: rnd(1, 4),
        status: ["Aprovado", "Em revisão", "Corrigido"][rnd(0, 2)],
        hora: `${rnd(8, 18).toString().padStart(2, "0")}:${["00", "15", "30", "45"][rnd(0, 3)]}`,
      };
    });
  }
  return map;
};

const generateErros = () => {
  const projs = ["Spot TV", "Institucional", "Teaser", "Série", "Reel", "Case", "Apresentação", "Campanha"];
  return Array.from({ length: 120 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - rnd(0, 89));
    const cat = CATEGORIAS_ERRO[rnd(0, CATEGORIAS_ERRO.length - 1)];
    return {
      id: i, data: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      mes: d.getMonth(), editor: EDITORS[rnd(0, 4)], cliente: CLIENTES[rnd(0, 4)],
      projeto: projs[rnd(0, projs.length - 1)] + " " + rnd(1, 5),
      categoria: cat.id, categoriaLabel: cat.label, subTipo: cat.sub[rnd(0, cat.sub.length - 1)],
      versao: rnd(1, 4), gravidade: ["baixa", "média", "alta"][rnd(0, 2)],
    };
  }).sort((a, b) => b.id - a.id);
};

export const MONTHLY_SCORES = EDITORS.map(() => MONTHS.map((_, i) => i < CUR_M ? rnd(58, 97) : null));
export const ACCUMULATED    = MONTHLY_SCORES.map(s => { let a = 0; return s.map(v => v !== null ? (a += v, a) : null); });

export const DAILY            = generateDaily();
export const ERROS            = generateErros();
export const DAILY_DELIVERIES = generateDailyDeliveries();
export const TIPO_RESUMO      = CATEGORIAS_ERRO.map(c => ({
  tipo: c.label, qtd: ERROS.filter(e => e.categoria === c.id).length,
}));

export const getDayDetail = (dia, metric) => {
  const base = DAILY_DELIVERIES[dia] || [];
  if (metric === "entregas") return base;
  if (metric === "versoes") {
    return base.map(e => ({
      ...e, versao: rnd(2, 4),
      detail: `Abriu v${rnd(2, 4)} após ${rnd(1, 3)} rodada${rnd(1, 3) > 1 ? "s" : ""} de revisão`,
    })).filter((_, i) => i < rnd(2, base.length));
  }
  if (metric === "correcoes") {
    const tipos = ["Áudio", "Corte", "Cor", "Legenda", "Motion", "Exportação"];
    return base.map(e => ({
      ...e,
      detail: `${rnd(1, 4)} correç${rnd(1, 4) > 1 ? "ões" : "ão"} · ${tipos[rnd(0, tipos.length - 1)]}`,
      gravidade: ["baixa", "média", "alta"][rnd(0, 2)],
    })).filter((_, i) => i < rnd(1, Math.max(1, base.length - 1)));
  }
  if (metric === "aprovacao_v1") {
    const aprovados  = base.filter((_, i) => i % 2 === 0).map(e => ({ ...e, aprovado: true }));
    const reprovados = base.filter((_, i) => i % 2 !== 0).map(e => ({
      ...e, aprovado: false, motivo: ["Áudio", "Corte", "Cor"][rnd(0, 2)],
    }));
    return [...aprovados, ...reprovados];
  }
  return base;
};

// Fonte única de verdade para os 4 níveis de performance
export const SCORE_LEVELS = [
  { min: 85, label: "EXCELENTE",    color: T.greenLight },
  { min: 70, label: "ACIMA",        color: T.green      },
  { min: 40, label: "ABAIXO",       color: T.amber      },
  { min: 0,  label: "MUITO ABAIXO", color: T.red        },
];

export const getScoreColor = (score) => {
  const level = SCORE_LEVELS.find(l => score >= l.min);
  return level ? level.color : T.red;
};
