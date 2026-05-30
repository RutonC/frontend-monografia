// pages/guardian/StudentDetail.tsx
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import {
  useStudentAttendance,
  useStudentGrades,
  useStudentInvoices,
  useStudentSchedule,
} from "@/hooks/useGuardian";
import { intlDate } from "@/utils/intl";
import {
  AlertOutlined,
  CalendarOutlined,
  HomeOutlined,
  UserOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Skeleton,
  Space,
  Tabs,
  Tag,
  Timeline,
  Typography
} from "antd";
import { useNavigate, useParams } from "react-router-dom";

const GRADE_TYPE_LABEL: Record<string, string> = {
  AC1: "Avaliação 1",
  AC2: "Avaliação 2",
  EXAM: "Exame",
  RETAKE: "Recurso",
};

const STATUS_COLOR: Record<string, string> = {
  PRESENT: "success",
  ABSENT: "error",
  LATE: "warning",
  JUSTIFIED: "processing",
};

const STATUS_LABEL: Record<string, string> = {
  PRESENT: "Presente",
  ABSENT: "Falta",
  LATE: "Atraso",
  JUSTIFIED: "Justificada",
};

const INVOICE_STATUS_COLOR: Record<string, string> = {
  PAID: "success",
  UNPAID: "warning",
  OVERDUE: "error",
  CANCELLED: "default",
};

const INVOICE_STATUS_LABEL: Record<string, string> = {
  PAID: "Pago",
  UNPAID: "Pendente",
  OVERDUE: "Em atraso",
  CANCELLED: "Cancelado",
};

// ── Tab: Notas ────────────────────────────────────────────────────
function GradesTab({ studentId }: { studentId: string }) {
  const { data, isPending } = useStudentGrades(studentId);
  const grouped = data?.grouped ?? {};

  if (isPending) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!Object.keys(grouped).length)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Sem notas registadas"
      />
    );

  return (
    <div>
      {Object.entries(grouped).map(([term, subjects]) => (
        <Card key={term} title={term} size="small" style={{ marginBottom: 16 }}>
          {Object.entries(subjects as Record<string, any[]>).map(
            ([subject, grades]) => (
              <div key={subject} style={{ marginBottom: 16 }}>
                <Typography.Text
                  strong
                  style={{ display: "block", marginBottom: 8 }}
                >
                  {subject}
                </Typography.Text>
                <Row gutter={[8, 8]}>
                  {grades.map((g: any) => (
                    <Col key={g.id} xs={12} sm={6}>
                      <Card
                        size="small"
                        style={{
                          background: "var(--color-background-secondary)",
                          border: "none",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 500,
                            color:
                              g.value >= 10
                                ? "var(--color-text-success)"
                                : "var(--color-text-danger)",
                          }}
                        >
                          {g.value.toFixed(1)}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {GRADE_TYPE_LABEL[g.type] ?? g.type}
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            ),
          )}
        </Card>
      ))}
    </div>
  );
}

// ── Tab: Assiduidade ──────────────────────────────────────────────
function AttendanceTab({ studentId }: { studentId: string }) {
  const { data, isPending } = useStudentAttendance(studentId);
  const stats = data?.stats ?? [];
  const attendance = data?.attendance ?? [];

  if (isPending) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!attendance.length)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Sem registos de assiduidade"
      />
    );

  return (
    <div>
      {/* Resumo por disciplina */}
      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, display: "block", marginBottom: 12 }}
      >
        Taxa de presença por disciplina
      </Typography.Text>
      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        {stats.map((s: any) => (
          <Col key={s.subject} xs={24} sm={12} md={8}>
            <Card size="small">
              <Typography.Text strong style={{ fontSize: 13 }}>
                {s.subject}
              </Typography.Text>
              <Progress
                percent={s.presenceRate}
                size="small"
                strokeColor={
                  s.presenceRate >= 75
                    ? "#059669"
                    : s.presenceRate >= 50
                      ? "#d97706"
                      : "#dc2626"
                }
                style={{ margin: "6px 0 4px" }}
              />
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  fontSize: 11,
                  color: "var(--color-text-secondary)",
                }}
              >
                <span>✅ {s.present} pres.</span>
                <span>❌ {s.absent} falt.</span>
                {s.late > 0 && <span>⏰ {s.late} atr.</span>}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Últimos registos */}
      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, display: "block", marginBottom: 12 }}
      >
        Últimos registos
      </Typography.Text>
      <Timeline
        items={attendance.slice(0, 20).map((a: any) => ({
          color:
            a.status === "PRESENT"
              ? "green"
              : a.status === "ABSENT"
                ? "red"
                : "orange",
          children: (
            <div>
              <Tag color={STATUS_COLOR[a.status]} style={{ fontSize: 11 }}>
                {STATUS_LABEL[a.status]}
              </Tag>
              <Typography.Text style={{ fontSize: 12, marginLeft: 6 }}>
                {a.subject?.name}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 11, display: "block" }}
              >
                {intlDate(a.date)}
              </Typography.Text>
              {a.remarks && (
                <Typography.Text
                  italic
                  type="secondary"
                  style={{ fontSize: 11 }}
                >
                  {a.remarks}
                </Typography.Text>
              )}
            </div>
          ),
        }))}
      />
    </div>
  );
}

// ── Tab: Horário ──────────────────────────────────────────────────
function ScheduleTab({ studentId }: { studentId: string }) {
  const { data, isPending } = useStudentSchedule(studentId);
  const schedule = data?.schedule ?? [];
  const section = data?.section;

  if (isPending) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!schedule.length)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Sem horário disponível"
      />
    );

  return (
    <div>
      {section && (
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "var(--color-background-secondary)",
            border: "none",
          }}
        >
          <Space>
            <CalendarOutlined />
            <Typography.Text>
              <strong>{section.name}</strong> · {section.level} ·{" "}
              {section.academicYear}
            </Typography.Text>
          </Space>
        </Card>
      )}

      <Row gutter={[12, 12]}>
        {schedule.map((ts: any) => (
          <Col key={`${ts.teacherId}-${ts.subjectId}`} xs={24} sm={12}>
            <Card size="small">
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Avatar
                  src={ts.teacher?.employee?.user?.avatar}
                  icon={<UserOutlined />}
                  size={36}
                />
                <div>
                  <Typography.Text
                    strong
                    style={{ display: "block", fontSize: 13 }}
                  >
                    {ts.subject?.name}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {ts.teacher?.employee?.user?.firstName}{" "}
                    {ts.teacher?.employee?.user?.lastName}
                  </Typography.Text>
                </div>
                <Tag style={{ marginLeft: "auto" }}>{ts.subject?.code}</Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

// ── Tab: Propinas ─────────────────────────────────────────────────
function InvoicesTab({ studentId }: { studentId: string }) {
  const { data, isPending } = useStudentInvoices(studentId);
  const invoices = data?.invoices ?? [];
  const totalPending = data?.totalPending ?? 0;

  if (isPending) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!invoices.length)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Sem facturas registadas"
      />
    );

  return (
    <div>
      {totalPending > 0 && (
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "var(--color-background-danger)",
            border: "0.5px solid var(--color-border-danger)",
          }}
        >
          <Space>
            <AlertOutlined style={{ color: "var(--color-text-danger)" }} />
            <Typography.Text style={{ color: "var(--color-text-danger)" }}>
              Total em dívida: <strong>MZN {totalPending.toFixed(2)}</strong>
            </Typography.Text>
          </Space>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {invoices.map((inv: any) => (
          <Card key={inv.id} size="small">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  {inv.description ?? inv.term?.name ?? "Propina"}
                </Typography.Text>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block" }}
                >
                  Vencimento: {intlDate(inv.dueDate)}
                </Typography.Text>
                {inv.balance > 0 && inv.status !== "PAID" && (
                  <Typography.Text type="danger" style={{ fontSize: 12 }}>
                    Em dívida: MZN {inv.balance.toFixed(2)}
                  </Typography.Text>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <Tag color={INVOICE_STATUS_COLOR[inv.status]}>
                  {INVOICE_STATUS_LABEL[inv.status]}
                </Tag>
                <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
                  MZN {Number(inv.amount).toFixed(2)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────
export default function GuardianStudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: gradesData } = useStudentGrades(id ?? "");
  const { data: attendanceData } = useStudentAttendance(id ?? "");
  const { data: invoicesData } = useStudentInvoices(id ?? "");

  const overdueInvoices =
    invoicesData?.invoices?.filter(
      (i: any) => i.status === "UNPAID" || i.status === "OVERDUE",
    ).length ?? 0;

  return (
    <>
      <CustomBreadcrumb
        title="Detalhes do Educando"
        items={[
          { title: <HomeOutlined />, href: "/guardian" },
          {
            title: "Os meus educandos",
            href: "#",
            onClick: () => navigate("/guardian"),
          },
          { title: "Detalhes" },
        ]}
        onPrev
      />

      <Tabs
        items={[
          {
            key: "grades",
            label: "Avaliações",
            children: <GradesTab studentId={id ?? ""} />,
          },
          {
            key: "attendance",
            label: "Assiduidade",
            children: <AttendanceTab studentId={id ?? ""} />,
          },
          {
            key: "schedule",
            label: "Horário",
            children: <ScheduleTab studentId={id ?? ""} />,
          },
          {
            key: "invoices",
            label: (
              <Badge count={overdueInvoices} size="small" offset={[6, -2]}>
                Propinas
              </Badge>
            ),
            children: <InvoicesTab studentId={id ?? ""} />,
          },
        ]}
      />
    </>
  );
}
