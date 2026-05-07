import { Link, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
import { ArrowRight, Zap, Dumbbell, Activity, Heart, Calendar, ShieldCheck, Star, Users, Trophy, Sparkles } from "lucide-react";

export default function HomePage() {
  const { me } = useCurrentUser();
  const navigate = useNavigate();
  const firstName = me?.name?.split(" ")[0] ?? "ATLET";

  const popularWorkouts = [
    {
      id: "Strength",
      title: "Latihan Kekuatan",
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
      title: "Kebugaran Umum",
      description: "Program kebugaran menyeluruh untuk pemula hingga tingkat lanjut.",
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/50"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="py-20 mb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#cdff00]/5 blur-[120px] rounded-full -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#cdff00]/10 border border-[#cdff00]/20 text-[#cdff00] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-[0_0_20px_rgba(205,255,0,0.1)]">
                <Sparkles className="w-3 h-3" />
                FITBOOK OS v2.0 · PLATFORM TERBAIK 2026
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-8 animate-in slide-in-from-left duration-700">
                {me
                    ? `SELAMAT DATANG,\n${firstName}!`
                    : "TRANSFORMASI\nTUBUH DIMULAI\nDI SINI."}
            </h1>

            <p className="text-gray-500 text-lg md:text-xl max-w-2xl mb-12 font-medium leading-relaxed">
                Platform reservasi trainer profesional tercepat. Pilih spesialisasi, tentukan jadwal, dan raih performa puncak bersama komunitas elit kami.
            </p>

            <div className="flex flex-wrap gap-6 animate-in slide-in-from-bottom duration-700 delay-200">
                <Link
                    to="/trainers"
                    className="bg-[#cdff00] text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#b8e600] transition-all hover:scale-105 shadow-[0_20px_40px_-15px_rgba(205,255,0,0.3)] active:scale-95"
                >
                    Booking Sekarang
                </Link>

                {me ? (
                    <Link
                        to="/dashboard"
                        className="bg-white/5 text-white border border-white/10 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                    >
                        Lihat Jadwal
                    </Link>
                ) : (
                    <Link
                        to="/auth"
                        className="bg-white/5 text-white border border-white/10 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                    >
                        Mulai Gratis
                    </Link>
                )}
            </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="mb-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
            { icon: Users, title: "1. Pilih Trainer", desc: "Temukan trainer bersertifikat yang sesuai dengan target spesifik Anda." },
            { icon: Calendar, title: "2. Atur Jadwal", desc: "Pilih waktu latihan yang fleksibel sesuai dengan agenda harian Anda." },
            { icon: Trophy, title: "3. Raih Target", desc: "Latihan intensif dan pantau progres transformasi tubuh Anda setiap hari." },
        ].map((step, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group hover:border-[#cdff00]/30 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#cdff00] group-hover:text-black transition-all">
                    <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-black uppercase tracking-tighter text-xl mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{step.desc}</p>
            </div>
        ))}
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

      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-t border-white/5 mb-20">
        <div>
          <div className="text-5xl font-black text-[#cdff00] mb-2 tracking-tighter">12+</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Trainer Elit</div>
        </div>
        <div>
          <div className="text-5xl font-black text-[#cdff00] mb-2 tracking-tighter">1.2K</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Sesi Selesai</div>
        </div>
        <div>
          <div className="text-5xl font-black text-[#cdff00] mb-2 tracking-tighter">4.9</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Rating Kepuasan</div>
        </div>
        <div>
          <div className="text-5xl font-black text-[#cdff00] mb-2 tracking-tighter">24/7</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Dukungan Sistem</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-32">
        <div className="p-12 md:p-20 rounded-[4rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-[#cdff00]/5 blur-[100px] pointer-events-none" />
            
            <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-8">KENAPA HARUS\nFITBOOK?</h2>
                <div className="space-y-8">
                    {[
                        { icon: ShieldCheck, title: "Keamanan Terjamin", desc: "Data dan transaksi Anda dilindungi dengan protokol keamanan tingkat tinggi." },
                        { icon: Star, title: "Trainer Terverifikasi", desc: "Hanya trainer dengan rekam jejak terbaik yang dapat bergabung di platform kami." },
                        { icon: Activity, title: "Monitoring Progres", desc: "Pantau perkembangan tubuh Anda melalui dashboard yang informatif dan akurat." },
                    ].map((feature, i) => (
                        <div key={i} className="flex gap-6">
                            <div className="shrink-0 w-12 h-12 rounded-xl bg-[#cdff00]/10 flex items-center justify-center text-[#cdff00]">
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg mb-1">{feature.title}</h4>
                                <p className="text-gray-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
