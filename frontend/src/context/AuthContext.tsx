import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import jwt_decode from "jwt-decode";

export type Role = "principal" | "teacher" | "student";

interface DecodedToken {
  id: string;
  role: Role;
  exp: number;
}

interface AuthContextValue {
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readToken(): { token: string | null; role: Role | null } {
  const token = sessionStorage.getItem("token");
  if (!token) return { token: null, role: null };
  try {
    const decoded = jwt_decode<DecodedToken>(token);
    // The backend also rejects an expired token per-request (401/403), but
    // checking the JWT's own exp claim here avoids firing a request we
    // already know will fail.
    if (decoded.exp * 1000 < Date.now()) {
      sessionStorage.removeItem("token");
      return { token: null, role: null };
    }
    return { token, role: decoded.role };
  } catch {
    sessionStorage.removeItem("token");
    return { token: null, role: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ token, role }, setAuth] = useState(readToken);

  const login = useCallback((newToken: string) => {
    sessionStorage.setItem("token", newToken);
    setAuth(readToken());
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    setAuth({ token: null, role: null });
  }, []);

  const value = useMemo(
    () => ({ token, role, isAuthenticated: token !== null, login, logout }),
    [token, role, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
