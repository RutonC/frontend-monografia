import { DashboardOutlined } from "@ant-design/icons";
import { ConfigProvider, Layout, Menu } from "antd";
import { useEffect, useState } from "react";
import {
  BiBookContent,
  BiCog,
  BiCreditCardAlt,
  BiEdit,
  BiFile,
  BiRadioCircleMarked,
  BiSpreadsheet,
  BiUserPlus,
} from "react-icons/bi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { PiStudent } from "react-icons/pi";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import NavBar from "../components/Navbar";
import Classes from "../pages/admin/classes";
import Dashboard from "../pages/admin/dashboard";
import Departments from "../pages/admin/departments";
import Employee from "../pages/admin/Employee";
import Students from "../pages/admin/students";
import AddNewStudent from "../pages/admin/students/add-new";
import Login from "../pages/auth/login";
import NotFound from "../pages/notfound";
import Teacher from "../pages/teacher";
import TeacherProfile from "../pages/teacher/Profile";
import { useAuthStore } from "../store/authStore";
import { getItem } from "../utils/getItem";
import theme from "../utils/theme";
import styles from "./index.module.scss";

const { Content, Header, Sider } = Layout;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RedirectAuthenticatedUser = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, isAuthenticated } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getCurrentUser, user } = useAuthStore();
  const { pathname } = location;
  const isAuthPage = ["/login", "/*"].some((path) => pathname.startsWith(path));

  const handleMenuClick = ({ key }: any) => {
    if (key) {
      navigate(key);
    }
  };

  const menuItems = [
    getItem("Painel", "/", <DashboardOutlined />, <Dashboard />),

    getItem(
      "Departamentos",
      "/departamentos",
      <BiBookContent size={20} />,
      <Departments />,
    ),
    getItem("Alunos", "/alunos", <PiStudent size={20} />, <Students />),
    getItem(
      "Professores",
      "/professores",
      <FaChalkboardTeacher size={20} />,
      <Teacher />,
    ),
    getItem(
      "Funcionários",
      "/funcionarios",
      <BiUserPlus size={20} />,
      <Employee />,
    ),
    getItem(
      "Turmas & Classes",
      "/turmas-e-classes",
      <BiSpreadsheet size={20} />,
      <Classes />,
    ),
    getItem(
      "Disciplinas",
      "/disciplinas",
      <BiEdit size={20} />,
      <>Disciplinas</>,
    ),

    getItem(
      "Financeiro",
      "/financeiro",
      <BiCreditCardAlt size={20} />,
      <>Financeiro</>,
      [
        getItem(
          "Mensalidades",
          "/mensalidades",
          <BiRadioCircleMarked />,
          <>Mensalidades</>,
        ),
        getItem(
          "Pagamentos",
          "/pagamentos",
          <BiRadioCircleMarked />,
          <>Pagamentos</>,
        ),
        getItem("Faturas", "/faturas", <BiRadioCircleMarked />, <>Faturas</>),
      ],
    ),
    getItem("Relatórios", "/relatoris", <BiFile size={20} />, <>Relatórios</>),

    getItem("Configurações", "/configuracoes", <BiCog size={20} />, null, [
      getItem("Escola", "/escola", <BiRadioCircleMarked />, <>Escola</>),
      getItem(
        "Ano Lectivo",
        "/ano-lectivo",
        <BiRadioCircleMarked />,
        <>Ano Lectivo</>,
      ),
    ]),
  ];

  const getSelectedKey = (path: string) => {
    if (path.startsWith("/alunos/adicionar-novo-aluno")) {
      return "/alunos/adicionar-novo-aluno";
    }

    if (path.startsWith("/professores/perfil")) {
      return "/professores/perfil";
    }

    return path; // fallback normal
  };

  useEffect(() => {
    getCurrentUser();
  }, [user?.id]);

  return (
    <ConfigProvider theme={theme}>
      {isAuthPage ? (
        <Routes>
          <Route
            key="login"
            path="/login"
            element={
              <RedirectAuthenticatedUser>
                <Login />
              </RedirectAuthenticatedUser>
            }
          />
          <Route key="not-found" path="*" element={<NotFound />} />
        </Routes>
      ) : (
        <Layout style={{ minHeight: "100vh" }} className={styles.mainLayout}>
          <Sider
            width={280}
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            collapsible
            theme="light"
            trigger={null}
            className={`${styles.aside} ${collapsed ? styles.collapsed : ""}`}
            style={{
              overflow: "auto",
              height: "100vh",
              position: "sticky",
              top: 0,
              bottom: 0,
              insetInlineStart: 0,
              scrollbarWidth: "thin",
              scrollbarGutter: "stable",
            }}
          >
            <Menu
              theme="light"
              mode="inline"
              className={styles.menu}
              items={menuItems}
              selectedKeys={[getSelectedKey(pathname)]}
              onClick={handleMenuClick}
              style={{
                overflow: "auto",
                height: "80vh",
                position: "sticky",
                bottom: 40,
                insetInlineStart: 0,
                scrollbarWidth: "thin",
                scrollbarColor: "#20b857",
                scrollbarGutter: "stable",
              }}
            />
          </Sider>
          <Layout>
            <Header
              style={{
                position: "sticky",
                top: 0,
                paddingInline: 25,
                zIndex: 1,
                width: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <NavBar collapse={collapsed} setIsCollapse={setCollapsed} />
            </Header>
            <Content>
              <Routes>
                {menuItems.map((item) => (
                  <Route
                    key={`menu-${item?.key}`}
                    path={item?.key?.toString()}
                    element={
                      <ProtectedRoute>
                        <Content
                          className={`${styles.contentLayout} ${collapsed ? styles.folded : ""}`}
                        >
                          {item?.element}
                        </Content>
                      </ProtectedRoute>
                    }
                  />
                ))}

                {menuItems.map((item) =>
                  item?.children?.map((subItem: any) => (
                    <Route
                      key={`menu-${subItem?.key}`}
                      path={subItem?.key?.toString()}
                      element={
                        <ProtectedRoute>
                          <Content
                            className={`${styles.contentLayout} ${collapsed ? styles.folded : ""}`}
                          >
                            {subItem?.element}
                          </Content>
                        </ProtectedRoute>
                      }
                    />
                  )),
                )}

                <Route
                  key={"adicionar-novo-aluno"}
                  path="/alunos/adicionar-novo-aluno"
                  element={
                    <ProtectedRoute>
                      <Content
                        className={`${styles.contentLayout} ${collapsed ? styles.folded : ""}`}
                      >
                        <AddNewStudent />
                      </Content>
                    </ProtectedRoute>
                  }
                />
                <Route
                  key={"perfil-professor"}
                  path="/professores/perfil"
                  element={
                    <ProtectedRoute>
                      <Content
                        className={`${styles.contentLayout} ${collapsed ? styles.folded : ""}`}
                      >
                        <TeacherProfile />
                      </Content>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      )}
    </ConfigProvider>
  );
}

export default App;
