// pages/auth/ChangePassword/index.tsx
// Troca de password forçada no primeiro acesso (mustChangePassword) — a
// mesma acção de "Alterar Password" das Definições Pessoais, mas numa
// página isolada que bloqueia o resto da aplicação até ser concluída.
import { homeForUser } from "@/app/guards";
import { useAuthStore } from "@/store/authStore";
import axiosInstance from "@/utils/axiosInstance";
import { LockOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Card, Flex, Form, Input, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePasswordForced() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (body: { currentPassword: string; newPassword: string }) => {
      const res = await axiosInstance.patch("/auth/change-password", body);
      return res.data;
    },
  });

  const handleSubmit = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setError(null);
    if (values.newPassword !== values.confirmPassword) {
      setError("As passwords não coincidem.");
      return;
    }
    try {
      await mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (user) setUser({ ...user, mustChangePassword: false });
      navigate(homeForUser(user?.type), { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Não foi possível alterar a password.",
      );
    }
  };

  return (
    <Content
      style={{
        backgroundColor: "#F5F5F5",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Card
        style={{
          width: "70%",
          maxWidth: 480,
          backgroundColor: "#fff",
          borderRadius: 0,
          padding: "32px 40px",
        }}
      >
        <Typography.Title level={3} style={{ marginBottom: 8 }}>
          Troca de password obrigatória
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
          Esta é a sua primeira entrada no sistema. Defina uma password
          pessoal antes de continuar.
        </Typography.Paragraph>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 20 }}
          />
        )}

        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Password actual (temporária)"
            name="currentPassword"
            rules={[{ required: true, message: "Indique a password actual." }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item
            label="Nova password"
            name="newPassword"
            rules={[
              { required: true, message: "Indique a nova password." },
              { min: 6, message: "Mínimo de 6 caracteres." },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            label="Confirmar nova password"
            name="confirmPassword"
            rules={[{ required: true, message: "Confirme a nova password." }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            style={{ width: "100%", marginTop: 8 }}
            loading={isPending}
          >
            Alterar Password e Continuar
          </Button>
        </Form>

        <Flex justify="center" style={{ marginTop: 16 }}>
          <Button type="link" onClick={() => logout()}>
            Sair
          </Button>
        </Flex>
      </Card>
    </Content>
  );
}
