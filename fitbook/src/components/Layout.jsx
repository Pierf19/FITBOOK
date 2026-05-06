import { useAuth } from "../App";

export default function Layout({ children, currentPage, onNavigate, onLogout }) {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", color: "var(--white)" }}>
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 40px", borderBottom: "1px solid #1e1e1e",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(8,8,8,0.96)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: "var(--lime)", letterSpacing: 2 }}>
          FitBook
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["home","booking","jadwal"].map((p) => (
            <button key={p} onClick={() => onNavigate(p)} style={{
              background: currentPage === p ? "rgba(198,241,53,.1)" : "transparent",
              border: currentPage === p ? "1px solid rgba(198,241,53,.3)" : "1px solid transparent",
              color: currentPage === p ? "var(--lime)" : "#777",
              padding: "8px 18px", borderRadius: 4, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
              transition: "all .2s",
            }}>
              {p === "home" ? "Home" : p === "booking" ? "Booking" : "Jadwal Saya"}
            </button>
          ))}

          <div style={{
            marginLeft: 16, padding: "8px 16px",
            background: "#141414", border: "1px solid #252525", borderRadius: 4,
            fontSize: 13, color: "#aaa", display: "flex", alignItems: "center", gap: 8
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", background: "var(--lime)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Bebas Neue'", fontSize: 13, color: "#0a0a0a"
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {user?.name?.split(" ")[0]}
          </div>

          <button onClick={onLogout} style={{
            background: "transparent", border: "1px solid #2a2a2a",
            color: "#555", padding: "8px 14px", borderRadius: 4,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            transition: "all .2s",
          }}
            onMouseEnter={e => { e.target.style.borderColor = "#ff4444"; e.target.style.color = "#ff4444"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#555"; }}
          >
            Keluar
          </button>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
