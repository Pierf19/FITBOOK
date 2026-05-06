// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import TrainerListPage from "./pages/TrainerListPage.jsx";
import TrainerDetailPage from "./pages/TrainerDetailPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import { useCurrentUser } from "./hooks/useCurrentUser.js";

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#cdff00] border-t-transparent" />
  </div>
);

function UserRoute({ children }) {
  const { me, loading } = useCurrentUser();
  if (loading) return <Spinner />;
  if (!me) return <Navigate to="/auth" replace />;
  if (me.email === "admin@fitbook.com") return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { me, loading } = useCurrentUser();
  if (loading) return <Spinner />;
  if (!me) return <Navigate to="/auth" replace />;
  if (me.email !== "admin@fitbook.com") return <Navigate to="/" replace />;
  return children;
}

function AuthRoute() {
  const { me, loading } = useCurrentUser();
  if (loading) return <Spinner />;
  if (me) {
    if (me.email === "admin@fitbook.com") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }
  return <AuthPage />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-text)]">
      <Navbar />
      <Routes>
        <Route path="/auth" element={<AuthRoute />} />
        <Route
          path="/"
          element={
            <UserRoute>
              <HomePage />
            </UserRoute>
          }
        />
        <Route
          path="/trainers"
          element={
            <UserRoute>
              <TrainerListPage />
            </UserRoute>
          }
        />
        <Route
          path="/trainers/:trainerId"
          element={
            <UserRoute>
              <TrainerDetailPage />
            </UserRoute>
          }
        />
        <Route
          path="/book/:trainerId"
          element={
            <UserRoute>
              <BookingPage />
            </UserRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <UserRoute>
              <DashboardPage />
            </UserRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <UserRoute>
              <ProfilePage />
            </UserRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
