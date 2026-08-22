// components/AcademicYearSelect.tsx — selector de ano lectivo partilhado
// pelas telas de Professor, Aluno e Encarregado (Fase 2). O valor por
// defeito não vem daqui — vem do próprio pedido de dados (o backend
// devolve o academicYearId que usou, tipicamente o ano activo); este
// componente só lista as opções e reporta a troca.
import { useFetch } from "@/utils/fetch";
import { Select } from "antd";
import type { CSSProperties } from "react";

interface AcademicYearOption {
  id: string;
  year: string;
  active: boolean;
}

// Para telas que não recebem o ano por defeito ecoado por um pedido
// próprio (ex.: um cabeçalho com vários separadores, cada um com o seu
// próprio fetch) — lê a mesma lista já partilhada por AcademicYearSelect
// (mesma queryKey, sem pedido extra) e devolve o id do ano activo.
export function useActiveAcademicYearId(): string | undefined {
  const { data } = useFetch<{ academicYear: AcademicYearOption[] }>(
    ["academic-years-select"],
    "academics?limit=50",
  );
  return data?.academicYear.find((y) => y.active)?.id;
}

export default function AcademicYearSelect({
  value,
  onChange,
  style,
  allowClear,
  clearLabel,
}: {
  value?: string;
  onChange: (id?: string) => void;
  style?: CSSProperties;
  // Só para filtros opcionais (ex.: Facturas, que nunca restringem por
  // defeito) — permite voltar a "sem filtro de ano" depois de escolher um.
  allowClear?: boolean;
  clearLabel?: string;
}) {
  const { data, isPending } = useFetch<{ academicYear: AcademicYearOption[] }>(
    ["academic-years-select"],
    "academics?limit=50",
  );
  const years = data?.academicYear ?? [];

  return (
    <Select
      loading={isPending}
      value={value}
      onChange={onChange}
      allowClear={allowClear}
      placeholder={clearLabel ?? "Ano Lectivo"}
      style={{ width: 160, ...style }}
      options={years.map((y) => ({
        label: y.active ? `${y.year} (activo)` : y.year,
        value: y.id,
      }))}
    />
  );
}
