import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../App";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const TIMES = ["07:00", "08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const GOAL_LABELS = { weight: "Turun Berat Badan", muscle: "Bangun Otot", cardio: "Tingkatkan Stamina", mobility: "Fleksibilitas & Mobilitas" };
const SESSION_TYPES = ["Personal Training", "Group Training", "Online Coaching"];
const FITNESS_LEVELS = ["Pemula", "Menengah", "Lanjutan"];

export default function BookingPage({ preselectedTrainer, onNavigate }) {
  const { user } = useAuth();
  const trainers = useQuery(api.trainers.getAll);
  const createBooking = useMutation(api.bookings.create);

  const [step, setStep] = useState(preselectedTrainer ? 2 : 1);
  const [trainer, setTrainer] = useState(preselectedTrainer || null);
  const [goal, setGoal] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [sessionType, setSessionType] = useState("Personal Training");
  const [fitnessLevel, setFitnessLevel] = useState("Pemula");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const bookedSlots = useQuery(
    api.bookings.getBookedSlots,
    trainer && goal ? { trainerId: trainer._id, goal } : "skip"
  );

  const isBooked = (d, t) => bookedSlots?.includes(`${d}-${t}`);

  const handleBook = async () => {
    if (!day || !time || !goal) { setError("Pilih hari, jam, dan tujuan latihan"); return; }
    if (!user?.userId) { setError("Sesi tidak valid, silakan login ulang"); return; }
    setLoading(true); setError("");
    try {
      await createBooking({
        userId: user.userId,
        trainerId: trainer._id,
        trainerName: trainer.name,
        trainerSpec: trainer.specialization,
        goal,
        day,
        time,
        sessionType,
        fitnessLevel,
        notes: notes || undefined,
        totalPrice: trainer.pricePerSession,
      });
      setDone(true);
    } catch (e) {
      setError(e.message || "Booking gagal");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ textAlign: "center", padding: "80px 40px" }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%", background: "var(--lime)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, margin: "0 auto 24px",
      }}>✓</div>
      <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 52, marginBottom: 12 }}>BOOKING BERHASIL!</h2>
      <p style={{ color: "#777", fontSize: 15, maxWidth: 400, margin: "0 auto 32px", lineHeight: 1.7 }}>
        Sesi dengan <strong style={{ color: "#fff" }}>{trainer.name}</strong> pada{" "}
        <strong style={{ color: "var(--lime)" }}>{day}</strong> pukul{" "}
        <strong style={{ color: "var(--lime)" }}>{time}</strong> telah dikonfirmasi. Selamat berlatih! 💪
      </p>
      <button onClick={() => onNavigate("jadwal")} style={btnPrimary}>Lihat Jadwal Saya →</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 40px" }}>
      {/* Breadcrumb steps */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 40 }}>
        {["Pilih Trainer", "Pilih Jadwal", "Detail", "Konfirmasi"].map((label, i) => {
          const num = i + 1;
          const active = step === num;
          const done = step > num;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
                background: done ? "var(--lime)" : active ? "var(--lime)" : "#1a1a1a",
                color: (done || active) ? "#0a0a0a" : "#444",
              }}>{done ? "✓" : num}</div>
              <span style={{ fontSize: 12, color: active ? "#fff" : "#444" }}>{label}</span>
              {i < 3 && <div style={{ width: 24, height: 1, background: "#222" }} />}
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{
          background: "rgba(255,68,68,.1)", border: "1px solid rgba(255,68,68,.3)",
          color: "#ff6b6b", padding: "12px 16px", borderRadius: 6, fontSize: 13, marginBottom: 20,
        }}>⚠ {error}</div>
      )}

      {/* STEP 1: Choose Trainer */}
      {step === 1 && (
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 36, marginBottom: 6 }}>PILIH TRAINER</h2>
          <p style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Klik trainer untuk melanjutkan booking</p>
          {!trainers ? (
            <div style={{ color: "#444", textAlign: "center", padding: 60 }}>Memuat trainer...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 16 }}>
              {trainers.map(t => (
                <div key={t._id} onClick={() => { setTrainer(t); setStep(2); }} style={{
                  background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 10,
                  padding: 20, cursor: "pointer", transition: "all .2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--lime)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.transform = ""; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "linear-gradient(135deg,var(--lime) 0%,#7cb800 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Bebas Neue'", fontSize: 18, color: "#0a0a0a", marginBottom: 10,
                  }}>{t.initials}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.name}</div>
                  <div style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>{t.specialization}</div>
                  <div style={{ color: "var(--lime)", fontSize: 13, fontWeight: 600 }}>
                    Rp {t.pricePerSession.toLocaleString("id")}<span style={{ color: "#444", fontSize: 11 }}>/sesi</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Choose Slot */}
      {step === 2 && trainer && (
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 36, marginBottom: 6 }}>PILIH JADWAL</h2>
          <TrainerBadge trainer={trainer} />

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Tujuan Latihan</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(trainer.goals || ["weight", "muscle", "cardio", "mobility"]).map(g => (
                <button key={g} onClick={() => setGoal(g)} style={{
                  padding: "8px 18px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                  border: goal === g ? "1.5px solid var(--lime)" : "1px solid #252525",
                  background: goal === g ? "rgba(198,241,53,.1)" : "#0f0f0f",
                  color: goal === g ? "var(--lime)" : "#666",
                  fontFamily: "'DM Sans', sans-serif",
                }}>{GOAL_LABELS[g] || g}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Hari</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DAYS.map(d => (
                <button key={d} onClick={() => setDay(d)} style={{
                  padding: "8px 16px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                  border: day === d ? "1.5px solid var(--lime)" : "1px solid #252525",
                  background: day === d ? "rgba(198,241,53,.1)" : "#0f0f0f",
                  color: day === d ? "var(--lime)" : "#666",
                  fontFamily: "'DM Sans', sans-serif",
                }}>{d}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={labelStyle}>Jam</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TIMES.map(t => {
                const taken = isBooked(day, t);
                return (
                  <button key={t} onClick={() => !taken && setTime(t)} disabled={taken} style={{
                    padding: "8px 16px", borderRadius: 6, fontSize: 13,
                    cursor: taken ? "not-allowed" : "pointer",
                    border: time === t ? "1.5px solid var(--lime)" : taken ? "1px solid #1a1a1a" : "1px solid #252525",
                    background: time === t ? "rgba(198,241,53,.1)" : taken ? "#0a0a0a" : "#0f0f0f",
                    color: time === t ? "var(--lime)" : taken ? "#2a2a2a" : "#666",
                    fontFamily: "'DM Sans', sans-serif",
                    textDecoration: taken ? "line-through" : "none",
                  }}>{t}</button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep(1)} style={btnSecondary}>← Kembali</button>
            <button onClick={() => {
              if (!goal) { setError("Pilih tujuan latihan"); return; }
              if (!day) { setError("Pilih hari"); return; }
              if (!time) { setError("Pilih jam"); return; }
              setError(""); setStep(3);
            }} style={btnPrimary}>Lanjutkan →</button>
          </div>
        </div>
      )}

      {/* STEP 3: Details */}
      {step === 3 && (
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 36, marginBottom: 6 }}>DETAIL SESI</h2>
          <TrainerBadge trainer={trainer} />

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Tipe Sesi</label>
            <div style={{ display: "flex", gap: 10 }}>
              {SESSION_TYPES.map(s => (
                <button key={s} onClick={() => setSessionType(s)} style={{
                  padding: "8px 18px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                  border: sessionType === s ? "1.5px solid var(--lime)" : "1px solid #252525",
                  background: sessionType === s ? "rgba(198,241,53,.1)" : "#0f0f0f",
                  color: sessionType === s ? "var(--lime)" : "#666",
                  fontFamily: "'DM Sans', sans-serif",
                }}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Level Kebugaran</label>
            <div style={{ display: "flex", gap: 10 }}>
              {FITNESS_LEVELS.map(l => (
                <button key={l} onClick={() => setFitnessLevel(l)} style={{
                  padding: "8px 18px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                  border: fitnessLevel === l ? "1.5px solid var(--lime)" : "1px solid #252525",
                  background: fitnessLevel === l ? "rgba(198,241,53,.1)" : "#0f0f0f",
                  color: fitnessLevel === l ? "var(--lime)" : "#666",
                  fontFamily: "'DM Sans', sans-serif",
                }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={labelStyle}>Catatan (opsional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ceritakan kondisi fisik, injury, atau target spesifik kamu..."
              style={{
                width: "100%", background: "#0f0f0f", border: "1px solid #252525",
                borderRadius: 6, padding: "12px 14px", color: "#f5f5f0",
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none",
                boxSizing: "border-box", resize: "vertical", minHeight: 88,
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep(2)} style={btnSecondary}>← Kembali</button>
            <button onClick={() => { setError(""); setStep(4); }} style={btnPrimary}>Review →</button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirm */}
      {step === 4 && (
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 36, marginBottom: 6 }}>KONFIRMASI BOOKING</h2>
          <p style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Periksa detail sesi kamu sebelum konfirmasi</p>

          <div style={{
            background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 10,
            padding: 24, marginBottom: 28,
          }}>
            <TrainerBadge trainer={trainer} />
            {[
              ["Tujuan", GOAL_LABELS[goal] || goal],
              ["Hari & Jam", `${day}, ${time}`],
              ["Tipe Sesi", sessionType],
              ["Level", fitnessLevel],
              ["Total", `Rp ${trainer.pricePerSession.toLocaleString("id")}`],
              ...(notes ? [["Catatan", notes]] : []),
            ].map(([k, v], i, arr) => (
              <div key={k} style={{
                display: "flex", justifyContent: "space-between",
                padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid #1a1a1a" : "none",
                fontSize: 14,
              }}>
                <span style={{ color: "#555" }}>{k}</span>
                <span style={{ color: k === "Total" ? "var(--lime)" : "#fff", fontWeight: k === "Total" ? 700 : 400 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep(3)} style={btnSecondary}>← Kembali</button>
            <button onClick={handleBook} disabled={loading} style={{
              ...btnPrimary, opacity: loading ? .7 : 1, cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Memproses..." : "✓ Konfirmasi Booking"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TrainerBadge({ trainer: t }) {
  return (
    <div style={{
      background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 10,
      padding: "14px 18px", marginBottom: 24, display: "flex", gap: 14, alignItems: "center",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg,var(--lime) 0%,#7cb800 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Bebas Neue'", fontSize: 18, color: "#0a0a0a",
      }}>{t.initials}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
        <div style={{ color: "#666", fontSize: 12 }}>{t.specialization} · Rp {t.pricePerSession.toLocaleString("id")}/sesi</div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 11, color: "#666",
  letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10,
  fontFamily: "'DM Sans', sans-serif",
};
const btnPrimary = {
  background: "var(--lime)", color: "#0a0a0a", border: "none",
  padding: "13px 28px", borderRadius: 6, fontFamily: "'DM Sans', sans-serif",
  fontWeight: 700, fontSize: 14, cursor: "pointer",
};
const btnSecondary = {
  background: "transparent", color: "#666", border: "1px solid #252525",
  padding: "13px 28px", borderRadius: 6, fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600, fontSize: 14, cursor: "pointer",
};
