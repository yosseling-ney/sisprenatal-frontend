import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../lib/http";
import {
  login as loginService,
  LoginPayload,
  LoginResponse,
  logout as logoutService,
} from "../services/auth.service";
import { PERMISSIONS, Permission, ROLE_PERMISSIONS, Role } from "../config/permissions";

const TOKEN_STORAGE_KEY = "sisprenatal:token";
const USER_STORAGE_KEY = "sisprenatal:user";

export interface AuthContextValue {
  user: LoginResponse["usuario"] | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<LoginResponse["usuario"] | null>(null);

  const hydrateFromStorage = useCallback(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedToken || !storedUser) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      setAuthToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as LoginResponse["usuario"];
      setToken(storedToken);
      setAuthToken(storedToken);
      setUser(parsedUser);
    } catch (error) {
      console.error("No se pudo rehidratar el usuario almacenado", error);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      setAuthToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginService(payload);

      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.usuario));
      setAuthToken(response.token);
      setToken(response.token);
      setUser(response.usuario);

      navigate("/", { replace: true });
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    await logoutService();
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const hasPermission = useCallback(
    (permission: Permission) => {
      if (!user) return false;
      const role = user.rol as Role;
      const permissions = ROLE_PERMISSIONS[role] ?? [];
      return permissions.includes(permission);
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      login,
      logout,
      hasPermission,
    }),
    [user, token, isLoading, login, logout, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AUTH_PERMISSIONS = PERMISSIONS;
