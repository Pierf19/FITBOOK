const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_ID = {
  Monday: "SEN",
  Tuesday: "SEL",
  Wednesday: "RAB",
  Thursday: "KAM",
  Friday: "JUM",
  Saturday: "SAB",
  Sunday: "MIN",
};
const EN_INDEX = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatHour(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function getHourRange(dayEn) {
  const isWeekend = dayEn === "Saturday" || dayEn === "Sunday";
  const endHour = isWeekend ? 21 : 19;
  const hours = [];

  for (let hour = 6; hour <= endHour; hour += 1) {
    hours.push({
      startTime: formatHour(hour),
      endTime: formatHour(hour + 1),
      day: dayEn,
    });
  }

  return hours;
}

// bookedSlots: { "YYYY-MM-DD": [{ startTime, endTime }, ...], ... }
export default function ScheduleCalendar({ trainer, onSlotSelect, selectedSlots = [], bookedSlots = {} }) {
  const getSlotsForDay = (dayEn) => {
    // Determine the next upcoming calendar date for the target day.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayIndex = today.getDay();
    const targetIndex = EN_INDEX.indexOf(dayEn);
    let diff = targetIndex - todayIndex;
    if (diff < 0) diff += 7;

    const d = new Date(today);
    d.setDate(today.getDate() + diff);
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");

    return getHourRange(dayEn).map((slot) => ({ ...slot, date: dateStr }));
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2">
        {DAYS_EN.map((dayEn) => {
          const slots = getSlotsForDay(dayEn);
          return (
            <div key={dayEn} className="flex flex-col gap-2">
              <div className="text-center text-xs font-semibold text-[#555] mb-2 uppercase tracking-wide">
                {DAYS_ID[dayEn]}
              </div>
              <div className="flex flex-col gap-[6px]">
                {slots.map((slot) => {
                  const isSelected = selectedSlots.some(
                    (s) => s.date === slot.date && s.startTime === slot.startTime
                  );

                  // Cek apakah slot ini sudah dipesan user lain
                  const isBooked =
                    bookedSlots[slot.date]?.some(
                      (b) => b.startTime === slot.startTime
                    ) ?? false;

                  // Slot sudah penuh — non-interaktif, tampilkan indikator merah
                  if (isBooked) {
                    return (
                      <div
                        key={`${dayEn}-${slot.startTime}`}
                        title="Slot ini sudah dipesan"
                        className="w-full py-2.5 rounded-md border border-rose-500/20 bg-rose-500/5 cursor-not-allowed flex flex-col items-center justify-center gap-0.5"
                      >
                        <span className="text-xs font-medium text-rose-500/50 line-through">
                          {slot.startTime}
                        </span>
                        <span className="text-[9px] font-bold text-rose-500/60 uppercase tracking-wide">
                          Penuh
                        </span>
                      </div>
                    );
                  }

                  // Slot tersedia — bisa dipilih
                  return (
                    <button
                      key={`${dayEn}-${slot.startTime}`}
                      onClick={() => onSlotSelect(slot)}
                      className={`w-full py-2.5 text-xs font-medium rounded-md transition-all border ${
                        isSelected
                          ? "bg-[#cdff00] text-black border-[#cdff00] shadow-[0_0_15px_rgba(205,255,0,0.2)]"
                          : "bg-[#111] text-gray-500 border-[#222] hover:border-[#444] hover:text-gray-300"
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#cdff00]" />
          <span>Dipilih</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#111] border border-[#333]" />
          <span>Tersedia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-rose-500/10 border border-rose-500/30" />
          <span>Penuh</span>
        </div>
      </div>
    </div>
  );
}
