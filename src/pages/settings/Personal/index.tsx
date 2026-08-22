// configuracoes/pessoais/index.tsx — partilhado pelos 6 perfis
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { Input } from "@/components/Input";
import { useAuthStore } from "@/store/authStore";
import axiosInstance from "@/utils/axiosInstance";
import { resolveAssetUrl } from "@/utils/constants";
import { useFetch } from "@/utils/fetch";
import { HomeOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Row,
  Space,
  Table,
  Typography,
  Upload,
  message,
} from "antd";
import ImgCrop from "antd-img-crop";
import { useEffect, useState } from "react";

type NotificationPreferenceRow = {
  type: string;
  web: boolean;
  email: boolean;
};

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  GRADE_POSTED: "Nota lançada",
  INVOICE_OVERDUE: "Factura vencida",
  FINE_APPLIED: "Multa aplicada",
  PAYMENT_CONFIRMED: "Pagamento confirmado",
  NEW_MESSAGE: "Nova mensagem",
  NEW_NEWS: "Nova notícia",
  ENROLLMENT_STATUS_CHANGED: "Estado de matrícula alterado",
  EVENT_CREATED: "Novo evento",
  STUDENT_UNBLOCKED: "Aluno desbloqueado",
  GENERAL: "Geral",
};

const { Text } = Typography;

export default function DefinicoesPessoais() {
  const { user, setUser, getCurrentUser } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  // O Aluno só pode alterar Foto e Password — os restantes dados
  // (nome, contacto, etc.) são geridos pela Secretaria/Admin.
  const isStudent = user?.type === "STUDENT";

  useEffect(() => {
    if (!user) return;
    profileForm.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      address: user.address,
      avatar: user.avatar,
    });
  }, [user, profileForm]);

  const { mutateAsync: uploadAvatar, isPending: uploadingAvatar } = useMutation(
    {
      mutationFn: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "avatars");
        const res = await axiosInstance.post("/assets/upload", formData);
        console.log(res);
        return res.data.url as string;
      },
    },
  );

  const handleAvatarUpload = async ({ file }: { file: File }) => {
    try {
      const url = await uploadAvatar(file);
      profileForm.setFieldValue("avatar", url);
      await axiosInstance.patch("/auth/me", { avatar: url });
      await getCurrentUser();
      message.success("Foto enviada. Guarde para aplicar.");
    } catch {
      message.error("Não foi possível enviar a foto.");
    }
  };

  const { mutateAsync: saveProfile, isPending: savingProfile } = useMutation({
    mutationFn: async (body: any) => {
      const res = await axiosInstance.patch("/auth/me", body);
      return res.data;
    },
    onSuccess: (data) => {
      if (user) setUser({ ...user, ...data.user });
      message.success("Perfil actualizado com sucesso.");
    },
    onError: () => {
      message.error("Não foi possível actualizar o perfil.");
    },
  });

  const { mutateAsync: changePassword, isPending: changingPassword } =
    useMutation({
      mutationFn: async (body: {
        currentPassword: string;
        newPassword: string;
      }) => {
        const res = await axiosInstance.patch("/auth/change-password", body);
        return res.data;
      },
      onSuccess: () => {
        message.success("Password alterada com sucesso.");
        passwordForm.resetFields();
      },
      onError: (error: any) => {
        message.error(
          error?.response?.data?.message ??
            "Não foi possível alterar a password.",
        );
      },
    });

  const avatarUrl = Form.useWatch("avatar", profileForm);

  // ── Preferências de notificação (Fase C) ───────────────────────
  const [preferences, setPreferences] = useState<NotificationPreferenceRow[]>(
    [],
  );
  const { data: preferencesData, isPending: loadingPreferences } = useFetch<{
    success: boolean;
    preferences: NotificationPreferenceRow[];
  }>(["notification-preferences"], "notifications/preferences");

  useEffect(() => {
    if (preferencesData?.preferences)
      setPreferences(preferencesData.preferences);
  }, [preferencesData]);

  const { mutateAsync: savePreferences, isPending: savingPreferences } =
    useMutation({
      mutationFn: async (body: {
        preferences: NotificationPreferenceRow[];
      }) => {
        const res = await axiosInstance.patch(
          "/notifications/preferences",
          body,
        );
        return res.data;
      },
    });

  const toggleChannel = (
    type: string,
    channel: "web" | "email",
    checked: boolean,
  ) => {
    setPreferences((prev) =>
      prev.map((p) => (p.type === type ? { ...p, [channel]: checked } : p)),
    );
  };

  const handleSavePreferences = async () => {
    try {
      await savePreferences({ preferences });
      message.success("Preferências de notificação actualizadas.");
    } catch {
      message.error("Não foi possível guardar as preferências.");
    }
  };

  const handlePasswordSubmit = (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("As passwords não coincidem.");
      return;
    }
    changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <>
      <CustomBreadcrumb
        title="Definições Pessoais"
        items={[{ title: <HomeOutlined /> }, { title: "Definições Pessoais" }]}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Editar Perfil">
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={(values) =>
                saveProfile({
                  firstName: values.firstName,
                  lastName: values.lastName,
                  gender: values.gender,
                  phoneNumber: values.phoneNumber,
                  address: values.address,
                  avatar: values.avatar,
                })
              }
            >
              <Space align="center" style={{ marginBottom: 20 }}>
                <Avatar
                  size={72}
                  shape="square"
                  src={resolveAssetUrl(avatarUrl)}
                  icon={!avatarUrl && <UserOutlined />}
                />
                <ImgCrop
                  rotationSlider
                  zoomSlider
                  aspect={1}
                  cropShape="round"
                  modalTitle="Ajustar foto"
                  showGrid
                >
                  <Upload
                    showUploadList={false}
                    customRequest={({ file }) =>
                      handleAvatarUpload({ file: file as File })
                    }
                  >
                    <Button icon={<UploadOutlined />} loading={uploadingAvatar}>
                      Alterar foto
                    </Button>
                  </Upload>
                </ImgCrop>
              </Space>

              {isStudent && (
                <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12 }}>
                  Os teus dados pessoais são geridos pela Secretaria/Administração — só podes alterar a foto e a password.
                </Text>
              )}
              <Row gutter={16}>
                <Col span={12}>
                  <Input.Text
                    label="Nome"
                    name="firstName"
                    required
                    disabled={isStudent}
                  />
                </Col>
                <Col span={12}>
                  <Input.Text
                    label="Apelido"
                    name="lastName"
                    required
                    disabled={isStudent}
                  />
                </Col>
                <Col span={12}>
                  <Input.Select
                    label="Género"
                    name="gender"
                    disabled={isStudent}
                    options={[
                      { label: "Masculino", value: "MALE" },
                      { label: "Feminino", value: "FEMALE" },
                      { label: "Outro", value: "OTHER" },
                    ]}
                  />
                </Col>
                <Col span={12}>
                  <Input.Text
                    label="Telefone"
                    name="phoneNumber"
                    disabled={isStudent}
                  />
                </Col>
                <Col span={24}>
                  <Input.Text
                    label="Morada"
                    name="address"
                    disabled={isStudent}
                  />
                </Col>
              </Row>

              <Form.Item name="avatar" hidden>
                <input type="hidden" />
              </Form.Item>

              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Identificador: <Text code>{user?.identifier}</Text>
                </Text>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={savingProfile}
                disabled={isStudent}
                style={{ marginTop: 16 }}
              >
                Guardar Perfil
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Alterar Password">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordSubmit}
            >
              <Input.Password
                label="Password actual"
                name="currentPassword"
                required
                message="Indique a password actual"
              />
              <Input.Password
                label="Nova password"
                name="newPassword"
                required
                message="Indique a nova password"
              />
              <Input.Password
                label="Confirmar nova password"
                name="confirmPassword"
                required
                message="Confirme a nova password"
              />
              <Button
                type="primary"
                htmlType="submit"
                loading={changingPassword}
              >
                Alterar Password
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24}>
          <Card
            title="Preferências de Notificação"
            extra={
              <Button
                type="primary"
                loading={savingPreferences}
                onClick={handleSavePreferences}
              >
                Guardar alterações
              </Button>
            }
          >
            <Table<NotificationPreferenceRow>
              rowKey="type"
              loading={loadingPreferences}
              dataSource={preferences}
              pagination={false}
              columns={[
                {
                  title: "Tipo de notificação",
                  dataIndex: "type",
                  render: (type: string) =>
                    NOTIFICATION_TYPE_LABELS[type] ?? type,
                },
                {
                  title: "Web (sino)",
                  align: "center",
                  render: (_, record) => (
                    <Checkbox
                      checked={record.web}
                      onChange={(e) =>
                        toggleChannel(record.type, "web", e.target.checked)
                      }
                    />
                  ),
                },
                {
                  title: "E-mail",
                  align: "center",
                  render: (_, record) => (
                    <Checkbox
                      checked={record.email}
                      onChange={(e) =>
                        toggleChannel(record.type, "email", e.target.checked)
                      }
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
