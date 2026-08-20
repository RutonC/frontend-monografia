import { Layout, Menu } from "antd";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../app/index.module.scss";
import { useIsCompactLayout } from "../hooks/useMediaQuery";
import NavBar from "./Navbar";
import SiderBarHeader from "./SiderBarHeader";

const { Content, Header, Sider } = Layout;

interface AppLayoutProps {
  menuItems: any[];
  selectedKey: string;
  children: ReactNode;
  siderWidth?: number;
  /** Conteúdo extra acima do Menu (ex.: cartão de identificação do utilizador) */
  siderHeader?: ReactNode;
  contentStyle?: CSSProperties;
}

export default function AppLayout({
  menuItems,
  selectedKey,
  children,
  siderWidth = 280,
  siderHeader,
  contentStyle,
}: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  // Abaixo de 1024px a barra lateral deixa de fazer parte do layout em
  // flex e passa a um menu deslizante (drawer) sobreposto ao conteúdo —
  // mobileOpen controla só esse estado, independente do "collapsed" do
  // modo desktop (rail colapsado a ícones).
  const isCompact = useIsCompactLayout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Fecha o drawer automaticamente ao voltar para um ecrã largo, para
  // não ficar "aberto" por engano quando o utilizador redimensiona.
  useEffect(() => {
    if (!isCompact) setMobileOpen(false);
  }, [isCompact]);

  const closeMobileMenu = () => {
    if (isCompact) setMobileOpen(false);
  };

  return (
    <Layout className={styles.mainLayout}>
      {isCompact && mobileOpen && (
        <div className={styles.backdrop} onClick={closeMobileMenu} />
      )}

      <div
        className={`${styles.asideWrapper} ${isCompact && mobileOpen ? styles.mobileOpen : ""}`}
      >
        <SiderBarHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Sider
          width={siderWidth}
          collapsed={!isCompact && collapsed}
          collapsible
          theme="light"
          trigger={null}
          onCollapse={setCollapsed}
          className={`${styles.aside} ${!isCompact && collapsed ? styles.collapsed : ""}`}
        >
          {!(!isCompact && collapsed) && siderHeader}

          <Menu
            theme="light"
            mode="inline"
            className={styles.menu}
            items={menuItems}
            selectedKeys={[selectedKey]}
            onClick={({ key }) => {
              navigate(key);
              closeMobileMenu();
            }}
          />
        </Sider>
      </div>

      <Layout
        className={`${styles.contentLayout} ${collapsed ? styles.collapsed : ""}`}
      >
        <Header className={styles.header}>
          <NavBar onToggleSidebar={() => setMobileOpen((v) => !v)} />
        </Header>

        <Content className={styles.content} style={contentStyle}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
