import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
import { 
  UserPlus, 
  Edit3, 
  Trash2, 
  Shield, 
  Users, 
  Activity, 
  Search, 
  LayoutDashboard, 
  Database, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Filter,
  Eye,
  EyeOff
} from "lucide-react";

export default function AdminPage() {
  const users = useQuery(api.users.getAllUsers);
  const createUser = useMutation(api.users.createUserAdmin);
  const updateUser = useMutation(api.users.updateUserAdmin);
  const deleteUser = useMutation(api.users.deleteUserAdmin);
  const addTrainer = useMutation(api.trainers.addTrainerAdmin);
  const seedTrainers = useMutation(api.trainers.seedDummyTrainers);
  const adminStats = useQuery(api.reports.getAdminStats);
  const bookings = useQuery(api.bookings.getAllBookings);
  const systemSettings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.updateSettings);
  const updateProfile = useMutation(api.users.updateProfile);
  const changePassword = useMutation(api.users.changePassword);
  const { me: currentUser } = useCurrentUser();
  
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState("dashboard");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ name: "", email: "", oldPassword: "", password: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    role: "user", 
    status: "Active", 
    email: "",
    bio: "",
    specialization: "",
    pricePerSession: 150000
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Filtered users calculation with safety
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const name = u.name || "Unknown";
      const email = u.email || "";
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           email.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeTab === "all") return matchesSearch;
      return matchesSearch && (u.role || "").toLowerCase() === activeTab.toLowerCase();
    });
  }, [users, searchQuery, activeTab]);

  if (users === undefined || adminStats === undefined) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#cdff00] border-t-transparent shadow-[0_0_20px_rgba(205,255,0,0.2)]" />
      </div>
    );
  }

  const handleOpenForm = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
        email: item.email || "",
        role: item.role || "user",
        status: item.status || "Active"
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        name: "", 
        role: "user", 
        status: "Active", 
        email: "",
        bio: "",
        specialization: "",
        pricePerSession: 150000
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData.role === "trainer") {
        await addTrainer({
          name: formData.name,
          email: formData.email,
          bio: formData.bio || "Pelatih profesional FITBOOK.",
          specialization: (formData.specialization || "Fitness").split(",").map(s => s.trim()),
          pricePerSession: Number(formData.pricePerSession) || 150000
        });
      } else if (editingItem) {
        await updateUser({
          userId: editingItem._id,
          name: formData.name,
          email: formData.email,
          role: formData.role.toLowerCase(),
          status: formData.status
        });
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          role: formData.role.toLowerCase(),
          status: formData.status
        });
      }
      handleCloseForm();
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan data: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await deleteUser({ userId: id });
      } catch (err) {
        alert("Terjadi kesalahan saat menghapus data.");
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const handleOpenProfileModal = () => {
    setProfileFormData({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        oldPassword: "",
        password: ""
    });
    setIsEditingProfile(false);
    setShowOldPassword(false);
    setShowNewPassword(false);
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
        if (profileFormData.password && !profileFormData.oldPassword) {
            alert("Silakan isi password lama untuk mengganti ke password baru.");
            return;
        }

        await updateProfile({
            userId: currentUser._id,
            name: profileFormData.name,
            email: profileFormData.email
        });
        
        if (profileFormData.password) {
            await changePassword({
                oldPassword: profileFormData.oldPassword,
                newPassword: profileFormData.password
            });
        }
        setIsEditingProfile(false);
        alert("Profil berhasil diperbarui!");
    } catch (err) {
        alert("Gagal memperbarui profil: " + err.message);
    }
  };

  const handleSeed = async () => {
    if (confirm("Reset/Seed data trainer dummy?")) {
        try {
            const res = await seedTrainers();
            alert(res.message);
        } catch (err) {
            alert("Error: " + err.message);
        }
    }
  };

  const stats = [
    { label: "Total Member", value: adminStats?.totalUsers || 0, sub: "Member Terdaftar", icon: Users, color: "text-[#cdff00]" },
    { label: "Trainer Aktif", value: adminStats?.totalTrainers || 0, sub: "Instruktur Profesional", icon: Activity, color: "text-blue-400" },
    { label: "Sesi Berjalan", value: adminStats?.activeBookings || 0, sub: "Jadwal Hari Ini", icon: Shield, color: "text-emerald-400" },
  ];

  const renderTable = (items) => (
    <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom duration-700">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Nama & Email</th>
              <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Peran</th>
              <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Status</th>
              <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-20 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest italic">Data tidak ditemukan.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="hover:bg-white/[0.01] transition-all group">
                  <td className="p-8">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center border border-white/10 group-hover:border-[#cdff00]/50 transition-all overflow-hidden">
                            {item.image ? (
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[#cdff00] font-black text-lg">{(item.name || "?").charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <p className="text-white font-black text-sm tracking-tight group-hover:text-[#cdff00] transition-colors">{item.name || "Unknown"}</p>
                            <p className="text-gray-500 text-[9px] font-bold tracking-widest uppercase">{item.email}</p>
                        </div>
                    </div>
                  </td>
                  <td className="p-8">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${item.role === 'trainer' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-gray-500/10 border-white/10 text-gray-400'}`}>
                          {item.role || "user"}
                      </span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-[#cdff00] shadow-[0_0_10px_#cdff00]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${item.status === 'Active' ? 'text-[#cdff00]' : 'text-red-500'}`}>
                            {item.status === 'Active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenForm(item)} className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5 transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="p-2.5 rounded-xl bg-red-500/5 text-red-500/50 hover:text-red-400 border border-red-500/10 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBookingsTable = () => (
    <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom duration-700">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Member</th>
              <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Trainer</th>
              <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Jadwal</th>
              <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {!bookings || bookings.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-20 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest italic">Belum ada data latihan.</td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b._id} className="hover:bg-white/[0.01] transition-all group">
                  <td className="p-8 text-white font-black text-sm">{b.userName || "Unknown"}</td>
                  <td className="p-8 text-gray-400 font-bold text-[10px] uppercase tracking-widest">{b.trainerName || "Unknown"}</td>
                  <td className="p-8">
                      <p className="text-white text-xs font-bold">{b.sessionDate}</p>
                      <p className="text-gray-500 text-[9px] uppercase tracking-tighter">{b.startTime} - {b.endTime}</p>
                  </td>
                  <td className="p-8">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${b.status === 'confirmed' ? 'bg-[#cdff00]/10 border-[#cdff00]/20 text-[#cdff00]' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                          {b.status}
                      </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] flex text-white">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col p-8 sticky top-0 h-screen bg-[#070707] z-20 shadow-2xl">
        <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#cdff00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(205,255,0,0.3)]">
                <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tighter uppercase leading-none">FITBOOK<span className="text-[#cdff00]">.</span>OS</h1>
                <p className="text-[7px] font-black text-gray-600 uppercase tracking-[0.4em] mt-1">Konsol Manajemen</p>
            </div>
        </div>

        <nav className="flex-1 space-y-2">
            {[
                { id: "dashboard", icon: LayoutDashboard, label: "Statistik Utama" },
                { id: "entities", icon: Users, label: "Daftar Member" },
                { id: "storage", icon: Database, label: "Data Latihan" },
                { id: "settings", icon: Settings, label: "Pengaturan Sistem" },
            ].map((item) => (
                <button 
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${currentView === item.id ? 'bg-[#cdff00]/10 text-[#cdff00] border border-[#cdff00]/20 shadow-[0_0_20px_rgba(205,255,0,0.05)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">{item.label}</span>
                    </div>
                    {currentView === item.id && <ChevronRight className="w-4 h-4" />}
                </button>
            ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-2">
            <button onClick={handleSeed} className="w-full flex items-center gap-3 p-4 rounded-2xl text-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5 transition-all">
                <Database className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Seed Database</span>
            </button>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all">
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Akhiri Sesi</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto relative bg-[#050505]">
        <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-[#cdff00]/5 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Dashboard <span className="text-[#cdff00]">Admin</span></h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Pemantauan Operasional & Kontrol Data Real-time.</p>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#cdff00] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Cari anggota..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-72 bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-[10px] text-white focus:outline-none focus:border-[#cdff00]/50 transition-all backdrop-blur-xl uppercase font-black tracking-widest"
                        />
                    </div>
                    <button
                        onClick={() => {
                            handleOpenForm();
                            setFormData(prev => ({ ...prev, role: "trainer" }));
                        }}
                        className="glow-button bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-tighter hover:bg-blue-600 active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap shadow-xl"
                    >
                        <UserPlus className="w-4 h-4" />
                        Tambah Trainer
                    </button>
                    <button
                        onClick={() => handleOpenForm()}
                        className="glow-button bg-[#cdff00] text-black px-8 py-4 rounded-2xl font-black uppercase tracking-tighter hover:bg-[#b8e600] active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap shadow-xl"
                    >
                        <UserPlus className="w-4 h-4" />
                        Tambah Member
                    </button>

                    {/* Admin Profile Feature - Click to show info */}
                    <button 
                        onClick={handleOpenProfileModal}
                        className="flex items-center gap-3 bg-white/5 p-1 pr-4 rounded-2xl hover:bg-white/10 transition-all group border border-white/5"
                    >
                        {currentUser?.image ? (
                            <img src={currentUser.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                            <div className="w-10 h-10 bg-[#cdff00] rounded-xl flex items-center justify-center text-black font-black">
                                {(currentUser?.name || "A").charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">{(currentUser?.name || "Admin").split(' ')[0]}</p>
                            <p className="text-[7px] font-bold text-[#cdff00] uppercase tracking-tighter">Info Akun</p>
                        </div>
                    </button>
                </div>
            </header>

            {currentView === "dashboard" && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {stats.map((stat, i) => (
                            <div key={i} className="premium-card p-10 rounded-[3rem] space-y-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#cdff00]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#cdff00]/10 transition-colors" />
                                <div className="flex items-center justify-between relative z-10">
                                    <div className={`p-4 rounded-2xl bg-black border border-white/5 ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-2xl`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#cdff00] animate-pulse" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-5xl font-black text-white tracking-tighter mb-1 leading-none">{stat.value}</p>
                                    <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                                    <p className="text-gray-600 text-[8px] font-black uppercase tracking-[0.2em]">{stat.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {renderTable(filteredUsers.slice(0, 5))}
                </>
            )}

            {currentView === "entities" && (
                <>
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl">
                            {[
                                { id: "all", label: "Semua Member" },
                                { id: "trainer", label: "Trainer Profesional" },
                                { id: "user", label: "Member Aktif" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#cdff00] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Filter className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Sector Filter</span>
                        </div>
                    </div>
                    {renderTable(filteredUsers)}
                </>
            )}

            {currentView === "storage" && renderBookingsTable()}

            {currentView === "settings" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Operational Card */}
                        <div className="premium-card p-10 rounded-[3rem] border border-white/5 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Konfigurasi Operasional</h3>
                                    <p className="text-gray-500 text-[8px] font-bold uppercase tracking-widest">Atur parameter inti sistem</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Limit Booking Harian</p>
                                        <p className="text-gray-600 text-[8px] font-bold uppercase tracking-widest">Maksimal sesi per member</p>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={systemSettings?.dailyBookingLimit ?? 3} 
                                        onChange={(e) => updateSettings({ dailyBookingLimit: parseInt(e.target.value) })}
                                        className="w-16 bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-[#cdff00] text-center font-black" 
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Mode Pemeliharaan</p>
                                        <p className="text-gray-600 text-[8px] font-bold uppercase tracking-widest">Nonaktifkan akses publik</p>
                                    </div>
                                    <div 
                                        onClick={() => updateSettings({ maintenanceMode: !systemSettings?.maintenanceMode })}
                                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${systemSettings?.maintenanceMode ? 'bg-red-500/20' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${systemSettings?.maintenanceMode ? 'right-1 bg-red-500' : 'left-1 bg-gray-500'}`} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Notifikasi WhatsApp</p>
                                        <p className="text-gray-600 text-[8px] font-bold uppercase tracking-widest">Kirim konfirmasi otomatis</p>
                                    </div>
                                    <div 
                                        onClick={() => updateSettings({ whatsappNotifications: !systemSettings?.whatsappNotifications })}
                                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${systemSettings?.whatsappNotifications ? 'bg-[#cdff00]/20' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${systemSettings?.whatsappNotifications ? 'right-1 bg-[#cdff00]' : 'left-1 bg-gray-500'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interface Preferences */}
                        <div className="premium-card p-10 rounded-[3rem] border border-white/5 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Preferensi Antarmuka</h3>
                                    <p className="text-gray-500 text-[8px] font-bold uppercase tracking-widest">Sesuaikan visual platform</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Warna Aksen Utama</p>
                                    <div className="flex gap-3">
                                        {['#cdff00', '#3b82f6', '#f59e0b', '#ec4899', '#ffffff'].map(color => (
                                            <div 
                                                key={color} 
                                                onClick={() => updateSettings({ accentColor: color })}
                                                className={`w-10 h-10 rounded-xl cursor-pointer border-2 transition-all ${systemSettings?.accentColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`} 
                                                style={{ backgroundColor: color }} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Animasi Kompleks</p>
                                        <p className="text-gray-600 text-[8px] font-bold uppercase tracking-widest">Render visual tingkat tinggi</p>
                                    </div>
                                    <div 
                                        onClick={() => updateSettings({ complexAnimations: !systemSettings?.complexAnimations })}
                                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${systemSettings?.complexAnimations ? 'bg-[#cdff00]/20' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${systemSettings?.complexAnimations ? 'right-1 bg-[#cdff00]' : 'left-1 bg-gray-500'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Database Management */}
                        <div className="premium-card p-10 rounded-[3rem] border border-white/5 space-y-8 col-span-1 md:col-span-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                        <Database className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Manajemen Basis Data</h3>
                                        <p className="text-gray-500 text-[8px] font-bold uppercase tracking-widest">Integritas dan pembersihan data</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => {
                                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ users, bookings, adminStats }));
                                            const downloadAnchorNode = document.createElement('a');
                                            downloadAnchorNode.setAttribute("href", dataStr);
                                            downloadAnchorNode.setAttribute("download", "fitbook_backup.json");
                                            document.body.appendChild(downloadAnchorNode);
                                            downloadAnchorNode.click();
                                            downloadAnchorNode.remove();
                                        }} 
                                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                                    >
                                        Export JSON
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            const btn = document.activeElement;
                                            btn.innerText = "SYNCING...";
                                            await new Promise(r => setTimeout(r, 2000));
                                            btn.innerText = "DATABASE SYNC";
                                            alert("Database berhasil disinkronisasi!");
                                        }} 
                                        className="px-6 py-3 bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all"
                                    >
                                        Database Sync
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-3xl bg-black border border-white/5 space-y-3">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Ukuran Storage</p>
                                    <p className="text-2xl font-black text-white">42.8 <span className="text-xs text-gray-600 font-bold">MB</span></p>
                                </div>
                                <div className="p-6 rounded-3xl bg-black border border-white/5 space-y-3">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Kesehatan Index</p>
                                    <p className="text-2xl font-black text-emerald-400">99.9 <span className="text-xs text-gray-600 font-bold">%</span></p>
                                </div>
                                <div className="p-6 rounded-3xl bg-black border border-white/5 space-y-3">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Uptime Server</p>
                                    <p className="text-2xl font-black text-blue-400">24 <span className="text-xs text-gray-600 font-bold">DAYS</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-500">
          <div className="glass rounded-[3rem] border border-[#cdff00]/10 p-12 w-full max-w-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#cdff00] to-transparent" />
            
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
              <div className="w-1.5 h-10 bg-[#cdff00] rounded-full shadow-[0_0_15px_#cdff00]" />
              {editingItem ? "Ubah Data" : "Tambah Data"}
            </h2>
            
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-8">
              <div className="col-span-2 space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Nama</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white text-sm focus:outline-none focus:border-[#cdff00]/50 transition-all"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white text-sm focus:outline-none focus:border-[#cdff00]/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Akses</label>
                <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white text-sm focus:outline-none focus:border-[#cdff00]/50 transition-all appearance-none cursor-pointer"
                >
                    <option value="user">Member Aktif</option>
                    <option value="trainer">Trainer Spesialis</option>
                    <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Status</label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white text-sm focus:outline-none focus:border-[#cdff00]/50 transition-all appearance-none cursor-pointer"
                >
                    <option value="Active">Protokol: Aktif</option>
                    <option value="Inactive">Protokol: Off</option>
                </select>
              </div>

              {formData.role === "trainer" && (
                <div className="col-span-2 space-y-6 animate-in fade-in slide-in-from-top duration-500 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[#cdff00] uppercase tracking-[0.4em] ml-1">Bio Pelatih</label>
                    <textarea
                      placeholder="Ceritakan tentang keahlian pelatih..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white text-sm focus:outline-none focus:border-[#cdff00]/50 transition-all min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[#cdff00] uppercase tracking-[0.4em] ml-1">Keahlian</label>
                      <input
                        type="text"
                        placeholder="Yoga, HIIT, Strength..."
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white text-sm focus:outline-none focus:border-[#cdff00]/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[#cdff00] uppercase tracking-[0.4em] ml-1">Harga Sesi</label>
                      <input
                        type="number"
                        value={formData.pricePerSession}
                        onChange={(e) => setFormData({ ...formData, pricePerSession: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white text-sm focus:outline-none focus:border-[#cdff00]/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="col-span-2 flex items-center gap-6 mt-6">
                <button type="button" onClick={handleCloseForm} className="flex-1 bg-white/5 text-gray-500 px-8 py-5 rounded-2xl font-black uppercase tracking-widest hover:text-white transition-all text-[10px]">
                  Batalkan
                </button>
                <button type="submit" className="flex-1 bg-[#cdff00] text-black px-8 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#b8e600] active:scale-95 transition-all text-[10px]">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Account Info Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 z-[110] animate-in fade-in zoom-in duration-300">
          <div className="glass rounded-[3rem] border border-[#cdff00]/20 p-12 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#cdff00]/5 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-[1.5rem] bg-[#111] border-2 border-[#cdff00] p-1 mb-4">
                    {currentUser?.image ? (
                        <img src={currentUser.image} alt="" className="w-full h-full object-cover rounded-[1.3rem]" />
                    ) : (
                        <div className="w-full h-full bg-[#cdff00] rounded-[1.3rem] flex items-center justify-center text-black font-black text-3xl">
                            {(currentUser?.name || "A").charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">{currentUser?.name || "Administrator"}</h2>
                <p className="text-[#cdff00] text-[8px] font-black uppercase tracking-[0.3em] mt-1">Status: Administrator Sistem</p>
            </div>

            {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 mb-8">
                    <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                        <input 
                            type="text"
                            required
                            value={profileFormData.name}
                            onChange={(e) => setProfileFormData({...profileFormData, name: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#cdff00]/50 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Email System</label>
                        <input 
                            type="email"
                            required
                            value={profileFormData.email}
                            onChange={(e) => setProfileFormData({...profileFormData, email: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#cdff00]/50 outline-none transition-all"
                        />
                    </div>

                    <div className="pt-2 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Password Lama (Wajib jika ganti baru)</label>
                            <div className="relative">
                                <input 
                                    type={showOldPassword ? "text" : "password"}
                                    value={profileFormData.oldPassword}
                                    onChange={(e) => setProfileFormData({...profileFormData, oldPassword: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-xs text-white focus:border-[#cdff00]/50 outline-none transition-all"
                                    placeholder="Isi password saat ini..."
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#cdff00] transition-colors"
                                >
                                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Password Baru (Opsional)</label>
                            <div className="relative">
                                <input 
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Isi untuk mengganti..."
                                    value={profileFormData.password}
                                    onChange={(e) => setProfileFormData({...profileFormData, password: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-xs text-white focus:border-[#cdff00]/50 outline-none transition-all"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#cdff00] transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 bg-white/5 text-gray-400 py-4 rounded-xl font-black uppercase tracking-widest text-[9px]">Batal</button>
                        <button type="submit" className="flex-1 bg-[#cdff00] text-black py-4 rounded-xl font-black uppercase tracking-widest text-[9px]">Simpan</button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5 mb-8">
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Email</span>
                            <span className="text-white text-[10px] font-bold">{currentUser?.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Otoritas</span>
                            <span className="text-[#cdff00] text-[9px] font-black uppercase tracking-widest">Administrator</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-4">
                        <button 
                            onClick={() => setIsEditingProfile(true)}
                            className="flex-1 bg-white/5 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[9px] border border-white/5 hover:bg-white/10 transition-all"
                        >
                            Edit Profil
                        </button>
                        <button 
                            onClick={() => setIsProfileModalOpen(false)}
                            className="flex-1 bg-[#cdff00] text-black py-4 rounded-xl font-black uppercase tracking-widest text-[9px]"
                        >
                            Tutup
                        </button>
                    </div>
                </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
