import { useState } from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { T } from "../../tokens";
import { EDITORS, COLORS, CLIENTES, CATEGORIAS_ERRO, ERROS } from "../../data";
import Tip from "../Tip";

const SUB_VIEWS = ["overview", "por editor", "por cliente", "log"];

const SEL_STYLE = {
  background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.07)`,
  color: "#F0EDE6", padding: "7px 10px",
  fontFamily: "'IBM Plex Mono',monospace", fontSize: 11,
  outline: "none", cursor: "pointer",
};

export default function Erros({ erroView, setErroView, filtVM, setFiltVM, filtCli, setFiltCli, filtCat, setFiltCat, filtGrav, setFiltGrav }) {
  const ef = ERROS.filter(e =>
    (filtVM   === "todos" || e.editor    === filtVM) &&
    (filtCli  === "todos" || e.cliente   === filtCli) &&
    (filtCat  === "todos" || e.categoria === filtCat) &&
    (filtGrav === "todos" || e.gravidade === filtGrav)
  );

  const errCat = CATEGORIAS_ERRO.map(c => ({
    label: c.label, icon: c.icon, cor: c.cor,
    total: ef.filter(e => e.categoria === c.id).length,
    alta:  ef.filter(e => e.categoria === c.id && e.gravidade === "alta").length,
  })).sort((a, b) => b.total - a.total);

  const errEditor = EDITORS.map((n, i) => {
    const ex = ef.filter(e => e.editor === n);
    const o  = { nome: n, cor: COLORS[i], total: ex.length };
    CATEGORIAS_ERRO.forEach(c => { o[c.label] = ex.filter(e => e.categoria === c.id).length; });
    return o;
  }).sort((a, b) => b.total - a.total);

  const errCli  = CLIENTES.map(c => ({
    nome: c,
    total: ef.filter(e => e.cliente === c).length,
    alta:  ef.filter(e => e.cliente === c && e.gravidade === "alta").length,
  })).sort((a, b) => b.total - a.total);

  const gravCount = {
    alta:  ef.filter(e => e.gravidade === "alta").length,
    média: ef.filter(e => e.gravidade === "média").length,
    baixa: ef.filter(e => e.gravidade === "baixa").length,
  };

  const subTipos = (() => {
    const m = {};
    ef.forEach(e => { m[e.subTipo] = (m[e.subTipo] || 0) + 1; });
    return Object.entries(m).map(([sub, qtd]) => ({ sub, qtd })).sort((a, b) => b.qtd - a.qtd).slice(0, 10);
  })();

  return (
    <div className="fade">
      {/* Sub-tab bar */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
        {SUB_VIEWS.map(v => (
          <button key={v} onClick={() => setErroView(v)} style={{
            background: erroView === v ? T.redDim : "none",
            border: `1px solid ${erroView === v ? T.red : T.border}`,
            color: erroView === v ? T.red : T.muted,
            fontFamily: T.mono, fontSize: 10, letterSpacing: 2,
            textTransform: "uppercase", padding: "7px 16px", cursor: "pointer",
            transition: `all ${T.fast}`,
          }}>{v}</button>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
        marginBottom: 20, padding: "13px 16px",
        border: `1px solid ${T.border}`, background: T.surface,
      }}>
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 3, marginRight: 4 }}>FILTROS:</span>
        {[
          { val: filtVM,   set: setFiltVM,   opts: ["todos", ...EDITORS],                        disp: null,                                    lbl: "todos editores" },
          { val: filtCli,  set: setFiltCli,  opts: ["todos", ...CLIENTES],                       disp: null,                                    lbl: "todos clientes" },
          { val: filtCat,  set: setFiltCat,  opts: ["todos", ...CATEGORIAS_ERRO.map(c => c.id)], disp: ["todos", ...CATEGORIAS_ERRO.map(c => c.label)], lbl: "categorias" },
          { val: filtGrav, set: setFiltGrav, opts: ["todos", "alta", "média", "baixa"],           disp: null,                                    lbl: "gravidade" },
        ].map((f, i) => (
          <select key={i} value={f.val} onChange={e => f.set(e.target.value)} style={SEL_STYLE}>
            {f.opts.map((o, j) => (
              <option key={o} value={o}>
                {(f.disp || f.opts)[j] === "todos" ? f.lbl.toUpperCase() : (f.disp || f.opts)[j]}
              </option>
            ))}
          </select>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, fontFamily: T.mono, fontSize: 10, alignItems: "center" }}>
          {[["alta", T.red], ["média", T.amber], ["baixa", T.green]].map(([g, c]) => (
            <div key={g} style={{ display: "flex", alignItems: "center", gap: 5, color: c }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
              {gravCount[g]} {g}
            </div>
          ))}
          <div style={{ color: T.muted, borderLeft: `1px solid ${T.border}`, paddingLeft: 12 }}>{ef.length} REGISTROS</div>
        </div>
      </div>

      {/* OVERVIEW */}
      {erroView === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 1, border: `1px solid ${T.border}`, marginBottom: 1 }}>
            {errCat.map((cat, i) => {
              const pct = ef.length > 0 ? Math.round((cat.total / ef.length) * 100) : 0;
              return (
                <div key={cat.label} onClick={() => setFiltCat(CATEGORIAS_ERRO.find(c => c.label === cat.label)?.id || "todos")}
                  style={{
                    padding: "18px 16px", borderRight: i < errCat.length - 1 ? `1px solid ${T.border}` : "none",
                    cursor: "pointer", position: "relative", overflow: "hidden", background: T.surface,
                    transition: `background ${T.fast}`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHov)}
                  onMouseLeave={e => (e.currentTarget.style.background = T.surface)}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: cat.cor }} />
                  <div style={{ fontSize: 18, marginBottom: 8 }}>{cat.icon}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 2, marginBottom: 6 }}>{cat.label.toUpperCase()}</div>
                  <div style={{ fontFamily: T.font, fontSize: 40, fontWeight: 900, color: cat.cor, lineHeight: 1, letterSpacing: -1 }}>{cat.total}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 6 }}>{pct}% DO TOTAL</div>
                  <div style={{ marginTop: 10, height: 1, background: "rgba(255,255,255,0.05)" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: cat.cor }} />
                  </div>
                  {cat.alta > 0 && <div style={{ fontFamily: T.mono, fontSize: 9, color: T.red, marginTop: 6, letterSpacing: 1 }}>⚠ {cat.alta} ALTA</div>}
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 1, border: `1px solid ${T.border}` }}>
            <div style={{ background: T.surface, padding: 24 }}>
              <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 20, color: T.white }}>
                OCORRÊNCIAS POR CATEGORIA
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={errCat} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="label" tick={{ fill: T.muted, fontSize: 9, fontFamily: T.mono }} tickLine={false} axisLine={false} width={85} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="total" radius={[0, 2, 2, 0]} name="Total">
                    {errCat.map((c, i) => <Cell key={i} fill={c.cor} opacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: T.surface, padding: 24, borderLeft: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 16, color: T.white }}>SUB-TIPOS</div>
              {subTipos.map((s, i) => {
                const pct = Math.round((s.qtd / (subTipos[0]?.qtd || 1)) * 100);
                return (
                  <div key={s.sub} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, minWidth: 16, textAlign: "right" }}>{i + 1}</span>
                    <span style={{ flex: "0 0 120px", fontFamily: T.mono, fontSize: 10, color: T.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.sub}</span>
                    <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.05)" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: COLORS[i % COLORS.length] }} />
                    </div>
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: COLORS[i % COLORS.length], fontWeight: 500, minWidth: 20, textAlign: "right" }}>{s.qtd}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* POR EDITOR */}
      {erroView === "por editor" && (
        <div style={{ display: "grid", gap: 1 }}>
          {errEditor.map(ed => (
            <div key={ed.nome} style={{ border: `1px solid ${T.border}`, padding: 22, background: T.surface }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 3, height: 36, background: ed.cor }} />
                  <div>
                    <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, letterSpacing: 2, color: T.white }}>{ed.nome.toUpperCase()}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 2 }}>{ed.total} ERROS REGISTRADOS</div>
                  </div>
                </div>
                <div style={{ fontFamily: T.font, fontSize: 48, fontWeight: 900, color: ed.cor, lineHeight: 1, letterSpacing: -2 }}>{ed.total}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 1 }}>
                {CATEGORIAS_ERRO.map(cat => {
                  const qtd = ed[cat.label] || 0;
                  const pct = Math.round((qtd / Math.max(...CATEGORIAS_ERRO.map(c => ed[c.label] || 0), 1)) * 100);
                  return (
                    <div key={cat.id} style={{ background: "rgba(255,255,255,0.025)", padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 14 }}>{cat.icon}</span>
                        <span style={{ fontFamily: T.font, fontSize: 20, fontWeight: 900, color: cat.cor }}>{qtd}</span>
                      </div>
                      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 6, letterSpacing: 1 }}>{cat.label.toUpperCase()}</div>
                      <div style={{ height: 2, background: "rgba(255,255,255,0.05)" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: cat.cor }} />
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
      {erroView === "por cliente" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, border: `1px solid ${T.border}`, marginBottom: 1 }}>
            <div style={{ background: T.surface, padding: 24 }}>
              <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 20, color: T.white }}>ERROS POR CLIENTE</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={errCli} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="nome" tick={{ fill: T.muted, fontSize: 9, fontFamily: T.mono }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: T.muted, fontSize: 9, fontFamily: T.mono }} tickLine={false} axisLine={false} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="total" name="Total" radius={[2, 2, 0, 0]}>
                    {errCli.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: T.surface, padding: 24, borderLeft: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 20, color: T.white }}>DETALHAMENTO</div>
              {errCli.map((c, i) => {
                const pct = ef.length > 0 ? Math.round((c.total / ef.length) * 100) : 0;
                return (
                  <div key={c.nome} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontFamily: T.font, fontSize: 14, fontWeight: 700, letterSpacing: 1, color: T.white }}>{c.nome.toUpperCase()}</span>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {c.alta > 0 && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.red, letterSpacing: 1 }}>⚠ {c.alta}</span>}
                        <span style={{ fontFamily: T.font, fontSize: 18, fontWeight: 900, color: COLORS[i % COLORS.length] }}>{c.total}</span>
                      </div>
                    </div>
                    <div style={{ height: 2, background: "rgba(255,255,255,0.05)" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heatmap */}
          <div style={{ border: `1px solid ${T.border}`, padding: 24, background: T.surface }}>
            <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 20, color: T.white }}>
              MAPA CLIENTE × CATEGORIA
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.mono, fontSize: 10 }}>
                <thead>
                  <tr>
                    <td style={{ padding: "6px 12px", color: T.muted }} />
                    {CATEGORIAS_ERRO.map(c => (
                      <td key={c.id} style={{ padding: "6px 8px", textAlign: "center", color: T.muted, fontSize: 9, letterSpacing: 1 }}>
                        {c.icon}<br />{c.label.toUpperCase()}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CLIENTES.map(cli => (
                    <tr key={cli}>
                      <td style={{ padding: "8px 12px", color: T.white, fontFamily: T.font, fontSize: 13, fontWeight: 700, letterSpacing: 1, whiteSpace: "nowrap" }}>
                        {cli.toUpperCase()}
                      </td>
                      {CATEGORIAS_ERRO.map(cat => {
                        const qtd       = ef.filter(e => e.cliente === cli && e.categoria === cat.id).length;
                        const intensity = qtd === 0 ? 0 : Math.min(0.85, 0.15 + qtd / 12);
                        return (
                          <td key={cat.id} style={{ padding: "8px", textAlign: "center" }}>
                            <div style={{
                              background: qtd > 0 ? cat.cor + Math.round(intensity * 255).toString(16).padStart(2, "0") : "transparent",
                              padding: "4px 0", color: qtd > 0 ? T.white : T.muted,
                              fontWeight: qtd > 5 ? 700 : 400,
                              fontFamily: T.mono, fontSize: 11,
                            }}>
                              {qtd || "—"}
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
      {erroView === "log" && (
        <div style={{ border: `1px solid ${T.border}` }}>
          <div style={{
            display: "grid", gridTemplateColumns: "80px 1fr 1fr 100px 90px 80px",
            padding: "10px 20px", borderBottom: `1px solid ${T.border}`,
            fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 2, textTransform: "uppercase",
          }}>
            {["Data", "Projeto · Editor", "Sub-tipo", "Categoria", "Cliente", "Grav."].map(h => <div key={h}>{h}</div>)}
          </div>
          {ef.slice(0, 40).map((e, i) => {
            const cat = CATEGORIAS_ERRO.find(c => c.id === e.categoria);
            const gc  = e.gravidade === "alta" ? T.red : e.gravidade === "média" ? T.amber : T.green;
            const ec  = COLORS[EDITORS.indexOf(e.editor)];
            return (
              <div key={e.id} className="row-hover" style={{
                display: "grid", gridTemplateColumns: "80px 1fr 1fr 100px 90px 80px",
                padding: "12px 20px", borderBottom: `1px solid ${T.border}`,
                fontSize: 11, alignItems: "center",
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
              }}>
                <div style={{ fontFamily: T.mono, color: T.muted }}>{e.data}</div>
                <div>
                  <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 700, letterSpacing: 1, color: T.white }}>{e.projeto.toUpperCase()}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: ec, letterSpacing: 1 }}>{e.editor.toUpperCase()}</div>
                </div>
                <div style={{ fontFamily: T.mono, color: T.white }}>{e.subTipo}</div>
                <div>
                  <span style={{ background: `${cat?.cor}22`, color: cat?.cor, padding: "2px 8px", fontFamily: T.mono, fontSize: 9, letterSpacing: 1 }}>
                    {cat?.label.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>{e.cliente}</div>
                <div>
                  <span style={{ background: `${gc}22`, color: gc, padding: "2px 6px", fontFamily: T.mono, fontSize: 9, fontWeight: 600, letterSpacing: 1 }}>
                    {e.gravidade.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
          {ef.length > 40 && (
            <div style={{ padding: "14px 20px", fontFamily: T.mono, fontSize: 10, color: T.muted, textAlign: "center", letterSpacing: 2 }}>
              + {ef.length - 40} REGISTROS — USE OS FILTROS PARA REFINAR
            </div>
          )}
          {ef.length === 0 && (
            <div style={{ padding: "40px 20px", fontFamily: T.mono, fontSize: 11, color: T.muted, textAlign: "center", letterSpacing: 2 }}>
              NENHUM REGISTRO COM OS FILTROS SELECIONADOS
            </div>
          )}
        </div>
      )}
    </div>
  );
}
