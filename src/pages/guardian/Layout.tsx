import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Avatar, Layout, Menu, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const { Sider, Content, Header } = Layout;

export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuthStore();

  const menuItems = [
    {
      key: "/guardian",
      icon: <DashboardOutlined />,
      label: "Painel",
    },
    {
      key: "/guardian/educandos",
      icon: <TeamOutlined />,
      label: "Os meus educandos",
    },
    {
      key: "/guardian/perfil",
      icon: <UserOutlined />,
      label: "O meu perfil",
    },
  ];

  const getSelectedKey = (path: string) => {
    if (path.startsWith("/guardian/educandos")) return "/guardian/educandos";
    if (path.startsWith("/guardian/perfil")) return "/guardian/perfil";
    return "/guardian";
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        theme="light"
        width={240}
        style={{
          borderRight: "0.5px solid var(--color-border-tertiary)",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Logótipo / nome da escola */}
        <div
          style={{
            padding: "20px 20px 12px",
            borderBottom: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <Typography.Text strong style={{ fontSize: 15 }}>
            Portal do Encarregado
          </Typography.Text>
        </div>

        {/* Avatar do guardian */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "0.5px solid var(--color-border-tertiary)",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Avatar src={user?.avatar} icon={<UserOutlined />} size={36} />
          <div>
            <Typography.Text
              style={{ fontSize: 13, fontWeight: 500, display: "block" }}
            >
              {user?.firstName} {user?.lastName}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              Encarregado
            </Typography.Text>
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey(pathname)]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: "none", paddingTop: 8 }}
        />
      </Sider>

      <Layout>
        <Content style={{ background: "var(--color-background-tertiary)" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

// ─────────────────────────────────────────────────────────────────
// Integração no App.tsx / router
// Adicionar ANTES das rotas protegidas normais:
//
// import GuardianLayout from "../pages/guardian/Layout";
// import GuardianDashboard from "../pages/guardian/Dashboard";
// import GuardianStudentDetail from "../pages/guardian/StudentDetail";
//
// No ProtectedRoute, detectar o tipo de utilizador e redirigir:
//
// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, user } = useAuthStore();
//   if (!isAuthenticated) return <Navigate to="/login" replace />;
//   // Guardians vão para o painel próprio
//   if (user?.type === "GUARDIAN" && !location.pathname.startsWith("/guardian")) {
//     return <Navigate to="/guardian" replace />;
//   }
//   return <>{children}</>;
// };
//
// Rotas do guardian (fora do Layout principal):
// <Route path="/guardian" element={<GuardianLayout><GuardianDashboard /></GuardianLayout>} />
// <Route path="/guardian/educandos/:id" element={<GuardianLayout><GuardianStudentDetail /></GuardianLayout>} />
// <Route path="/guardian/perfil" element={<GuardianLayout>...</GuardianLayout>} />
// ─────────────────────────────────────────────────────────────────
