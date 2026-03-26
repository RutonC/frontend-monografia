import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Popconfirm,
  Space,
  Typography,
  type TableColumnsType,
} from "antd";
import { intl } from "../../../utils/intl";
import type { IDepartment } from "../../../utils/type";

type Handlers = {
  onEdit: (r: IDepartment) => void;
  onDelete: (r: IDepartment) => void;
};

export const columns = ({
  onEdit,
  onDelete,
}: Handlers): TableColumnsType<IDepartment> => [
  {
    key: "id",
  },
  {
    title: "Nome do departamento",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Data de crição",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (createdAt: Date) => intl(createdAt),
  },
  {
    title: "Número de funcionários",
    dataIndex: "employeeCount",
    key: "employeeCount",
  },
  {
    title: "Acções",
    key: "action",
    fixed: "right",
    width: "6rem",
    render: (_, { name }) => (
      <Space size="small">
        <Button
          icon={<EditOutlined />}
          onClick={(e) => {
            onEdit(_);
            e.stopPropagation();
          }}
        />
        <Popconfirm
          title={`Remover o departemento ${name}`}
          okText="Sim"
          cancelText="Não"
          description={
            <Typography.Text>
              Tem certeza que pretende remover o <strong>{name}?</strong>
            </Typography.Text>
          }
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              onDelete(_);
              e.stopPropagation();
            }}
          />
        </Popconfirm>
      </Space>
    ),
  },
];

export const dados = [
  {
    key: "1",
    name: "Informático",
    code: "IN001",
    createdAt: new Date("2025-08-28"),
    updatedAt: new Date("2025-08-28"),
    employerLength: 5,
  },
  {
    key: "2",
    name: "Academico",
    code: "AC001",
    updatedAt: new Date("2025-08-28"),
    createdAt: new Date("2025-08-28"),
    employerLength: 7,
  },
  {
    key: "3",
    name: "Financeiro",
    code: "FN001",
    createdAt: new Date("2025-08-28"),
    updatedAt: new Date("2025-08-28"),
    employerLength: 10,
  },
];
