import { DashboardOutlined } from "@ant-design/icons";
import { ConfigProvider, Layout, Menu } from "antd";
import { useEffect, useState } from "react";
import {
  BiBarChart,
  BiBookContent,
  BiCalendar,
  BiCheckCircle,
  BiCog,
  BiCreditCardAlt,
  BiEdit,
  BiFile,
  BiGroup,
  BiMessageRounded,
  BiRadioCircleMarked,
  BiSpreadsheet,
  BiUserPlus,
} from "react-icons/bi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdEventNote } from "react-icons/md";
import { PiStudent } from "react-icons/pi";
import { RiUserSettingsLine } from "react-icons/ri";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import NavBar from "../components/Navbar";

// ── Admin pages ───────────────────────────────────────────────────
import LancamentoNotas from "../pages/admin/Agenda";
import Classes from "../pages/admin/classes";
import Disciplinas from "../pages/admin/classes/subject";
import Dashboard from "../pages/admin/dashboard";
import Departments from "../pages/admin/departments";
import Employee from "../pages/admin/Employee";
import Eventos from "../pages/admin/Event";
import Pagamentos from "../pages/admin/Financial/Payments";
import Encarregados from "../pages/admin/Guardian";
import PautaGlobal from "../pages/admin/Marks";
import Mensagens from "../pages/admin/Message"; // componente partilhado — funciona para admin e professor
import RegistarAssiduidade from "../pages/admin/Presence";
import Horario from "../pages/admin/Schedule";
import Students from "../pages/admin/students";
import AddNewStudent from "../pages/admin/students/add-new";
import EditStudent from "../pages/admin/students/edit";
import StudentProfile from "../pages/admin/students/Profile";
import NovaInscricao from "../pages/admin/Subscription";
import ListaInscricoes from "../pages/admin/Subscription/List";
import ActualizarInscricao from "../pages/admin/Subscription/Update";
import Utilizadores from "../pages/admin/User";
import AnoLectivo from "../pages/settings/AcademicYear";

// ── Teacher pages — nomes conforme as tuas importações ───────────
import TeacherTurmas from "../pages/teacher/Class";
import TeacherDashboard from "../pages/teacher/Dashboard";
import TeacherNotas from "../pages/teacher/Marks";
import TeacherAssiduidade from "../pages/teacher/Presence";
import TeacherHorario from "../pages/teacher/Schedule";
// Mensagens é o mesmo componente partilhado — detecção de papel feita dentro

// ── Old teacher admin pages ───────────────────────────────────────
import Teacher from "../pages/teacher";
import AddTeacher from "../pages/teacher/add-teacher";
import EditTeacher from "../pages/teacher/EditTeacher";
import TeacherProfile from "../pages/teacher/Profile";

// ── Guardian pages ────────────────────────────────────────────────
import GuardianDashboard from "../pages/guardian/Dashboard";
import GuardianLayout from "../pages/guardian/Layout";
import GuardianStudentDetail from "../pages/guardian/StudentDetail";

import Login from "../pages/auth/login";
import NotFound from "../pages/notfound";
import { useAuthStore } from "../store/authStore";
import { getItem } from "../utils/getItem";
import theme from "../utils/theme";
import styles from "./index.module.scss";

const { Content, Header, Sider } = Layout;

// ─────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────

function homeForUser(type?: string): string {
  switch (type) {
    case "TEACHER":
      return "/teacher";
    case "GUARDIAN":
      return "/guardian";
    case "STUDENT":
      return "/student";
    default:
      return "/";
  }
}

// ─────────────────────────────────────────────────────────────────
//  Guards de rota
// ─────────────────────────────────────────────────────────────────

const RedirectAuthenticatedUser = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <>{children}</>;
  return <Navigate to={homeForUser(user?.type)} replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!["ADMIN", "SUPERADMIN"].includes(user?.type ?? ""))
    return <Navigate to={homeForUser(user?.type)} replace />;
  return <>{children}</>;
};

const TeacherRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.type !== "TEACHER")
    return <Navigate to={homeForUser(user?.type)} replace />;
  return <>{children}</>;
};

const GuardianRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.type !== "GUARDIAN")
    return <Navigate to={homeForUser(user?.type)} replace />;
  return <>{children}</>;
};

// ─────────────────────────────────────────────────────────────────
//  Menus
// ─────────────────────────────────────────────────────────────────

function useAdminMenuItems() {
  const { user } = useAuthStore();
  const isSuperAdmin = ["SUPERADMIN", "ADMIN"].includes(user?.type ?? "");

  return [
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
      <Disciplinas />,
    ),
    getItem("Inscrições", "/inscricao", <PiStudent size={20} />, null, [
      getItem(
        "Nova Inscrição",
        "/inscricao/nova",
        <BiRadioCircleMarked />,
        <NovaInscricao />,
      ),
      getItem(
        "Actualizar Inscrição",
        "/inscricao/actualizar",
        <BiRadioCircleMarked />,
        <ActualizarInscricao />,
      ),
      getItem(
        "Lista de Inscrições",
        "/inscricao/lista",
        <BiRadioCircleMarked />,
        <ListaInscricoes />,
      ),
    ]),
    getItem("Horário", "/horario", <BiCalendar size={20} />, <Horario />),
    getItem("Notas", "/notas", <BiBarChart size={20} />, null, [
      getItem(
        "Lançamento",
        "/notas/lancamento",
        <BiRadioCircleMarked />,
        <LancamentoNotas />,
      ),
      getItem(
        "Pauta Global",
        "/notas/pauta",
        <BiRadioCircleMarked />,
        <PautaGlobal />,
      ),
    ]),
    getItem(
      "Assiduidade",
      "/assiduidade",
      <BiCheckCircle size={20} />,
      <RegistarAssiduidade />,
    ),
    getItem("Financeiro", "/financeiro", <BiCreditCardAlt size={20} />, null, [
      getItem(
        "Pagamentos",
        "/pagamentos",
        <BiRadioCircleMarked />,
        <Pagamentos />,
      ),
      getItem(
        "Mensalidades",
        "/mensalidades",
        <BiRadioCircleMarked />,
        <>Mensalidades</>,
      ),
      getItem("Faturas", "/faturas", <BiRadioCircleMarked />, <>Faturas</>),
    ]),
    getItem("Eventos", "/eventos", <MdEventNote size={20} />, <Eventos />),
    getItem(
      "Mensagens",
      "/mensagens",
      <BiMessageRounded size={20} />,
      <Mensagens />,
    ),
    getItem(
      "Encarregados",
      "/encarregados",
      <BiGroup size={20} />,
      <Encarregados />,
    ),
    ...(isSuperAdmin
      ? [
          getItem(
            "Utilizadores",
            "/utilizadores",
            <RiUserSettingsLine size={20} />,
            <Utilizadores />,
          ),
        ]
      : []),
    getItem("Relatórios", "/relatorios", <BiFile size={20} />, <>Relatórios</>),
    getItem("Configurações", "/configuracoes", <BiCog size={20} />, null, [
      getItem("Escola", "/escola", <BiRadioCircleMarked />, <>Escola</>),
      getItem(
        "Ano Lectivo",
        "/ano-lectivo",
        <BiRadioCircleMarked />,
        <AnoLectivo />,
      ),
    ]),
  ];
}

/**
 * Menu do professor — keys são paths completos para o navigate() funcionar.
 * As routes internas do TeacherLayout fazem o strip do prefixo /teacher.
 */
function useTeacherMenuItems() {
  return [
    getItem("Painel", "/teacher", <DashboardOutlined />, <TeacherDashboard />),
    getItem(
      "Minhas Turmas",
      "/teacher/turmas",
      <BiSpreadsheet size={20} />,
      <TeacherTurmas />,
    ),
    getItem(
      "Notas",
      "/teacher/notas",
      <BiBarChart size={20} />,
      <TeacherNotas />,
    ),
    getItem(
      "Assiduidade",
      "/teacher/assiduidade",
      <BiCheckCircle size={20} />,
      <TeacherAssiduidade />,
    ),
    getItem(
      "Horário",
      "/teacher/horario",
      <BiCalendar size={20} />,
      <TeacherHorario />,
    ),
    // Mensagens — mesmo componente partilhado; isGuardian=false para professor
    getItem(
      "Mensagens",
      "/teacher/mensagens",
      <BiMessageRounded size={20} />,
      <Mensagens />,
    ),
  ];
}

// ─────────────────────────────────────────────────────────────────
//  Selected key helpers
// ─────────────────────────────────────────────────────────────────

function getAdminSelectedKey(pathname: string): string {
  if (pathname.startsWith("/professores")) return "/professores";
  if (pathname.startsWith("/alunos")) return "/alunos";
  if (pathname.startsWith("/funcionarios")) return "/funcionarios";
  if (pathname.startsWith("/disciplinas")) return "/disciplinas";
  if (pathname.startsWith("/turmas")) return "/turmas-e-classes";
  if (pathname.startsWith("/inscricao/nova")) return "/inscricao/nova";
  if (pathname.startsWith("/inscricao/actualizar"))
    return "/inscricao/actualizar";
  if (pathname.startsWith("/inscricao/lista")) return "/inscricao/lista";
  if (pathname.startsWith("/horario")) return "/horario";
  if (pathname.startsWith("/notas/pauta")) return "/notas/pauta";
  if (pathname.startsWith("/notas")) return "/notas/lancamento";
  if (pathname.startsWith("/assiduidade")) return "/assiduidade";
  if (pathname.startsWith("/pagamentos")) return "/pagamentos";
  if (pathname.startsWith("/eventos")) return "/eventos";
  if (pathname.startsWith("/mensagens")) return "/mensagens";
  if (pathname.startsWith("/encarregados")) return "/encarregados";
  if (pathname.startsWith("/utilizadores")) return "/utilizadores";
  if (pathname.startsWith("/ano-lectivo")) return "/ano-lectivo";
  if (pathname.startsWith("/escola")) return "/escola";
  return pathname;
}

function getTeacherSelectedKey(pathname: string): string {
  if (pathname === "/teacher") return "/teacher";
  if (pathname.startsWith("/teacher/turmas")) return "/teacher/turmas";
  if (pathname.startsWith("/teacher/notas")) return "/teacher/notas";
  if (pathname.startsWith("/teacher/assiduidade"))
    return "/teacher/assiduidade";
  if (pathname.startsWith("/teacher/horario")) return "/teacher/horario";
  if (pathname.startsWith("/teacher/mensagens")) return "/teacher/mensagens";
  return "/teacher";
}

// ─────────────────────────────────────────────────────────────────
//  Layout base reutilizável
// ─────────────────────────────────────────────────────────────────

interface AppLayoutProps {
  menuItems: any[];
  selectedKey: string;
  children: React.ReactNode;
}

function AppLayout({ menuItems, selectedKey, children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: "100vh" }} className={styles.mainLayout}>
      <Sider
        width={280}
        collapsed={collapsed}
        collapsible
        theme="light"
        trigger={null}
        onCollapse={setCollapsed}
        className={`${styles.aside} ${collapsed ? styles.collapsed : ""}`}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          top: 0,
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
          selectedKeys={[selectedKey]}
          onClick={({ key }) => navigate(key)}
          style={{
            overflow: "auto",
            height: "80vh",
            position: "sticky",
            bottom: 40,
            scrollbarWidth: "thin",
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
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
}

// ─────────────────────────────────────────────────────────────────
//  AdminLayout
// ─────────────────────────────────────────────────────────────────

const adminExtraRoutes = [
  {
    key: "add-student",
    path: "/alunos/adicionar-novo-aluno",
    element: <AddNewStudent />,
  },
  { key: "edit-student", path: "/alunos/editar/:id", element: <EditStudent /> },
  {
    key: "student-profile",
    path: "/alunos/perfil/:id",
    element: <StudentProfile />,
  },
  {
    key: "add-teacher",
    path: "/professores/adicionar-novo-professor",
    element: <AddTeacher />,
  },
  {
    key: "edit-teacher",
    path: "/professores/editar/:id",
    element: <EditTeacher />,
  },
  {
    key: "teacher-profile",
    path: "/professores/perfil/:slug",
    element: <TeacherProfile />,
  },
];

function AdminLayout() {
  const { pathname } = useLocation();
  const menuItems = useAdminMenuItems();
  const selectedKey = getAdminSelectedKey(pathname);
  const cc = styles.contentLayout;

  const wrap = (el: React.ReactNode) => (
    <AdminRoute>
      <Content className={cc}>{el}</Content>
    </AdminRoute>
  );

  return (
    <AppLayout menuItems={menuItems} selectedKey={selectedKey}>
      <Routes>
        {menuItems.map((item) => (
          <Route
            key={`m-${item?.key}`}
            path={item?.key?.toString()}
            element={wrap(item?.element)}
          />
        ))}
        {menuItems.flatMap((item) =>
          (item?.children ?? []).map((sub: any) => (
            <Route
              key={`s-${sub?.key}`}
              path={sub?.key?.toString()}
              element={wrap(sub?.element)}
            />
          )),
        )}
        {adminExtraRoutes.map((r) => (
          <Route key={r.key} path={r.path} element={wrap(r.element)} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
//  TeacherLayout
//  — montado em /teacher/*
//  — os paths das <Route> são RELATIVOS a /teacher/ (strip do prefixo)
// ─────────────────────────────────────────────────────────────────

function TeacherLayout() {
  const { pathname } = useLocation();
  const menuItems = useTeacherMenuItems();
  const selectedKey = getTeacherSelectedKey(pathname);
  const cc = styles.contentLayout;

  const wrap = (el: React.ReactNode) => (
    <TeacherRoute>
      <Content className={cc}>{el}</Content>
    </TeacherRoute>
  );

  return (
    <AppLayout menuItems={menuItems} selectedKey={selectedKey}>
      <Routes>
        {/* index → /teacher */}
        <Route index element={wrap(<TeacherDashboard />)} />

        {/* sub-rotas → /teacher/turmas, /teacher/notas, etc. */}
        <Route path="turmas" element={wrap(<TeacherTurmas />)} />
        <Route path="notas" element={wrap(<TeacherNotas />)} />
        <Route path="assiduidade" element={wrap(<TeacherAssiduidade />)} />
        <Route path="horario" element={wrap(<TeacherHorario />)} />
        <Route path="mensagens" element={wrap(<Mensagens />)} />

        {/* perfil do próprio professor */}
        <Route path="perfil/:slug" element={wrap(<TeacherProfile />)} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
//  App root
// ─────────────────────────────────────────────────────────────────

export default function App() {
  const { getCurrentUser } = useAuthStore();

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <ConfigProvider theme={theme}>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <Login />
            </RedirectAuthenticatedUser>
          }
        />

        {/* Painel do Encarregado */}
        <Route
          path="/guardian"
          element={
            <GuardianRoute>
              <GuardianLayout>
                <GuardianDashboard />
              </GuardianLayout>
            </GuardianRoute>
          }
        />
        <Route
          path="/guardian/educandos/:id"
          element={
            <GuardianRoute>
              <GuardianLayout>
                <GuardianStudentDetail />
              </GuardianLayout>
            </GuardianRoute>
          }
        />
        <Route
          path="/guardian/perfil"
          element={
            <GuardianRoute>
              <GuardianLayout>
                <div style={{ padding: 24 }}>Perfil do Encarregado</div>
              </GuardianLayout>
            </GuardianRoute>
          }
        />
        {/* Mensagens do encarregado — mesmo componente, isGuardian=true detectado dentro */}
        <Route
          path="/guardian/mensagens"
          element={
            <GuardianRoute>
              <GuardianLayout>
                <Mensagens />
              </GuardianLayout>
            </GuardianRoute>
          }
        />

        {/* Painel do Professor — /teacher/* */}
        <Route
          path="/teacher/*"
          element={
            <TeacherRoute>
              <TeacherLayout />
            </TeacherRoute>
          }
        />

        {/* Painel Admin / SUPERADMIN — /* (último, apanha tudo o resto) */}
        <Route path="/*" element={<AdminLayout />} />
      </Routes>
    </ConfigProvider>
  );
}
