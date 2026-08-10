// configuracoes/pessoais/index.tsx — partilhado pelos 6 perfis
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { Input } from "@/components/Input";
import { useAuthStore } from "@/store/authStore";
import axiosInstance from "@/utils/axiosInstance";
import { resolveAssetUrl } from "@/utils/constants";
import { HomeOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Row,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import { useEffect } from "react";

const { Text } = Typography;

export default function DefinicoesPessoais() {
  const { user, setUser } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

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

  const { mutateAsync: uploadAvatar, isPending: uploadingAvatar } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axiosInstance.post("/assets/upload", formData);
      return res.data.url as string;
    },
  });

  const handleAvatarUpload = async ({ file }: { file: File }) => {
    try {
      const url = await uploadAvatar(file);
      profileForm.setFieldValue("avatar", url);
      message.success("Foto enviada. Guarde para aplicar.");
    } catch {
      message.error("Não foi possível enviar a foto.");
    }
  };

  const { mutateAsync: saveProfile, isPending: savingProfile } = useMutation({
    mutationFn: async (body: any) => {
      const res = await axiosInstance.put("/auth/me", body);
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

  const { mutateAsync: changePassword, isPending: changingPassword } = useMutation({
    mutationFn: async (body: { currentPassword: string; newPassword: string }) => {
      const res = await axiosInstance.patch("/auth/change-password", body);
      return res.data;
    },
    onSuccess: () => {
      message.success("Password alterada com sucesso.");
      passwordForm.resetFields();
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message ?? "Não foi possível alterar a password.",
      );
    },
  });

  const avatarUrl = Form.useWatch("avatar", profileForm);

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
              </Space>

              <Row gutter={16}>
                <Col span={12}>
                  <Input.Text label="Nome" name="firstName" required />
                </Col>
                <Col span={12}>
                  <Input.Text label="Apelido" name="lastName" required />
                </Col>
                <Col span={12}>
                  <Input.Select
                    label="Género"
                    name="gender"
                    options={[
                      { label: "Masculino", value: "MALE" },
                      { label: "Feminino", value: "FEMALE" },
                      { label: "Outro", value: "OTHER" },
                    ]}
                  />
                </Col>
                <Col span={12}>
                  <Input.Text label="Telefone" name="phoneNumber" />
                </Col>
                <Col span={24}>
                  <Input.Text label="Morada" name="address" />
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
      </Row>
    </>
  );
}
