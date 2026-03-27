/** Base da API (sem barra final). Ex.: http://localhost:3001 */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url || url.trim() === "") {
    if (process.env.NODE_ENV !== "production") {
      return "http://localhost:3001";
    }
    throw new Error("NEXT_PUBLIC_API_URL não está configurada no ambiente de produção.");
  }
  return url.replace(/\/$/, "");
}
