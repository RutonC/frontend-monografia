import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Popconfirm,
  Space,
  Typography,
  type TableColumnsType,
} from "antd";
import type { IEmployee } from "../../../utils/type";

type Handlers = {
  onEdit: (r: IEmployee) => void;
  onDelete: (r: IEmployee) => void;
};

export const columns = ({
  onEdit,
  onDelete,
}: Handlers): TableColumnsType<IEmployee> => [
  {
    title: "Nome",
    dataIndex: "name",
    key: "name",
    render: (_, { user }) => `${user?.firstName} ${user?.lastName}`,
  },
  {
    title: "Departamento",
    dataIndex: "department",
    key: "department",
    render: (_, { department }) => department?.name,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    render: (_, { user }) => user?.email,
  },
  {
    title: "Telefone",
    dataIndex: "phoneNumber",
    key: "phoneNumber",
    render: (_, { user }) => user.phoneNumber,
  },
  {
    title: "Endereço",
    dataIndex: "address",
    key: "address",
    render: (_, { user }) => user.address,
  },
  {
    title: "Função",
    dataIndex: "position",
    key: "position",
  },
  {
    title: "Acções",
    key: "action",
    fixed: "right",
    width: "6rem",
    render: (_, { user }) => (
      <Space size="small">
        <Button
          icon={<EditOutlined />}
          onClick={(e) => {
            onEdit(_);
            e.stopPropagation();
          }}
        />
        <Popconfirm
          title={`Remover o funcionário ${user?.firstName}`}
          okText="Sim"
          cancelText="Não"
          description={
            <Typography.Text>
              Tem certeza que pretende remover o{" "}
              <strong>{user?.firstName}?</strong>
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
