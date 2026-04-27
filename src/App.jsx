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
import { useCurrentUser } from "./hooks/useCurrentUser.js";

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#cdff00] border-t-transparent" />
  </div>
);

function ProtectedRoute({ children }) {
  const { me, loading } = useCurrentUser();
  if (loading) return <Spinner />;
  if (!me) return <Navigate to="/auth" replace />;
  return children;
}

function AuthRoute() {
  const { me, loading } = useCurrentUser();
  if (loading) return <Spinner />;
  if (me) return <Navigate to="/" replace />;
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
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainers"
          element={
            <ProtectedRoute>
              <TrainerListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainers/:trainerId"
          element={
            <ProtectedRoute>
              <TrainerDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:trainerId"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
