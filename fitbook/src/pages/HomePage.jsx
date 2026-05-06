import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../App";

export default function HomePage({ onNavigate }) {
  const { user } = useAuth();
  const trainers = useQuery(api.trainers.getAll);
  const seed = useMutation(api.trainers.seed);

  if (trainers && trainers.length === 0) seed();

  const firstName = user?.name?.split(" ")[0];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 40px" }}>

      <div style={{ marginBottom: 56 }}>
        <div style={{
          display: "inline-block", background: "var(--lime)", color: "#0a0a0a",
          fontSize: 11, fontWeight: 700, letterSpacing: 2, padding: "4px 12px",
          borderRadius: 2, marginBottom: 20, textTransform: "uppercase",
        }}>
          🏋️ Fitness Booking Platform
        </div>
        <h1 style={{
          fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(48px,9vw,86px)",
          lineHeight: .95, letterSpacing: 2, marginBottom: 20,
        }}>
          HALO, <span style={{ color: "var(--lime)" }}>{firstName}!</span><br/>
          SIAP LATIHAN?
        </h1>
        <p style={{ color: "#777", fontSize: 16, lineHeight: 1.7, maxWidth: 500, marginBottom: 32 }}>
          Pilih trainer, booking jadwal, dan raih target kebugaran kamu bersama profesional terbaik.
        </p>
        <button onClick={() => onNavigate("booking")} style={btnStyle}>
          Booking Sekarang →
        </button>
        {" "}
        <button onClick={() => onNavigate("jadwal")} style={{ ...btnStyle, background: "transparent", color: "var(--lime)", border: "1.5px solid var(--lime)" }}>
          Jadwal Saya
        </button>
      </div>

      <div style={{
        display: "flex", gap: 0,
        borderTop: "1px solid #1e1e1e", borderBottom: "1px solid #1e1e1e",
        marginBottom: 56,
      }}>
        {[
          { n: trainers?.length ?? "…", label: "Trainer Aktif" },
          { n: "480+", label: "Sesi Selesai" },
          { n: "4.9★", label: "Rating Rata-rata" },
          { n: "98%", label: "Kepuasan Klien" },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: "28px 32px",
            borderRight: i < 3 ? "1px solid #1e1e1e" : "none",
          }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 38, color: "var(--lime)" }}>{s.n}</div>
            <div style={{ color: "#555", fontSize: 13, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 32, marginBottom: 6, letterSpacing: 1 }}>
          Trainer Tersedia
        </h2>
        <p style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>
          Klik trainer untuk langsung booking sesi
        </p>

        {!trainers ? (
          <div style={{ color: "#444", textAlign: "center", padding: 60 }}>Memuat trainer...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 18 }}>
            {trainers.map(t => (
              <TrainerCard key={t._id} trainer={t} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TrainerCard({ trainer: t, onNavigate }) {
  return (
    <div
      onClick={() => onNavigate("booking", { trainer: t })}
      style={{
        background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 10,
        padding: 22, cursor: "pointer", transition: "all .2s",
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#333";
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.querySelector(".top-bar").style.transform = "scaleX(1)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#1e1e1e";
        e.currentTarget.style.transform = "";
        e.currentTarget.querySelector(".top-bar").style.transform = "scaleX(0)";
      }}
    >
      <div className="top-bar" style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "var(--lime)", transform: "scaleX(0)", transformOrigin: "left",
        transition: "transform .25s",
      }} />

      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: "linear-gradient(135deg,var(--lime) 0%,#7cb800 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Bebas Neue'", fontSize: 20, color: "#0a0a0a", marginBottom: 12,
      }}>
        {t.initials}
      </div>

      {t.isRecommended && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          background: "rgba(198,241,53,.1)", border: "1px solid rgba(198,241,53,.3)",
          color: "var(--lime)", fontSize: 10, padding: "3px 8px", borderRadius: 20, marginBottom: 6,
        }}>
          ⭐ Rekomendasi
        </div>
      )}

      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{t.name}</div>
      <div style={{ color: "#777", fontSize: 12, marginBottom: 10 }}>{t.specialization}</div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {t.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 20,
            background: "#1a1a1a", color: "#888", border: "1px solid #252525",
          }}>{tag}</span>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#555" }}>
        <span>{t.experience} thn pengalaman</span>
        <span style={{ color: "var(--lime)", fontWeight: 600 }}>{t.rating} ★</span>
      </div>

      <div style={{
        marginTop: 14, paddingTop: 12, borderTop: "1px solid #1a1a1a",
        fontSize: 13, color: "#888",
      }}>
        Rp {t.pricePerSession.toLocaleString("id")}<span style={{ fontSize: 11, color: "#444" }}>/sesi</span>
      </div>
    </div>
  );
}

const btnStyle = {
  display: "inline-flex", alignItems: "center", gap: 8,
  background: "var(--lime)", color: "#0a0a0a",
  fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
  padding: "13px 28px", border: "none", cursor: "pointer", borderRadius: 6,
  transition: "transform .15s",
};
