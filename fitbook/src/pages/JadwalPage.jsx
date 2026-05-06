import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../App";

const GOAL_LABELS = {
  weight: "Turun BB",
  muscle: "Bangun Otot",
  cardio: "Stamina",
  mobility: "Fleksibilitas",
};

const STATUS_MAP = {
  confirmed: { label: "Terkonfirmasi", bg: "rgba(198,241,53,.12)", color: "var(--lime)" },
  pending: { label: "Menunggu", bg: "rgba(255,165,0,.1)", color: "orange" },
  done: { label: "Selesai", bg: "#181818", color: "#444" },
  cancelled: { label: "Dibatalkan", bg: "rgba(255,68,68,.1)", color: "#ff6b6b" },
};

export default function JadwalPage() {
  const { user } = useAuth();
  const bookings = useQuery(
    api.bookings.getByUser,
    user?.userId ? { userId: user.userId } : "skip"
  );
  const cancel = useMutation(api.bookings.cancel);

  const active = bookings?.filter(b => b.status === "confirmed" || b.status === "pending") || [];
  const history = bookings?.filter(b => b.status === "done" || b.status === "cancelled") || [];

  if (!bookings) return (
    <div style={{ textAlign: "center", padding: 80, color: "#444" }}>Memuat jadwal...</div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 40px" }}>
      <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 42, marginBottom: 6, letterSpacing: 1 }}>
        JADWAL SAYA
      </h1>
      <p style={{ color: "#555", fontSize: 14, marginBottom: 40 }}>
        {bookings.length} total sesi · {active.length} aktif
      </p>

      {bookings.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 40px",
          background: "#0f0f0f", border: "1px dashed #222", borderRadius: 10,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, marginBottom: 8 }}>
            BELUM ADA BOOKING
          </div>
          <p style={{ color: "#555", fontSize: 14 }}>
            Yuk booking sesi pertama kamu dengan trainer pilihan!
          </p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
                SESI MENDATANG
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {active.map(b => (
                  <BookingCard key={b._id} booking={b} onCancel={() => cancel({ bookingId: b._id })} />
                ))}
              </div>
            </section>
          )}

          {history.length > 0 && (
            <section>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
                RIWAYAT
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {history.map(b => (
                  <BookingCard key={b._id} booking={b} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function BookingCard({ booking: b, onCancel }) {
  const s = STATUS_MAP[b.status] || STATUS_MAP.pending;
  const date = new Date(b.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{
      background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 10,
      padding: "20px 24px", display: "flex", justifyContent: "space-between",
      alignItems: "center", gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{b.trainerName}</div>
        <div style={{ color: "#666", fontSize: 13, marginBottom: 6 }}>
          {b.trainerSpec} · {b.day}, {b.time}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {b.goal && <span style={{ fontSize: 11, color: "#555" }}>{GOAL_LABELS[b.goal] || b.goal}</span>}
          {b.goal && <span style={{ fontSize: 11, color: "#333" }}>·</span>}
          <span style={{ fontSize: 11, color: "#555" }}>{b.sessionType}</span>
          <span style={{ fontSize: 11, color: "#333" }}>·</span>
          <span style={{ fontSize: 11, color: "#555" }}>{b.fitnessLevel}</span>
          <span style={{ fontSize: 11, color: "#333" }}>·</span>
          <span style={{ fontSize: 11, color: "#555" }}>Rp {b.totalPrice.toLocaleString("id")}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <span style={{
          background: s.bg, color: s.color,
          fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
        }}>
          {s.label}
        </span>
        <span style={{ fontSize: 11, color: "#333" }}>Dibuat {date}</span>
        {onCancel && (
          <button onClick={onCancel} style={{
            background: "transparent", border: "1px solid #2a2a2a", color: "#555",
            fontSize: 11, padding: "4px 10px", borderRadius: 4, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}
            onMouseEnter={e => { e.target.style.borderColor = "#ff4444"; e.target.style.color = "#ff4444"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#555"; }}
          >
            Batalkan
          </button>
        )}
      </div>
    </div>
  );
}
