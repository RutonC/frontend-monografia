// pages/admin/utilizadores/index.tsx
import {
  HomeOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Empty,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { useAuthStore } from "../../../store/authStore";
import {
  useFetch,
  useMutationDel,
  useMutationPatch,
  useMutationPost,
} from "../../../utils/fetch";
import type { IRole } from "../../../utils/type";

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
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.type === "SUPERADMIN";

  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  const [assignRolesUser, setAssignRolesUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(
    new Set(),
  );

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

  const { data: rolesData, isPending: loadingRoles } = useFetch<{
    success: boolean;
    roles: IRole[];
  }>(["roles"], "roles", { enabled: isSuperAdmin });

  const {
    data: userRolesData,
    isPending: loadingUserRoles,
    refetch: refetchUserRoles,
  } = useFetch<{ success: boolean; roles: IRole[] }>(
    ["user-roles", assignRolesUser?.id ?? ""],
    "users",
    {
      params: assignRolesUser ? `${assignRolesUser.id}/roles` : undefined,
      enabled: !!assignRolesUser,
    },
  );

  const { mutateAsync: assignRole, isPending: assigning } = useMutationPost(
    ["user-roles"],
    "assign-roles-to-user",
  );
  const { mutateAsyncDel: unassignRole, isPending: unassigning } =
    useMutationDel(["user-roles"], "users");

  const users = data?.users ?? [];
  const counts = data?.counts ?? {};
  const allRoles = rolesData?.roles ?? [];

  const handleStatusChange = async (id: string, status: string) => {
    await mutateAsyncPatch({ id, urlParams: "status", body: { status } });
    message.success("Estado actualizado.");
    refetch();
  };

  useEffect(() => {
    if (!userRolesData?.roles) return;
    setSelectedRoleIds(new Set(userRolesData.roles.map((r) => r.id)));
  }, [userRolesData]);

  const onOpenAssignRoles = (r: {
    id: string;
    firstName?: string;
    lastName?: string;
  }) => {
    setAssignRolesUser({
      id: r.id,
      name: `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim(),
    });
  };

  const onCloseAssignRoles = () => {
    setAssignRolesUser(null);
    setSelectedRoleIds(new Set());
  };

  const onToggleRole = (roleId: string, checked: boolean) => {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(roleId);
      else next.delete(roleId);
      return next;
    });
  };

  const onSaveRoles = async () => {
    if (!assignRolesUser) return;
    const current = new Set(userRolesData?.roles?.map((r) => r.id) ?? []);
    const toAdd = [...selectedRoleIds].filter((id) => !current.has(id));
    const toRemove = [...current].filter((id) => !selectedRoleIds.has(id));

    try {
      for (const roleId of toAdd) {
        await assignRole({ userId: assignRolesUser.id, roleId });
      }
      for (const roleId of toRemove) {
        await unassignRole({
          id: assignRolesUser.id,
          urlParams: `roles/${roleId}`,
        });
      }
      message.success("Papéis actualizados.");
      refetchUserRoles();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Não foi possível actualizar os Papéis.",
      );
    }
  };

  const savingRoles = assigning || unassigning;

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
                  <Avatar src={r.avatar} shape="square">
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
                <Tag color={TYPE_COLOR[r.type]} variant="outlined">
                  {TYPE_LABEL[r.type] ?? r.type}
                </Tag>
              ),
            },
            {
              title: "Estado",
              render: (_, r: any) => (
                <Tag color={STATUS_COLOR[r.status]} variant="outlined">
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
              width: isSuperAdmin ? "16rem" : "12rem",
              render: (_, r: any) => (
                <Space>
                  {isSuperAdmin && (
                    <Tooltip title="Atribuir Papéis dinâmicos">
                      <Button
                        icon={<SafetyCertificateOutlined />}
                        onClick={() => onOpenAssignRoles(r)}
                      >
                        Papéis
                      </Button>
                    </Tooltip>
                  )}
                  {r.status === "ACTIVE" && (
                    <Tooltip title="Suspender conta">
                      <Popconfirm
                        title="Suspender este utilizador?"
                        okText="Sim"
                        cancelText="Não"
                        onConfirm={() => handleStatusChange(r.id, "SUSPENDED")}
                      >
                        <Button
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
                        <Button icon={<UnlockOutlined />} loading={changing}>
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
                        <Button icon={<LockOutlined />} loading={changing}>
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

      <Modal
        open={!!assignRolesUser}
        title={`Atribuir Papéis — ${assignRolesUser?.name ?? ""}`}
        onCancel={onCloseAssignRoles}
        okText="Guardar"
        cancelText="Cancelar"
        okButtonProps={{ loading: savingRoles }}
        onOk={onSaveRoles}
      >
        {loadingRoles || loadingUserRoles ? (
          <Empty description="A carregar..." />
        ) : allRoles.length === 0 ? (
          <Empty description="Ainda não existem Papéis dinâmicos. Crie um em Papéis & Permissões." />
        ) : (
          <Space direction="vertical">
            {allRoles.map((role) => (
              <Checkbox
                key={role.id}
                checked={selectedRoleIds.has(role.id)}
                onChange={(e) => onToggleRole(role.id, e.target.checked)}
              >
                {role.name}
              </Checkbox>
            ))}
          </Space>
        )}
      </Modal>
    </>
  );
}
