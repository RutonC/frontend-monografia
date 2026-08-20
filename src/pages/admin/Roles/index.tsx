// pages/admin/Roles/index.tsx — Papéis & Permissões (RBAC dinâmico, Fase A)
import {
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  PlusOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Drawer,
  Empty,
  Form,
  Modal,
  Popconfirm,
  Result,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { Input } from "../../../components/Input";
import { useAuthStore } from "../../../store/authStore";
import {
  useFetch,
  useMutationDel,
  useMutationPatch,
  useMutationPost,
} from "../../../utils/fetch";
import { intl } from "../../../utils/intl";
import type { IPermission, IRole } from "../../../utils/type";

const SUBJECT_LABELS: Record<string, string> = {
  Student: "Alunos",
  Guardian: "Encarregados",
  Teacher: "Professores",
  Employee: "Funcionários",
  Enrollment: "Matrículas",
  Department: "Departamentos",
  News: "Notícias",
  AcademicYear: "Anos Lectivos",
  Term: "Trimestres",
  Subject: "Disciplinas",
  Level: "Classes",
  Section: "Turmas",
  Invoice: "Facturas",
  Payment: "Pagamentos",
  Grade: "Notas",
  Attendance: "Assiduidade",
  TeacherSection: "Atribuições de Turma",
};

function RolesPermissoes() {
  const { user } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [btnTitle, setBtnTitle] = useState("");
  const [form] = Form.useForm();

  const [drawerRoleId, setDrawerRoleId] = useState<string | null>(null);
  const [drawerRoleName, setDrawerRoleName] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<string>
  >(new Set());

  const {
    data: rolesData,
    isPending: loadingRoles,
    refetch: refetchRoles,
  } = useFetch<{ success: boolean; roles: IRole[] }>(["roles"], "roles");

  const { data: catalogData, isPending: loadingCatalog } = useFetch<{
    success: boolean;
    permissions: IPermission[];
  }>(["permissions"], "permissions");

  const {
    data: roleDetailData,
    isPending: loadingDetail,
    refetch: refetchRoleDetail,
  } = useFetch<{ success: boolean; role: IRole }>(
    ["role", drawerRoleId ?? ""],
    "roles",
    { params: drawerRoleId ?? undefined, enabled: !!drawerRoleId },
  );

  const { mutateAsync: mutateAsyncPost, isPending: creating } =
    useMutationPost(["roles"], "roles");
  const { mutateAsyncPatch, isPending: updating } = useMutationPatch(
    ["roles"],
    "roles",
  );
  const { mutateAsyncDel: deleteRole } = useMutationDel(["roles"], "roles");
  const { mutateAsync: assignPermissions, isPending: assigning } =
    useMutationPost(["roles"], "assign-permissions-to-role");
  const { mutateAsyncDel: unassignPermission, isPending: unassigning } =
    useMutationDel(["roles"], "roles");

  const roles = rolesData?.roles ?? [];
  const catalog = catalogData?.permissions ?? [];

  const catalogBySubject = useMemo(() => {
    const groups = new Map<string, IPermission[]>();
    for (const permission of catalog) {
      const list = groups.get(permission.subject) ?? [];
      list.push(permission);
      groups.set(permission.subject, list);
    }
    return groups;
  }, [catalog]);

  useEffect(() => {
    if (!roleDetailData?.role) return;
    setSelectedPermissionIds(
      new Set(roleDetailData.role.permissions?.map((p) => p.id) ?? []),
    );
  }, [roleDetailData]);

  if (user?.type !== "SUPERADMIN") {
    return (
      <Result
        status="403"
        title="Acesso restrito"
        subTitle="Só um Super Administrador pode gerir Papéis & Permissões."
      />
    );
  }

  const onShowCreateModal = () => {
    form.resetFields();
    setTitle("Adicionar novo Papel");
    setBtnTitle("Adicionar");
    setOpen(true);
  };

  const onEditRole = (role: IRole) => {
    form.setFieldsValue({ id: role.id, name: role.name });
    setTitle("Renomear Papel");
    setBtnTitle("Actualizar");
    setOpen(true);
  };

  const onAddNewRole = (values: { name: string }) => {
    mutateAsyncPost({ name: values.name })
      .then(() => {
        message.success("Papel criado com sucesso.");
        refetchRoles();
        setOpen(false);
        form.resetFields();
      })
      .catch((error: any) => {
        message.error(
          error?.response?.data?.message ?? "Não foi possível criar o Papel.",
        );
      });
  };

  const onUpdateRole = (values: { id: string; name: string }) => {
    mutateAsyncPatch({ id: values.id, body: { name: values.name } })
      .then(() => {
        message.success("Papel actualizado.");
        refetchRoles();
        setOpen(false);
        form.resetFields();
      })
      .catch((error: any) => {
        message.error(
          error?.response?.data?.message ??
            "Não foi possível renomear o Papel.",
        );
      });
  };

  const onDeleteRole = (role: IRole) => {
    deleteRole(role.id)
      .then(() => {
        message.success("Papel removido com sucesso.");
        refetchRoles();
      })
      .catch((error: any) => {
        message.error(
          error?.response?.data?.message ??
            "Não foi possível remover o Papel.",
        );
      });
  };

  const onOpenDrawer = (role: IRole) => {
    setDrawerRoleName(role.name);
    setDrawerRoleId(role.id);
  };

  const onCloseDrawer = () => {
    setDrawerRoleId(null);
    setDrawerRoleName("");
    setSelectedPermissionIds(new Set());
  };

  const onToggleChecked = (permissionId: string, checked: boolean) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(permissionId);
      else next.delete(permissionId);
      return next;
    });
  };

  const onSavePermissions = async () => {
    if (!drawerRoleId) return;
    const current = new Set(
      roleDetailData?.role?.permissions?.map((p) => p.id) ?? [],
    );
    const toAdd = [...selectedPermissionIds].filter((id) => !current.has(id));
    const toRemove = [...current].filter(
      (id) => !selectedPermissionIds.has(id),
    );

    try {
      if (toAdd.length > 0) {
        await assignPermissions({
          roleId: drawerRoleId,
          permissionIds: toAdd,
        });
      }
      for (const permissionId of toRemove) {
        await unassignPermission({
          id: drawerRoleId,
          urlParams: `permissions/${permissionId}`,
        });
      }
      message.success("Permissões actualizadas.");
      refetchRoleDetail();
      refetchRoles();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Não foi possível actualizar as permissões.",
      );
    }
  };

  const savingPermissions = assigning || unassigning;

  return (
    <>
      <CustomBreadcrumb
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Papéis & Permissões" },
        ]}
        title="Papéis & Permissões"
      />
      <Card
        title="Papéis dinâmicos"
        extra={
          <Button onClick={onShowCreateModal}>
            <PlusOutlined />
          </Button>
        }
      >
        <Table<IRole>
          rowKey="id"
          loading={loadingRoles}
          dataSource={roles}
          pagination={{ pageSize: 8 }}
          onRow={(record) => ({ onClick: () => onOpenDrawer(record) })}
          columns={[
            { title: "Nome", dataIndex: "name", key: "name" },
            {
              title: "Permissões",
              key: "permissionCount",
              render: (_, r) => <Tag>{r.permissionCount ?? 0}</Tag>,
            },
            {
              title: "Utilizadores",
              key: "userCount",
              render: (_, r) => <Tag>{r.userCount ?? 0}</Tag>,
            },
            {
              title: "Criado em",
              dataIndex: "createdAt",
              key: "createdAt",
              render: (createdAt: string) =>
                createdAt ? intl(createdAt) : "—",
            },
            {
              title: "Acções",
              key: "action",
              fixed: "right",
              width: "12rem",
              render: (_, record) => (
                <Space size="small">
                  <Button
                    icon={<SafetyOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDrawer(record);
                    }}
                  >
                    Permissões
                  </Button>
                  <Button
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditRole(record);
                    }}
                  />
                  <Popconfirm
                    title={`Remover o Papel ${record.name}`}
                    okText="Sim"
                    cancelText="Não"
                    description={
                      <Typography.Text>
                        Isto remove o Papel de todos os utilizadores que o
                        têm atribuído. Tem certeza?
                      </Typography.Text>
                    }
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      onDeleteRole(record);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={open}
        title={title}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        okButtonProps={{ loading: creating || updating }}
        okText={btnTitle}
        cancelText="Cancelar"
        onOk={() =>
          form.validateFields().then((values) => {
            if (values.id) onUpdateRole(values);
            else onAddNewRole(values);
          })
        }
      >
        <Form name="form_role" layout="vertical" form={form}>
          <Input.Id label="ID" name="id" />
          <Input.Text
            label="Nome do Papel"
            name="name"
            placeholder="Ex.: Leitura de Notícias"
            required
            message="Campo obrigatório"
          />
        </Form>
      </Modal>

      <Drawer
        title={
          drawerRoleId ? `Permissões de "${drawerRoleName}"` : "Permissões"
        }
        open={!!drawerRoleId}
        onClose={onCloseDrawer}
        width={520}
        extra={
          <Button
            type="primary"
            loading={savingPermissions}
            onClick={onSavePermissions}
          >
            Guardar alterações
          </Button>
        }
      >
        {loadingDetail || loadingCatalog ? (
          <Empty description="A carregar..." />
        ) : catalog.length === 0 ? (
          <Empty description="Nenhuma permissão disponível." />
        ) : (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {[...catalogBySubject.entries()].map(([subjectKey, perms]) => (
              <Card
                key={subjectKey}
                size="small"
                title={SUBJECT_LABELS[subjectKey] ?? subjectKey}
              >
                <Space direction="vertical">
                  {perms.map((permission) => (
                    <Checkbox
                      key={permission.id}
                      checked={selectedPermissionIds.has(permission.id)}
                      onChange={(e) =>
                        onToggleChecked(permission.id, e.target.checked)
                      }
                    >
                      {permission.label ?? permission.key}
                    </Checkbox>
                  ))}
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </Drawer>
    </>
  );
}

export default RolesPermissoes;
