import { apiJson } from "@/lib/api";

import { clearSessionStorage } from "./auth/session";

export type { StoredUser } from "./auth/session";
export {
  clearSessionStorage,
  getStoredUser,
  persistUser,
  updateStoredUser,
} from "./auth/session";

/** Remove dados locais não sensíveis da sessão. */
export function clearSession() {
  clearSessionStorage();
}

/** Revoga refresh na API (se possível) e limpa sessão local. */
export async function logoutAndClear(): Promise<void> {
  try {
    await apiJson("/auth/logout", {
      method: "POST",
      json: {},
      auth: false,
    });
  } catch {
    /* falha de rede: ainda assim encerra sessão local */
  }
  clearSession();
}
