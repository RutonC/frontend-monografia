// pages/teacher/Presence.tsx
import { CheckOutlined, CloseOutlined, SaveOutlined } from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api, useAuthStore } from "../../store/authStore";

const { Title, Text } = Typography;

type AttStatus = "PRESENT" | "ABSENT" | "LATE" | "JUSTIFIED";

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Presente", color: "success" },
  { value: "ABSENT", label: "Ausente", color: "error" },
  { value: "LATE", label: "Atrasado", color: "warning" },
  { value: "JUSTIFIED", label: "Justificado", color: "default" },
] as const;

interface Section {
  id: string;
  name: string;
  level?: { name: string };
}
interface Subject {
  id: string;
  name: string;
}
interface Term {
  id: string;
  name: string;
}

interface AttRow {
  enrollmentId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  identifier?: string;
  status: AttStatus;
  existingId?: string;
}

function statusTag(s: AttStatus) {
  const opt = STATUS_OPTIONS.find((o) => o.value === s);
  return <Tag color={opt?.color ?? "default"}>{opt?.label ?? s}</Tag>;
}

export default function TeacherPresence() {
  const location = useLocation();
  const { user } = useAuthStore();

  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  // filtros obrigatórios (o bulk attendance exige todos os 4)
  const [selSection, setSelSection] = useState<string | null>(
    location.state?.sectionId ?? null,
  );
  const [selSubject, setSelSubject] = useState<string | null>(null);
  const [selTerm, setSelTerm] = useState<string | null>(null);
  const [selDate, setSelDate] = useState<Dayjs>(dayjs());

  const [rows, setRows] = useState<AttRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [booting, setBooting] = useState(true);

  const presentCount = rows.filter((r) => r.status === "PRESENT").length;
  const absentCount = rows.filter((r) => r.status === "ABSENT").length;
  const otherCount = rows.length - presentCount - absentCount;

  // ── carrega dados base ─────────────────────────────────────────
  useEffect(() => {
    Promise.all([api.get("/sections"), api.get("/subjects"), api.get("/terms")])
      .then(([s, sub, t]) => {
        setSections(s.data?.sections ?? []);
        setSubjects(sub.data?.subjects ?? []);
        setTerms(t.data?.terms ?? t.data?.data ?? []);
      })
      .catch(console.error)
      .finally(() => setBooting(false));
  }, []);

  // ── carrega alunos + assiduidade existente ──────────────────────
  useEffect(() => {
    if (!selSection || !selDate) {
      setRows([]);
      return;
    }
    setLoading(true);
    const dateStr = selDate.format("YYYY-MM-DD");

    Promise.all([
      // enrollments da turma — devolve { enrollments: [] }
      api.get(`/enrollments?sectionId=${selSection}&status=APPROVED`),
      // presenças já registadas para este dia/turma — devolve { attendance: [] }
      api.get(`/attendance?sectionId=${selSection}&date=${dateStr}`),
    ])
      .then(([enrollRes, attRes]) => {
        const enrollments: any[] = enrollRes.data?.enrollments ?? [];
        const existing: any[] = attRes.data?.attendance ?? [];

        const attMap = new Map(existing.map((a: any) => [a.studentId, a]));

        setRows(
          enrollments.map((e) => {
            const u = e.student?.user ?? {};
            const att = attMap.get(e.studentId);
            return {
              enrollmentId: e.id,
              studentId: e.studentId,
              firstName: u.firstName ?? "—",
              lastName: u.lastName ?? "",
              avatar: u.avatar,
              identifier: u.identifier,
              status: (att?.status as AttStatus) ?? "PRESENT",
              existingId: att?.id,
            };
          }),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selSection, selDate]);

  const handleStatusChange = (studentId: string, status: AttStatus) => {
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)),
    );
  };

  const markAll = (status: AttStatus) => {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSave = async () => {
    if (!selSection || !selDate) return;

    // O bulk requer subjectId e termId — se não foram seleccionados, avisa
    if (!selSubject || !selTerm) {
      message.warning(
        "Seleccione também a disciplina e o trimestre para guardar.",
      );
      return;
    }

    setSaving(true);
    const dateStr = selDate.format("YYYY-MM-DD");
    const hasExisting = rows.some((r) => r.existingId);

    try {
      if (!hasExisting) {
        // Bulk create — o controller exige date, subjectId, termId, teacherId, sectionId
        await api.post("/attendance/bulk", {
          sectionId: selSection,
          subjectId: selSubject,
          termId: selTerm,
          teacherId: user?.id,
          date: dateStr,
          records: rows.map((r) => ({
            studentId: r.studentId,
            status: r.status,
          })),
        });
      } else {
        // Update individual para os existentes, create para os novos
        await Promise.all(
          rows.map((r) => {
            const payload = {
              studentId: r.studentId,
              sectionId: selSection,
              subjectId: selSubject,
              termId: selTerm,
              teacherId: user?.id,
              date: dateStr,
              status: r.status,
            };
            return r.existingId
              ? api.patch(`/attendance/${r.existingId}`, { status: r.status })
              : api.post("/attendance", payload);
          }),
        );
      }
      message.success("Assiduidade guardada com sucesso!");
    } catch (err: any) {
      message.error(
        err.response?.data?.message ?? "Erro ao guardar assiduidade.",
      );
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<AttRow> = [
    {
      title: "Aluno",
      key: "student",
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar src={r.avatar} size={34} style={{ background: "#4f46e5" }}>
            {r.firstName?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>
              {r.firstName} {r.lastName}
            </div>
            {r.identifier && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {r.identifier}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Estado",
      key: "status",
      width: 130,
      align: "center",
      render: (_, r) => statusTag(r.status),
    },
    {
      title: "Alterar",
      key: "change",
      width: 190,
      align: "center",
      render: (_, r) => (
        <Select
          value={r.status}
          onChange={(v) => handleStatusChange(r.studentId, v as AttStatus)}
          style={{ width: 165 }}
          options={STATUS_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
        />
      ),
    },
  ];

  if (booting) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const filtersComplete = !!selSection && !!selSubject && !!selTerm;

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Registo de Assiduidade
        </Title>
        <Text type="secondary">
          Marque a presença dos alunos por turma, disciplina e data.
        </Text>
      </div>

      {/* Filtros */}
      <Card style={{ borderRadius: 12, marginBottom: 20 }}>
        <Row gutter={[16, 12]} align="bottom">
          <Col xs={24} md={6}>
            <Form.Item label="Turma" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Seleccionar turma"
                value={selSection}
                onChange={(v) => {
                  setSelSection(v);
                  setRows([]);
                }}
                showSearch
                optionFilterProp="label"
                options={sections.map((s) => ({
                  value: s.id,
                  label: `${s.name}${s.level?.name ? ` · ${s.level.name}` : ""}`,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="Disciplina" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Seleccionar disciplina"
                value={selSubject}
                onChange={setSelSubject}
                showSearch
                optionFilterProp="label"
                disabled={!selSection}
                options={subjects.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={5}>
            <Form.Item label="Trimestre" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Trimestre"
                value={selTerm}
                onChange={setSelTerm}
                disabled={!selSubject}
                options={terms.map((t) => ({ value: t.id, label: t.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={4}>
            <Form.Item label="Data" style={{ marginBottom: 0 }}>
              <DatePicker
                value={selDate}
                onChange={(d) => d && setSelDate(d)}
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabledDate={(d) => d.isAfter(dayjs(), "day")}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={3}>
            <Form.Item label=" " style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <Button
                  icon={<CheckOutlined />}
                  size="small"
                  onClick={() => markAll("PRESENT")}
                  disabled={rows.length === 0}
                  title="Todos presentes"
                >
                  ✓
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  size="small"
                  danger
                  onClick={() => markAll("ABSENT")}
                  disabled={rows.length === 0}
                  title="Todos ausentes"
                >
                  ✗
                </Button>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {!selSection && (
        <Alert
          message="Seleccione uma turma para começar o registo de assiduidade."
          type="info"
          showIcon
          style={{ marginBottom: 20, borderRadius: 10 }}
        />
      )}

      {selSection && !filtersComplete && (
        <Alert
          message="Seleccione também a disciplina e o trimestre para poder guardar o registo."
          type="warning"
          showIcon
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      {selSection && (
        <>
          {/* Resumo */}
          {rows.length > 0 && (
            <Row gutter={12} style={{ marginBottom: 16 }}>
              {[
                { label: "Presentes", count: presentCount, color: "#16a34a" },
                { label: "Ausentes", count: absentCount, color: "#dc2626" },
                { label: "Outros", count: otherCount, color: "#f59e0b" },
              ].map((s) => (
                <Col xs={8} key={s.label}>
                  <Card
                    size="small"
                    style={{ borderRadius: 10, textAlign: "center" }}
                    styles={{ body: { padding: "10px 0" } }}
                  >
                    <div
                      style={{ fontSize: 24, fontWeight: 700, color: s.color }}
                    >
                      {s.count}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {s.label}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          <Card
            style={{ borderRadius: 12 }}
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text strong>
                  {rows.length} aluno{rows.length !== 1 ? "s" : ""} —{" "}
                  {selDate.format("DD/MM/YYYY")}
                </Text>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  disabled={rows.length === 0 || !filtersComplete}
                  onClick={handleSave}
                >
                  Guardar
                </Button>
              </div>
            }
          >
            <Table
              dataSource={rows}
              columns={columns}
              rowKey="studentId"
              loading={loading}
              pagination={{ pageSize: 30 }}
              locale={{ emptyText: "Nenhum aluno inscrito nesta turma." }}
            />
          </Card>
        </>
      )}
    </div>
  );
}
