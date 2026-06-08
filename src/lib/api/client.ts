import {
  clearSessionStorage,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/auth/session";
import { getApiBaseUrl } from "./config";

export type ApiErrorFieldDetail = {
  path: string;
  code: string;
  message: string;
};

export type ApiErrorDetails =
  | {
      fields?: ApiErrorFieldDetail[];
      context?: Record<string, unknown>;
    }
  | Record<string, unknown>
  | unknown[]
  | null;

type ApiErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    details?: ApiErrorDetails;
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details: ApiErrorDetails;

  constructor(
    message: string,
    status: number,
    code?: string,
    details: ApiErrorDetails = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  getFieldErrors(): ApiErrorFieldDetail[] {
    return getApiErrorFields(this.details);
  }

  getFieldError(path: string): string | undefined {
    return this.getFieldErrors().find((field) => field.path === path)?.message;
  }

  hasCode(code: string): boolean {
    return this.code === code;
  }
}

type JsonBody = Record<string, unknown> | unknown[] | null;
type ApiFetchOptions = RequestInit & {
  json?: JsonBody;
  auth?: boolean;
  retryOnAuthError?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

function getApiErrorFields(details: ApiErrorDetails): ApiErrorFieldDetail[] {
  if (!details || Array.isArray(details) || typeof details !== "object") {
    return [];
  }

  const fields = (details as { fields?: unknown }).fields;
  if (!Array.isArray(fields)) {
    return [];
  }

  return fields.filter(isApiErrorFieldDetail);
}

function isApiErrorFieldDetail(value: unknown): value is ApiErrorFieldDetail {
  if (!value || typeof value !== "object") {
    return false;
  }

  const field = value as Record<string, unknown>;
  return (
    typeof field.path === "string" &&
    typeof field.code === "string" &&
    typeof field.message === "string"
  );
}

async function readApiError(res: Response): Promise<{
  message: string;
  code?: string;
  details: ApiErrorDetails;
}> {
  let message = res.statusText || "Erro na requisição";
  let code: string | undefined;
  let details: ApiErrorDetails = null;

  try {
    const j = (await res.json()) as ApiErrorEnvelope;
    if (j?.error?.message) message = j.error.message;
    if (j?.error?.code) code = j.error.code;
    if ("details" in (j.error ?? {})) details = j.error?.details ?? null;
  } catch {
    /* ignore */
  }

  return { message, code, details };
}

async function parseJsonError(res: Response): Promise<never> {
  const { message, code, details } = await readApiError(res);
  throw new ApiError(message, res.status, code, details);
}

function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = "amparian_auth=; path=/; max-age=0";
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

function buildHeaders(init: HeadersInit | undefined, body: JsonBody | undefined, sendBearer: boolean): Headers {
  const h = new Headers(init);
  const isJsonBody = body !== undefined && body !== null && typeof body === "object";
  if (isJsonBody && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }
  if (sendBearer) {
    const token = getAccessToken();
    if (token) h.set("Authorization", `Bearer ${token}`);
  }
  return h;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        clearSessionAndRedirect();
        return null;
      }

      const data = (await res.json()) as {
        accessToken: string;
        refreshToken?: string;
      };

      setAccessToken(data.accessToken);
      if (data.refreshToken) setRefreshToken(data.refreshToken);
      return data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const base = getApiBaseUrl();
  const { json, auth: useBearer = true, retryOnAuthError = true, ...rest } = options;
  const body = json !== undefined ? JSON.stringify(json) : rest.body;
  const headers = buildHeaders(rest.headers, json, useBearer);

  const url = `${base}/api/v1${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...rest,
    headers,
    body,
  });

  if (res.status === 401 && useBearer && retryOnAuthError) {
    const { code } = await readApiError(res.clone());
    if (code === "UNAUTHORIZED" || code === "TOKEN_EXPIRED") {
      const nextAccess = await refreshAccessToken();
      if (nextAccess) {
        const retryHeaders = buildHeaders(rest.headers, json, useBearer);
        retryHeaders.set("Authorization", `Bearer ${nextAccess}`);
        const retryRes = await fetch(url, {
          ...rest,
          headers: retryHeaders,
          body,
        });
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
