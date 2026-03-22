export type MockUser = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

const USERS_KEY = "amparian_users";

// ── Cookie helpers (client-side only) ────────────────────────

export function setAuthCookie(name: string) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `amparian_auth=${encodeURIComponent(name)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAuthCookie() {
  document.cookie = "amparian_auth=; path=/; max-age=0";
}

// ── Mock user store (localStorage) ───────────────────────────

export function registerUser(user: MockUser): void {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUser(email: string, password: string): MockUser | null {
  // Usuário padrão para testes
  if (email === "bianca@exemplo.com" && password === "123456") {
    return { name: "Bianca Lello", email, phone: "", password };
  }
  return getStoredUsers().find((u) => u.email === email && u.password === password) ?? null;
}

export function emailAlreadyRegistered(email: string): boolean {
  if (email === "bianca@exemplo.com") return true;
  return getStoredUsers().some((u) => u.email === email);
}

function getStoredUsers(): MockUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as MockUser[]) : [];
  } catch {
    return [];
  }
}
