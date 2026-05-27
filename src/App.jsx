import { useState } from "react";
import { T } from "./tokens";
import {
  generateEditors, generateRadar, calcPontuacao, EDITORS, COLORS,
} from "./data";

import Nav    from "./components/Nav";
import Modal  from "./components/Modal";

import Resumo    from "./components/tabs/Resumo";
import Editores  from "./components/tabs/Editores";
import Historico from "./components/tabs/Historico";
import AoVivo    from "./components/tabs/AoVivo";
import Ranking   from "./components/tabs/Ranking";
import Erros     from "./components/tabs/Erros";

const initRadar = () => Object.fromEntries(EDITORS.map(e => [e, generateRadar()]));

const initFeed = () => [
  { time: "14:32", text: "Lucas M. entregou v2 — Spot Banco Digital",        cor: COLORS[0] },
  { time: "13:15", text: "Fernanda R. aprovada na v1 — Institucional Saúde", cor: COLORS[1] },
  { time: "11:48", text: "João P. recebeu 3 correções — Teaser Filme",        cor: COLORS[2] },
  { time: "10:20", text: "Camila S. entregou no prazo — Série Ep.4",          cor: COLORS[3] },
];

const TAB_TITLES = {
  resumo:      "Resumo Geral",
  editores:    "Análise por Editor",
  "histórico": "Histórico de Entregas",
  "ao vivo":   "Feed Ao Vivo",
  ranking:     "Ranking Anual",
  erros:       "Análise de Erros",
};

export default function App() {
  const [tab,      setTab]      = useState("resumo");
  const [modal,    setModal]    = useState(false);
  const [editors,  setEditors]  = useState(generateEditors);
  const [radarData]             = useState(initRadar);
  const [feed,     setFeed]     = useState(initFeed);

  const [selEditor,     setSelEditor]     = useState(null);
  const [diaDetalhe,    setDiaDetalhe]    = useState(null);
  const [metricDetalhe, setMetricDetalhe] = useState("entregas");

  const [erroView, setErroView] = useState("overview");
  const [filtVM,   setFiltVM]   = useState("todos");
  const [filtCli,  setFiltCli]  = useState("todos");
  const [filtCat,  setFiltCat]  = useState("todos");
  const [filtGrav, setFiltGrav] = useState("todos");

  const handleAdd = (form) => {
    const now  = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setFeed(f => [
      { time, text: `${form.editor} entregou v${form.versao}${form.projeto ? ` — ${form.projeto}` : ""}`, cor: COLORS[EDITORS.indexOf(form.editor)] || T.amber },
      ...f.slice(0, 9),
    ]);
    setEditors(ed => ed.map(e => {
      if (e.nome !== form.editor) return e;
      const n = e.entregas + 1;
      const updated = {
        ...e,
        entregas:        n,
        versoes_media:   +((e.versoes_media * e.entregas + form.versao) / n).toFixed(1),
        taxa_aprovacao:  Math.round((e.taxa_aprovacao * e.entregas + (form.versao === 1 ? 100 : 0)) / n),
        prazo:           Math.round((e.prazo * e.entregas + (form.prazo === "sim" ? 100 : 0)) / n),
        correcoes_media: +((e.correcoes_media * e.entregas + form.correcoes) / n).toFixed(1),
      };
      return { ...updated, pontuacao: calcPontuacao(updated) };
    }));
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <Nav tab={tab} setTab={setTab} onNewDelivery={() => setModal(true)} />

      {/* Title bar */}
      <div style={{
        display: "flex", alignItems: "baseline", gap: 14,
        padding: "22px 28px 18px",
        borderBottom: `1px solid ${T.border}`,
      }}>
        <span style={{
          fontFamily: T.font, fontSize: 38, fontWeight: 900,
          letterSpacing: 2, color: T.white, lineHeight: 1, textTransform: "uppercase",
        }}>
          {TAB_TITLES[tab]}
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: 1 }}>
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span style={{
          marginLeft: "auto", fontFamily: T.mono, fontSize: 10, color: T.muted,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: T.green, display: "inline-block", animation: "pulse 2s infinite",
          }} />
          SISTEMA ATIVO
        </span>
      </div>

      <main style={{ padding: "28px 28px 60px", maxWidth: 1440, margin: "0 auto" }}>
        {tab === "resumo" && (
          <Resumo
            editors={editors}
            setTab={setTab}
            setMetricDetalhe={setMetricDetalhe}
            setDiaDetalhe={setDiaDetalhe}
            setSelEditor={setSelEditor}
            setErroView={setErroView}
            setFiltCat={setFiltCat}
          />
        )}

        {tab === "editores" && (
          <Editores
            editors={editors}
            radarData={radarData}
            selEditor={selEditor}
            setSelEditor={setSelEditor}
          />
        )}

        {tab === "histórico" && (
          <Historico
            diaDetalhe={diaDetalhe}
            setDiaDetalhe={setDiaDetalhe}
            metricDetalhe={metricDetalhe}
            setMetricDetalhe={setMetricDetalhe}
          />
        )}

        {tab === "ao vivo" && <AoVivo editors={editors} feed={feed} />}

        {tab === "ranking"  && <Ranking editors={editors} />}

        {tab === "erros" && (
          <Erros
            erroView={erroView}  setErroView={setErroView}
            filtVM={filtVM}      setFiltVM={setFiltVM}
            filtCli={filtCli}    setFiltCli={setFiltCli}
            filtCat={filtCat}    setFiltCat={setFiltCat}
            filtGrav={filtGrav}  setFiltGrav={setFiltGrav}
          />
        )}
      </main>

      {modal && <Modal onClose={() => setModal(false)} onAdd={handleAdd} />}
    </div>
  );
}
