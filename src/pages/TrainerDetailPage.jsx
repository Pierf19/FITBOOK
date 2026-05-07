// src/pages/TrainerDetailPage.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
import { ArrowLeft, Star, Clock, ShieldCheck, Zap, Award, Target, CheckCircle2 } from "lucide-react";

export default function TrainerDetailPage() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const trainer = useQuery(api.trainers.getTrainer, { trainerId });
  const { me } = useCurrentUser();

  if (trainer === undefined) {
    return (
      <div className="flex justify-center py-40 bg-[#050505] min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#cdff00] border-t-transparent" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="text-center py-40 text-gray-500 bg-[#050505] min-h-screen">
        <Target className="w-16 h-16 mx-auto mb-6 opacity-20" />
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Entity Not Found</h2>
        <p className="text-sm text-gray-600 mt-2">The requested specialist record does not exist in the database.</p>
        <Link to="/trainers" className="inline-block mt-8 text-[#cdff00] font-black uppercase tracking-widest text-xs hover:text-glow transition-all">
          ← Return to Database
        </Link>
      </div>
    );
  }

  // Group available slots by day
  const slotsByDay = trainer.availableSlots.reduce((acc, slot) => {
    if (!acc[slot.day]) acc[slot.day] = [];
    acc[slot.day].push(slot);
    return acc;
  }, {});

  const dayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden pb-20">
      {/* Ambient Background Elements */}
      <div className="absolute top-0 right-0 w-[50%] h-[500px] bg-[#cdff00]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 pt-12 relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-12 text-[10px] font-black uppercase tracking-[0.3em]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Specialists
        </button>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Info */}
          <div className="lg:col-span-7 space-y-12">
            <section className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-gradient-to-br from-[#111] to-[#222] border border-white/10 flex items-center justify-center text-4xl md:text-5xl font-black text-[#cdff00] shadow-2xl relative z-10 overflow-hidden">
                    {trainer.image ? (
                        <img src={trainer.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        trainer.userName?.charAt(0).toUpperCase()
                    )}
                </div>
                <div className="absolute -bottom-3 -right-3 bg-[#cdff00] text-black w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl z-20 rotate-12">
                    <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cdff00]/10 border border-[#cdff00]/20 text-[#cdff00] text-[9px] font-black uppercase tracking-widest">
                    <Star className="w-3 h-3 fill-[#cdff00]" />
                    Elite Specialist v2.4
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">{trainer.userName}</h1>
                <div className="flex flex-wrap gap-2">
                    {trainer.specialization.map((s) => (
                        <span key={s} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {s}
                        </span>
                    ))}
                </div>
              </div>
            </section>

            <section className="premium-card p-10 rounded-[3rem] space-y-6">
                <h2 className="text-xs font-black text-[#cdff00] uppercase tracking-[0.4em] flex items-center gap-3">
                    <Award className="w-4 h-4" /> Professional Profile
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed font-medium">
                    {trainer.bio}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6">
                    {[
                        { icon: Zap, label: "Experience", value: "5+ Years" },
                        { icon: Star, label: "Rating", value: "4.9/5.0" },
                        { icon: Clock, label: "Session", value: "60 Min" },
                    ].map((item, i) => (
                        <div key={i} className="space-y-1">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                                <item.icon className="w-3 h-3" /> {item.label}
                            </p>
                            <p className="text-white font-black uppercase">{item.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-8">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-3">
                    <Clock className="w-4 h-4" /> Tactical Availability
                </h2>
                <div className="grid gap-4">
                    {dayOrder.map((day) => {
                        const daySlots = slotsByDay[day];
                        if (!daySlots) return null;
                        return (
                            <div key={day} className="glass p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-white/5 hover:border-[#cdff00]/30 transition-all">
                                <span className="text-sm font-black text-white uppercase tracking-widest w-32">{day}</span>
                                <div className="flex flex-wrap gap-2">
                                    {daySlots.map((s, i) => (
                                        <span key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300">
                                            {s.startTime} – {s.endTime}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
          </div>

          {/* Right Column: CTA */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
                <div className="premium-card p-10 rounded-[3rem] border-[#cdff00]/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#cdff00]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#cdff00]/20 transition-all" />
                    
                    <div className="relative z-10 space-y-8">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-4">Investment Protocol</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-black text-white tracking-tighter">Rp {trainer.pricePerSession.toLocaleString('id-ID')}</span>
                                <span className="text-sm font-black text-gray-600 uppercase tracking-widest">/ Sesi</span>
                            </div>
                        </div>

                        <ul className="space-y-4">
                            {[
                                "Full 60-minute tactical training",
                                "Custom progress mapping",
                                "Nutritional baseline assessment",
                                "Priority support access"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 text-xs font-bold text-gray-400">
                                    <CheckCircle2 className="w-4 h-4 text-[#cdff00]" />
                                    {text}
                                </li>
                            ))}
                        </ul>

                        <div className="pt-4">
                            {me ? (
                                <Link
                                    to={`/book/${trainer._id}`}
                                    className="glow-button block w-full bg-[#cdff00] text-black py-6 rounded-2xl text-center font-black uppercase tracking-widest text-sm hover:bg-[#b8e600] active:scale-[0.98] transition-all shadow-[0_20px_40px_-10px_rgba(205,255,0,0.3)]"
                                >
                                    Initialize Booking
                                </Link>
                            ) : (
                                <Link
                                    to="/auth"
                                    className="glow-button block w-full bg-white text-black py-6 rounded-2xl text-center font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all"
                                >
                                    Authenticate to Book
                                </Link>
                            )}
                        </div>
                        
                        <p className="text-[9px] text-center text-gray-600 font-black uppercase tracking-[0.3em]">Secure Transaction Guaranteed</p>
                    </div>
                </div>

                <div className="glass p-8 rounded-3xl space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Client Testimonial</p>
                    <p className="text-sm text-gray-400 italic leading-relaxed font-medium">"The most professional training experience I've had. The attention to detail and progress tracking is world-class."</p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">James W. · Pro Athlete</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
