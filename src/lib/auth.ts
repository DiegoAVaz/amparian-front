import { apiJson } from "@/lib/api";

import { clearSessionStorage, getRefreshToken } from "./auth/session";

export type { StoredUser } from "./auth/session";
export {
  clearSessionStorage,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  persistSession,
  updateStoredUser,
} from "./auth/session";

/** Cookie lido pelo proxy para proteger /home (presença de sessão). */
export function setAuthCookie(displayName: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `amparian_auth=${encodeURIComponent(displayName)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAuthCookie() {
  document.cookie = "amparian_auth=; path=/; max-age=0";
}

/** Remove tokens, dados locais e cookie marcador de sessão. */
export function clearSession() {
  clearSessionStorage();
  clearAuthCookie();
}

/** Revoga refresh na API (se possível) e limpa sessão local. */
export async function logoutAndClear(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    await apiJson("/auth/logout", {
      method: "POST",
      json: refresh ? { refreshToken: refresh } : {},
      auth: false,
    });
  } catch {
    /* falha de rede: ainda assim encerra sessão local */
  }
  clearSession();
}
