import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import MemoryBridgePage from "./pages/MemoryBridgePage";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/invite/:token" element={<AuthPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <MemoryBridgePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
