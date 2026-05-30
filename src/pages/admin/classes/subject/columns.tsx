// disciplinas/columns.tsx
import DataActions from "@/components/DataAction";
import type { ISubject } from "@/utils/type";
import { BookOutlined } from "@ant-design/icons";
import { Button, Tag, Tooltip, type TableColumnsType } from "antd";

type Handlers = {
  onEdit: (r: ISubject) => void;
  onAssign: (r: ISubject) => void;
  onDelete: (r: ISubject) => void;
};

export const columns = ({
  onEdit,
  onAssign,
  onDelete,
}: Handlers): TableColumnsType<ISubject> => [
  {
    title: "Nome",
    dataIndex: "name",
    key: "name",
    render: (name) => <strong>{name}</strong>,
  },
  {
    title: "Código",
    dataIndex: "code",
    key: "code",
    render: (code) => (code ? <Tag>{code}</Tag> : "—"),
  },
  {
    title: "Descrição",
    dataIndex: "description",
    key: "description",
    render: (d) => d ?? "—",
    ellipsis: true,
  },
  {
    title: "Classes Associadas",
    key: "levels",
    render: (_, record: any) => {
      const levels = record.levels ?? [];
      if (!levels.length) return <Tag color="warning">Sem classe</Tag>;
      return (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {levels.map((l: any) => (
            <Tag key={l.levelId} color="blue">
              {l.level?.name ?? l.levelId}
            </Tag>
          ))}
        </div>
      );
    },
  },
  {
    title: "Acções",
    key: "actions",
    fixed: "right",
    width: "16rem",
    render: (_, record) => (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Tooltip title="Atribuir a uma classe">
          <Button
            icon={<BookOutlined />}
            onClick={(e) => {
              onAssign(record);
              e.stopPropagation();
            }}
          >
            Atribuir
          </Button>
        </Tooltip>
        <DataActions
          onEdit={(e) => {
            onEdit(record);
            e.stopPropagation();
          }}
          onDelete={(e) => {
            onDelete(record);
            e.stopPropagation();
          }}
          removeMessage={record.name}
          titleRemove="Remover disciplina"
        />
      </div>
    ),
  },
];
