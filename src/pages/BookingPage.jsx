// src/pages/BookingPage.jsx
import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import ScheduleCalendar from "../components/ScheduleCalendar.jsx";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
import { Check } from "lucide-react";

// Hari yang ditampilkan di kalender (urutan kolom)
const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const EN_INDEX = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Hitung 7 tanggal terdekat (satu per hari dalam seminggu)
function getWeekDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIndex = today.getDay();
  return DAYS_EN.map((dayEn) => {
    const targetIndex = EN_INDEX.indexOf(dayEn);
    let diff = targetIndex - todayIndex;
    if (diff < 0) diff += 7;
    const d = new Date(today);
    d.setDate(today.getDate() + diff);
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  });
}

export default function BookingPage() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const { me: currentUser, email: sessionEmail, loading: userLoading } = useCurrentUser();
  const trainer = useQuery(api.trainers.getTrainer, { trainerId });
  const createBooking = useMutation(api.bookings.createBooking);

  // Hitung tanggal 7 hari ke depan sekali (stabil selama komponen hidup)
  const weekDates = useMemo(() => getWeekDates(), []);

  // Ambil semua slot yang sudah terpesan untuk trainer ini, realtime via Convex
  const bookedSlots = useQuery(
    api.bookings.getBookedSlotsForDates,
    trainerId ? { trainerId, dates: weekDates } : "skip"
  );

  // Stepper state: 2=Jadwal, 3=Data Diri, 4=Konfirmasi, 5=Success
  const [step, setStep] = useState(2);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [formData, setFormData] = useState({ whatsapp: "", level: "Pemula" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (trainer === undefined) {
    return (
      <div className="flex justify-center py-20 min-h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#cdff00] border-t-transparent" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="text-center py-20 text-gray-400 min-h-screen bg-[#0a0a0a]">Trainer not found.</div>
    );
  }

  const handleConfirm = async () => {
    if (!sessionEmail) {
      setError("Sesi login tidak ditemukan. Silakan login ulang.");
      return;
    }

    if (selectedSlots.length === 0) {
      setError("Pilih jadwal terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await Promise.all(
        selectedSlots.map((slot) =>
          createBooking({
            trainerId: trainer._id,
            sessionDate: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            whatsapp: formData.whatsapp,
            level: formData.level,
            sessionCount: 1,
            userEmail: sessionEmail,
          })
        )
      );
      setStep(5);
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setError(err.message ?? "Failed to book.");
    } finally {
      setLoading(false);
    }
  };

  const getDayLabel = (day) => {
    return {
      Monday: "Sen", Tuesday: "Sel", Wednesday: "Rab",
      Thursday: "Kam", Friday: "Jum", Saturday: "Sab", Sunday: "Min"
    }[day];
  };

  const handleSlotToggle = (slot) => {
    setSelectedSlots(prev => {
      const exists = prev.find(s => s.date === slot.date && s.startTime === slot.startTime);
      if (exists) {
        return prev.filter(s => !(s.date === slot.date && s.startTime === slot.startTime));
      }
      return [...prev, slot];
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-10 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        
        {step < 5 && (
          <div className="flex items-center justify-center mb-12 text-sm font-medium">
            {/* Step 1 */}
            <div className="flex items-center text-[#cdff00]">
              <div className="w-6 h-6 rounded-full bg-[#cdff00] text-black flex items-center justify-center mr-2">
                <Check size={14} strokeWidth={3} />
              </div>
              <span className="text-[#555]">Pilih Trainer</span>
            </div>
            
            <div className="w-16 h-px bg-[#cdff00] mx-4 opacity-50"></div>

            {/* Step 2 */}
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[2px] mr-2 transition-colors ${
                step >= 2 ? "border-[#cdff00] text-[#cdff00]" : "border-[#333] text-[#555]"
              } ${step > 2 ? "bg-[#cdff00] text-black" : ""}`}>
                {step > 2 ? <Check size={14} strokeWidth={3} /> : "2"}
              </div>
              <span className={step >= 2 ? "text-white" : "text-[#555]"}>Pilih Jadwal</span>
            </div>
            
            <div className={`w-16 h-px mx-4 transition-colors ${step > 2 ? "bg-[#cdff00] opacity-50" : "bg-[#333]"}`}></div>

            {/* Step 3 */}
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[2px] mr-2 transition-colors ${
                step >= 3 ? "border-[#cdff00] text-[#cdff00]" : "border-[#333] text-[#555]"
              } ${step > 3 ? "bg-[#cdff00] text-black" : ""}`}>
                 {step > 3 ? <Check size={14} strokeWidth={3} /> : "3"}
              </div>
              <span className={step >= 3 ? "text-white" : "text-[#555]"}>Data Diri</span>
            </div>

            <div className={`w-16 h-px mx-4 transition-colors ${step > 3 ? "bg-[#cdff00] opacity-50" : "bg-[#333]"}`}></div>

            {/* Step 4 */}
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[2px] mr-2 transition-colors ${
                step >= 4 ? "border-[#cdff00] text-[#cdff00]" : "border-[#333] text-[#555]"
              }`}>
                 4
              </div>
              <span className={step >= 4 ? "text-white" : "text-[#555]"}>Konfirmasi</span>
            </div>
          </div>
        )}

        {/* --- STEP 2: Pilih Jadwal --- */}
        {step === 2 && (
          <div className="w-full max-w-2xl mx-auto">
            <h1 className="text-3xl font-extrabold uppercase tracking-tight mb-2">Pilih Jadwal</h1>
            <p className="text-sm text-gray-400 mb-8">
              Trainer: <span className="text-white font-medium">{trainer.userName}</span>
            </p>

            <ScheduleCalendar
              trainer={trainer}
              onSlotSelect={handleSlotToggle}
              selectedSlots={selectedSlots}
              bookedSlots={bookedSlots ?? {}}
            />

            <div className="mt-10 flex gap-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-md border border-[#333] text-gray-300 hover:text-white hover:border-[#555] transition-colors text-sm font-semibold"
              >
                ← Kembali
              </button>
              <button
                disabled={selectedSlots.length === 0}
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-md bg-[#cdff00] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lanjut Isi Data →
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: Data Diri (Implicit in screenshots, we add it to make form work) --- */}
        {step === 3 && (
          <div className="w-full max-w-xl mx-auto">
            <h1 className="text-3xl font-extrabold uppercase tracking-tight mb-8">Data Diri</h1>
            
            <div className="space-y-6 bg-[#111] p-8 rounded-xl border border-[#222]">
              <div>
                <label className="block text-sm text-gray-400 mb-2">WhatsApp</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  placeholder="08xxxxxxxxxx"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#cdff00]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#cdff00] appearance-none"
                >
                  <option value="Pemula">Pemula</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Lanjut">Lanjut</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-md border border-[#333] text-gray-300 hover:text-white hover:border-[#555] transition-colors text-sm font-semibold"
              >
                ← Kembali
              </button>
              <button
                disabled={!formData.whatsapp}
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-md bg-[#cdff00] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lanjut Konfirmasi →
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 4: Konfirmasi Booking --- */}
        {step === 4 && (
          <div className="w-full max-w-2xl mx-auto">
            <h1 className="text-3xl font-extrabold uppercase tracking-tight mb-8">Konfirmasi Booking</h1>
            
            <div className="bg-[#111] rounded-xl border border-[#222] p-8 relative">
              <div className="text-[#cdff00] text-sm font-bold tracking-wider mb-6 uppercase">Ringkasan Booking</div>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-[#222] pb-4">
                  <span className="text-gray-500">Trainer</span>
                  <span className="text-white">{trainer.userName}</span>
                </div>
                <div className="flex justify-between border-b border-[#222] pb-4">
                  <span className="text-gray-500">Spesialisasi</span>
                  <span className="text-white">{trainer.specialization[0] || "General"}</span>
                </div>
                <div className="flex justify-between border-b border-[#222] pb-4">
                  <span className="text-gray-500">Jadwal</span>
                  <div className="text-white text-right space-y-1">
                    {selectedSlots.map(s => (
                      <div key={s.date + s.startTime}>{getDayLabel(s.day)} • {s.date} • {s.startTime}</div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between border-b border-[#222] pb-4">
                  <span className="text-gray-500">Nama</span>
                  <span className="text-white">{currentUser?.name || "Guest"}</span>
                </div>
                <div className="flex justify-between border-b border-[#222] pb-4">
                  <span className="text-gray-500">WhatsApp</span>
                  <span className="text-white">{formData.whatsapp}</span>
                </div>
                <div className="flex justify-between border-b border-[#222] pb-4">
                  <span className="text-gray-500">Level</span>
                  <span className="text-white">{formData.level}</span>
                </div>
                <div className="flex justify-between border-b border-[#222] pb-4">
                  <span className="text-gray-500">Sesi</span>
                  <span className="text-white">{selectedSlots.length} Sesi ({selectedSlots.length} jam)</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-500">Total Harga</span>
                  <span className="text-[#cdff00] font-bold">Rp {(trainer.pricePerSession * selectedSlots.length).toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-md bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-md border border-[#333] text-gray-300 hover:text-white hover:border-[#555] transition-colors text-sm font-semibold"
              >
                ← Kembali
              </button>
              <button
                disabled={loading || userLoading || !sessionEmail}
                onClick={handleConfirm}
                className="px-6 py-3 rounded-md bg-[#cdff00] text-black font-bold text-sm hover:opacity-90 transition-opacity flex items-center disabled:opacity-50"
              >
                {loading ? "Memproses..." : (
                  <>
                    <Check size={16} className="mr-2" strokeWidth={3} /> Konfirmasi Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 5: Success --- */}
        {step === 5 && (
          <div className="flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-[#cdff00] rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(205,255,0,0.3)]">
              <Check size={40} className="text-black" strokeWidth={3} />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-4">
              Booking Berhasil!
            </h1>
            <p className="text-gray-400 mb-2">
              Trainer <span className="text-white font-bold">{trainer.userName}</span> akan segera menghubungi kamu.
            </p>
            <p className="text-gray-400 mb-10">Selamat berlatih! 💪</p>
            
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-3 rounded-md bg-[#cdff00] text-black font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Lihat Jadwal Saya →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
