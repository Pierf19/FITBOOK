import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
import { useAuthActions } from "@convex-dev/auth/react";

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
    return location.pathname === path
      ? "text-[#cdff00] border border-[#cdff00] px-4 py-1.5 rounded-md font-medium text-sm transition-colors"
      : "text-gray-400 hover:text-gray-200 font-medium text-sm transition-colors";
  };

  return (
    <nav className="bg-[var(--color-brand-bg)] sticky top-0 z-50 border-b border-[#222]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-[#cdff00] tracking-tighter uppercase">
          FITBOOK
        </Link>

        <div className="flex items-center gap-6">
          {me && me.email === "admin@fitbook.com" ? (
            <Link to="/admin" className={getLinkClass("/admin")}>
              Admin Dashboard
            </Link>
          ) : (
            <>
              <Link to="/" className={getLinkClass("/")}>
                Home
              </Link>
              <Link to="/trainers" className={getLinkClass("/trainers")}>
                Booking
              </Link>
              {me && (
                <Link to="/dashboard" className={getLinkClass("/dashboard")}>
                  Jadwal Saya
                </Link>
              )}
            </>
          )}

          {me ? (
            <div className="flex items-center gap-4 border-l border-[#333] pl-6 ml-2">
              <Link to="/profile" className="flex items-center gap-2 bg-[#1a1a1a] pr-4 rounded-full hover:bg-[#222] transition-all p-1">
                {me.image ? (
                  <img src={me.image} alt="Profile" className="h-7 w-7 rounded-full object-cover border border-[#cdff00]" />
                ) : (
                  <div className="bg-[#cdff00] text-black font-bold h-7 w-7 rounded-full flex items-center justify-center text-xs">
                    {me.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-gray-200 font-medium ml-1">{me.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-400 hover:text-white border border-[#333] px-3 py-1.5 rounded-md transition-colors"
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="bg-[#cdff00] text-black px-5 py-2 rounded-md hover:bg-[#b8e600] transition-colors font-bold text-sm"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
