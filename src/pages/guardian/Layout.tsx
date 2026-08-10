import {
  DashboardOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Typography } from "antd";
import { useLocation } from "react-router-dom";
import AppLayout from "../../components/AppLayout";
import { useAuthStore } from "../../store/authStore";

// "Os meus educandos" já é o conteúdo principal do Painel (cards clicáveis
// para /guardian/educandos/:id) — não existe (nem faz falta) uma rota de
// lista à parte, por isso não tem entrada própria no menu.
const menuItems = [
  {
    key: "/guardian",
    icon: <DashboardOutlined />,
    label: "Painel",
  },
  {
    key: "/guardian/mensagens",
    icon: <MessageOutlined />,
    label: "Mensagens",
  },
  {
    key: "/guardian/perfil",
    icon: <UserOutlined />,
    label: "O meu perfil",
  },
];

function getSelectedKey(path: string) {
  if (path.startsWith("/guardian/educandos")) return "/guardian";
  if (path.startsWith("/guardian/mensagens")) return "/guardian/mensagens";
  if (path.startsWith("/guardian/perfil")) return "/guardian/perfil";
  return "/guardian";
}

export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const { user } = useAuthStore();

  const siderHeader = (
    <>
      <div
        style={{
          padding: "20px 20px 12px",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        <Typography.Text strong style={{ fontSize: 15, color: "#fff" }}>
          Portal do Encarregado
        </Typography.Text>
      </div>

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
            style={{
              fontSize: 13,
              fontWeight: 500,
              display: "block",
              color: "#fff",
            }}
          >
            {user?.firstName} {user?.lastName}
          </Typography.Text>
          <Typography.Text style={{ fontSize: 11, color: "var(--lg-mc-100)" }}>
            Encarregado
          </Typography.Text>
        </div>
      </div>
    </>
  );

  return (
    <AppLayout
      menuItems={menuItems}
      selectedKey={getSelectedKey(pathname)}
      siderHeader={siderHeader}
      contentStyle={{ background: "var(--color-background-tertiary)" }}
    >
      {children}
    </AppLayout>
  );
}
