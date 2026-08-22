// pages/guardian/StudentDetail.tsx
import AcademicYearSelect, {
  useActiveAcademicYearId,
} from "@/components/AcademicYearSelect";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import {
  useStudentAttendance,
  useStudentGrades,
  useStudentInvoices,
  useStudentSchedule,
} from "@/hooks/useGuardian";
import { useFetch, useMutationPost } from "@/utils/fetch";
import { intlDate } from "@/utils/intl";
import {
  AlertOutlined,
  CalendarOutlined,
  CopyOutlined,
  DownloadOutlined,
  FileTextOutlined,
  HomeOutlined,
  LockOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input as AntInput,
  InputNumber,
  List,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Skeleton,
  Space,
  Tabs,
  Tag,
  Timeline,
  Typography,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";

const GRADE_TYPE_LABEL: Record<string, string> = {
  ACS1: "1ª Aval. Contínua",
  ACS2: "2ª Aval. Contínua",
  ACS3: "3ª Aval. Contínua",
  ACP1: "1ª Aval. c/ Prova",
  ACP2: "2ª Aval. c/ Prova",
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

// ── Boletim: média por disciplina + final do trimestre ─────────────
function TermReportCard({
  studentId,
  termId,
  termName,
}: {
  studentId: string;
  termId: string;
  termName: string;
}) {
  const { data, isPending } = useFetch<{ reportCard?: any }>(
    ["report-card", studentId, termId],
    `students/${studentId}/report-card?termId=${termId}`,
  );

  if (isPending) return <Skeleton active paragraph={{ rows: 2 }} />;
  const card = data?.reportCard;
  if (!card) return null;

  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      title={`Boletim — ${termName}`}
      extra={
        card.termAverage !== null && (
          <Tag color={card.passed ? "success" : "error"}>
            Média: {card.termAverage.toFixed(1)} —{" "}
            {card.passed ? "Aprovado" : "Reprovado"}
          </Tag>
        )
      }
    >
      <Row gutter={[8, 8]}>
        {card.subjects.map((s: any) => (
          <Col key={s.subjectId} xs={12} sm={8} md={6}>
            <div style={{ textAlign: "center" }}>
              <Typography.Text
                style={{
                  fontSize: 11,
                  display: "block",
                  color: "var(--color-text-secondary)",
                }}
              >
                {s.subjectName}
              </Typography.Text>
              <Typography.Text
                strong
                style={{
                  fontSize: 16,
                  color:
                    s.average === null
                      ? "var(--color-text-secondary)"
                      : s.passed
                        ? "var(--color-text-success)"
                        : "var(--color-text-danger)",
                }}
              >
                {s.average === null ? "—" : s.average.toFixed(1)}
              </Typography.Text>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

function GradeChip({ grade }: { grade: any }) {
  return (
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
            grade.value >= 10
              ? "var(--color-text-success)"
              : "var(--color-text-danger)",
        }}
      >
        {grade.value.toFixed(1)}
      </div>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
        {GRADE_TYPE_LABEL[grade.type] ?? grade.type}
      </div>
    </Card>
  );
}

// ── Tab: Notas ────────────────────────────────────────────────────
function GradesTab({
  studentId,
  academicYearId,
}: {
  studentId: string;
  academicYearId?: string;
}) {
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const { data, isPending } = useStudentGrades(studentId, undefined, academicYearId);

  if (isPending) return <Skeleton active paragraph={{ rows: 6 }} />;

  if ((data as any)?.blocked) {
    const blocked = data as any;
    return (
      <Card
        style={{
          background: "var(--color-background-danger)",
          border: "0.5px solid var(--color-border-danger)",
          textAlign: "center",
        }}
      >
        <LockOutlined
          style={{ fontSize: 28, color: "var(--color-text-danger)" }}
        />
        <Typography.Title
          level={5}
          style={{ color: "var(--color-text-danger)", marginTop: 12 }}
        >
          Pautas bloqueadas por mensalidades em atraso
        </Typography.Title>
        <Typography.Text style={{ display: "block", marginBottom: 4 }}>
          {blocked.reason}
        </Typography.Text>
        {typeof blocked.overdueTotal === "number" && (
          <Typography.Text strong>
            Total em atraso: MZN {blocked.overdueTotal.toFixed(2)}
          </Typography.Text>
        )}
      </Card>
    );
  }

  const grouped = data?.grouped ?? {};
  if (!Object.keys(grouped).length)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Sem notas registadas"
      />
    );

  // Mapa termId → nome, a partir das notas já carregadas — evita um
  // pedido extra só para descobrir os trimestres com notas.
  const terms = new Map<string, string>();
  (data?.grades ?? []).forEach((g: any) => {
    if (g.termId && g.term?.name) terms.set(g.termId, g.term.name);
  });

  const subjectOptions = Array.from(
    new Set(
      Object.values(grouped as Record<string, Record<string, any[]>>).flatMap(
        (s) => Object.keys(s),
      ),
    ),
  ).sort();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <Select
          value={selectedSubject}
          onChange={setSelectedSubject}
          allowClear
          placeholder="Todas as disciplinas"
          style={{ minWidth: 200 }}
          options={subjectOptions.map((s) => ({ value: s, label: s }))}
        />
      </div>

      {Array.from(terms.entries()).map(([termId, termName]) => (
        <TermReportCard
          key={termId}
          studentId={studentId}
          termId={termId}
          termName={termName}
        />
      ))}

      {selectedSubject ? (
        // Uma disciplina — lado a lado por trimestre, para acompanhar a
        // evolução ao longo do ano.
        <Card
          title={`Evolução — ${selectedSubject}`}
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[12, 12]}>
            {Object.entries(grouped).map(([term, subjects]) => {
              const grades = (subjects as Record<string, any[]>)[
                selectedSubject
              ];
              return (
                <Col key={term} xs={24} sm={12} md={8}>
                  <Card size="small" title={term}>
                    {!grades?.length ? (
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        Sem notas lançadas.
                      </Typography.Text>
                    ) : (
                      <Row gutter={[8, 8]}>
                        {grades.map((g: any) => (
                          <Col key={g.id} xs={12}>
                            <GradeChip grade={g} />
                          </Col>
                        ))}
                      </Row>
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>
      ) : (
        Object.entries(grouped).map(([term, subjects]) => (
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
                        <GradeChip grade={g} />
                      </Col>
                    ))}
                  </Row>
                </div>
              ),
            )}
          </Card>
        ))
      )}
    </div>
  );
}

// ── Tab: Desempenho (Fase 8) — média actual + taxa de presença por
// disciplina, lado a lado; reaproveita o boletim anual já calculado no
// backend (computeAnnualReportCard) e as estatísticas de assiduidade já
// usadas em AttendanceTab, sem nenhum endpoint novo.
function PerformanceTab({
  studentId,
  academicYearId,
}: {
  studentId: string;
  academicYearId?: string;
}) {
  const { data: cardData, isPending: cardPending } = useFetch<{
    reportCard?: any;
    blocked?: boolean;
    reason?: string;
    overdueTotal?: number;
  }>(
    ["report-card-annual", studentId, academicYearId ?? "none"],
    `students/${studentId}/report-card?academicYearId=${academicYearId}`,
    { enabled: !!academicYearId },
  );
  const { data: attData, isPending: attPending } = useStudentAttendance(
    studentId,
    undefined,
    academicYearId,
  );

  if (cardPending || attPending)
    return <Skeleton active paragraph={{ rows: 6 }} />;

  if (cardData?.blocked) {
    return (
      <Card
        style={{
          background: "var(--color-background-danger)",
          border: "0.5px solid var(--color-border-danger)",
          textAlign: "center",
        }}
      >
        <LockOutlined
          style={{ fontSize: 28, color: "var(--color-text-danger)" }}
        />
        <Typography.Title
          level={5}
          style={{ color: "var(--color-text-danger)", marginTop: 12 }}
        >
          Desempenho bloqueado por mensalidades em atraso
        </Typography.Title>
        <Typography.Text style={{ display: "block", marginBottom: 4 }}>
          {cardData.reason}
        </Typography.Text>
        {typeof cardData.overdueTotal === "number" && (
          <Typography.Text strong>
            Total em atraso: MZN {cardData.overdueTotal.toFixed(2)}
          </Typography.Text>
        )}
      </Card>
    );
  }

  const subjects = cardData?.reportCard?.subjects ?? [];
  const statsBySubject = new Map(
    (attData?.stats ?? []).map((s: any) => [s.subject, s]),
  );

  if (!subjects.length)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Sem dados de desempenho para este ano lectivo"
      />
    );

  return (
    <div>
      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, display: "block", marginBottom: 12 }}
      >
        Média actual e taxa de presença por disciplina, no ano lectivo em
        curso.
      </Typography.Text>
      <Row gutter={[12, 12]}>
        {subjects.map((s: any) => {
          const att = statsBySubject.get(s.subjectName) as any;
          const presenceRate = att?.presenceRate ?? 0;
          return (
            <Col key={s.subjectId} xs={24} sm={12} md={8}>
              <Card size="small">
                <Typography.Text
                  strong
                  style={{ fontSize: 13, display: "block", marginBottom: 8 }}
                >
                  {s.subjectName}
                </Typography.Text>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 6,
                  }}
                >
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    Média actual
                  </Typography.Text>
                  <Typography.Text
                    strong
                    style={{
                      fontSize: 18,
                      color: s.passed
                        ? "var(--color-text-success)"
                        : "var(--color-text-danger)",
                    }}
                  >
                    {s.average.toFixed(1)}
                  </Typography.Text>
                </div>
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  Presença{att ? ` — ${att.present}/${att.total}` : ""}
                </Typography.Text>
                <Progress
                  percent={presenceRate}
                  size="small"
                  strokeColor={
                    presenceRate >= 75
                      ? "#059669"
                      : presenceRate >= 50
                        ? "#d97706"
                        : "#dc2626"
                  }
                  style={{ margin: "4px 0 0" }}
                />
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}

// ── Modal: Pedir correcção de um registo de assiduidade (Fase 5) ────
function JustifyAttendanceModal({
  studentId,
  attendanceId,
  open,
  onClose,
}: {
  studentId: string;
  attendanceId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [form] = Form.useForm();
  const [proofUrl, setProofUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  const { mutateAsync, isPending } = useMutationPost(
    ["guardian", "attendance", studentId],
    `attendance/${attendanceId}/justification-requests`,
  );

  const handleUpload = async ({ file }: { file: File }) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "documents");
      const res = await axiosInstance.post("/assets/upload", formData);
      setProofUrl(res.data.url);
      message.success("Comprovativo anexado.");
    } catch {
      message.error("Não foi possível enviar o comprovativo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      await mutateAsync({ ...values, proofUrl });
      message.success(
        "Pedido enviado. O professor vai rever e aprovar/rejeitar.",
      );
      form.resetFields();
      setProofUrl(undefined);
      onClose();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ?? "Não foi possível enviar o pedido.",
      );
    }
  };

  return (
    <Modal
      title="Pedir correcção deste registo"
      open={open}
      onCancel={onClose}
      okText="Enviar pedido"
      cancelText="Cancelar"
      confirmLoading={isPending}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Motivo"
          name="reason"
          rules={[{ required: true, message: "Indique o motivo do pedido." }]}
        >
          <AntInput.TextArea
            rows={3}
            placeholder="Ex.: o meu educando esteve presente, mas foi marcado como ausente."
          />
        </Form.Item>
        <Form.Item label="Anexar comprovativo (opcional)">
          <Upload
            customRequest={({ file }) => handleUpload({ file: file as File })}
            showUploadList={false}
            accept="image/*,.pdf"
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              {proofUrl ? "Comprovativo anexado ✓" : "Escolher ficheiro"}
            </Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ── Tab: Assiduidade ──────────────────────────────────────────────
function AttendanceTab({
  studentId,
  academicYearId,
}: {
  studentId: string;
  academicYearId?: string;
}) {
  const { data, isPending } = useStudentAttendance(
    studentId,
    undefined,
    academicYearId,
  );
  const stats = data?.stats ?? [];
  const attendance = data?.attendance ?? [];
  const [justifyingId, setJustifyingId] = useState<string | null>(null);

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
              <Button
                type="link"
                size="small"
                style={{ padding: 0, height: "auto", fontSize: 11 }}
                onClick={() => setJustifyingId(a.id)}
              >
                Pedir correcção
              </Button>
            </div>
          ),
        }))}
      />

      {justifyingId && (
        <JustifyAttendanceModal
          studentId={studentId}
          attendanceId={justifyingId}
          open={!!justifyingId}
          onClose={() => setJustifyingId(null)}
        />
      )}
    </div>
  );
}

// ── Tab: Horário ──────────────────────────────────────────────────
function ScheduleTab({
  studentId,
  academicYearId,
}: {
  studentId: string;
  academicYearId?: string;
}) {
  const { data, isPending } = useStudentSchedule(studentId, academicYearId);
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

// ── Tab: Avaliações (Fase 10) — calendário de testes agendados pelo
// professor, distinto de "Avaliações"/Notas (o resultado em si).
function AssessmentsTab({
  studentId,
  academicYearId,
}: {
  studentId: string;
  academicYearId?: string;
}) {
  const { data: scheduleData, isPending: schedulePending } = useStudentSchedule(
    studentId,
    academicYearId,
  );
  const sectionId = scheduleData?.section?.id as string | undefined;
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sectionId) {
      setAssessments([]);
      return;
    }
    setLoading(true);
    axiosInstance
      .get(`/assessments?sectionId=${sectionId}`)
      .then((res) => setAssessments(res.data?.assessments ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sectionId]);

  if (schedulePending || loading)
    return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!assessments.length)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Sem avaliações agendadas"
      />
    );

  const today = dayjs().startOf("day");
  const upcoming = assessments.filter((a) => !dayjs(a.date).isBefore(today, "day"));
  const past = assessments.filter((a) => dayjs(a.date).isBefore(today, "day"));

  const renderCard = (a: any, isPast?: boolean) => (
    <Col key={a.id} xs={24} sm={12} md={8}>
      <Card size="small" style={{ opacity: isPast ? 0.6 : 1 }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <div>
            <Typography.Text strong style={{ display: "block", fontSize: 13 }}>
              {a.subject?.name}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {a.term?.name}
            </Typography.Text>
          </div>
          <Tag color={isPast ? "default" : "processing"}>
            {GRADE_TYPE_LABEL[a.type] ?? a.type}
          </Tag>
        </div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <CalendarOutlined style={{ color: "var(--color-text-secondary)" }} />
          <Typography.Text style={{ fontSize: 13 }}>
            {dayjs(a.date).format("DD/MM/YYYY")}
          </Typography.Text>
        </div>
        {a.description && (
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12, display: "block", marginTop: 6 }}
          >
            {a.description}
          </Typography.Text>
        )}
      </Card>
    </Col>
  );

  return (
    <div>
      {upcoming.length > 0 && (
        <>
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12, display: "block", marginBottom: 12 }}
          >
            Próximas avaliações
          </Typography.Text>
          <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
            {upcoming.map((a) => renderCard(a))}
          </Row>
        </>
      )}
      {past.length > 0 && (
        <>
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12, display: "block", marginBottom: 12 }}
          >
            Já realizadas
          </Typography.Text>
          <Row gutter={[12, 12]}>{past.map((a) => renderCard(a, true))}</Row>
        </>
      )}
    </div>
  );
}

// ── Modal: Reportar pagamento ──────────────────────────────────────
function ReportPaymentModal({
  studentId,
  invoiceId,
  open,
  onClose,
}: {
  studentId: string;
  invoiceId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [form] = Form.useForm();
  const [proofUrl, setProofUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  const { mutateAsync, isPending } = useMutationPost(
    ["guardian", "invoices", studentId],
    `guardian/students/${studentId}/invoices/${invoiceId}/report-payment`,
  );

  const handleUpload = async ({ file }: { file: File }) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "payment-proofs");
      const res = await axiosInstance.post("/assets/upload", formData);
      setProofUrl(res.data.url);
      message.success("Comprovativo anexado.");
    } catch {
      message.error("Não foi possível enviar o comprovativo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      await mutateAsync({ ...values, proofUrl });
      message.success(
        "Pagamento reportado. Aguarda confirmação da Secretaria/Financeiro.",
      );
      form.resetFields();
      setProofUrl(undefined);
      onClose();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ?? "Não foi possível reportar o pagamento.",
      );
    }
  };

  return (
    <Modal
      title="Reportar pagamento"
      open={open}
      onCancel={onClose}
      okText="Reportar"
      cancelText="Cancelar"
      confirmLoading={isPending}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Método"
          name="method"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <Select
            placeholder="Como pagou?"
            options={[
              { label: "Referência (entidade/referência)", value: "REFERENCE" },
              { label: "Depósito/Transferência bancária", value: "TRANSFER" },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="Valor pago (MZN)"
          name="amountPaid"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Referência/comprovativo (nº do talão, etc.)" name="reference">
          <AntInput placeholder="Opcional" />
        </Form.Item>
        <Form.Item label="Notas" name="notes">
          <AntInput.TextArea rows={2} placeholder="Opcional" />
        </Form.Item>
        <Form.Item label="Anexar comprovativo">
          <Upload
            customRequest={({ file }) => handleUpload({ file: file as File })}
            showUploadList={false}
            accept="image/*,.pdf"
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              {proofUrl ? "Comprovativo anexado ✓" : "Escolher ficheiro"}
            </Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ── Tab: Propinas ─────────────────────────────────────────────────
function InvoicesTab({ studentId }: { studentId: string }) {
  const [academicYearId, setAcademicYearId] = useState<string | undefined>();
  const { data, isPending } = useStudentInvoices(studentId, academicYearId);
  const { data: settingsData } = useFetch<{ settings: { paymentEntityCode?: string } }>(
    ["settings"],
    "settings",
  );
  const invoices = data?.invoices ?? [];
  const totalPending = data?.totalPending ?? 0;
  const entityCode = settingsData?.settings?.paymentEntityCode;
  const [reportingInvoiceId, setReportingInvoiceId] = useState<string | null>(
    null,
  );

  const copyReference = (reference: string) => {
    navigator.clipboard
      .writeText(reference)
      .then(() => message.success("Referência copiada."))
      .catch(() => message.error("Não foi possível copiar."));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <AcademicYearSelect
          value={academicYearId}
          onChange={setAcademicYearId}
          allowClear
          clearLabel="Todos os anos"
        />
      </div>

      {isPending ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !invoices.length ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sem facturas registadas"
        />
      ) : (
        <>
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
        {invoices.map((inv: any) => {
          const payable = inv.status === "UNPAID" || inv.status === "OVERDUE";
          return (
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

              {payable && inv.paymentReference && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 10,
                    borderRadius: 6,
                    background: "var(--color-background-secondary)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 12 }}>
                    <Typography.Text type="secondary">Entidade: </Typography.Text>
                    <Typography.Text strong>{entityCode ?? "—"}</Typography.Text>
                    <Typography.Text type="secondary" style={{ marginLeft: 12 }}>
                      Referência:{" "}
                    </Typography.Text>
                    <Typography.Text strong>{inv.paymentReference}</Typography.Text>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => copyReference(inv.paymentReference)}
                    />
                  </div>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => setReportingInvoiceId(inv.id)}
                  >
                    Reportei o pagamento
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {reportingInvoiceId && (
        <ReportPaymentModal
          studentId={studentId}
          invoiceId={reportingInvoiceId}
          open={!!reportingInvoiceId}
          onClose={() => setReportingInvoiceId(null)}
        />
      )}
        </>
      )}
    </div>
  );
}

// ── Tab: Documentos (Fase 9) — só leitura/descarga; o upload é feito
// pela Secretaria/Admin no perfil do aluno.
function DocumentsTab({ studentId }: { studentId: string }) {
  const { data, isPending } = useFetch(
    ["student-documents", studentId],
    `student-documents?studentId=${studentId}`,
    { enabled: !!studentId },
  );
  const documents = data?.documents ?? [];

  if (isPending) return <Skeleton active paragraph={{ rows: 4 }} />;
  if (!documents.length)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Sem documentos disponíveis"
      />
    );

  return (
    <List
      dataSource={documents}
      renderItem={(d: any) => (
        <List.Item
          actions={[
            <a key="download" href={d.url} target="_blank" rel="noreferrer">
              <Button size="small" icon={<DownloadOutlined />}>
                Descarregar
              </Button>
            </a>,
          ]}
        >
          <List.Item.Meta
            avatar={<FileTextOutlined style={{ fontSize: 20 }} />}
            title={d.label}
            description={
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {intlDate(d.createdAt)}
              </Typography.Text>
            }
          />
        </List.Item>
      )}
    />
  );
}

// ── Página principal ──────────────────────────────────────────────
export default function GuardianStudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const activeYearId = useActiveAcademicYearId();
  const [academicYearId, setAcademicYearId] = useState<string | undefined>();

  // const { data: gradesData } = useStudentGrades(id ?? "");
  // const { data: attendanceData } = useStudentAttendance(id ?? "");
  const { data: invoicesData } = useStudentInvoices(id ?? "");

  const overdueInvoices =
    invoicesData?.invoices?.filter(
      (i: any) => i.status === "UNPAID" || i.status === "OVERDUE",
    ).length ?? 0;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
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
        <AcademicYearSelect
          value={academicYearId ?? activeYearId}
          onChange={setAcademicYearId}
        />
      </div>

      <Tabs
        items={[
          {
            key: "grades",
            label: "Notas",
            children: (
              <GradesTab
                studentId={id ?? ""}
                academicYearId={academicYearId ?? activeYearId}
              />
            ),
          },
          {
            key: "assessments",
            label: "Avaliações",
            children: (
              <AssessmentsTab
                studentId={id ?? ""}
                academicYearId={academicYearId ?? activeYearId}
              />
            ),
          },
          {
            key: "performance",
            label: "Desempenho",
            children: (
              <PerformanceTab
                studentId={id ?? ""}
                academicYearId={academicYearId ?? activeYearId}
              />
            ),
          },
          {
            key: "attendance",
            label: "Assiduidade",
            children: (
              <AttendanceTab
                studentId={id ?? ""}
                academicYearId={academicYearId ?? activeYearId}
              />
            ),
          },
          {
            key: "schedule",
            label: "Horário",
            children: (
              <ScheduleTab
                studentId={id ?? ""}
                academicYearId={academicYearId ?? activeYearId}
              />
            ),
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
          {
            key: "documents",
            label: "Documentos",
            children: <DocumentsTab studentId={id ?? ""} />,
          },
        ]}
      />
    </>
  );
}
