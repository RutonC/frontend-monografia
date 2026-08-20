import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Flex, Form, Input, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AvisoLegalModal from "../../../components/AvisoLegalModal";
import { useAuthStore } from "../../../store/authStore";
import styles from "./login.module.scss";

function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [avisoLegalOpen, setAvisoLegalOpen] = useState(false);
  const { login, error, isLoading, isAuthenticated, clearError } =
    useAuthStore();

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values: {
    identifier: string;
    password: string;
  }) => {
    try {
      await login(values);
      navigate("/", { replace: true });
    } catch {
      // O erro já está no store — não precisa de tratamento aqui
    }
  };

  return (
    <Content className={styles.page}>
      <Card className={styles.card}>
        <Typography.Title
          level={3}
          style={{ marginBottom: 32, textAlign: "center" }}
        >
          Entrar no sistema
        </Typography.Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: 20 }}
          />
        )}

        <Form
          layout="vertical"
          name="login_form"
          requiredMark={false}
          form={form}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Identificador ou e-mail"
            name="identifier"
            rules={[{ required: true, message: "Identificador obrigatório." }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Identificador ou e-mail"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="Palavra-passe"
            name="password"
            rules={[{ required: true, message: "Palavra-passe obrigatória." }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            style={{ width: "100%", marginTop: 8 }}
            loading={isLoading}
          >
            Entrar
          </Button>
        </Form>
      </Card>

      <Flex justify="space-between" className={styles.footer}>
        <span style={{ color: "#757575" }}>
          Copyright 2025. AMS. Todos os direitos reservados.
        </span>
        <Typography.Link onClick={() => setAvisoLegalOpen(true)}>
          Aviso Legal
        </Typography.Link>
      </Flex>

      <AvisoLegalModal
        open={avisoLegalOpen}
        onClose={() => setAvisoLegalOpen(false)}
      />
    </Content>
  );
}

export default Login;
