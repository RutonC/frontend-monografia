import { Layout, Menu } from "antd";
import { useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../app/index.module.scss";
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
  const navigate = useNavigate();

  return (
    <Layout className={styles.mainLayout}>
      <div className={styles.asideWrapper}>
        <SiderBarHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Sider
          width={siderWidth}
          collapsed={collapsed}
          collapsible
          theme="light"
          trigger={null}
          onCollapse={setCollapsed}
          className={`${styles.aside} ${collapsed ? styles.collapsed : ""}`}
        >
          {!collapsed && siderHeader}

          <Menu
            theme="light"
            mode="inline"
            className={styles.menu}
            items={menuItems}
            selectedKeys={[selectedKey]}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
      </div>

      <Layout
        className={`${styles.contentLayout} ${collapsed ? styles.collapsed : ""}`}
      >
        <Header className={styles.header}>
          <NavBar />
        </Header>

        <Content className={styles.content} style={contentStyle}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
