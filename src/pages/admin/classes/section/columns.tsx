// classes/section/columns.tsx
import DataActions from "@/components/DataAction";
import type { ISection } from "@/utils/type";
import { EyeOutlined } from "@ant-design/icons";
import { Button, Tag, Tooltip, type TableColumnsType } from "antd";

type Handlers = {
  onEdit: (r: ISection) => void;
  onEnable: (r: ISection) => void;
  onViewDetail: (r: ISection) => void;
  enableLoading?: boolean;
};

export const columns = ({
  onEdit,
  onEnable,
  onViewDetail,
  enableLoading,
}: Handlers): TableColumnsType<ISection> => [
  {
    title: "Nome da Turma",
    dataIndex: "name",
    key: "name",
    render: (name) => <strong>{name}</strong>,
  },
  {
    title: "Classe",
    key: "level",
    render: (_, r: any) => r.level?.name ?? "—",
  },
  {
    title: "Ano Lectivo",
    key: "academicYear",
    render: (_, r: any) => r.academicYear?.year ?? "—",
  },
  {
    title: "Alunos / Cap.",
    key: "capacity",
    render: (_, r: any) => {
      const enrolled = r._count?.enrollments ?? 0;
      const total = r.capacity;
      const pct = Math.round((enrolled / total) * 100);
      const color = pct >= 100 ? "red" : pct >= 80 ? "orange" : "green";
      return (
        <Tag color={color}>
          {enrolled} / {total}
        </Tag>
      );
    },
  },
  {
    title: "Professores",
    key: "teachers",
    render: (_, r: any) => r._count?.teacherSections ?? 0,
  },
  {
    title: "Estado",
    dataIndex: "status",
    key: "status",
    render: (status) => (
      <Tag color={status ? "green" : "red"} variant="outlined">
        {status ? "Activo" : "Desactivado"}
      </Tag>
    ),
  },
  {
    title: "Acções",
    key: "actions",
    fixed: "right",
    width: "15rem",
    render: (_, record) => (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Tooltip title="Ver disciplinas e professores">
          <Button
            icon={<EyeOutlined />}
            onClick={(e) => {
              onViewDetail(record);
              e.stopPropagation();
            }}
          >
            Detalhes
          </Button>
        </Tooltip>
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
      </div>
    ),
  },
];
