import { Button, Card, Flex, Form, Input, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";

function Login() {
  const [form] = Form.useForm();
  const { login, error, isLoading } = useAuthStore();

  const handleSubmit = async (values: any) => {
    await login(values);
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
          height: "80%",
          width: "70%",
          backgroundColor: "#fff",
          borderRadius: 0,
          paddingInline: "20%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Form
          layout="vertical"
          name="login_form"
          requiredMark={false}
          form={form}
        >
          <Form.Item label="Nome do utilizador" name="identifier" required>
            <Input />
          </Form.Item>

          <Form.Item label="Palavra-passe" name="password" required>
            <Input.Password />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: "100%" }}
            loading={isLoading}
            onClick={() =>
              form.validateFields().then((values) => handleSubmit(values))
            }
          >
            Entrar
          </Button>
          {error?.data?.success === false && (
            <Typography.Text type="danger">
              {error?.data?.message}
            </Typography.Text>
          )}
        </Form>
      </Card>
      <Flex justify="space-between" style={{ width: "70%", marginTop: 4 }}>
        <span style={{ color: "#757575" }}>
          Copyright 2025. AMS. Todos os direitos reservados.
        </span>
        <Link to={"/aviso-legal"}>Aviso Legal</Link>
      </Flex>
    </Content>
  );
}

export default Login;
