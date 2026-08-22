// configuracoes/trimestres/columns.tsx
import DataActions from "@/components/DataAction";
import { intl } from "@/utils/intl";
import type { ITerm } from "@/utils/type";
import type { TableColumnsType } from "antd";

type Handlers = {
  onEdit: (r: ITerm) => void;
};

function fmtPercent(v?: number) {
  return v !== undefined && v !== null ? `${Math.round(v * 100)}%` : "—";
}

export const columns = ({ onEdit }: Handlers): TableColumnsType<ITerm> => [
  {
    title: "Trimestre",
    dataIndex: "name",
    key: "name",
    render: (name) => <strong>{name}</strong>,
  },
  {
    title: "Ano Lectivo",
    key: "academicYear",
    render: (_, r) => r.academicYear?.year ?? "—",
  },
  {
    title: "Início",
    dataIndex: "startDate",
    key: "startDate",
    render: (d) => (d ? intl(d) : "—"),
  },
  {
    title: "Fim",
    dataIndex: "endDate",
    key: "endDate",
    render: (d) => (d ? intl(d) : "—"),
  },
  {
    title: "Mensalidade",
    dataIndex: "monthlyFee",
    key: "monthlyFee",
    render: (v) => (v ? `${Number(v).toFixed(2)} MZN` : "—"),
  },
  {
    title: "Tolerância",
    dataIndex: "gracePeriodDays",
    key: "gracePeriodDays",
    render: (v) => (v !== undefined && v !== null ? `${v} dias` : "—"),
  },
  {
    title: "Multa (1ª/2ª/3ª+ semana)",
    key: "lateFee",
    render: (_, r) =>
      `${fmtPercent(r.lateFeeWeek1Percent)} / ${fmtPercent(r.lateFeeWeek2Percent)} / ${fmtPercent(r.lateFeeWeek3PlusPercent)}`,
  },
  {
    title: "Acções",
    key: "actions",
    fixed: "right",
    width: "6rem",
    render: (_, record) => (
      <DataActions
        onEdit={(e) => {
          onEdit(record);
          e.stopPropagation();
        }}
      />
    ),
  },
];
