// pages/admin/alunos/perfil.tsx
import {
  CalendarOutlined,
  HomeOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UnlockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input as AntInput,
  Modal,
  Progress,
  Row,
  Skeleton,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { useFetch, useMutationPatch } from "../../../utils/fetch";
import { intlDate } from "../../../utils/intl";

const { Text, Title } = Typography;

const GENDER_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro",
};

const GRADE_TYPE_LABEL: Record<string, string> = {
  AC1: "Avaliação 1",
  AC2: "Avaliação 2",
  EXAM: "Exame",
  RETAKE: "Recurso",
};

const ATT_COLOR: Record<string, string> = {
  PRESENT: "success",
  ABSENT: "error",
  LATE: "warning",
  JUSTIFIED: "processing",
};

const ATT_LABEL: Record<string, string> = {
  PRESENT: "Presente",
  ABSENT: "Falta",
  LATE: "Atraso",
  JUSTIFIED: "Justificada",
};

const INV_COLOR: Record<string, string> = {
  PAID: "success",
  UNPAID: "warning",
  OVERDUE: "error",
  CANCELLED: "default",
};

const INV_LABEL: Record<string, string> = {
  PAID: "Pago",
  UNPAID: "Pendente",
  OVERDUE: "Em atraso",
  CANCELLED: "Cancelado",
};

// ── Tab Notas ────────────────────────────────────────────────────
function GradesTab({ studentId }: { studentId: string }) {
  const { data, isPending } = useFetch(
    ["grades-student", studentId],
    `grades?studentId=${studentId}`,
    { enabled: !!studentId },
  );

  if (isPending) return <Skeleton active paragraph={{ rows: 4 }} />;
  const grades = data?.grades ?? [];
  if (!grades.length)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Sem notas registadas"
      />
    );

  // Agrupar por trimestre → disciplina
  const grouped: Record<string, Record<string, any[]>> = {};
  grades.forEach((g: any) => {
    const term = g.term?.name ?? "—";
    const subject = g.subject?.name ?? "—";
    if (!grouped[term]) grouped[term] = {};
    if (!grouped[term][subject]) grouped[term][subject] = [];
    grouped[term][subject].push(g);
  });

  return (
    <div>
      {Object.entries(grouped).map(([term, subjects]) => (
        <Card key={term} title={term} size="small" style={{ marginBottom: 16 }}>
          {Object.entries(subjects).map(([subject, gs]) => (
            <div key={subject} style={{ marginBottom: 16 }}>
              <Text
                strong
                style={{ fontSize: 13, display: "block", marginBottom: 8 }}
              >
                {subject}
              </Text>
              <Row gutter={[8, 8]}>
                {gs.map((g: any) => (
                  <Col key={g.id} xs={12} sm={6} md={4}>
                    <Card
                      size="small"
                      style={{
                        textAlign: "center",
                        background: "var(--color-background-secondary)",
                        border: "none",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 500,
                          color:
                            Number(g.value) >= 10
                              ? "var(--color-text-success)"
                              : "var(--color-text-danger)",
                        }}
                      >
                        {Number(g.value).toFixed(1)}
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
          ))}
        </Card>
      ))}
    </div>
  );
}

// ── Tab Assiduidade ──────────────────────────────────────────────
function AttendanceTab({ studentId }: { studentId: string }) {
  const { data, isPending } = useFetch(
    ["attendance-student", studentId],
    `attendance?studentId=${studentId}`,
    { enabled: !!studentId },
  );

  if (isPending) return <Skeleton active paragraph={{ rows: 4 }} />;
  const records = data?.attendance ?? [];
  if (!records.length)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Sem registos de assiduidade"
      />
    );

  // Stats por disciplina
  const stats: Record<string, Record<string, number>> = {};
  records.forEach((a: any) => {
    const k = a.subject?.name ?? "—";
    if (!stats[k])
      stats[k] = { PRESENT: 0, ABSENT: 0, LATE: 0, JUSTIFIED: 0, total: 0 };
    stats[k][a.status] = (stats[k][a.status] ?? 0) + 1;
    stats[k].total++;
  });

  return (
    <div>
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {Object.entries(stats).map(([subject, s]) => {
          const rate =
            s.total > 0 ? Math.round((s.PRESENT / s.total) * 100) : 0;
          return (
            <Col key={subject} xs={24} sm={12} md={8}>
              <Card size="small">
                <Text strong style={{ fontSize: 13, display: "block" }}>
                  {subject}
                </Text>
                <Progress
                  percent={rate}
                  size="small"
                  strokeColor={
                    rate >= 75 ? "#059669" : rate >= 50 ? "#d97706" : "#dc2626"
                  }
                  style={{ margin: "6px 0 4px" }}
                />
                <Space size="small">
                  <Text style={{ fontSize: 11 }}>✅ {s.PRESENT}</Text>
                  <Text style={{ fontSize: 11 }}>❌ {s.ABSENT}</Text>
                  {s.LATE > 0 && (
                    <Text style={{ fontSize: 11 }}>⏰ {s.LATE}</Text>
                  )}
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Timeline
        items={records.slice(0, 30).map((a: any) => ({
          color:
            a.status === "PRESENT"
              ? "green"
              : a.status === "ABSENT"
                ? "red"
                : "orange",
          children: (
            <div>
              <Tag color={ATT_COLOR[a.status]} style={{ fontSize: 11 }}>
                {ATT_LABEL[a.status]}
              </Tag>
              <Text style={{ fontSize: 12, marginLeft: 6 }}>
                {a.subject?.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                {a.date ? intlDate(a.date) : "—"}
              </Text>
            </div>
          ),
        }))}
      />
    </div>
  );
}

// ── Tab Propinas ─────────────────────────────────────────────────
function InvoicesTab({ studentId }: { studentId: string }) {
  const { data, isPending } = useFetch(
    ["enrollments-student", studentId],
    `enrollments?studentId=${studentId}`,
    { enabled: !!studentId },
  );

  if (isPending) return <Skeleton active paragraph={{ rows: 4 }} />;
  const enrollments = data?.enrollments ?? [];
  const allInvoices = enrollments.flatMap((e: any) => e.invoices ?? []);

  if (!allInvoices.length)
    return (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sem facturas" />
    );

  return (
    <Table
      rowKey="id"
      dataSource={allInvoices}
      pagination={false}
      size="small"
      columns={[
        {
          title: "Descrição",
          dataIndex: "description",
          render: (v: string) => v ?? "—",
        },
        { title: "Trimestre", render: (_: any, r: any) => r.term?.name ?? "—" },
        {
          title: "Valor",
          render: (_: any, r: any) => `MZN ${Number(r.amount).toFixed(2)}`,
        },
        {
          title: "Vencimento",
          render: (_: any, r: any) => (r.dueDate ? intlDate(r.dueDate) : "—"),
        },
        {
          title: "Estado",
          render: (_: any, r: any) => (
            <Tag color={INV_COLOR[r.status]}>
              {INV_LABEL[r.status] ?? r.status}
            </Tag>
          ),
        },
      ]}
    />
  );
}

// ── Tab Matrícula ────────────────────────────────────────────────
function EnrollmentTab({ studentId }: { studentId: string }) {
  const { data, isPending } = useFetch(
    ["enrollments-student", studentId],
    `enrollments?studentId=${studentId}`,
    { enabled: !!studentId },
  );

  if (isPending) return <Skeleton active paragraph={{ rows: 3 }} />;
  const enrollments = data?.enrollments ?? [];
  if (!enrollments.length)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Sem inscrições"
      />
    );

  return (
    <Table
      rowKey="id"
      dataSource={enrollments}
      pagination={false}
      size="small"
      columns={[
        {
          title: "Ano Lectivo",
          render: (_: any, r: any) => r.academicYear?.year ?? "—",
        },
        { title: "Classe", render: (_: any, r: any) => r.level?.name ?? "—" },
        { title: "Turma", render: (_: any, r: any) => r.section?.name ?? "—" },
        {
          title: "Estado",
          render: (_: any, r: any) => (
            <Tag color={r.status === "APPROVED" ? "success" : "default"}>
              {r.status === "APPROVED" ? "Aprovado" : r.status}
            </Tag>
          ),
        },
        {
          title: "Data",
          render: (_: any, r: any) =>
            r.createdAt ? intlDate(r.createdAt) : "—",
        },
      ]}
    />
  );
}

// ── Modal: Desbloquear aluno (inadimplência) ─────────────────────
function UnblockStudentModal({
  studentId,
  open,
  onClose,
}: {
  studentId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [form] = Form.useForm();
  const { mutateAsyncPatch, isPending } = useMutationPatch(
    ["student", studentId],
    "students",
  );

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      await mutateAsyncPatch({
        id: studentId,
        urlParams: "financial-override",
        body: {
          untilDate: values.untilDate.toISOString(),
          reason: values.reason,
        },
      });
      message.success("Aluno desbloqueado temporariamente.");
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Não foi possível desbloquear o aluno.",
      );
    }
  };

  return (
    <Modal
      title="Desbloquear aluno temporariamente"
      open={open}
      onCancel={onClose}
      okText="Desbloquear"
      cancelText="Cancelar"
      confirmLoading={isPending}
      onOk={handleSubmit}
    >
      <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
        A dívida não é apagada — só a consulta de notas volta a ficar
        disponível até à data escolhida.
      </Typography.Paragraph>
      <Form form={form} layout="vertical">
        <Form.Item
          label="Desbloqueado até"
          name="untilDate"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item label="Motivo (opcional)" name="reason">
          <AntInput.TextArea rows={2} placeholder="Ex.: negociação em curso" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ── Página principal ─────────────────────────────────────────────
export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [unblockOpen, setUnblockOpen] = useState(false);

  const { data, isPending } = useFetch(
    ["student", id ?? ""],
    `students/${id}`,
    { enabled: !!id },
  );

  const student = data?.student;
  const user = student?.user ?? student;

  const hasActiveOverride =
    !!student?.financialOverrideUntil &&
    new Date(student.financialOverrideUntil) > new Date();
  const isBlocked = !!student?.financialState && !hasActiveOverride;

  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "—";

  // Contagem de propinas pendentes para o badge
  const { data: enrollData } = useFetch(
    ["enrollments-badge", id ?? ""],
    `enrollments?studentId=${id}`,
    { enabled: !!id },
  );
  const pendingCount = (enrollData?.enrollments ?? [])
    .flatMap((e: any) => e.invoices ?? [])
    .filter((i: any) => i.status === "UNPAID" || i.status === "OVERDUE").length;

  const statusColor: Record<string, string> = {
    ACTIVE: "success",
    INACTIVE: "error",
    SUSPENDED: "warning",
  };

  return (
    <>
      <CustomBreadcrumb
        title="Perfil do Aluno"
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Alunos", href: "#", onClick: () => navigate("/alunos") },
          { title: fullName },
        ]}
        onPrev
      />

      <Row gutter={[16, 16]}>
        {/* Avatar + info rápida */}
        <Col md={5} xs={24}>
          <Card style={{ textAlign: "center" }}>
            {isPending ? (
              <Skeleton.Avatar active size={100} />
            ) : (
              <Avatar
                src={user?.avatar}
                icon={<UserOutlined />}
                size={100}
                style={{ border: "2px solid var(--color-border-secondary)" }}
              />
            )}
            {!isPending && (
              <div style={{ marginTop: 12 }}>
                <Title level={5} style={{ margin: 0 }}>
                  {fullName}
                </Title>
                <Text
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {user?.identifier}
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color={statusColor[user?.status ?? "ACTIVE"]}>
                    {user?.status === "ACTIVE"
                      ? "Activo"
                      : user?.status === "SUSPENDED"
                        ? "Suspenso"
                        : "Inactivo"}
                  </Tag>
                  {isBlocked && (
                    <Tag icon={<LockOutlined />} color="error">
                      Bloqueado por inadimplência
                    </Tag>
                  )}
                  {hasActiveOverride && (
                    <Tag icon={<UnlockOutlined />} color="processing">
                      Desbloqueado até{" "}
                      {intlDate(student.financialOverrideUntil)}
                    </Tag>
                  )}
                </div>
                <Button
                  size="small"
                  style={{ marginTop: 12, width: "100%" }}
                  onClick={() => navigate(`/alunos/editar/${id}`)}
                >
                  Editar dados
                </Button>
                {isBlocked && (
                  <Button
                    size="small"
                    style={{ marginTop: 8, width: "100%" }}
                    icon={<UnlockOutlined />}
                    onClick={() => setUnblockOpen(true)}
                  >
                    Desbloquear temporariamente
                  </Button>
                )}
              </div>
            )}
          </Card>
        </Col>

        {/* Dados + Tabs */}
        <Col md={19} xs={24}>
          {isPending ? (
            <Card>
              <Skeleton active paragraph={{ rows: 5 }} />
            </Card>
          ) : (
            <>
              <Card size="small" style={{ marginBottom: 16 }}>
                <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }}>
                  <Descriptions.Item
                    label={
                      <>
                        <MailOutlined /> E-mail
                      </>
                    }
                  >
                    {user?.email ?? "—"}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <PhoneOutlined /> Telefone
                      </>
                    }
                  >
                    {user?.phoneNumber ?? "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Género">
                    {GENDER_LABEL[user?.gender ?? ""] ?? "—"}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <CalendarOutlined /> Nascimento
                      </>
                    }
                  >
                    {user?.birthday ? intlDate(user.birthday) : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Naturalidade">
                    {student?.naturalness ?? "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Encarregado">
                    {student?.guardian?.user
                      ? `${student.guardian.user.firstName} ${student.guardian.user.lastName}`
                      : "—"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Tabs
                items={[
                  {
                    key: "enrollment",
                    label: "Matrículas",
                    children: <EnrollmentTab studentId={id ?? ""} />,
                  },
                  {
                    key: "grades",
                    label: "Notas",
                    children: <GradesTab studentId={id ?? ""} />,
                  },
                  {
                    key: "attendance",
                    label: "Assiduidade",
                    children: <AttendanceTab studentId={id ?? ""} />,
                  },
                  {
                    key: "invoices",
                    label: (
                      <Badge count={pendingCount} size="small" offset={[6, -2]}>
                        Propinas
                      </Badge>
                    ),
                    children: <InvoicesTab studentId={id ?? ""} />,
                  },
                ]}
              />
            </>
          )}
        </Col>
      </Row>

      {id && (
        <UnblockStudentModal
          studentId={id}
          open={unblockOpen}
          onClose={() => setUnblockOpen(false)}
        />
      )}
    </>
  );
}
