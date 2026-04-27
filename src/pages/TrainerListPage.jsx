import { useQuery } from "convex/react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import TrainerCard from "../components/TrainerCard.jsx";
import { ArrowLeft } from "lucide-react";

export default function TrainerListPage() {
  const [searchParams] = useSearchParams();
  const specFilter = searchParams.get("spec");

  const trainers = useQuery(
    api.trainers.listTrainers,
    specFilter ? { specialization: specFilter } : {}
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-12">
        {specFilter && (
          <Link to="/" className="inline-flex items-center text-xs font-bold text-[#cdff00] hover:text-[#b8e600] uppercase tracking-widest mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Beranda
          </Link>
        )}
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-3">
          {specFilter ? `Spesialis ${specFilter}` : "Trainer Tersedia"}
        </h1>
        <p className="text-gray-400 text-sm font-medium">
          {specFilter 
            ? `Temukan profesional terbaik untuk fokus pada ${specFilter}.`
            : "Klik trainer untuk melihat detail dan mulai booking sesi latihan."}
        </p>
      </div>

      {trainers === undefined ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#cdff00] border-t-transparent" />
        </div>
      ) : trainers.length === 0 ? (
        <div className="bg-[#111] border border-[#222] border-dashed rounded-3xl p-16 text-center">
          <p className="text-gray-500 font-medium mb-6 text-lg">Belum ada trainer untuk spesialisasi ini.</p>
          <Link to="/trainers" className="bg-[#cdff00] text-black px-6 py-3 rounded-xl font-black uppercase text-xs tracking-tighter hover:bg-[#b8e600] transition-colors">
            Lihat Semua Trainer
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trainers.map((trainer) => (
            <TrainerCard key={trainer._id} trainer={trainer} />
          ))}
        </div>
      )}
    </div>
  );
}
