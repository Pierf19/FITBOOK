// src/pages/ProfilePage.jsx
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
import { 
  User, 
  Target, 
  TrendingUp, 
  Award, 
  Settings, 
  Plus, 
  X,
  Activity,
  Flame,
  Calendar,
  Camera
} from "lucide-react";

export default function ProfilePage() {
  const { me, loading: userLoading } = useCurrentUser();
  const progress = useQuery(api.users.getUserProgress, me ? { userId: me._id } : "skip");
  const updateProfile = useMutation(api.users.updateProfile);
  const progressEntries = useQuery(api.progress.getEntries, me ? { userId: me._id } : "skip");
  const addEntry = useMutation(api.progress.addEntry);
  const deleteEntry = useMutation(api.progress.deleteEntry);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfileImage = useMutation(api.users.updateProfileImage);

  const [isUploading, setIsUploading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [newEntry, setNewEntry] = useState({ weight: "", bodyFat: "", notes: "" });
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    bio: "",
  });

  if (userLoading || !me) {
    return (
      <div className="flex justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#cdff00] border-t-transparent" />
      </div>
    );
  }

  const handleUpdate = async () => {
    await updateProfile({
      userId: me._id,
      name: editedProfile.name || me.name,
      bio: editedProfile.bio || me.bio,
    });
    setIsEditing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await updateProfileImage({ storageId });
    } catch (err) {
      console.error("Gagal mengunggah gambar:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    const currentGoals = me.goals || [];
    await updateProfile({
      userId: me._id,
      goals: [...currentGoals, newGoal.trim()],
    });
    setNewGoal("");
  };

  const removeGoal = async (index) => {
    const currentGoals = me.goals || [];
    const updatedGoals = currentGoals.filter((_, i) => i !== index);
    await updateProfile({
      userId: me._id,
      goals: updatedGoals,
    });
  };

  const stats = [
    { label: "Total Sesi", value: progress?.totalSessions || 0, icon: Activity, color: "text-[#cdff00]" },
    { label: "Booking Aktif", value: progress?.confirmedBookings || 0, icon: Calendar, color: "text-blue-400" },
    { label: "Pencapaian", value: (me.goals?.length || 0), icon: Award, color: "text-purple-400" },
    { label: "Streak", value: "5 Hari", icon: Flame, color: "text-orange-500" },
  ];

  const specializationIcons = {
    "Strength": "💪",
    "Cardio": "🏃",
    "Yoga": "🧘",
    "HIIT": "⚡",
    "Boxing": "🥊",
    "General": "🏋️",
  };

  const getBadge = (sessions) => {
    if (sessions >= 20) return { name: "Apex Predator", border: "border-red-500/50", bg: "bg-red-500/10", text: "text-red-500", icon: "👑" };
    if (sessions >= 10) return { name: "Titanium Core", border: "border-cyan-400/50", bg: "bg-cyan-400/10", text: "text-cyan-400", icon: "💎" };
    if (sessions >= 5) return { name: "Forged Steel", border: "border-gray-400/50", bg: "bg-gray-400/10", text: "text-gray-300", icon: "⚔️" };
    if (sessions >= 2) return { name: "Ignited Spark", border: "border-orange-500/50", bg: "bg-orange-500/10", text: "text-orange-500", icon: "🔥" };
    return { name: "Raw Iron", border: "border-stone-600/50", bg: "bg-stone-600/10", text: "text-stone-400", icon: "🧱" };
  };

  const userBadge = getBadge(progress?.totalSessions || 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* Header Profile */}
      <div className="bg-[#111] border border-[#222] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#cdff00]/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            {me.image ? (
              <img src={me.image} alt="Profile" className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#cdff00] transition-transform group-hover:scale-105" />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 bg-[#cdff00] rounded-full flex items-center justify-center text-black text-5xl font-black transition-transform group-hover:scale-105">
                {me.name.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 bg-[#1a1a1a] border border-[#333] p-3 rounded-full cursor-pointer hover:bg-[#222] transition-colors">
              <Camera className="w-5 h-5 text-gray-400 group-hover:text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
            </label>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#cdff00] border-t-transparent" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            {isEditing ? (
              <div className="space-y-4 max-w-md">
                <input
                  type="text"
                  defaultValue={me.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2 text-white font-bold text-3xl focus:border-[#cdff00] outline-none"
                />
                <textarea
                  placeholder="Ceritakan sedikit tentang dirimu..."
                  defaultValue={me.bio}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2 text-gray-400 h-24 focus:border-[#cdff00] outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdate} className="bg-[#cdff00] text-black px-6 py-2 rounded-xl font-bold text-sm">Simpan</button>
                  <button onClick={() => setIsEditing(false)} className="bg-[#222] text-white px-6 py-2 rounded-xl font-bold text-sm">Batal</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">{me.name}</h1>
                  <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-white transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-400 max-w-lg leading-relaxed font-medium">
                  {me.bio || "Belum ada bio. Tambahkan bio untuk memberi tahu trainer tentang dirimu!"}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                  <span className="bg-[#cdff00]/10 text-[#cdff00] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-[#cdff00]/20">
                    {me.role === "trainer" ? "Pelatih" : "Klien"}
                  </span>
                  <span className={`${userBadge.bg} ${userBadge.text} px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border ${userBadge.border} flex items-center gap-1.5 shadow-lg`}>
                    <span className="text-sm">{userBadge.icon}</span> {userBadge.name}
                  </span>
                  <span className="text-gray-600 text-xs font-bold uppercase tracking-widest hidden sm:inline">
                    Member Sejak {new Date(me.createdAt).getFullYear()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#111] border border-[#222] rounded-3xl p-6 space-y-4 hover:border-[#333] transition-all">
            <div className={`p-3 bg-gray-900/50 rounded-2xl w-fit ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Progress & Charts */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-[#111] border border-[#222] rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Progress Latihan
              </h2>
            </div>
            
            <div className="space-y-6">
              {Object.entries(progress?.statsByType || {}).length > 0 ? (
                Object.entries(progress.statsByType).map(([type, count]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="text-xl">{specializationIcons[type] || "🏋️"}</span> {type}
                      </span>
                      <span className="text-xs text-gray-500 font-bold">{count} Sesi</span>
                    </div>
                    <div className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#cdff00] rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((count / (progress.totalSessions || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <Activity className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium italic">Belum ada aktivitas latihan tercatat.</p>
                </div>
              )}
            </div>
          </section>

          {/* Activity History */}
          <section className="bg-[#111] border border-[#222] rounded-[2.5rem] p-8 space-y-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Aktivitas Terakhir</h2>
            <div className="space-y-4">
              {progress?.activityHistory?.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-[#1a1a1a]/50 rounded-2xl border border-transparent hover:border-[#333] transition-all">
                  <div className="w-10 h-10 bg-[#cdff00]/10 rounded-xl flex items-center justify-center text-[#cdff00]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-tighter">Sesi {activity.type}</p>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{activity.sessionDate} · {activity.startTime}</p>
                  </div>
                </div>
              ))}
              {(!progress?.activityHistory || progress.activityHistory.length === 0) && (
                <p className="text-gray-600 text-sm italic">Belum ada riwayat.</p>
              )}
            </div>
          </section>
        </div>

        {/* Goals Section */}
        <div className="space-y-8">
          <section className="bg-[#111] border border-[#222] rounded-[2.5rem] p-8 space-y-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Target className="w-4 h-4" /> Target Kamu
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tambah target baru..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                  className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2 text-sm text-white focus:border-[#cdff00] outline-none"
                />
                <button 
                  onClick={addGoal}
                  className="bg-[#cdff00] text-black p-2 rounded-xl hover:bg-[#b8e600] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {me.goals?.map((goal, i) => (
                  <div key={i} className="group flex items-center justify-between p-4 bg-[#1a1a1a] rounded-2xl border border-[#222] hover:border-[#cdff00]/30 transition-all">
                    <span className="text-sm font-bold text-gray-200">{goal}</span>
                    <button 
                      onClick={() => removeGoal(i)}
                      className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!me.goals || me.goals.length === 0) && (
                  <p className="text-gray-600 text-xs italic py-4">Kamu belum mengatur target. Mari buat satu!</p>
                )}
              </div>
            </div>
          </section>

          {/* Progress Tracker (Body Metrics) */}
          <section className="bg-[#111] border border-[#222] rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-4 h-4" /> Metrik Tubuh
              </h2>
              <button 
                onClick={() => setIsAddingEntry(!isAddingEntry)}
                className="text-[#cdff00] text-xs font-bold uppercase hover:text-white transition-colors"
              >
                {isAddingEntry ? "Batal" : "+ Catat Baru"}
              </button>
            </div>

            {isAddingEntry && (
              <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-[#333] space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Berat (kg)</label>
                    <input type="number" step="0.1" value={newEntry.weight} onChange={(e) => setNewEntry({...newEntry, weight: e.target.value})} className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2 text-white text-sm focus:border-[#cdff00] outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Lemak Tubuh (%)</label>
                    <input type="number" step="0.1" value={newEntry.bodyFat} onChange={(e) => setNewEntry({...newEntry, bodyFat: e.target.value})} className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2 text-white text-sm focus:border-[#cdff00] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Catatan</label>
                  <input type="text" value={newEntry.notes} onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})} placeholder="Cth: Merasa lebih kuat hari ini!" className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2 text-white text-sm focus:border-[#cdff00] outline-none" />
                </div>
                <button 
                  onClick={async () => {
                    if (!newEntry.weight) return;
                    await addEntry({
                      userId: me._id,
                      date: new Date().toISOString().split("T")[0],
                      weight: parseFloat(newEntry.weight),
                      bodyFat: newEntry.bodyFat ? parseFloat(newEntry.bodyFat) : undefined,
                      notes: newEntry.notes || undefined,
                    });
                    setNewEntry({ weight: "", bodyFat: "", notes: "" });
                    setIsAddingEntry(false);
                  }}
                  className="w-full bg-[#cdff00] text-black py-2 rounded-xl font-bold text-xs uppercase hover:bg-[#b8e600] transition-colors"
                >
                  Simpan Catatan
                </button>
              </div>
            )}

            <div className="space-y-3">
              {progressEntries?.map((entry) => (
                <div key={entry._id} className="group flex items-center justify-between p-4 bg-[#1a1a1a] rounded-2xl border border-[#222] hover:border-[#333] transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-black text-white">{entry.weight} kg</span>
                      {entry.bodyFat && <span className="text-xs font-bold text-[#cdff00]">{entry.bodyFat}% BF</span>}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {entry.notes && ` · ${entry.notes}`}
                    </p>
                  </div>
                  <button 
                    onClick={() => deleteEntry({ entryId: entry._id })}
                    className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {progressEntries?.length === 0 && !isAddingEntry && (
                 <p className="text-gray-600 text-xs italic py-4 text-center border border-dashed border-[#222] rounded-2xl">Belum ada catatan metrik tubuh.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
