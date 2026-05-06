import { useState, createContext, useContext } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import JadwalPage from "./pages/JadwalPage";
import Layout from "./components/Layout";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL ?? "https://placeholder.convex.cloud");

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fitbook_user")); } catch { return null; }
  });
  const [page, setPage] = useState(user ? "home" : "login");
  const [bookingTrainer, setBookingTrainer] = useState(null);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("fitbook_user", JSON.stringify(userData));
    setPage("home");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fitbook_user");
    setPage("login");
  };

  const navigate = (p, extra) => {
    if (p === "booking" && extra?.trainer) setBookingTrainer(extra.trainer);
    setPage(p);
  };

  return (
    <ConvexProvider client={convex}>
      <AuthContext.Provider value={{ user, login, logout }}>
        {!user ? (
          page === "login"
            ? <LoginPage onNavigate={navigate} />
            : <RegisterPage onNavigate={navigate} />
        ) : (
          <Layout currentPage={page} onNavigate={navigate} onLogout={logout}>
            {page === "home" && <HomePage onNavigate={navigate} />}
            {page === "booking" && <BookingPage preselectedTrainer={bookingTrainer} onNavigate={navigate} />}
            {page === "jadwal" && <JadwalPage />}
          </Layout>
        )}
      </AuthContext.Provider>
    </ConvexProvider>
  );
}
