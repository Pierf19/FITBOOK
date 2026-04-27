// src/components/TrainerCard.jsx
import { Link } from "react-router-dom";

export default function TrainerCard({ trainer }) {
  const initials = trainer.userName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '?';
  const specializations = trainer.specialization ?? [];
  const primarySpec = specializations[0] ?? "Personal Training";

  return (
    <Link
      to={`/book/${trainer._id}`}
      className="group rounded-xl bg-[#111] border border-[#222] p-6 flex flex-col hover:border-[#cdff00] transition-colors relative cursor-pointer"
    >
      {/* Top Green Accent on Hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-[#cdff00] transition-colors rounded-t-xl" />

      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-full bg-[#cdff00] flex items-center justify-center text-xl font-bold text-black shadow-[0_0_15px_rgba(205,255,0,0.3)]">
          {initials}
        </div>
      </div>

      <div className="mb-2">
        <div className="inline-flex items-center gap-1.5 bg-[#1a1a00] border border-[#cdff00]/30 text-[#cdff00] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-3">
          <span>★</span> Rekomendasi
        </div>
        
        <h3 className="text-xl font-bold text-white leading-tight mb-1">{trainer.userName}</h3>
        <p className="text-sm text-gray-400">
          {primarySpec}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 my-4">
        {specializations.slice(1, 3).map((s) => (
          <span
            key={s}
            className="text-[11px] bg-[#1a1a1a] text-gray-300 border border-[#333] px-3 py-1 rounded-full font-medium"
          >
            {s}
          </span>
        ))}
        {specializations.length <= 1 && (
          <>
            <span className="text-[11px] bg-[#1a1a1a] text-gray-300 border border-[#333] px-3 py-1 rounded-full font-medium">Weight Training</span>
            <span className="text-[11px] bg-[#1a1a1a] text-gray-300 border border-[#333] px-3 py-1 rounded-full font-medium">Nutrition</span>
          </>
        )}
      </div>

      <div className="flex items-end justify-between mt-auto pt-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">
            5 thn pengalaman
          </div>
          <div className="font-medium text-gray-200">
            Rp {(trainer.pricePerSession || 150000).toLocaleString('id-ID')}
            <span className="text-gray-500 text-xs font-normal">/sesi</span>
          </div>
        </div>
        <div className="text-[#cdff00] font-bold text-lg flex items-center gap-1">
          4.9 <span className="text-sm">★</span>
        </div>
      </div>
    </Link>
  );
}
