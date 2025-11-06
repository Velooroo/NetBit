import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthSuccess, TokenPair, UserPayload } from "../lib/api/auth";
import * as authApi from "../lib/api/auth";

const STORAGE_KEY = "netbit.auth";

interface StoredAuth {
  user: UserPayload;
  tokens: TokenPair;
}

interface AuthContextValue {
  user: UserPayload | null;
  tokens: TokenPair | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: {
    username: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch (error) {
    console.warn("Failed to parse stored auth state", error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function persistAuth(payload: StoredAuth | null) {
  if (!payload) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [tokens, setTokens] = useState<TokenPair | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadStoredAuth();
    if (stored) {
      setUser(stored.user);
      setTokens(stored.tokens);
    }
    setLoading(false);
  }, []);

  const setAuthState = useCallback((payload: AuthSuccess) => {
    setUser(payload.user);
    setTokens(payload.tokens);
    persistAuth({ user: payload.user, tokens: payload.tokens });
  }, []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setTokens(null);
    persistAuth(null);
  }, []);

  const signIn = useCallback(
    async (credentials: { username: string; password: string }) => {
      const result = await authApi.login(credentials);
      setAuthState(result);
    },
    [setAuthState]
  );

  const signOut = useCallback(async () => {
    if (tokens?.refresh_token) {
      try {
        await authApi.logout({ refresh_token: tokens.refresh_token });
      } catch (error) {
        console.warn("Failed to revoke refresh token", error);
      }
    }
    clearAuthState();
  }, [tokens, clearAuthState]);

  const refresh = useCallback(async () => {
    if (!tokens?.refresh_token) {
      throw new Error("Missing refresh token");
    }

    const result = await authApi.refresh({ refresh_token: tokens.refresh_token });
    setAuthState(result);
  }, [tokens, setAuthState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      loading,
      isAuthenticated: Boolean(user && tokens),
      signIn,
      signOut,
      refresh,
    }),
    [user, tokens, loading, signIn, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}