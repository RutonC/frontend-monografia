// pages/teacher/Dashboard.tsx
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Card, Col, Row, Spin, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { BiCalendar, BiTime } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { api, useAuthStore } from "../../store/authStore";

const { Title, Text } = Typography;

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
};

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
  const { user } = useAuthStore();

  const [sections, setSections] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/sections"),
      api.get(`/schedules?teacherId=${user?.id}`),
      api.get("/grades"),
      api.get("/attendance"),
    ])
      .then(([s, sc, g, a]) => {
        // cada controller usa a chave correcta
        setSections(s.data?.sections ?? []);
        setSchedules(sc.data?.schedules ?? []);
        setGrades(g.data?.grades ?? []);
        setAttendance(a.data?.attendance ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const todaySchedule = schedules.filter((s) => s.dayOfWeek === TODAY_KEY);
  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const absentCount = attendance.filter((a) => a.status === "ABSENT").length;
  const totalStudents = sections.reduce(
    (acc, s) => acc + (s._count?.enrollments ?? 0),
    0,
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1280 }}>
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
            value={sections.length}
            color="#4f46e5"
            onClick={() => navigate("/teacher/turmas")}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<BookOutlined />}
            label="Alunos no Total"
            value={totalStudents}
            color="#0ea5e9"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<CheckCircleOutlined />}
            label="Notas Lançadas"
            value={grades.length}
            color="#16a34a"
            onClick={() => navigate("/teacher/notas")}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<CalendarOutlined />}
            label="Presenças Hoje"
            value={presentCount}
            color="#f59e0b"
            onClick={() => navigate("/teacher/assiduidade")}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
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
                {todaySchedule.map((s) => (
                  <div
                    key={s.id}
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
                        {s.subject?.name ?? "—"}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {s.section?.name} · {s.startTime} – {s.endTime}
                      </Text>
                    </div>
                    <Tag color="blue">{s.section?.name}</Tag>
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
                {sections.slice(0, 5).map((sec) => (
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

        {/* Resumo assiduidade */}
        {attendance.length > 0 && (
          <Col xs={24}>
            <Card
              title="Resumo de Assiduidade"
              style={{ borderRadius: 12 }}
              extra={
                <a onClick={() => navigate("/teacher/assiduidade")}>Registar</a>
              }
            >
              <Row gutter={16}>
                {[
                  { label: "Presentes", count: presentCount, color: "#16a34a" },
                  { label: "Ausentes", count: absentCount, color: "#dc2626" },
                  {
                    label: "Justificados",
                    count: attendance.length - presentCount - absentCount,
                    color: "#f59e0b",
                  },
                ].map((s) => (
                  <Col xs={8} key={s.label}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 32,
                          fontWeight: 700,
                          color: s.color,
                        }}
                      >
                        {s.count}
                      </div>
                      <Text type="secondary">{s.label}</Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
