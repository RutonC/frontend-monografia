// pages/student/Dashboard.tsx
import NewsFeed from "@/components/NewsFeed";
import { useAuthStore } from "@/store/authStore";
import { useFetch } from "@/utils/fetch";
import { intlDate } from "@/utils/intl";
import {
  BookOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  LockOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import type { ColumnConfig, LineConfig, PieConfig } from "@ant-design/plots";
import { Column, Line, Pie } from "@ant-design/plots";
import { Card, Col, Empty, Row, Spin, Table, Tag, Typography } from "antd";

const { Title, Text } = Typography;

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const STATUS_LABEL: Record<string, string> = {
  UNPAID: "Por pagar",
  OVERDUE: "Em atraso",
};

const STATUS_COLOR: Record<string, string> = {
  UNPAID: "gold",
  OVERDUE: "error",
};

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <Card
      style={{ borderRadius: 12 }}
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

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { data, isPending } = useFetch(
    ["dashboard-student"],
    "dashboard/student",
  );

  if (isPending) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data?.hasEnrollment) {
    return (
      <div>
        <Title level={3}>Olá, {user?.firstName ?? "Aluno"} 👋</Title>
        <Card>
          <Empty description="Ainda não tem uma matrícula activa este ano." />
        </Card>
      </div>
    );
  }

  const {
    enrollment,
    term,
    gradesBlocked,
    attendance,
    attendanceTrend,
    invoicesPending,
    totalPending,
    nextClass,
  } = data;

  const subjectData = (term?.subjects ?? []).filter(
    (s: any) => s.average !== null,
  );

  const subjectConfig: ColumnConfig = {
    data: subjectData,
    xField: "subjectName",
    yField: "average",
    height: 280,
    style: { radiusTopLeft: 10, radiusTopRight: 10 },
    axis: { y: { title: "Média (0–20)" } },
  };

  const attendanceTrendConfig: LineConfig = {
    data: attendanceTrend ?? [],
    xField: "month",
    yField: "rate",
    height: 260,
    point: { shape: "circle" },
    axis: { y: { title: "% presença" } },
  };

  const attendanceBreakdown = [
    { status: "Presente", count: attendance.present },
    { status: "Ausente", count: attendance.absent },
    { status: "Atraso", count: attendance.late },
    { status: "Justificado", count: attendance.justified },
  ].filter((s) => s.count > 0);

  const attendancePieConfig: PieConfig = {
    data: attendanceBreakdown,
    angleField: "count",
    colorField: "status",
    innerRadius: 0.6,
    height: 260,
    legend: { color: { position: "right" } },
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0 }}>
          Olá, {user?.firstName ?? "Aluno"} 👋
        </Title>
        <Text type="secondary">
          {enrollment.level} · {enrollment.section} · {enrollment.academicYear}
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={gradesBlocked ? <LockOutlined /> : <TrophyOutlined />}
            label={term ? `Média — ${term.termName}` : "Média do Trimestre"}
            value={
              gradesBlocked
                ? "Bloqueado"
                : term?.termAverage != null
                  ? term.termAverage.toFixed(1)
                  : "—"
            }
            color={
              gradesBlocked
                ? "#dc2626"
                : term?.passed === false
                  ? "#dc2626"
                  : "#16a34a"
            }
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<CalendarOutlined />}
            label="Taxa de Presença"
            value={`${attendance.rate}%`}
            color="#4f46e5"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<CreditCardOutlined />}
            label="Facturas Pendentes"
            value={`MZN ${new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 0 }).format(totalPending)}`}
            color={totalPending > 0 ? "#dc2626" : "#16a34a"}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<BookOutlined />}
            label="Disciplinas Avaliadas"
            value={subjectData.length}
            color="#0ea5e9"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Notas por Disciplina"
            style={{ borderRadius: 12, height: "100%" }}
          >
            {gradesBlocked ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <LockOutlined style={{ fontSize: 28, color: "#dc2626" }} />
                <Typography.Title
                  level={5}
                  style={{ color: "#dc2626", marginTop: 12 }}
                >
                  Notas bloqueadas
                </Typography.Title>
                <Text type="secondary">
                  Mensalidade(s) em atraso. Contacte a Secretaria ou o
                  Financeiro para regularizar a situação.
                </Text>
              </div>
            ) : subjectData.length ? (
              <Column {...subjectConfig} />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Ainda sem notas lançadas este trimestre"
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Resumo de Presenças"
            style={{ borderRadius: 12, height: "100%" }}
          >
            {attendanceBreakdown.length ? (
              <Pie {...attendancePieConfig} />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Ainda sem registos de assiduidade"
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Tendência de Assiduidade" style={{ borderRadius: 12 }}>
            <Line {...attendanceTrendConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarOutlined style={{ color: "#4f46e5" }} /> Próxima Aula
              </span>
            }
            style={{ borderRadius: 12, height: "100%" }}
          >
            {nextClass ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  background: "#f8faff",
                  borderRadius: 10,
                  borderLeft: "3px solid #4f46e5",
                }}
              >
                <div style={{ flex: 1 }}>
                  <Text strong style={{ display: "block", fontSize: 15 }}>
                    {nextClass.subject}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {DAY_LABELS[nextClass.day] ?? nextClass.day} ·{" "}
                    {nextClass.startTime} – {nextClass.endTime}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Prof. {nextClass.teacher}
                  </Text>
                </div>
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Sem aulas programadas"
              />
            )}

            {invoicesPending.length > 0 && (
              <>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                    display: "block",
                    margin: "16px 0 8px",
                  }}
                >
                  Facturas pendentes
                </Text>
                <Table
                  size="small"
                  pagination={false}
                  dataSource={invoicesPending}
                  rowKey="id"
                  columns={[
                    {
                      title: "Valor",
                      dataIndex: "amount",
                      render: (v: number) => `MZN ${v.toFixed(2)}`,
                    },
                    {
                      title: "Vencimento",
                      dataIndex: "dueDate",
                      render: (v: string) => intlDate(v),
                    },
                    {
                      title: "Estado",
                      dataIndex: "status",
                      render: (s: string) => (
                        <Tag color={STATUS_COLOR[s] ?? "default"}>
                          {STATUS_LABEL[s] ?? s}
                        </Tag>
                      ),
                    },
                  ]}
                />
              </>
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
