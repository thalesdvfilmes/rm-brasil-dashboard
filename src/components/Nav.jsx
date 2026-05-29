import { T } from "../tokens";

const TABS = [
  { id: "resumo",    icon: "◈", label: "RESUMO" },
  { id: "editores",  icon: "◉", label: "EDITORES" },
  { id: "histórico", icon: "◎", label: "HISTÓRICO" },
  { id: "ao vivo",   icon: "●", label: "AO VIVO" },
  { id: "ranking",   icon: "▲", label: "RANKING" },
  { id: "erros",     icon: "◆", label: "ERROS" },
];

export default function Nav({ tab, setTab, onNewDelivery }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(6,6,6,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "stretch",
        height: 56,
      }}>

        {/* ── Brand ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "0 28px", borderRight: `1px solid ${T.border}`,
          flexShrink: 0, minWidth: 180,
        }}>
          <div style={{
            width: 7, height: 7, flexShrink: 0,
            background: T.amber,
            animation: "pulseDot 2.5s infinite",
          }} />
          <span style={{
            fontFamily: T.font, fontSize: 22, fontWeight: 900,
            letterSpacing: 4, color: T.white, lineHeight: 1,
          }}>RM</span>
          <span style={{
            fontFamily: T.mono, fontSize: 8, color: T.muted,
            letterSpacing: 3, borderLeft: `1px solid ${T.border}`, paddingLeft: 12,
          }}>
            DASHBOARD
          </span>
        </div>

        {/* ── Tab nav ── */}
        <nav style={{ display: "flex", flex: 1, alignItems: "stretch", overflowX: "auto" }}>
          {TABS.map(({ id, icon, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  background: active ? T.amberGlow : "transparent",
                  border: "none",
                  borderBottom: `2px solid ${active ? T.amber : "transparent"}`,
                  borderTop: "2px solid transparent",
                  color: active ? T.amber : T.muted,
                  fontFamily: T.mono, fontSize: 10, letterSpacing: 2,
                  padding: "0 18px", cursor: "pointer",
                  transition: `color ${T.fast}, background ${T.fast}, border-color ${T.fast}`,
                  display: "flex", alignItems: "center", gap: 7,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = T.mutedHov;
                    e.currentTarget.style.background = T.surface;
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = T.muted;
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: 7, opacity: active ? 1 : 0.5 }}>{icon}</span>
                {label}
              </button>
            );
          })}
        </nav>

        {/* ── Right cluster ── */}
        <div style={{ display: "flex", alignItems: "stretch", flexShrink: 0, borderLeft: `1px solid ${T.border}` }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "0 20px", borderRight: `1px solid ${T.border}`,
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: T.green, animation: "pulse 2s infinite",
            }} />
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 2 }}>
              {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).toUpperCase().replace(".", "")}
            </span>
          </div>
          <button
            onClick={onNewDelivery}
            style={{
              background: T.amber, border: "none",
              color: "#060606",
              fontFamily: T.font, fontSize: 13, fontWeight: 700, letterSpacing: 2,
              padding: "0 26px", cursor: "pointer",
              transition: `background ${T.fast}`,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F0C862")}
            onMouseLeave={e => (e.currentTarget.style.background = T.amber)}
          >
            + ENTREGA
          </button>
        </div>
      </header>
    </>
  );
}
