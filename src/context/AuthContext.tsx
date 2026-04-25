import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getDemoSession, demoSignOut, type DemoAccount } from "../lib/demo-auth";
import type { UserRole } from "../lib/database.types";

interface AuthContextValue {
  user: DemoAccount | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getDemoSession());
    setLoading(false);
  }, []);

  function signOut() {
    demoSignOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
