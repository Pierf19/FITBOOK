import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut, User, LayoutDashboard, Calendar, Settings, Shield, Activity } from "lucide-react";

export default function Navbar() {
  const { me } = useCurrentUser();
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSignOut() {
    await signOut();
    navigate("/auth", { replace: true });
  }

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-[#cdff00] bg-[#cdff00]/10 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-[#cdff00]/20"
      : "text-gray-500 hover:text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/5";
  };

  return (
    <nav className="sticky top-0 z-[90] glass border-b border-white/5 px-6">
      <div className="max-w-7xl mx-auto py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#cdff00] rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(205,255,0,0.3)]">
            <span className="text-black font-black text-lg leading-none">F</span>
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase group-hover:text-[#cdff00] transition-colors">
            FITBOOK<span className="text-[#cdff00]">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {me && (me.role === "admin" || ["admin@fitbook.com", "adminaulia@gmail.com"].includes(me.email)) ? (
            <Link to="/admin" className={getLinkClass("/admin")}>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Panel Admin
              </div>
            </Link>
          ) : (
            <>
              <Link to="/" className={getLinkClass("/")}>
                <div className="flex items-center gap-2">
                   <LayoutDashboard className="w-3 h-3" />
                   Beranda
                </div>
              </Link>
              <Link to="/trainers" className={getLinkClass("/trainers")}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Booking
                </div>
              </Link>
              {me && (
                <Link to="/dashboard" className={getLinkClass("/dashboard")}>
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Jadwal Latihan
                    </div>
                </Link>
              )}
            </>
          )}

          {me ? (
            <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
              <Link to="/profile" className="flex items-center gap-2 bg-white/5 pr-4 pl-1 py-1 rounded-2xl hover:bg-white/10 transition-all group">
                {me.image ? (
                  <img src={me.image} alt="Profile" className="h-8 w-8 rounded-xl object-cover border border-white/10 group-hover:border-[#cdff00]/50" />
                ) : (
                  <div className="bg-gradient-to-br from-[#cdff00] to-[#b8e600] text-black font-black h-8 w-8 rounded-xl flex items-center justify-center text-xs">
                    {(me.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">{(me.name || "User").split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2.5 rounded-xl bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="bg-[#cdff00] text-black px-6 py-2.5 rounded-2xl hover:bg-[#b8e600] active:scale-95 transition-all font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(205,255,0,0.2)] ml-4"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

