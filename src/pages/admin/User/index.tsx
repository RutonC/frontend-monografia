// pages/admin/utilizadores/index.tsx
import {
  HomeOutlined,
  LockOutlined,
  StopOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message
} from "antd";
import { useState } from "react";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { useFetch, useMutationPatch } from "../../../utils/fetch";

const { Text } = Typography;

const TYPE_COLOR: Record<string, string> = {
  ADMIN: "purple",
  SUPERADMIN: "magenta",
  TEACHER: "blue",
  EMPLOYEE: "cyan",
  STUDENT: "green",
  GUARDIAN: "orange",
};

const TYPE_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  SUPERADMIN: "Super Admin",
  TEACHER: "Professor",
  EMPLOYEE: "Funcionário",
  STUDENT: "Aluno",
  GUARDIAN: "Encarregado",
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "success",
  INACTIVE: "default",
  SUSPENDED: "warning",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  SUSPENDED: "Suspenso",
};

export default function Utilizadores() {
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  const queryStr = [
    filterType ? `type=${filterType}` : "",
    filterStatus ? `status=${filterStatus}` : "",
  ]
    .filter(Boolean)
    .join("&");

  const { data, isPending, refetch } = useFetch(
    ["users", filterType ?? "", filterStatus ?? ""],
    `users?${queryStr}`,
  );

  const { mutateAsyncPatch, isPending: changing } = useMutationPatch(
    ["users"],
    "users",
  );

  const users = data?.users ?? [];
  const counts = data?.counts ?? {};

  const handleStatusChange = async (id: string, status: string) => {
    await mutateAsyncPatch({ id, urlParams: "status", body: { status } });
    message.success("Estado actualizado.");
    refetch();
  };

  const typeOptions = [
    { label: "Todos", value: "" },
    { label: "Administrador", value: "ADMIN" },
    { label: "Super Admin", value: "SUPERADMIN" },
    { label: "Professor", value: "TEACHER" },
    { label: "Funcionário", value: "EMPLOYEE" },
    { label: "Aluno", value: "STUDENT" },
    { label: "Encarregado", value: "GUARDIAN" },
  ];

  return (
    <>
      <CustomBreadcrumb
        title="Utilizadores"
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Utilizadores" },
        ]}
      />

      {/* Contagens rápidas por tipo */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}
      >
        {Object.entries(TYPE_LABEL).map(([type, label]) => (
          <Button
            key={type}
            size="small"
            type={filterType === type ? "primary" : "default"}
            onClick={() =>
              setFilterType(filterType === type ? undefined : type)
            }
          >
            {label}
            {counts[type] !== undefined && (
              <Tag
                color={TYPE_COLOR[type]}
                style={{ marginLeft: 6, fontSize: 10, padding: "0 4px" }}
              >
                {counts[type]}
              </Tag>
            )}
          </Button>
        ))}
      </div>

      <Card
        title={
          <Space>
            <Select
              placeholder="Filtrar por tipo"
              options={typeOptions}
              value={filterType ?? ""}
              onChange={(v) => setFilterType(v || undefined)}
              style={{ width: 160 }}
            />
            <Select
              placeholder="Estado"
              allowClear
              onChange={setFilterStatus}
              style={{ width: 130 }}
              options={[
                { label: "Activo", value: "ACTIVE" },
                { label: "Inactivo", value: "INACTIVE" },
                { label: "Suspenso", value: "SUSPENDED" },
              ]}
            />
          </Space>
        }
      >
        <Table
          rowKey="id"
          loading={isPending}
          dataSource={users}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 12 }}
          columns={[
            {
              title: "Utilizador",
              render: (_, r: any) => (
                <Space>
                  <Avatar src={r.avatar} size="small">
                    {r.firstName?.[0]}
                  </Avatar>
                  <div>
                    <Text style={{ fontSize: 13 }}>
                      {r.firstName} {r.lastName}
                    </Text>
                    <br />
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, fontFamily: "monospace" }}
                    >
                      {r.identifier}
                    </Text>
                  </div>
                </Space>
              ),
            },
            {
              title: "E-mail",
              dataIndex: "email",
              render: (v: string) => v ?? "—",
            },
            {
              title: "Tipo",
              render: (_, r: any) => (
                <Tag color={TYPE_COLOR[r.type]}>
                  {TYPE_LABEL[r.type] ?? r.type}
                </Tag>
              ),
            },
            {
              title: "Estado",
              render: (_, r: any) => (
                <Tag color={STATUS_COLOR[r.status]}>
                  {STATUS_LABEL[r.status] ?? r.status}
                </Tag>
              ),
            },
            {
              title: "Registado em",
              render: (_, r: any) =>
                r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString("pt-MZ")
                  : "—",
            },
            {
              title: "Acções",
              fixed: "right",
              width: "12rem",
              render: (_, r: any) => (
                <Space>
                  {r.status === "ACTIVE" && (
                    <Tooltip title="Suspender conta">
                      <Popconfirm
                        title="Suspender este utilizador?"
                        okText="Sim"
                        cancelText="Não"
                        onConfirm={() => handleStatusChange(r.id, "SUSPENDED")}
                      >
                        <Button
                          size="small"
                          icon={<StopOutlined />}
                          danger
                          loading={changing}
                        >
                          Suspender
                        </Button>
                      </Popconfirm>
                    </Tooltip>
                  )}
                  {r.status === "SUSPENDED" && (
                    <Tooltip title="Reactivar conta">
                      <Popconfirm
                        title="Reactivar este utilizador?"
                        okText="Sim"
                        cancelText="Não"
                        onConfirm={() => handleStatusChange(r.id, "ACTIVE")}
                      >
                        <Button
                          size="small"
                          icon={<UnlockOutlined />}
                          loading={changing}
                        >
                          Reactivar
                        </Button>
                      </Popconfirm>
                    </Tooltip>
                  )}
                  {r.status === "INACTIVE" && (
                    <Tooltip title="Activar conta">
                      <Popconfirm
                        title="Activar este utilizador?"
                        okText="Sim"
                        cancelText="Não"
                        onConfirm={() => handleStatusChange(r.id, "ACTIVE")}
                      >
                        <Button
                          size="small"
                          icon={<LockOutlined />}
                          loading={changing}
                        >
                          Activar
                        </Button>
                      </Popconfirm>
                    </Tooltip>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
