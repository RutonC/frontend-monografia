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
  },
  {
    title: "Turmas Associados",
    dataIndex: "sections",
    key: "sections",
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
