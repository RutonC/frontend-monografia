import { Tag, type TableColumnsType } from "antd";
import DataActions from "../../../../components/DataAction";
import type { ISection } from "../../../../utils/type";

type Handlers = {
  onEdit: (r: ISection) => void;
  onEnable: (r: ISection) => void;
  enableLoading?: boolean;
};

export const columns = ({
  onEdit,
  onEnable,
  enableLoading,
}: Handlers): TableColumnsType<ISection> => [
  {
    title: "Nome da Turma",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Estado",
    dataIndex: "status",
    key: "status",
    render: (_, { status }) => (
      <Tag
        variant="outlined"
        styles={{ root: { fontSize: 15, padding: 4, paddingInline: 8 } }}
        color={status ? "green" : "red"}
      >
        {status ? "Activo" : "Desactivado"}
      </Tag>
    ),
  },
  {
    title: "Acções",
    key: "actions",
    fixed: "right",
    width: "7rem",
    render: (_, { status }) => (
      <DataActions
        onEdit={(e) => {
          onEdit?.(_);
          e.stopPropagation();
        }}
        status={status}
        enableLoading={enableLoading}
        onEnable={(e) => {
          onEnable?.(_);
          e.stopPropagation();
        }}
      />
    ),
  },
];
