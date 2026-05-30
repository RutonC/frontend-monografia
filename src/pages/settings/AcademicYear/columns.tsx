// configuracoes/ano-lectivo/columns.tsx
import DataActions from "@/components/DataAction";
import { intl } from "@/utils/intl";
import type { IAcademicYear } from "@/utils/type";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Tag, type TableColumnsType } from "antd";

type Handlers = {
  onEdit: (r: IAcademicYear) => void;
  onEnable: (r: IAcademicYear) => void;
  enableLoading?: boolean;
};

export const columns = ({
  onEdit,
  onEnable,
  enableLoading,
}: Handlers): TableColumnsType<IAcademicYear> => [
  {
    title: "Ano Lectivo",
    dataIndex: "year",
    key: "year",
    render: (year) => <strong>{year}</strong>,
  },
  {
    title: "Início",
    dataIndex: "startDate",
    key: "startDate",
    render: (d) => intl(d),
  },
  {
    title: "Fim",
    dataIndex: "endDate",
    key: "endDate",
    render: (d) => intl(d),
  },
  {
    title: "Estado",
    dataIndex: "active",
    key: "active",
    render: (active) =>
      active ? (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Activo
        </Tag>
      ) : (
        <Tag icon={<CloseCircleOutlined />} color="default">
          Inactivo
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
        status={record.active}
        enableLoading={enableLoading}
        onEnable={(e) => {
          onEnable(record);
          e.stopPropagation();
        }}
      />
    ),
  },
];
