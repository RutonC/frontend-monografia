// utils/downloadFile.ts — descarrega um ficheiro de um endpoint
// autenticado. `window.open` não serve: não leva o token do interceptor
// axios. Usa a instância `api` (que injecta o Authorization), recebe o
// corpo como blob e força o download com um <a> temporário.
import { api } from "../store/authStore";

function filenameFromDisposition(header?: string): string | null {
  if (!header) return null;
  const match =
    /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(header) ?? null;
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function downloadFile(
  url: string,
  fallbackName: string,
): Promise<void> {
  const res = await api.get(url, { responseType: "blob" });
  const blob = res.data as Blob;
  const name =
    filenameFromDisposition(
      res.headers?.["content-disposition"] as string | undefined,
    ) ?? fallbackName;

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoga no próximo tick — dar tempo ao browser de iniciar o download.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
