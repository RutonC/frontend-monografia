// pages/teacher/Marks.tsx
import { SaveOutlined } from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api, useAuthStore } from "../../store/authStore";

const { Title, Text } = Typography;

// Tipos de nota conforme o schema do backend
const GRADE_TYPES = [
  { value: "TEST", label: "Teste" },
  { value: "EXAM", label: "Exame" },
  { value: "ASSIGNMENT", label: "Trabalho" },
  { value: "PROJECT", label: "Projecto" },
  { value: "ORAL", label: "Oral" },
];

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

/** Dados de uma linha da tabela — mistura enrollment + nota existente */
interface GradeRow {
  enrollmentId: string; // necessário para criar a nota
  studentId: string; // student record id (não user id)
  firstName: string;
  lastName: string;
  avatar?: string;
  identifier?: string;
  // nota existente (se já foi lançada)
  gradeId?: string;
  currentValue: number | null;
  // valor a submeter
  newValue: number | null;
}

function valueTag(v: number | null) {
  if (v === null) return <Tag color="default">—</Tag>;
  if (v >= 14) return <Tag color="success">{v}</Tag>;
  if (v >= 10) return <Tag color="warning">{v}</Tag>;
  return <Tag color="error">{v}</Tag>;
}

export default function TeacherMarks() {
  const location = useLocation();
  const { user } = useAuthStore();

  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [gradeType, setGradeType] = useState<string>("TEST");
  const [weight, setWeight] = useState<number>(1);

  const [selSection, setSelSection] = useState<string | null>(
    location.state?.sectionId ?? null,
  );
  const [selSubject, setSelSubject] = useState<string | null>(null);
  const [selTerm, setSelTerm] = useState<string | null>(null);

  const [rows, setRows] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [booting, setBooting] = useState(true);

  // ── carrega dados base ─────────────────────────────────────────
  useEffect(() => {
    Promise.all([api.get("/sections"), api.get("/subjects"), api.get("/terms")])
      .then(([s, sub, t]) => {
        // controllers devolvem { sections }, { subjects }, { terms }
        setSections(s.data?.sections ?? []);
        setSubjects(sub.data?.subjects ?? []);
        setTerms(t.data?.terms ?? t.data?.data ?? []);
      })
      .catch(console.error)
      .finally(() => setBooting(false));
  }, []);

  // ── carrega matrículas + notas quando os 3 filtros estão prontos ──
  useEffect(() => {
    if (!selSection || !selSubject || !selTerm) {
      setRows([]);
      return;
    }
    setLoading(true);

    Promise.all([
      // enrollments filtrados por turma — devolve { enrollments: [] }
      api.get(`/enrollments?sectionId=${selSection}&status=APPROVED`),
      // notas já lançadas para estes filtros — devolve { grades: [] }
      api.get(`/grades?subjectId=${selSubject}&termId=${selTerm}`),
    ])
      .then(([enrollRes, gradeRes]) => {
        const enrollments: any[] = enrollRes.data?.enrollments ?? [];
        const grades: any[] = gradeRes.data?.grades ?? [];

        // índice de notas por studentId para lookup O(1)
        const gradeMap = new Map(grades.map((g: any) => [g.studentId, g]));

        setRows(
          enrollments.map((e) => {
            // o student está nested: e.student.user.firstName
            const u = e.student?.user ?? {};
            const grade = gradeMap.get(e.studentId);
            return {
              enrollmentId: e.id,
              studentId: e.studentId,
              firstName: u.firstName ?? "—",
              lastName: u.lastName ?? "",
              avatar: u.avatar,
              identifier: u.identifier,
              gradeId: grade?.id,
              currentValue: grade?.value ?? null,
              newValue: grade?.value ?? null,
            };
          }),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selSection, selSubject, selTerm]);

  const handleChange = (studentId: string, v: number | null) => {
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, newValue: v } : r)),
    );
  };

  const handleSave = async () => {
    if (!selSubject || !selTerm) return;
    setSaving(true);

    try {
      await Promise.all(
        rows
          .filter((r) => r.newValue !== null)
          .map((r) => {
            const payload = {
              studentId: r.studentId,
              enrollmentId: r.enrollmentId, // obrigatório no controller
              subjectId: selSubject,
              termId: selTerm,
              teacherId: user?.id, // teacher.id = user.id neste schema
              value: r.newValue, // ← "value", não "score"
              type: gradeType, // obrigatório
              weight, // obrigatório
            };

            // Se já existe nota → PATCH, senão → POST
            return r.gradeId
              ? api.patch(`/grades/${r.gradeId}`, {
                  value: r.newValue,
                  type: gradeType,
                  weight,
                })
              : api.post("/grades", payload);
          }),
      );
      message.success("Notas guardadas com sucesso!");

      // Recarrega para reflectir gradeId nas linhas
      setSelTerm((t) => t); // forçar re-fetch
    } catch (err: any) {
      message.error(err.response?.data?.message ?? "Erro ao guardar notas.");
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<GradeRow> = [
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
      title: "Nota Actual",
      key: "current",
      width: 120,
      align: "center",
      render: (_, r) => valueTag(r.currentValue),
    },
    {
      title: "Nova Nota (0–20)",
      key: "input",
      width: 170,
      align: "center",
      render: (_, r) => (
        <InputNumber
          min={0}
          max={20}
          step={0.5}
          value={r.newValue ?? undefined}
          onChange={(v) => handleChange(r.studentId, v)}
          style={{ width: 110 }}
          placeholder="—"
        />
      ),
    },
    {
      title: "Estado",
      key: "status",
      width: 120,
      align: "center",
      render: (_, r) => {
        if (r.newValue === null) return <Tag>Sem nota</Tag>;
        if (r.newValue >= 10) return <Tag color="success">Aprovado</Tag>;
        return <Tag color="error">Reprovado</Tag>;
      },
    },
  ];

  if (booting) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const canSave =
    !!selSection &&
    !!selSubject &&
    !!selTerm &&
    rows.some((r) => r.newValue !== null);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Lançamento de Notas
        </Title>
        <Text type="secondary">
          Seleccione a turma, disciplina e trimestre para lançar ou editar
          notas.
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
                onChange={setSelSection}
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
          <Col xs={24} md={6}>
            <Form.Item label="Trimestre" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Seleccionar trimestre"
                value={selTerm}
                onChange={setSelTerm}
                disabled={!selSubject}
                options={terms.map((t) => ({ value: t.id, label: t.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={3}>
            <Form.Item label="Tipo" style={{ marginBottom: 0 }}>
              <Select
                value={gradeType}
                onChange={setGradeType}
                options={GRADE_TYPES}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={3}>
            <Form.Item label="Peso" style={{ marginBottom: 0 }}>
              <InputNumber
                min={0.1}
                max={10}
                step={0.1}
                value={weight}
                onChange={(v) => setWeight(v ?? 1)}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {(!selSection || !selSubject || !selTerm) && (
        <Alert
          message="Seleccione a turma, disciplina e trimestre para visualizar e lançar notas."
          type="info"
          showIcon
          style={{ marginBottom: 20, borderRadius: 10 }}
        />
      )}

      {selSection && selSubject && selTerm && (
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
                {rows.length} aluno{rows.length !== 1 ? "s" : ""}
              </Text>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                disabled={!canSave}
                onClick={handleSave}
              >
                Guardar Notas
              </Button>
            </div>
          }
        >
          <Table
            dataSource={rows}
            columns={columns}
            rowKey="enrollmentId"
            loading={loading}
            pagination={{ pageSize: 25 }}
            locale={{ emptyText: "Nenhum aluno inscrito nesta turma." }}
          />
        </Card>
      )}
    </div>
  );
}
