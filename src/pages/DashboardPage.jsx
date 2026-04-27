// src/pages/DashboardPage.jsx
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "../hooks/useCurrentUser.js";

function formatIDR(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount).replace("IDR", "Rp");
}

function getDayShort(dateStr) {
  const date = new Date(dateStr);
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  return days[date.getDay()];
}

function formatDateID(timestamp) {
  const date = new Date(timestamp);
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function BookingCard({ booking, onCancel }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPast = booking.sessionDate < new Date().toISOString().split("T")[0];
  const isUpcoming = !isPast && booking.status !== "cancelled";

  if (booking.status === "cancelled" && !isPast) return null; // Hide cancelled in upcoming if not needed, but screenshot shows "2 total"

  return (
    <div className="bg-[#151515] border border-[#222] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#333]">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white tracking-tight">{booking.trainerName}</h3>
        </div>
        
        <p className="text-sm text-gray-400 font-medium">
          {booking.trainerSpecialization?.join(" & ")} · {getDayShort(booking.sessionDate)}, {booking.startTime}
        </p>
        
        <p className="text-xs text-gray-500">
          {booking.sessionCount || 1} Sesi ({parseInt(booking.endTime) - parseInt(booking.startTime)} jam) · {booking.level || "Umum"} · {formatIDR(booking.pricePerSession)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-col items-end">
          <span className="bg-[#1a1c10] text-[#cdff00] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#cdff00]/20">
            {booking.status === "confirmed" ? "Terkonfirmasi" : booking.status}
          </span>
          <span className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">
            Dibuat {formatDateID(booking.createdAt)}
          </span>
        </div>

        {isUpcoming && (
          <div className="mt-2">
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="text-[11px] text-gray-500 border border-[#333] px-4 py-1.5 rounded-lg hover:bg-[#222] hover:text-white transition-colors uppercase font-bold tracking-wider"
              >
                Batalkan
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setLoading(true);
                    await onCancel(booking._id);
                    setLoading(false);
                    setConfirming(false);
                  }}
                  disabled={loading}
                  className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all uppercase font-bold"
                >
                  {loading ? "..." : "Ya, Batal"}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="text-[10px] text-gray-400 px-3 py-1.5 rounded-lg hover:bg-[#222] transition-colors uppercase font-bold"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Trainer view ─────────────────────────────────────────────────────────────

function TrainerDashboard({ me }) {
  const trainerProfile = useQuery(api.trainers.getMyTrainerProfile);
  const bookings = useQuery(
    api.bookings.getTrainerBookings,
    trainerProfile ? { trainerId: trainerProfile._id } : "skip"
  );
  const updateAvailability = useMutation(api.trainers.updateAvailability);

  const [slots, setSlots] = useState(trainerProfile?.availableSlots ?? []);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  if (
    trainerProfile &&
    JSON.stringify(slots) !== JSON.stringify(trainerProfile.availableSlots) &&
    !saving
  ) {
    setSlots(trainerProfile.availableSlots);
  }

  const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const WEEKDAY_SET = new Set(["Monday","Tuesday","Wednesday","Thursday","Friday"]);

  function getTimesForDay(day) {
    const endHour = WEEKDAY_SET.has(day) ? 19 : 21;
    const times = [];
    for (let h = 6; h < endHour; h++) {
      times.push({
        startTime: `${String(h).padStart(2, "0")}:00`,
        endTime: `${String(h + 1).padStart(2, "0")}:00`,
      });
    }
    return times;
  }

  function toggleSlot(day, startTime, endTime) {
    const exists = slots.some(
      (s) => s.day === day && s.startTime === startTime && s.endTime === endTime
    );
    if (exists) {
      setSlots(slots.filter(
        (s) => !(s.day === day && s.startTime === startTime && s.endTime === endTime)
      ));
    } else {
      setSlots([...slots, { day, startTime, endTime }]);
    }
  }

  function toggleAllDay(day) {
    const times = getTimesForDay(day);
    const allActive = times.every((t) =>
      slots.some((s) => s.day === day && s.startTime === t.startTime)
    );
    if (allActive) {
      setSlots(slots.filter((s) => s.day !== day));
    } else {
      const existing = slots.filter((s) => s.day !== day);
      setSlots([...existing, ...times.map((t) => ({ day, ...t }))]);
    }
  }

  async function saveSlots() {
    if (!trainerProfile) return;
    setSaving(true);
    try {
      await updateAvailability({ trainerId: trainerProfile._id, availableSlots: slots });
      setSaveMsg("Availability saved!");
    } catch (err) {
      setSaveMsg(err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Trainer Dashboard</h1>
        <p className="text-gray-500">Kelola jadwal dan pantau klien Anda.</p>
      </div>

      <section>
        <h2 className="text-xs font-bold text-gray-600 mb-6 uppercase tracking-[0.2em]">Booking Mendatang</h2>
        <div className="grid gap-4">
          {bookings?.map((b) => (
            <div key={b._id} className="bg-[#151515] border border-[#222] rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-white tracking-tight">{b.clientName}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {b.sessionDate} · {b.startTime}–{b.endTime}
                </p>
              </div>
              <span className="bg-[#1a1c10] text-[#cdff00] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#cdff00]/20">
                {b.status}
              </span>
            </div>
          ))}
          {bookings?.length === 0 && <p className="text-center py-10 text-gray-600 italic">Belum ada booking.</p>}
        </div>
      </section>

      {trainerProfile && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-[0.2em]">Atur Ketersediaan</h2>
            <button
              onClick={saveSlots}
              disabled={saving}
              className="bg-[#cdff00] text-black px-6 py-2 rounded-xl text-sm font-black uppercase tracking-tighter hover:bg-[#b8e600] transition-colors disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
          <div className="bg-[#111] rounded-3xl border border-[#222] p-8 space-y-8">
            {DAYS.map((day) => {
              const times = getTimesForDay(day);
              const allActive = times.every((t) =>
                slots.some((s) => s.day === day && s.startTime === t.startTime)
              );
              return (
                <div key={day} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm font-bold text-white uppercase tracking-wider">
                      {day}
                    </span>
                    <button
                      onClick={() => toggleAllDay(day)}
                      className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-all border ${
                        allActive
                          ? "bg-[#cdff00]/10 text-[#cdff00] border-[#cdff00]/20"
                          : "bg-[#222] text-gray-500 border-transparent hover:text-gray-300"
                      }`}
                    >
                      {allActive ? "Hapus Semua" : "Pilih Semua"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {times.map((t) => {
                      const active = slots.some(
                        (s) => s.day === day && s.startTime === t.startTime && s.endTime === t.endTime
                      );
                      return (
                        <button
                          key={t.startTime}
                          onClick={() => toggleSlot(day, t.startTime, t.endTime)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            active
                              ? "bg-[#cdff00] text-black border-[#cdff00]"
                              : "bg-[#1a1a1a] text-gray-600 border-[#222] hover:border-[#333] hover:text-gray-400"
                          }`}
                        >
                          {t.startTime}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

// ── User view ────────────────────────────────────────────────────────────────

function UserDashboard({ me, sessionEmail }) {
  const bookings = useQuery(
    api.bookings.getMyBookings,
    sessionEmail ? { userEmail: sessionEmail } : "skip"
  );
  const cancelBooking = useMutation(api.bookings.cancelBooking);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = bookings?.filter(
    (b) => b.sessionDate >= today && b.status !== "cancelled"
  ) ?? [];
  const past = bookings?.filter(
    (b) => b.sessionDate < today || b.status === "cancelled"
  ) ?? [];

  async function handleCancel(bookingId) {
    if (!sessionEmail) return;
    await cancelBooking({ bookingId, userEmail: sessionEmail });
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">Jadwal Saya</h1>
        <p className="text-gray-500 font-medium text-sm">
          {bookings?.length || 0} total sesi · {upcoming.length} aktif
        </p>
      </div>

      <section>
        <h2 className="text-xs font-bold text-gray-600 mb-6 uppercase tracking-[0.2em]">Sesi Mendatang</h2>
        {bookings === undefined && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#cdff00] border-t-transparent" />
          </div>
        )}
        {bookings !== undefined && upcoming.length === 0 && (
          <div className="text-center py-20 bg-[#111] rounded-3xl border border-[#222] border-dashed">
            <p className="text-gray-500 mb-4 font-medium">Belum ada sesi mendatang.</p>
            <Link to="/trainers" className="inline-block bg-[#cdff00] text-black px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-tighter hover:bg-[#b8e600] transition-colors">
              Cari Trainer
            </Link>
          </div>
        )}
        <div className="grid gap-4">
          {upcoming.map((b) => (
            <BookingCard key={b._id} booking={b} onCancel={handleCancel} />
          ))}
        </div>
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-600 mb-6 uppercase tracking-[0.2em]">Riwayat</h2>
          <div className="grid gap-4 opacity-60">
            {past.map((b) => (
              <BookingCard key={b._id} booking={b} onCancel={handleCancel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Root dashboard ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { me, loading, email: sessionEmail } = useCurrentUser();

  if (loading || !me) {
    return (
      <div className="flex justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#cdff00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {me.role === "trainer" ? (
        <TrainerDashboard me={me} />
      ) : (
        <UserDashboard me={me} sessionEmail={sessionEmail} />
      )}
    </div>
  );
}
