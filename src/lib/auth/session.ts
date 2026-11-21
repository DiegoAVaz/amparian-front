import { clearOfflineApiCache } from "@/lib/offline/api-cache";

const ACCESS_KEY = "amparian_access_token";
const REFRESH_KEY = "amparian_refresh_token";
const USER_KEY = "amparian_user";

export type StoredUser = {
  name: string;
  email: string;
};

export function persistSession(
  tokens: { accessToken: string; refreshToken: string },
  user: StoredUser,
): void {
  clearOfflineApiCache();
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_KEY, token);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_KEY, token);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function updateStoredUser(patch: Partial<StoredUser>): StoredUser | null {
  const current = getStoredUser();
  if (!current) return null;
  const next = { ...current, ...patch };
  localStorage.setItem(USER_KEY, JSON.stringify(next));
  return next;
}

// Todo fim de sessão passa por aqui — o logout e a sessão vencida que manda para o login —, então
// é aqui que somem também as leituras guardadas para uso offline.
export function clearSessionStorage(): void {
  clearOfflineApiCache();
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}
