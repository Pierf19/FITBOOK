import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../App";

export default function RegisterPage({ onNavigate }) {
  const { login } = useAuth();
  const registerMutation = useMutation(api.auth.register);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { setError("Isi semua field"); return; }
    if (form.password !== form.confirm) { setError("Password tidak cocok"); return; }
    if (form.password.length < 6) { setError("Password minimal 6 karakter"); return; }
    setLoading(true); setError("");
    try {
      const user = await registerMutation({ name: form.name, email: form.email, password: form.password });
      login(user);
    } catch (e) {
      setError(e.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Lemah", "Sedang", "Kuat"];
  const strengthColor = ["", "#ff4444", "orange", "var(--lime)"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 960, display: "flex", alignItems: "stretch", minHeight: "100vh" }}>

        {/* LEFT - FORM */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 80px" }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: "var(--lime)", letterSpacing: 3, marginBottom: 48 }}>
            FitBook
          </div>

          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 44, lineHeight: 1, marginBottom: 8 }}>
            BUAT AKUN
          </div>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 36, lineHeight: 1.6 }}>
            Bergabung dan mulai perjalanan kebugaran kamu bersama trainer profesional.
          </p>

          {error && (
            <div style={{
              background: "rgba(255,68,68,.1)", border: "1px solid rgba(255,68,68,.3)",
              color: "#ff6b6b", padding: "12px 16px", borderRadius: 6, fontSize: 13, marginBottom: 20
            }}>⚠ {error}</div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nama Lengkap</label>
            <input style={inputStyle} placeholder="Nama kamu..." value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" placeholder="email@kamu.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" placeholder="Min. 6 karakter" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            {form.password.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", gap: 4, alignItems: "center" }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: i <= strength ? strengthColor[strength] : "#222",
                    transition: "background .3s"
                  }} />
                ))}
                <span style={{ fontSize: 11, color: strengthColor[strength], marginLeft: 8 }}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Konfirmasi Password</label>
            <input style={{
              ...inputStyle,
              borderColor: form.confirm && form.confirm !== form.password ? "rgba(255,68,68,.5)" : "#252525"
            }} type="password" placeholder="Ulangi password" value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", background: "var(--lime)", color: "#0a0a0a",
            border: "none", padding: 14, borderRadius: 6,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1,
          }}>
            {loading ? "Mendaftar..." : "Daftar Sekarang →"}
          </button>

          <p style={{ marginTop: 24, textAlign: "center", color: "#555", fontSize: 13 }}>
            Sudah punya akun?{" "}
            <span onClick={() => onNavigate("login")} style={{ color: "var(--lime)", cursor: "pointer", fontWeight: 600 }}>
              Masuk
            </span>
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          flex: 1, background: "#0d0d0d", borderLeft: "1px solid #1a1a1a",
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", padding: 60, position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(198,241,53,.06) 0%, transparent 70%)",
          }} />

          <div style={{ textAlign: "center", maxWidth: 340, position: "relative" }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>💪</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, marginBottom: 12, letterSpacing: 1 }}>
              KENAPA <span style={{ color: "var(--lime)" }}>FITBOOK?</span>
            </div>

            {[
              { num: "12+", label: "Trainer Bersertifikat" },
              { num: "480+", label: "Sesi Berhasil" },
              { num: "4.9★", label: "Rating Rata-rata" },
            ].map((s, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                padding: "14px 0", borderBottom: i < 2 ? "1px solid #1a1a1a" : "none",
              }}>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: "var(--lime)" }}>{s.num}</span>
                <span style={{ color: "#666", fontSize: 14, lineHeight: 1.4, textAlign: "right", maxWidth: 180 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 11, color: "#666",
  letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8,
  fontFamily: "'DM Sans', sans-serif",
};
const inputStyle = {
  width: "100%", background: "#0f0f0f", border: "1px solid #252525",
  borderRadius: 6, padding: "12px 14px", color: "#f5f5f0",
  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
  outline: "none", boxSizing: "border-box",
};
