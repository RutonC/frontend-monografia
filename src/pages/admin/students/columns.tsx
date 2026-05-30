// pages/admin/students/columns.tsx
import { Tag, type TableColumnsType } from "antd";
import DataActions from "../../../components/DataAction";
import { intlDate } from "../../../utils/intl";
import type { IStudent } from "../../../utils/type";

type Handlers = {
  onEdit: (r: IStudent) => void;
  onDelete: (r: IStudent) => void;
};

export const columns = ({
  onEdit,
  onDelete,
}: Handlers): TableColumnsType<IStudent> => [
  {
    title: "Nome Completo",
    key: "name",
    render: (_, r) =>
      `${r.user?.firstName ?? ""} ${r.user?.lastName ?? ""}`.trim() || "—",
  },
  {
    title: "Identificador",
    key: "identifier",
    render: (_, r) => (
      <span style={{ fontFamily: "monospace", fontSize: 12 }}>
        {r.user?.identifier ?? "—"}
      </span>
    ),
  },
  {
    title: "Contacto",
    key: "phoneNumber",
    render: (_, r) => r.user?.phoneNumber ?? "—",
  },
  {
    title: "Data de Nascimento",
    key: "birthday",
    // birthday agora vem de user.birthday (schema novo)
    render: (_, r) => (r.user?.birthday ? intlDate(r.user.birthday) : "—"),
  },
  {
    title: "Encarregado",
    key: "guardian",
    render: (_, r) => {
      const g = r.guardian?.user;
      if (!g) return "—";
      return `${g.firstName ?? ""} ${g.lastName ?? ""}`.trim() || "—";
    },
  },
  {
    title: "Estado",
    key: "status",
    render: (_, r) => {
      const s = r.user?.status;
      const map: Record<string, { color: string; label: string }> = {
        ACTIVE: { color: "success", label: "Activo" },
        INACTIVE: { color: "default", label: "Inactivo" },
        SUSPENDED: { color: "warning", label: "Suspenso" },
      };
      const cfg = map[s ?? "ACTIVE"] ?? map.ACTIVE;
      return (
        <Tag color={cfg.color} variant="outlined">
          {cfg.label}
        </Tag>
      );
    },
  },
  {
    title: "Matrícula",
    key: "registrationStatus",
    render: (_, r) => (
      <Tag color={r?.registrationStatus ? "green" : "orange"}>
        {r?.registrationStatus ? "Completa" : "Pendente"}
      </Tag>
    ),
  },
  {
    title: "Acções",
    key: "actions",
    fixed: "right",
    width: "10rem",
    render: (_, record) => (
      <DataActions
        onEdit={(e) => {
          onEdit(record);
          e.stopPropagation();
        }}
        onDelete={(e) => {
          onDelete(record);
          e.stopPropagation();
        }}
        removeMessage={`${record.user?.firstName} ${record.user?.lastName}`}
        titleRemove="Remover aluno"
      />
    ),
  },
];
