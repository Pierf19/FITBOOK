import { Link, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
import { ArrowRight, Zap, Dumbbell, Activity, Heart } from "lucide-react";

export default function HomePage() {
  const { me } = useCurrentUser();
  const navigate = useNavigate();
  const firstName = me?.name?.split(" ")[0] ?? "ATLET";

  const popularWorkouts = [
    {
      id: "Strength",
      title: "Strength Training",
      description: "Bangun massa otot dan tingkatkan kekuatan fisik Anda dengan beban.",
      icon: Dumbbell,
      color: "text-[#cdff00]",
      bg: "bg-[#cdff00]/10",
      border: "hover:border-[#cdff00]/50"
    },
    {
      id: "HIIT",
      title: "HIIT & Cardio",
      description: "Bakar kalori maksimal dalam waktu singkat dan tingkatkan stamina.",
      icon: Zap,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "hover:border-orange-500/50"
    },
    {
      id: "Yoga",
      title: "Yoga & Pilates",
      description: "Tingkatkan fleksibilitas, keseimbangan tubuh, dan ketenangan pikiran.",
      icon: Heart,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      border: "hover:border-pink-500/50"
    },
    {
      id: "General",
      title: "General Fitness",
      description: "Program kebugaran menyeluruh untuk pemula hingga tingkat lanjut.",
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/50"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <section className="py-12 border-b border-[#222] mb-12">
        <div className="inline-flex items-center gap-2 bg-[#cdff00] text-black px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest mb-6">
          <span className="text-sm">FB</span> FITNESS BOOKING PLATFORM
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6 whitespace-pre-line">
          {me
            ? `HALO, ${firstName}!\nSIAP LATIHAN?`
            : "LEVEL BARU\nKEBUGARANMU"}
        </h1>

        <p className="text-gray-400 text-lg max-w-xl mb-10">
          Pilih trainer, booking jadwal, dan raih target kebugaran kamu bersama profesional terbaik.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/trainers"
            className="bg-[#cdff00] text-black px-8 py-3.5 rounded-md font-bold text-sm tracking-wide hover:bg-[#b8e600] transition-colors"
          >
            Booking Sekarang
          </Link>

          {me ? (
            <Link
              to="/dashboard"
              className="bg-transparent text-white border border-[#333] px-8 py-3.5 rounded-md font-bold text-sm tracking-wide hover:border-gray-500 transition-colors"
            >
              Jadwal Saya
            </Link>
          ) : (
            <Link
              to="/auth"
              className="bg-transparent text-white border border-[#333] px-8 py-3.5 rounded-md font-bold text-sm tracking-wide hover:border-gray-500 transition-colors"
            >
              Mulai Sekarang
            </Link>
          )}
        </div>
      </section>

      {/* Popular Workouts Section */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">
              Olahraga Populer
            </h2>
            <p className="text-gray-500 text-sm">Pilih spesialisasi yang sesuai dengan target kebugaran Anda.</p>
          </div>
          <Link 
            to="/trainers" 
            className="text-sm font-bold text-[#cdff00] hover:text-[#b8e600] transition-colors uppercase tracking-widest flex items-center gap-1"
          >
            Lihat Semua Trainer <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularWorkouts.map((workout) => (
            <div 
              key={workout.id} 
              onClick={() => navigate(`/trainers?spec=${workout.id}`)}
              className={`bg-[#151515] border border-[#222] p-6 rounded-2xl cursor-pointer transition-all duration-300 ${workout.border} hover:-translate-y-1 group`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${workout.bg} ${workout.color}`}>
                <workout.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 transition-colors">
                {workout.title}
              </h3>
              <p className="text-sm text-gray-500 mb-8 line-clamp-3">
                {workout.description}
              </p>
              <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-600 group-hover:text-[#cdff00] transition-colors mt-auto">
                Cari Trainer <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-[#222]">
        <div>
          <div className="text-4xl font-black text-[#cdff00] mb-2">4</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Trainer Aktif</div>
        </div>
        <div>
          <div className="text-4xl font-black text-[#cdff00] mb-2">480+</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Sesi Selesai</div>
        </div>
        <div>
          <div className="text-4xl font-black text-[#cdff00] mb-2">4.9</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Rating Rata-rata</div>
        </div>
        <div>
          <div className="text-4xl font-black text-[#cdff00] mb-2">98%</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Kepuasan Klien</div>
        </div>
      </section>
    </div>
  );
}
