export const baseURL = {
  API_URL: import.meta.env.VITE_API_URL,
};

const apiOrigin = baseURL.API_URL.replace(/\/+$/, "");

// Uploads antigos guardam um caminho relativo servido por /public/;
// uploads novos (via /assets/upload, MinIO) já vêm como URL absoluto.
export function resolveAssetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${apiOrigin}/public/${path.replace(/^\/+/, "")}`;
}
