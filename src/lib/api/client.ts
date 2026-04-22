import { clearSessionStorage } from "@/lib/auth/session";
import { getApiBaseUrl } from "./config";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type JsonBody = Record<string, unknown> | unknown[] | null;
type ApiFetchOptions = RequestInit & {
  json?: JsonBody;
  auth?: boolean;
  retryOnAuthError?: boolean;
};

let refreshPromise: Promise<"refreshed" | null> | null = null;

async function parseJsonError(res: Response): Promise<never> {
  let message = res.statusText || "Erro na requisição";
  let code: string | undefined;
  try {
    const j = (await res.json()) as { error?: { message?: string; code?: string } };
    if (j?.error?.message) message = j.error.message;
    if (j?.error?.code) code = j.error.code;
  } catch {
    /* ignore */
  }
  throw new ApiError(message, res.status, code);
}

function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `amparian_auth=; path=/; max-age=0; SameSite=Lax${secure}`;
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const current = window.location.pathname;
  const publicPaths = ["/login", "/criar-conta", "/esqueci-minha-senha"];
  const isPublic = publicPaths.some((path) => current === path || current.startsWith(`${path}/`));
  if (!isPublic) {
    window.location.replace("/login?reason=session-expired");
  }
}

function clearSessionAndRedirect(): void {
  clearSessionStorage();
  clearAuthCookie();
  redirectToLogin();
}

function buildHeaders(init: HeadersInit | undefined, body: JsonBody | undefined): Headers {
  const h = new Headers(init);
  const isJsonBody = body !== undefined && body !== null && typeof body === "object";
  if (isJsonBody && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }
  return h;
}

async function readApiError(res: Response): Promise<{ message: string; code?: string }> {
  let message = res.statusText || "Erro na requisição";
  let code: string | undefined;
  try {
    const j = (await res.json()) as { error?: { message?: string; code?: string } };
    if (j?.error?.message) message = j.error.message;
    if (j?.error?.code) code = j.error.code;
  } catch {
    /* ignore */
  }
  return { message, code };
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        clearSessionAndRedirect();
        return null;
      }

      return "refreshed";
    })().finally(() => {
      refreshPromise = null;
    });
  }

  const result = await refreshPromise;
  return result === "refreshed";
}

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const base = getApiBaseUrl();
  const { json, auth: useBearer = true, retryOnAuthError = true, ...rest } = options;
  const body = json !== undefined ? JSON.stringify(json) : rest.body;
  const headers = buildHeaders(rest.headers, json);

  const url = `${base}/api/v1${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...rest,
    credentials: rest.credentials ?? "include",
    headers,
    body,
  });

  if (res.status === 401 && useBearer && retryOnAuthError) {
    const { code } = await readApiError(res.clone());
    if (code === "UNAUTHORIZED" || code === "TOKEN_EXPIRED") {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const retryHeaders = buildHeaders(rest.headers, json);
        const retryRes = await fetch(url, {
          ...rest,
          credentials: rest.credentials ?? "include",
          headers: retryHeaders,
          body,
        });
        if (retryRes.status === 401) {
          clearSessionAndRedirect();
        }
        if (!retryRes.ok) await parseJsonError(retryRes);
        return retryRes;
      }
      clearSessionAndRedirect();
    }
  }

  if (!res.ok) await parseJsonError(res);
  return res;
}

export async function apiJson<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const res = await apiFetch(path, options);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
