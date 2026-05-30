// classes/level/columns.tsx
import { Tag, type TableColumnsType } from "antd";
import DataActions from "../../../../components/DataAction";
import type { ILevel } from "../../../../utils/type";

type Handlers = {
  onEdit: (r: ILevel) => void;
  onEnable: (r: ILevel) => void;
  enableLoading?: boolean;
};

export const columns = ({
  onEdit,
  onEnable,
  enableLoading,
}: Handlers): TableColumnsType<ILevel> => [
  {
    title: "Nome da Classe",
    dataIndex: "name",
    key: "name",
    render: (name) => <strong>{name}</strong>,
  },
  {
    title: "Descrição",
    dataIndex: "description",
    key: "description",
    render: (d) => d ?? "—",
  },
  {
    title: "Disciplinas",
    key: "subjects",
    render: (_, record: any) => record._count?.subjects ?? "—",
  },
  {
    title: "Turmas",
    key: "sections",
    render: (_, record: any) => record._count?.sections ?? "—",
  },
  {
    title: "Estado",
    dataIndex: "status",
    key: "status",
    render: (status) => (
      <Tag color={status ? "green" : "red"}>
        {status ? "Activo" : "Desactivado"}
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
        status={record.status}
        enableLoading={enableLoading}
        onEnable={(e) => {
          onEnable(record);
          e.stopPropagation();
        }}
      />
    ),
  },
];
