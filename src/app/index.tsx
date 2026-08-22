import {
  BellOutlined,
  CalendarOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LockOutlined,
  NotificationOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ConfigProvider, Layout } from "antd";
import { useEffect } from "react";
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
import { Route, Routes, useLocation } from "react-router-dom";

// ── Admin pages ───────────────────────────────────────────────────
// NOTA: os nomes de ficheiro/pasta estavam trocados face ao conteúdo real —
// Agenda/index.tsx é a Pauta (só leitura) e Marks/index.tsx é o Lançamento
// (formulário de entrada de notas). Os imports abaixo corrigem isso; os
// items do menu continuam a apontar para o componente certo.
import PautaGlobal from "../pages/admin/Agenda";
import Classes from "../pages/admin/classes";
import Disciplinas from "../pages/admin/classes/subject";
import Dashboard from "../pages/admin/dashboard";
import Departments from "../pages/admin/departments";
import Employee from "../pages/admin/Employee";
import Eventos from "../pages/admin/Event";
import Pagamentos from "../pages/admin/Financial/Payments";
import Encarregados from "../pages/admin/Guardian";
import LancamentoNotas from "../pages/admin/Marks";
import Mensagens from "../pages/admin/Message"; // componente partilhado — funciona para admin e professor
import RegistarAssiduidade from "../pages/admin/Presence";
import RolesPermissoes from "../pages/admin/Roles";
import Horario from "../pages/admin/Schedule";
import Students from "../pages/admin/students";
import AddNewStudent from "../pages/admin/students/add-new";
import GradeExceptions from "../pages/admin/GradeExceptions";
import EditStudent from "../pages/admin/students/edit";
import StudentProfile from "../pages/admin/students/Profile";
import NovaInscricao from "../pages/admin/Subscription";
import ListaInscricoes from "../pages/admin/Subscription/List";
import ActualizarInscricao from "../pages/admin/Subscription/Update";
import Utilizadores from "../pages/admin/User";
import AnoLectivo from "../pages/settings/AcademicYear";
import Trimestres from "../pages/settings/Term";

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

import AppLayout from "../components/AppLayout";
import CalendarPage from "../pages/admin/Calendar";
import Noticias from "../pages/admin/News";
import NotificationsPage from "../pages/admin/Notifications";
import Reports from "../pages/admin/Reports";
import ChangePasswordForced from "../pages/auth/ChangePassword";
import Login from "../pages/auth/login";
import FinanceDashboard from "../pages/finance/Dashboard";
import PendingConfirmations from "../pages/finance/PendingConfirmations";
import Maintenance from "../pages/Maintenance";
import NotFound from "../pages/notfound";
import SecretaryDashboard from "../pages/secretary/Dashboard";
import DefinicoesPessoais from "../pages/settings/Personal";
import EscolaSettings from "../pages/settings/School";
import StudentAttendance from "../pages/student/Attendance";
import StudentDashboard from "../pages/student/Dashboard";
import StudentInvoices from "../pages/student/Invoices";
import StudentAssessments from "../pages/student/Assessments";
import StudentDocuments from "../pages/student/Documents";
import StudentReportCard from "../pages/student/ReportCard";
import StudentSchedule from "../pages/student/Schedule";
import StudentSubjects from "../pages/student/Subjects";
import { useAuthStore } from "../store/authStore";
import { getItem } from "../utils/getItem";
import theme from "../utils/theme";
import { RedirectAuthenticatedUser, RequireAuth, RoleRoute } from "./guards";

const { Content } = Layout;

// ─────────────────────────────────────────────────────────────────
//  Menus
// ─────────────────────────────────────────────────────────────────

function useAdminMenuItems() {
  const { user } = useAuthStore();
  const isSuperAdmin = ["SUPERADMIN", "ADMIN"].includes(user?.type ?? "");
  // RBAC dinâmico (Fase A) — o backend só concede can("manage","all") ao
  // SUPERADMIN (ver lib/ability.ts), por isso este item fica de fora do
  // isSuperAdmin genérico acima (que também inclui ADMIN).
  const isTrueSuperAdmin = user?.type === "SUPERADMIN";

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
      getItem(
        "Excepções de Trimestre",
        "/notas/excepcoes",
        <BiRadioCircleMarked />,
        <GradeExceptions />,
      ),
    ]),
    getItem(
      "Assiduidade",
      "/assiduidade",
      <BiCheckCircle size={20} />,
      <RegistarAssiduidade />,
    ),
    getItem(
      "Financeiro",
      "/pagamentos",
      <BiCreditCardAlt size={20} />,
      <Pagamentos />,
    ),
    getItem("Eventos", "/eventos", <MdEventNote size={20} />, <Eventos />),
    getItem("Notícias", "/noticias", <NotificationOutlined />, <Noticias />),
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
    getItem("Relatórios", "/relatorios", <BiFile size={20} />, <Reports />),
    getItem("Configurações", "/configuracoes", <BiCog size={20} />, null, [
      getItem("Escola", "/escola", <BiRadioCircleMarked />, <EscolaSettings />),
      ...(isTrueSuperAdmin
        ? [
            getItem(
              "Papéis & Permissões",
              "/papeis-e-permissoes",
              <SafetyCertificateOutlined size={20} />,
              <RolesPermissoes />,
            ),
          ]
        : []),
      getItem(
        "Ano Lectivo",
        "/ano-lectivo",
        <BiRadioCircleMarked />,
        <AnoLectivo />,
      ),
      getItem(
        "Trimestres",
        "/trimestres",
        <BiRadioCircleMarked />,
        <Trimestres />,
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
    getItem(
      "Notícias",
      "/teacher/noticias",
      <NotificationOutlined />,
      <Noticias readOnly />,
    ),
    getItem(
      "Eventos",
      "/teacher/eventos",
      <MdEventNote size={20} />,
      <Eventos readOnly />,
    ),
  ];
}

/**
 * Menu da Secretária — reaproveita as páginas já existentes de
 * Alunos/Encarregados/Matrículas (RN003: gere registo académico e
 * administrativo, nunca altera pagamentos).
 */
function useSecretaryMenuItems() {
  return [
    // O "element" não é usado por SecretaryLayout (rotas explícitas
    // abaixo definem o próprio "index"); mantido só para a key/label/ícone.
    getItem("Painel", "/secretary", <DashboardOutlined />, null),
    getItem(
      "Alunos",
      "/secretary/alunos",
      <PiStudent size={20} />,
      <Students />,
    ),
    getItem(
      "Encarregados",
      "/secretary/encarregados",
      <BiGroup size={20} />,
      <Encarregados />,
    ),
    getItem(
      "Inscrições",
      "/secretary/inscricao",
      <PiStudent size={20} />,
      null,
      [
        getItem(
          "Nova Inscrição",
          "/secretary/inscricao/nova",
          <BiRadioCircleMarked />,
          <NovaInscricao />,
        ),
        getItem(
          "Actualizar Inscrição",
          "/secretary/inscricao/actualizar",
          <BiRadioCircleMarked />,
          <ActualizarInscricao />,
        ),
        getItem(
          "Lista de Inscrições",
          "/secretary/inscricao/lista",
          <BiRadioCircleMarked />,
          <ListaInscricoes />,
        ),
      ],
    ),
    getItem(
      "Pagamentos por Confirmar",
      "/secretary/pagamentos-por-confirmar",
      <BiCreditCardAlt size={20} />,
      <PendingConfirmations />,
    ),
    getItem(
      "Excepções de Trimestre",
      "/secretary/excepcoes-notas",
      <LockOutlined style={{ fontSize: 20 }} />,
      <GradeExceptions />,
    ),
    getItem(
      "Notícias",
      "/secretary/noticias",
      <NotificationOutlined />,
      <Noticias />,
    ),
    getItem(
      "Eventos",
      "/secretary/eventos",
      <MdEventNote size={20} />,
      <Eventos readOnly />,
    ),
    getItem(
      "Mensagens",
      "/secretary/mensagens",
      <BiMessageRounded size={20} />,
      <Mensagens />,
    ),
  ];
}

/**
 * Menu do Financeiro — reaproveita a página já existente de Pagamentos
 * (RN004: gere propinas/pagamentos, nunca mexe em notas).
 */
function useFinanceMenuItems() {
  return [
    // O "element" não é usado por FinanceLayout (rotas explícitas abaixo
    // definem o próprio "index"); mantido só para a key/label/ícone.
    getItem("Painel", "/finance", <DashboardOutlined />, null),
    getItem(
      "Pagamentos",
      "/finance/pagamentos",
      <BiCreditCardAlt size={20} />,
      <Pagamentos />,
    ),
    getItem(
      "Pagamentos por Confirmar",
      "/finance/pagamentos-por-confirmar",
      <BiCreditCardAlt size={20} />,
      <PendingConfirmations />,
    ),
    getItem(
      "Notícias",
      "/finance/noticias",
      <NotificationOutlined />,
      <Noticias readOnly />,
    ),
    getItem(
      "Eventos",
      "/finance/eventos",
      <MdEventNote size={20} />,
      <Eventos readOnly />,
    ),
    getItem(
      "Mensagens",
      "/finance/mensagens",
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
  if (pathname.startsWith("/noticias")) return "/noticias";
  if (pathname.startsWith("/mensagens")) return "/mensagens";
  if (pathname.startsWith("/encarregados")) return "/encarregados";
  if (pathname.startsWith("/utilizadores")) return "/utilizadores";
  if (pathname.startsWith("/papeis-e-permissoes"))
    return "/papeis-e-permissoes";
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
  if (pathname.startsWith("/teacher/noticias")) return "/teacher/noticias";
  if (pathname.startsWith("/teacher/eventos")) return "/teacher/eventos";
  return "/teacher";
}

function getSecretarySelectedKey(pathname: string): string {
  if (pathname === "/secretary") return "/secretary";
  if (pathname.startsWith("/secretary/alunos")) return "/secretary/alunos";
  if (pathname.startsWith("/secretary/encarregados"))
    return "/secretary/encarregados";
  if (pathname.startsWith("/secretary/inscricao/nova"))
    return "/secretary/inscricao/nova";
  if (pathname.startsWith("/secretary/inscricao/actualizar"))
    return "/secretary/inscricao/actualizar";
  if (pathname.startsWith("/secretary/inscricao/lista"))
    return "/secretary/inscricao/lista";
  if (pathname.startsWith("/secretary/pagamentos-por-confirmar"))
    return "/secretary/pagamentos-por-confirmar";
  if (pathname.startsWith("/secretary/noticias")) return "/secretary/noticias";
  if (pathname.startsWith("/secretary/eventos")) return "/secretary/eventos";
  if (pathname.startsWith("/secretary/mensagens"))
    return "/secretary/mensagens";
  return "/secretary";
}

function getFinanceSelectedKey(pathname: string): string {
  if (pathname === "/finance") return "/finance";
  if (pathname.startsWith("/finance/pagamentos-por-confirmar"))
    return "/finance/pagamentos-por-confirmar";
  if (pathname.startsWith("/finance/pagamentos")) return "/finance/pagamentos";
  if (pathname.startsWith("/finance/noticias")) return "/finance/noticias";
  if (pathname.startsWith("/finance/eventos")) return "/finance/eventos";
  if (pathname.startsWith("/finance/mensagens")) return "/finance/mensagens";
  return "/finance";
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
  {
    key: "personal-settings",
    path: "/definicoes-pessoais",
    element: <DefinicoesPessoais />,
  },
];

function AdminLayout() {
  const { pathname } = useLocation();
  const menuItems = useAdminMenuItems();
  const selectedKey = getAdminSelectedKey(pathname);
  // const cc = styles.contentLayout;

  const wrap = (el: React.ReactNode) => (
    <RoleRoute allowed={["ADMIN", "SUPERADMIN"]}>
      <Content>{el}</Content>
    </RoleRoute>
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

  const wrap = (el: React.ReactNode) => (
    <RoleRoute allowed={["TEACHER"]}>
      <Content>{el}</Content>
    </RoleRoute>
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
        <Route path="noticias" element={wrap(<Noticias readOnly />)} />
        <Route path="eventos" element={wrap(<Eventos readOnly />)} />

        {/* perfil do próprio professor */}
        <Route path="perfil/:slug" element={wrap(<TeacherProfile />)} />
        <Route
          path="definicoes-pessoais"
          element={wrap(<DefinicoesPessoais />)}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
//  SecretaryLayout — montado em /secretary/*
//  Fase 3: reaproveita páginas existentes; dashboard próprio na Fase 7.
// ─────────────────────────────────────────────────────────────────

function SecretaryLayout() {
  const { pathname } = useLocation();
  const menuItems = useSecretaryMenuItems();
  const selectedKey = getSecretarySelectedKey(pathname);

  const wrap = (el: React.ReactNode) => (
    <RoleRoute allowed={["SECRETARY"]}>
      <Content>{el}</Content>
    </RoleRoute>
  );

  return (
    <AppLayout menuItems={menuItems} selectedKey={selectedKey}>
      <Routes>
        <Route index element={wrap(<SecretaryDashboard />)} />
        <Route path="alunos" element={wrap(<Students />)} />
        <Route
          path="alunos/adicionar-novo-aluno"
          element={wrap(<AddNewStudent />)}
        />
        <Route path="alunos/editar/:id" element={wrap(<EditStudent />)} />
        <Route path="encarregados" element={wrap(<Encarregados />)} />
        <Route path="inscricao/nova" element={wrap(<NovaInscricao />)} />
        <Route
          path="inscricao/actualizar"
          element={wrap(<ActualizarInscricao />)}
        />
        <Route path="inscricao/lista" element={wrap(<ListaInscricoes />)} />
        <Route
          path="pagamentos-por-confirmar"
          element={wrap(<PendingConfirmations />)}
        />
        <Route
          path="excepcoes-notas"
          element={wrap(<GradeExceptions />)}
        />
        <Route path="noticias" element={wrap(<Noticias />)} />
        <Route path="eventos" element={wrap(<Eventos readOnly />)} />
        <Route path="mensagens" element={wrap(<Mensagens />)} />
        <Route
          path="definicoes-pessoais"
          element={wrap(<DefinicoesPessoais />)}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
//  FinanceLayout — montado em /finance/*
//  Fase 3: reaproveita páginas existentes; dashboard próprio na Fase 7.
// ─────────────────────────────────────────────────────────────────

function FinanceLayout() {
  const { pathname } = useLocation();
  const menuItems = useFinanceMenuItems();
  const selectedKey = getFinanceSelectedKey(pathname);

  const wrap = (el: React.ReactNode) => (
    <RoleRoute allowed={["FINANCE"]}>
      <Content>{el}</Content>
    </RoleRoute>
  );

  return (
    <AppLayout menuItems={menuItems} selectedKey={selectedKey}>
      <Routes>
        <Route index element={wrap(<FinanceDashboard />)} />
        <Route path="pagamentos" element={wrap(<Pagamentos />)} />
        <Route
          path="pagamentos-por-confirmar"
          element={wrap(<PendingConfirmations />)}
        />
        <Route path="noticias" element={wrap(<Noticias readOnly />)} />
        <Route path="eventos" element={wrap(<Eventos readOnly />)} />
        <Route path="mensagens" element={wrap(<Mensagens />)} />
        <Route
          path="definicoes-pessoais"
          element={wrap(<DefinicoesPessoais />)}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
//  StudentLayout — montado em /student/*
// ─────────────────────────────────────────────────────────────────

function useStudentMenuItems() {
  return [
    getItem("Painel", "/student", <DashboardOutlined />, <StudentDashboard />),
    getItem(
      "Disciplinas",
      "/student/disciplinas",
      <BiBookContent size={20} />,
      <StudentSubjects />,
    ),
    getItem(
      "Boletim",
      "/student/boletim",
      <BiBarChart size={20} />,
      <StudentReportCard />,
    ),
    getItem(
      "Avaliações",
      "/student/avaliacoes",
      <ScheduleOutlined />,
      <StudentAssessments />,
    ),
    getItem(
      "Assiduidade",
      "/student/assiduidade",
      <BiCheckCircle size={20} />,
      <StudentAttendance />,
    ),
    getItem(
      "Horário",
      "/student/horario",
      <BiCalendar size={20} />,
      <StudentSchedule />,
    ),
    getItem(
      "Propinas",
      "/student/propinas",
      <BiCreditCardAlt size={20} />,
      <StudentInvoices />,
    ),
    getItem(
      "Documentos",
      "/student/documentos",
      <FileTextOutlined />,
      <StudentDocuments />,
    ),
    getItem(
      "Notícias",
      "/student/noticias",
      <NotificationOutlined />,
      <Noticias readOnly />,
    ),
    getItem(
      "Eventos",
      "/student/eventos",
      <MdEventNote size={20} />,
      <Eventos readOnly />,
    ),
    getItem(
      "Calendário",
      "/student/calendario",
      <CalendarOutlined />,
      <CalendarPage />,
    ),
    getItem(
      "Notificações",
      "/student/notificacoes",
      <BellOutlined />,
      <NotificationsPage />,
    ),
    getItem(
      "Meu Perfil",
      "/student/definicoes-pessoais",
      <UserOutlined />,
      <DefinicoesPessoais />,
    ),
  ];
}

function getStudentSelectedKey(pathname: string): string {
  if (pathname.startsWith("/student/disciplinas"))
    return "/student/disciplinas";
  if (pathname.startsWith("/student/boletim")) return "/student/boletim";
  if (pathname.startsWith("/student/avaliacoes"))
    return "/student/avaliacoes";
  if (pathname.startsWith("/student/assiduidade"))
    return "/student/assiduidade";
  if (pathname.startsWith("/student/horario")) return "/student/horario";
  if (pathname.startsWith("/student/propinas")) return "/student/propinas";
  if (pathname.startsWith("/student/documentos"))
    return "/student/documentos";
  if (pathname.startsWith("/student/noticias")) return "/student/noticias";
  if (pathname.startsWith("/student/eventos")) return "/student/eventos";
  if (pathname.startsWith("/student/calendario"))
    return "/student/calendario";
  if (pathname.startsWith("/student/notificacoes"))
    return "/student/notificacoes";
  if (pathname.startsWith("/student/definicoes-pessoais"))
    return "/student/definicoes-pessoais";
  return "/student";
}

function StudentLayout() {
  const { pathname } = useLocation();
  const menuItems = useStudentMenuItems();
  const selectedKey = getStudentSelectedKey(pathname);

  const wrap = (el: React.ReactNode) => (
    <RoleRoute allowed={["STUDENT"]}>
      <Content>{el}</Content>
    </RoleRoute>
  );

  return (
    <AppLayout menuItems={menuItems} selectedKey={selectedKey}>
      <Routes>
        <Route index element={wrap(<StudentDashboard />)} />
        <Route path="disciplinas" element={wrap(<StudentSubjects />)} />
        <Route path="boletim" element={wrap(<StudentReportCard />)} />
        <Route path="avaliacoes" element={wrap(<StudentAssessments />)} />
        <Route path="assiduidade" element={wrap(<StudentAttendance />)} />
        <Route path="horario" element={wrap(<StudentSchedule />)} />
        <Route path="propinas" element={wrap(<StudentInvoices />)} />
        <Route path="documentos" element={wrap(<StudentDocuments />)} />
        <Route path="noticias" element={wrap(<Noticias readOnly />)} />
        <Route path="eventos" element={wrap(<Eventos readOnly />)} />
        <Route path="calendario" element={wrap(<CalendarPage />)} />
        <Route path="notificacoes" element={wrap(<NotificationsPage />)} />
        <Route
          path="definicoes-pessoais"
          element={wrap(<DefinicoesPessoais />)}
        />
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
        <Route
          path="/mudar-password"
          element={
            <RequireAuth>
              <ChangePasswordForced />
            </RequireAuth>
          }
        />
        <Route path="/manutencao" element={<Maintenance />} />

        {/* Painel do Encarregado */}
        <Route
          path="/guardian"
          element={
            <RoleRoute allowed={["GUARDIAN"]}>
              <GuardianLayout>
                <GuardianDashboard />
              </GuardianLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/guardian/educandos/:id"
          element={
            <RoleRoute allowed={["GUARDIAN"]}>
              <GuardianLayout>
                <GuardianStudentDetail />
              </GuardianLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/guardian/perfil"
          element={
            <RoleRoute allowed={["GUARDIAN"]}>
              <GuardianLayout>
                <DefinicoesPessoais />
              </GuardianLayout>
            </RoleRoute>
          }
        />
        {/* Mensagens do encarregado — mesmo componente, isGuardian=true detectado dentro */}
        <Route
          path="/guardian/mensagens"
          element={
            <RoleRoute allowed={["GUARDIAN"]}>
              <GuardianLayout>
                <Mensagens />
              </GuardianLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/guardian/calendario"
          element={
            <RoleRoute allowed={["GUARDIAN"]}>
              <GuardianLayout>
                <CalendarPage />
              </GuardianLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/guardian/notificacoes"
          element={
            <RoleRoute allowed={["GUARDIAN"]}>
              <GuardianLayout>
                <NotificationsPage />
              </GuardianLayout>
            </RoleRoute>
          }
        />

        {/* Painel do Professor — /teacher/* */}
        <Route
          path="/teacher/*"
          element={
            <RoleRoute allowed={["TEACHER"]}>
              <TeacherLayout />
            </RoleRoute>
          }
        />

        {/* Painel da Secretária — /secretary/* */}
        <Route
          path="/secretary/*"
          element={
            <RoleRoute allowed={["SECRETARY"]}>
              <SecretaryLayout />
            </RoleRoute>
          }
        />

        {/* Painel do Financeiro — /finance/* */}
        <Route
          path="/finance/*"
          element={
            <RoleRoute allowed={["FINANCE"]}>
              <FinanceLayout />
            </RoleRoute>
          }
        />

        {/* Painel do Aluno — /student/* */}
        <Route
          path="/student/*"
          element={
            <RoleRoute allowed={["STUDENT"]}>
              <StudentLayout />
            </RoleRoute>
          }
        />

        {/* Painel Admin / SUPERADMIN — /* (último, apanha tudo o resto) */}
        <Route path="/*" element={<AdminLayout />} />
      </Routes>
    </ConfigProvider>
  );
}
