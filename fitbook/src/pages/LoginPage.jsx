import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../App";

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const loginMutation = useMutation(api.auth.login);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError("Isi semua field"); return; }
    setLoading(true); setError("");
    try {
      const user = await loginMutation({ email: form.email, password: form.password });
      login(user);
    } catch (e) {
      setError(e.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--black)",
      display: "flex", alignItems: "stretch",
    }}>
      {/* LEFT PANEL */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 80px",
        maxWidth: 520,
      }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: "var(--lime)", letterSpacing: 3, marginBottom: 48 }}>
          FitBook
        </div>

        <div style={{ marginBottom: 8, fontFamily: "'Bebas Neue'", fontSize: 48, lineHeight: 1 }}>
          SELAMAT<br/>DATANG
        </div>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 40, lineHeight: 1.6 }}>
          Masuk untuk mulai booking sesi latihan dengan trainer terbaik kamu.
        </p>

        {error && (
          <div style={{
            background: "rgba(255,68,68,.1)", border: "1px solid rgba(255,68,68,.3)",
            color: "#ff6b6b", padding: "12px 16px", borderRadius: 6,
            fontSize: 13, marginBottom: 20
          }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            type="email"
            placeholder="email@kamu.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              style={{ ...inputStyle, paddingRight: 44 }}
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
            <button
              onClick={() => setShow(!show)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 14,
              }}
            >{show ? "🙈" : "👁"}</button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", background: "var(--lime)", color: "#0a0a0a",
            border: "none", padding: "14px", borderRadius: 6,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? .7 : 1,
            transition: "transform .15s, box-shadow .15s",
          }}
          onMouseEnter={e => { if (!loading) { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 24px rgba(198,241,53,.3)"; }}}
          onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = ""; }}
        >
          {loading ? "Masuk..." : "Masuk →"}
        </button>

        <p style={{ marginTop: 24, textAlign: "center", color: "#555", fontSize: 13 }}>
          Belum punya akun?{" "}
          <span
            onClick={() => onNavigate("register")}
            style={{ color: "var(--lime)", cursor: "pointer", fontWeight: 600 }}
          >
            Daftar Sekarang
          </span>
        </p>

        {/* Demo hint */}
        <div style={{
          marginTop: 32, padding: "12px 16px",
          background: "#0f0f0f", border: "1px dashed #222", borderRadius: 6,
          fontSize: 12, color: "#444", lineHeight: 1.6
        }}>
          <span style={{ color: "#555" }}>Demo: </span>
          daftar akun baru atau gunakan email yang sudah didaftarkan
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        flex: 1, background: "#0d0d0d", borderLeft: "1px solid #1a1a1a",
        display: "flex", flexDirection: "column", justifyContent: "center",
        alignItems: "center", padding: 60,
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative bg */}
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(198,241,53,.06) 0%, transparent 70%)",
        }}/>
        <div style={{
          position: "absolute", bottom: -60, left: -60,
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(198,241,53,.04) 0%, transparent 70%)",
        }}/>

        <div style={{ position: "relative", textAlign: "center", maxWidth: 360 }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🏋️</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, marginBottom: 12, letterSpacing: 1 }}>
            LATIHAN LEBIH <span style={{ color: "var(--lime)" }}>CERDAS</span>
          </div>
          <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, marginBottom: 40 }}>
            Booking trainer profesional, jadwal fleksibel, dan pantau progress kebugaran kamu — semua dalam satu platform.
          </p>

          {[
            { icon: "⚡", text: "Booking real-time, konfirmasi instan" },
            { icon: "🎯", text: "Trainer sesuai tujuan & level kamu" },
            { icon: "📅", text: "Jadwal fleksibel, mudah diubah" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#111", border: "1px solid #1e1e1e", borderRadius: 8,
              padding: "14px 16px", marginBottom: 10, textAlign: "left",
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "#888" }}>{item.text}</span>
            </div>
          ))}
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
  width: "100%", background: "#0f0f0f",
  border: "1px solid #252525", borderRadius: 6,
  padding: "12px 14px", color: "#f5f5f0",
  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
  outline: "none", boxSizing: "border-box",
  transition: "border-color .2s",
};
