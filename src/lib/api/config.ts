/** Base da API (sem barra final). Ex.: http://localhost:3001 */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url || url.trim() === "") {
    return "http://localhost:3001";
  }
  return url.replace(/\/$/, "");
}
