import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Popconfirm,
  Space,
  Typography,
  type TableColumnsType,
} from "antd";
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
    dataIndex: "name",
    key: "name",
    render: (_, { user: { firstName, lastName } }) =>
      `${firstName} ${lastName}`,
  },
  {
    title: "Contacto",
    dataIndex: "contact",
    key: "contact",
    render: (_, { user: { phoneNumber } }) => phoneNumber,
  },
  {
    title: "Data de nascimento",
    dataIndex: "birthday",
    key: "birthday",
    render: (_, { birthday }) => intlDate(birthday),
  },
  {
    title: "Encarregado",
    dataIndex: "guardianName",
    key: "guardianName",
  },
  {
    title: "Estado de Matrícula",
    dataIndex: "registrationStatus",
    key: "registrationStatus",
  },
  {
    title: "Acções",
    key: "action",
    fixed: "right",
    width: "6rem",
    render: (_, { firstName }) => (
      <Space size="small">
        <Button icon={<EditOutlined />} onClick={() => onEdit(_)} />
        <Popconfirm
          title={`Remover o aluno ${firstName}`}
          okText="Sim"
          cancelText="Não"
          description={
            <Typography.Text>
              Tem certeza que pretende remover o <strong>{firstName}?</strong>
            </Typography.Text>
          }
        >
          <Button danger icon={<DeleteOutlined />} onClick={() => onDelete} />
        </Popconfirm>
      </Space>
    ),
  },
];
