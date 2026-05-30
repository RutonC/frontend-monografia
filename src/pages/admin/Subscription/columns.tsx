import type { IStudent } from "@/utils/type";
import { Avatar, Flex, Tag, Typography, type TableColumnsType } from "antd";

const { Text } = Typography;

export const columns = (): TableColumnsType<IStudent> => [
  {
    title: "Nome",
    render: (_, r: IStudent) => (
      <Flex align="center" gap={8}>
        <Avatar size="small" src={r.user?.avatar}>
          {r.user?.firstName?.[0]}
        </Avatar>
        <span>
          {r.user?.firstName} {r.user?.lastName}
        </span>
      </Flex>
    ),
  },
  {
    title: "Identificador",
    render: (_, r: IStudent) => (
      <Text code style={{ fontSize: 11 }}>
        {r.user?.identifier}
      </Text>
    ),
  },
  {
    title: "Estado",
    render: (_, r: IStudent) => (
      <Tag color={r.user?.status === "ACTIVE" ? "success" : "default"}>
        {r.user?.status === "ACTIVE" ? "Activo" : "Inactivo"}
      </Tag>
    ),
  },
];
