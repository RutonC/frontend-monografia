// pages/teacher/Dashboard.tsx
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ColumnConfig, LineConfig } from "@ant-design/plots";
import { Column, Line } from "@ant-design/plots";
import { Avatar, Badge, Card, Col, Row, Tag, Typography } from "antd";
import { BiCalendar, BiTime } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import NewsFeed from "../../components/NewsFeed";
import PageLoader from "../../components/PageLoader";
import { useFetch } from "../../utils/fetch";

const { Title, Text } = Typography;

const TODAY_KEY = (() => {
  const d = new Date().getDay();
  return [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ][d];
})();

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

function StatCard({
  icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      style={{ borderRadius: 12, cursor: onClick ? "pointer" : "default" }}
      styles={{ body: { padding: "20px 24px" } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            fontSize: 22,
          }}
        >
          {icon}
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {label}
          </Text>
          <div
            style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, color }}
          >
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { data, isPending } = useFetch(
    ["dashboard-teacher"],
    "dashboard/teacher",
  );

  if (isPending) {
    return <PageLoader />;
  }

  const totals = data?.totals ?? {
    sections: 0,
    students: 0,
    gradesLaunched: 0,
    pendingGrades: 0,
  };
  const gradeDistribution = data?.gradeDistribution ?? [];
  const attendanceTrend = data?.attendanceTrend ?? [];
  const weekSchedule = data?.weekSchedule ?? [];
  const sections = data?.sections ?? [];

  const todaySchedule = weekSchedule.filter(
    (s: any) => s.dayOfWeek === TODAY_KEY,
  );

  const gradeDistConfig: ColumnConfig = {
    data: gradeDistribution,
    xField: "subject",
    yField: "average",
    height: 280,
    style: { radiusTopLeft: 10, radiusTopRight: 10 },
    axis: { y: { title: "Média (0–20)" } },
  };

  const attendanceTrendConfig: LineConfig = {
    data: attendanceTrend,
    xField: "month",
    yField: "rate",
    height: 280,
    point: { shape: "circle" },
    axis: { y: { title: "% presença" } },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0 }}>
          Painel do Professor
        </Title>
        <Text type="secondary">
          {new Date().toLocaleDateString("pt-PT", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<TeamOutlined />}
            label="Minhas Turmas"
            value={totals.sections}
            color="#4f46e5"
            onClick={() => navigate("/teacher/turmas")}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<BookOutlined />}
            label="Alunos no Total"
            value={totals.students}
            color="#0ea5e9"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<CheckCircleOutlined />}
            label="Notas Lançadas"
            value={totals.gradesLaunched}
            color="#16a34a"
            onClick={() => navigate("/teacher/notas")}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<CalendarOutlined />}
            label="Notas por Lançar"
            value={totals.pendingGrades}
            color="#f59e0b"
            onClick={() => navigate("/teacher/notas")}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Média por Disciplina"
            style={{ borderRadius: 12, height: "100%" }}
          >
            <Column {...gradeDistConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Tendência de Assiduidade" style={{ borderRadius: 12 }}>
            <Line {...attendanceTrendConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Aulas de hoje */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BiCalendar color="#4f46e5" /> Aulas de Hoje
              </span>
            }
            style={{ borderRadius: 12, height: "100%" }}
            extra={<Tag color="purple">{DAY_LABELS[TODAY_KEY] ?? "Hoje"}</Tag>}
          >
            {todaySchedule.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <Text type="secondary">Sem aulas programadas para hoje.</Text>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {todaySchedule.map((s: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 16px",
                      background: "#f8faff",
                      borderRadius: 10,
                      borderLeft: "3px solid #4f46e5",
                    }}
                  >
                    <BiTime size={18} color="#4f46e5" />
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ display: "block" }}>
                        {s.subject}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {s.section} · {s.startTime} – {s.endTime}
                      </Text>
                    </div>
                    <Tag color="blue">{s.section}</Tag>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Minhas turmas */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BookOutlined style={{ color: "#0ea5e9" }} /> Minhas Turmas
              </span>
            }
            style={{ borderRadius: 12 }}
            extra={<a onClick={() => navigate("/teacher/turmas")}>Ver todas</a>}
          >
            {sections.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <Text type="secondary">Nenhuma turma atribuída.</Text>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {sections.slice(0, 5).map((sec: any) => (
                  <div
                    key={sec.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      background: "#f8faff",
                      borderRadius: 10,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate("/teacher/turmas")}
                  >
                    <Avatar
                      style={{ background: "#4f46e5", flexShrink: 0 }}
                      size={36}
                    >
                      {sec.name?.charAt(0)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ display: "block" }}>
                        {sec.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {sec.level?.name ?? "—"}
                      </Text>
                    </div>
                    <Badge
                      count={sec._count?.enrollments ?? 0}
                      color="#0ea5e9"
                      overflowCount={999}
                      showZero
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Notícias" style={{ borderRadius: 12 }}>
            <NewsFeed limit={5} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
