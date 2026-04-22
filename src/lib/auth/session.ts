const ACCESS_COOKIE = "amparian_access_token";
const REFRESH_COOKIE = "amparian_refresh_token";
const USER_KEY = "amparian_user";
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type StoredUser = {
  name: string;
  email: string;
};

export function persistUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function persistSession(
  tokens: { accessToken: string; refreshToken: string },
  user: StoredUser,
): void {
  setCookie(ACCESS_COOKIE, tokens.accessToken, DEFAULT_MAX_AGE);
  setCookie(REFRESH_COOKIE, tokens.refreshToken, DEFAULT_MAX_AGE);
  persistUser(user);
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_COOKIE);
}

export function setAccessToken(token: string): void {
  setCookie(ACCESS_COOKIE, token, DEFAULT_MAX_AGE);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_COOKIE);
}

export function setRefreshToken(token: string): void {
  setCookie(REFRESH_COOKIE, token, DEFAULT_MAX_AGE);
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

export function clearSessionStorage(): void {
  clearCookie(ACCESS_COOKIE);
  clearCookie(REFRESH_COOKIE);
  localStorage.removeItem(USER_KEY);
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(";").map((part) => part.trim());
  const found = cookies.find((part) => part.startsWith(cookieName));
  if (!found) return null;
  return decodeURIComponent(found.slice(cookieName.length));
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`;
}
