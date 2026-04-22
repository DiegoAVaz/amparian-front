const USER_KEY = "amparian_user";

export type StoredUser = {
  name: string;
  email: string;
};

export function persistUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
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
  localStorage.removeItem(USER_KEY);
}
