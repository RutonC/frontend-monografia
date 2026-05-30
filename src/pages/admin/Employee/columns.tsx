// pages/admin/Employee/columns.tsx
import { Tag, type TableColumnsType } from "antd";
import DataActions from "../../../components/DataAction";
import type { IEmployee } from "../../../utils/type";

type Handlers = {
  onEdit: (r: IEmployee) => void;
  onDelete: (r: IEmployee) => void;
  onSuspend: (r: IEmployee) => void;
  suspendLoading?: boolean;
};

export const columns = ({
  onEdit,
  onDelete,
  onSuspend,
  suspendLoading,
}: Handlers): TableColumnsType<IEmployee> => [
  {
    title: "Nome",
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
    title: "Departamento",
    key: "department",
    render: (_, r) => r.department?.name ?? "—",
  },
  {
    title: "Cargo",
    dataIndex: "position",
    key: "position",
    render: (v) => v ?? "—",
  },
  {
    title: "E-mail",
    key: "email",
    render: (_, r) => r.user?.email ?? "—",
  },
  {
    title: "Telefone",
    key: "phoneNumber",
    render: (_, r) => r.user?.phoneNumber ?? "—",
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
        status={record.user?.status === "ACTIVE"}
        enableLoading={suspendLoading}
        onEnable={(e) => {
          onSuspend(record);
          e.stopPropagation();
        }}
        removeMessage={`${record.user?.firstName} ${record.user?.lastName}`}
        titleRemove="Remover funcionário"
      />
    ),
  },
];
