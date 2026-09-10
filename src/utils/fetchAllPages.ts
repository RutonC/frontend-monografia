// utils/fetchAllPages.ts
//
// Alguns endpoints genéricos de listagem (ex.: /grades, /attendance) usam o
// mesmo limite de paginação de 100 registos por pedido (queryParamsSchema,
// no backend) — uma protecção legítima contra pedidos gigantes, usada em
// todo o sistema. Um relatório, no entanto, precisa dos dados completos
// (ex.: todas as notas de uma turma+disciplina+trimestre), não só da
// primeira página — pedir isso com um `limit=9999` avulso é rejeitado pelo
// Zod (400) em vez de devolver tudo.
//
// Esta função agrega quantas páginas forem precisas (usando o próprio
// `totalSize` que estes endpoints já devolvem), sem alterar o limite
// partilhado no backend.
import { api } from "../store/authStore";

export async function fetchAllPages<T = any>(
  url: string,
  dataKey: string,
): Promise<T[]> {
  const sep = url.includes("?") ? "&" : "?";
  const first = await api.get(`${url}${sep}page=1&limit=100`);
  const items: T[] = [...(first.data?.[dataKey] ?? [])];
  const totalSize: number = first.data?.totalSize ?? 1;

  for (let page = 2; page <= totalSize; page++) {
    const res = await api.get(`${url}${sep}page=${page}&limit=100`);
    items.push(...(res.data?.[dataKey] ?? []));
  }

  return items;
}
