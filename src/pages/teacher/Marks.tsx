import {
  CheckOutlined,
  DownloadOutlined,
  EditOutlined,
  SaveOutlined,
  TableOutlined,
} from "@ant-design/icons";
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
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api, useAuthStore } from "../../store/authStore";
import {
  type StudentFichaRow,
  type TermGrades,
  approved,
  calcMA,
  calcMACS,
  calcMAP,
  calcMT,
  gerarFichaExcel,
} from "../../utils/fichaExcel";

const { Title, Text } = Typography;

const GRADE_TYPES = [
  { value: "ACS1", label: "ACS 1 — 1ª Avaliação Contínua" },
  { value: "ACS2", label: "ACS 2 — 2ª Avaliação Contínua" },
  { value: "ACS3", label: "ACS 3 — 3ª Avaliação Contínua" },
  { value: "ACP1", label: "ACP 1 — 1ª Avaliação com Prova" },
  { value: "ACP2", label: "ACP 2 — 2ª Avaliação com Prova" },
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

interface GradeEntryRow {
  enrollmentId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  identifier?: string;
  gradeId?: string;
  currentValue: number | null;
  newValue: number | null;
  saved: boolean;
}

function scoreColor(v: number | null): string {
  if (v === null) return "#d9d9d9";
  if (v >= 14) return "#52c41a";
  if (v >= 10) return "#faad14";
  return "#ff4d4f";
}

function ScoreCell({ v }: { v: number | null }) {
  if (v === null) return <span style={{ color: "#bbb" }}>—</span>;
  return (
    <span style={{ fontWeight: 700, color: scoreColor(v), fontSize: 13 }}>
      {v}
    </span>
  );
}

// ── Tab 1: Lançar Notas ───────────────────────────────────────────────────────

function TabLancar({
  sections,
  subjects,
  terms,
  user,
  initialSection,
}: {
  sections: Section[];
  subjects: Subject[];
  terms: Term[];
  user: any;
  initialSection: string | null;
}) {
  const [selSection, setSelSection] = useState<string | null>(initialSection);
  const [selSubject, setSelSubject] = useState<string | null>(null);
  const [selTerm, setSelTerm] = useState<string | null>(null);
  const [gradeType, setGradeType] = useState<string>("ACS1");
  const [rows, setRows] = useState<GradeEntryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selSection || !selSubject || !selTerm || !gradeType) {
      setRows([]);
      return;
    }
    setLoading(true);
    Promise.all([
      api.get(`/enrollments?sectionId=${selSection}&status=APPROVED`),
      api.get(`/grades?subjectId=${selSubject}&termId=${selTerm}`),
    ])
      .then(([eRes, gRes]) => {
        const enrollments: any[] = eRes.data?.enrollments ?? [];
        const grades: any[] = gRes.data?.grades ?? [];
        const gradeMap = new Map(
          grades
            .filter((g: any) => g.type === gradeType)
            .map((g: any) => [g.studentId, g]),
        );
        setRows(
          enrollments.map((e) => {
            const u = e.student?.user ?? {};
            const g = gradeMap.get(e.studentId);
            return {
              enrollmentId: e.id,
              studentId: e.studentId,
              firstName: u.firstName ?? "—",
              lastName: u.lastName ?? "",
              avatar: u.avatar,
              identifier: u.identifier,
              gradeId: g?.id,
              currentValue: g?.value ?? null,
              newValue: g?.value ?? null,
              saved: false,
            };
          }),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selSection, selSubject, selTerm, gradeType]);

  const handleChange = (studentId: string, v: number | null) =>
    setRows((prev) =>
      prev.map((r) =>
        r.studentId === studentId ? { ...r, newValue: v, saved: false } : r,
      ),
    );

  const handleSave = async () => {
    if (!selSubject || !selTerm) return;
    setSaving(true);
    const toSave = rows.filter((r) => r.newValue !== null && !r.saved);
    let ok = 0,
      errors = 0;
    for (const r of toSave) {
      try {
        const payload = {
          studentId: r.studentId,
          enrollmentId: r.enrollmentId,
          subjectId: selSubject,
          termId: selTerm,
          teacherId: user?.id,
          value: r.newValue,
          type: gradeType,
          weight: 1,
        };
        if (r.gradeId) {
          await api.patch(`/grades/${r.gradeId}`, {
            value: r.newValue,
            type: gradeType,
          });
        } else {
          await api.post("/grades", payload);
        }
        setRows((prev) =>
          prev.map((row) =>
            row.studentId === r.studentId
              ? { ...row, saved: true, currentValue: r.newValue }
              : row,
          ),
        );
        ok++;
      } catch {
        errors++;
      }
    }
    if (ok)
      message.success(
        `${ok} nota${ok > 1 ? "s" : ""} guardada${ok > 1 ? "s" : ""}!`,
      );
    if (errors)
      message.error(`${errors} erro${errors > 1 ? "s" : ""} ao guardar.`);
    setSaving(false);
  };

  const unsaved = rows.filter((r) => r.newValue !== null && !r.saved).length;

  const columns: ColumnsType<GradeEntryRow> = [
    {
      title: "Nº",
      width: 50,
      render: (_, __, i) => (
        <Text type="secondary">{String(i + 1).padStart(2, "0")}</Text>
      ),
    },
    {
      title: "Aluno",
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar src={r.avatar} size={32} style={{ background: "#4f46e5" }}>
            {r.firstName?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {r.firstName} {r.lastName}
            </div>
            {r.identifier && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {r.identifier}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Nota Actual",
      width: 110,
      align: "center",
      render: (_, r) => <ScoreCell v={r.currentValue} />,
    },
    {
      title: "Nova Nota (0–20)",
      width: 155,
      align: "center",
      render: (_, r) => (
        <InputNumber
          min={0}
          max={20}
          step={0.5}
          precision={1}
          value={r.newValue ?? undefined}
          onChange={(v) => handleChange(r.studentId, v)}
          disabled={r.saved}
          style={{ width: 105 }}
          placeholder="0.0"
          status={
            r.newValue !== null && r.newValue < 10 ? "warning" : undefined
          }
        />
      ),
    },
    {
      title: "Estado",
      width: 120,
      align: "center",
      render: (_, r) => {
        if (r.saved)
          return (
            <Tag color="success" icon={<CheckOutlined />}>
              Guardado
            </Tag>
          );
        if (r.newValue === null) return <Tag>—</Tag>;
        return (
          <Tag color={r.newValue >= 10 ? "success" : "error"}>
            {r.newValue >= 10 ? "Positiva" : "Negativa"}
          </Tag>
        );
      },
    },
  ];

  return (
    <div>
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="bottom">
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="Turma" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Turma"
                value={selSection}
                onChange={(v) => {
                  setSelSection(v);
                  setRows([]);
                }}
                options={sections.map((s) => ({
                  value: s.id,
                  label: `${s.name}${s.level?.name ? ` · ${s.level.name}` : ""}`,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="Disciplina" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Disciplina"
                value={selSubject}
                onChange={setSelSubject}
                disabled={!selSection}
                showSearch
                optionFilterProp="label"
                options={subjects.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
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
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Tipo de avaliação" style={{ marginBottom: 0 }}>
              <Select
                value={gradeType}
                onChange={setGradeType}
                disabled={!selTerm}
                options={GRADE_TYPES}
              />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={6}
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              disabled={unsaved === 0}
              onClick={handleSave}
            >
              Guardar ({unsaved})
            </Button>
          </Col>
        </Row>
      </Card>

      {!selSection || !selSubject || !selTerm ? (
        <Alert
          message="Seleccione turma, disciplina, trimestre e tipo de avaliação."
          type="info"
          showIcon
          style={{ borderRadius: 10 }}
        />
      ) : (
        <Card
          style={{ borderRadius: 12 }}
          title={
            <span>
              <Text strong>
                {rows.length} aluno{rows.length !== 1 ? "s" : ""}
              </Text>{" "}
              <Tag color="blue">
                {
                  GRADE_TYPES.find((t) => t.value === gradeType)?.label.split(
                    " — ",
                  )[0]
                }
              </Tag>
            </span>
          }
        >
          <Alert
            type="info"
            showIcon
            message="Preencha as notas de 0 a 20 com 1 casa decimal. Notas abaixo de 10 ficam a amarelo."
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
          <Table
            dataSource={rows}
            columns={columns}
            rowKey="enrollmentId"
            loading={loading}
            pagination={false}
            size="small"
            locale={{ emptyText: "Nenhum aluno inscrito nesta turma." }}
          />
        </Card>
      )}
    </div>
  );
}

// ── Tab 2: Pauta Trimestral ───────────────────────────────────────────────────

interface TermRow {
  enrollmentId: string;
  studentId: string;
  name: string;
  identifier?: string;
  ACS1: number | null;
  ACS2: number | null;
  ACS3: number | null;
  ACP1: number | null;
  ACP2: number | null;
}

const emptyTG = (): TermGrades => ({
  termName: "",
  termId: "",
  ACS1: null,
  ACS2: null,
  ACS3: null,
  ACP1: null,
  ACP2: null,
});

function TabPautaTrimestre({
  sections,
  subjects,
  terms,
}: {
  sections: Section[];
  subjects: Subject[];
  terms: Term[];
}) {
  const [selSection, setSelSection] = useState<string | null>(null);
  const [selSubject, setSelSubject] = useState<string | null>(null);
  const [selTerm, setSelTerm] = useState<string | null>(null);
  const [rows, setRows] = useState<TermRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selSection || !selSubject || !selTerm) {
      setRows([]);
      return;
    }
    setLoading(true);
    Promise.all([
      api.get(`/enrollments?sectionId=${selSection}&status=APPROVED`),
      api.get(`/grades?subjectId=${selSubject}&termId=${selTerm}`),
    ])
      .then(([eRes, gRes]) => {
        const enrollments: any[] = eRes.data?.enrollments ?? [];
        const grades: any[] = gRes.data?.grades ?? [];
        const gMap = new Map<string, Map<string, number>>();
        grades.forEach((g: any) => {
          if (!gMap.has(g.studentId)) gMap.set(g.studentId, new Map());
          gMap.get(g.studentId)!.set(g.type, g.value);
        });
        setRows(
          enrollments.map((e) => {
            const u = e.student?.user ?? {};
            const sm = gMap.get(e.studentId) ?? new Map();
            return {
              enrollmentId: e.id,
              studentId: e.studentId,
              name: `${u.lastName ?? ""} ${u.firstName ?? ""}`.trim(),
              identifier: u.identifier,
              ACS1: sm.get("ACS1") ?? null,
              ACS2: sm.get("ACS2") ?? null,
              ACS3: sm.get("ACS3") ?? null,
              ACP1: sm.get("ACP1") ?? null,
              ACP2: sm.get("ACP2") ?? null,
            };
          }),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selSection, selSubject, selTerm]);

  const rowToTG = (r: TermRow): TermGrades => ({
    ...emptyTG(),
    ACS1: r.ACS1,
    ACS2: r.ACS2,
    ACS3: r.ACS3,
    ACP1: r.ACP1,
    ACP2: r.ACP2,
  });
  const mts = rows.map((r) => calcMT(rowToTG(r)));
  const avaliados = mts.filter((v) => v !== null).length;
  const pos = mts.filter((v): v is number => v !== null && v >= 10).length;
  const neg = mts.filter((v): v is number => v !== null && v < 10).length;

  const columns: ColumnsType<TermRow> = [
    {
      title: "Nº",
      width: 50,
      render: (_, __, i) => (
        <Text type="secondary">{String(i + 1).padStart(2, "0")}</Text>
      ),
    },
    {
      title: "Nome do Aluno",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
          {r.identifier && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {r.identifier}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "ACS",
      children: [
        {
          title: "1",
          width: 55,
          align: "center" as const,
          render: (_: any, r: TermRow) => <ScoreCell v={r.ACS1} />,
        },
        {
          title: "2",
          width: 55,
          align: "center" as const,
          render: (_: any, r: TermRow) => <ScoreCell v={r.ACS2} />,
        },
        {
          title: "3",
          width: 55,
          align: "center" as const,
          render: (_: any, r: TermRow) => <ScoreCell v={r.ACS3} />,
        },
      ],
    },
    {
      title: "MACS",
      width: 65,
      align: "center",
      render: (_, r) => <ScoreCell v={calcMACS(rowToTG(r))} />,
    },
    {
      title: "ACP",
      children: [
        {
          title: "1",
          width: 55,
          align: "center" as const,
          render: (_: any, r: TermRow) => <ScoreCell v={r.ACP1} />,
        },
        {
          title: "2",
          width: 55,
          align: "center" as const,
          render: (_: any, r: TermRow) => <ScoreCell v={r.ACP2} />,
        },
      ],
    },
    {
      title: "MAP",
      width: 65,
      align: "center",
      render: (_, r) => <ScoreCell v={calcMAP(rowToTG(r))} />,
    },
    {
      title: "MT",
      width: 65,
      align: "center",
      render: (_, r) => {
        const mt = calcMT(rowToTG(r));
        return (
          <span
            style={{ fontWeight: 700, fontSize: 14, color: scoreColor(mt) }}
          >
            {mt ?? "—"}
          </span>
        );
      },
    },
    {
      title: "Resultado",
      width: 100,
      align: "center",
      render: (_, r) => {
        const mt = calcMT(rowToTG(r));
        if (mt === null) return <Tag>—</Tag>;
        return (
          <Tag color={mt >= 10 ? "success" : "error"}>
            {mt >= 10 ? "Positiva" : "Negativa"}
          </Tag>
        );
      },
    },
  ];

  return (
    <div>
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Form.Item label="Turma" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Turma"
                value={selSection}
                onChange={(v) => {
                  setSelSection(v);
                  setRows([]);
                }}
                options={sections.map((s) => ({
                  value: s.id,
                  label: `${s.name}${s.level?.name ? ` · ${s.level.name}` : ""}`,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Disciplina" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Disciplina"
                value={selSubject}
                onChange={setSelSubject}
                disabled={!selSection}
                showSearch
                optionFilterProp="label"
                options={subjects.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
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
        </Row>
      </Card>

      {avaliados > 0 && (
        <Row gutter={12} style={{ marginBottom: 14 }}>
          {[
            { label: "Avaliados", v: avaliados, color: "#4f46e5" },
            { label: "Positivas", v: pos, color: "#16a34a" },
            { label: "Negativas", v: neg, color: "#dc2626" },
            {
              label: "% Positivo",
              v: `${Math.round((pos / avaliados) * 100)}%`,
              color: "#f59e0b",
            },
          ].map((s) => (
            <Col xs={6} key={s.label}>
              <Card
                size="small"
                style={{ borderRadius: 10, textAlign: "center" }}
                styles={{ body: { padding: "8px 0" } }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>
                  {s.v}
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {s.label}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {selSection && selSubject && selTerm ? (
        <Card style={{ borderRadius: 12 }}>
          <Table
            dataSource={rows}
            columns={columns}
            rowKey="enrollmentId"
            loading={loading}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Nenhuma nota lançada." }}
          />
        </Card>
      ) : (
        <Alert
          message="Seleccione turma, disciplina e trimestre."
          type="info"
          showIcon
          style={{ borderRadius: 10 }}
        />
      )}
    </div>
  );
}

// ── Tab 3: Pauta Anual + Excel ────────────────────────────────────────────────

interface AnnualRow {
  enrollmentId: string;
  studentId: string;
  name: string;
  identifier?: string;
  terms: TermGrades[];
}

function TabPautaAnual({
  sections,
  subjects,
  terms,
  user,
}: {
  sections: Section[];
  subjects: Subject[];
  terms: Term[];
  user: any;
}) {
  const [selSection, setSelSection] = useState<string | null>(null);
  const [selSubject, setSelSubject] = useState<string | null>(null);
  const [rows, setRows] = useState<AnnualRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const selSectionObj = sections.find((s) => s.id === selSection);
  const selSubjectName = subjects.find((s) => s.id === selSubject)?.name ?? "";

  useEffect(() => {
    if (!selSection || !selSubject || !terms.length) {
      setRows([]);
      return;
    }
    setLoading(true);
    Promise.all([
      api.get(`/enrollments?sectionId=${selSection}&status=APPROVED`),
      ...terms.map((t) =>
        api.get(`/grades?subjectId=${selSubject}&termId=${t.id}`),
      ),
    ])
      .then(([eRes, ...gradeResponses]) => {
        const enrollments: any[] = eRes.data?.enrollments ?? [];
        const master = new Map<string, Map<string, Map<string, number>>>();
        gradeResponses.forEach((gRes, tIdx) => {
          const tid = terms[tIdx]?.id;
          if (!tid) return;
          (gRes.data?.grades ?? []).forEach((g: any) => {
            if (!master.has(g.studentId)) master.set(g.studentId, new Map());
            if (!master.get(g.studentId)!.has(tid))
              master.get(g.studentId)!.set(tid, new Map());
            master.get(g.studentId)!.get(tid)!.set(g.type, g.value);
          });
        });
        setRows(
          enrollments.map((e) => {
            const u = e.student?.user ?? {};
            const studentMap = master.get(e.studentId) ?? new Map();
            return {
              enrollmentId: e.id,
              studentId: e.studentId,
              name: `${u.lastName ?? ""} ${u.firstName ?? ""}`.trim(),
              identifier: u.identifier,
              terms: terms.map((t) => {
                const tm = studentMap.get(t.id) ?? new Map();
                return {
                  termName: t.name,
                  termId: t.id,
                  ACS1: tm.get("ACS1") ?? null,
                  ACS2: tm.get("ACS2") ?? null,
                  ACS3: tm.get("ACS3") ?? null,
                  ACP1: tm.get("ACP1") ?? null,
                  ACP2: tm.get("ACP2") ?? null,
                };
              }),
            };
          }),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selSection, selSubject, terms.map((t) => t.id).join(",")]);

  const handleExport = async () => {
    if (!rows.length) {
      message.warning("Nenhum dado para exportar.");
      return;
    }
    setExporting(true);
    try {
      gerarFichaExcel({
        teacherName:
          `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "—",
        className: selSectionObj?.level?.name ?? "—",
        sectionName: selSectionObj?.name ?? "—",
        subjectName: selSubjectName,
        year: new Date().getFullYear().toString(),
        students: rows.map((r) => ({
          name: r.name,
          identifier: r.identifier,
          terms: r.terms,
        })) as StudentFichaRow[],
      });
      message.success("Ficha de avaliação exportada com sucesso!");
    } catch (err) {
      console.error(err);
      message.error("Erro ao gerar Excel. Execute: npm install xlsx");
    } finally {
      setExporting(false);
    }
  };

  const termColumns = terms.map((term, tIdx) => ({
    title: term.name,
    children: [
      {
        title: "ACS",
        align: "center" as const,
        children: [
          {
            title: "1",
            width: 48,
            align: "center" as const,
            render: (_: any, r: AnnualRow) => (
              <ScoreCell v={r.terms[tIdx]?.ACS1 ?? null} />
            ),
          },
          {
            title: "2",
            width: 48,
            align: "center" as const,
            render: (_: any, r: AnnualRow) => (
              <ScoreCell v={r.terms[tIdx]?.ACS2 ?? null} />
            ),
          },
          {
            title: "3",
            width: 48,
            align: "center" as const,
            render: (_: any, r: AnnualRow) => (
              <ScoreCell v={r.terms[tIdx]?.ACS3 ?? null} />
            ),
          },
        ],
      },
      {
        title: "MACS",
        width: 58,
        align: "center" as const,
        render: (_: any, r: AnnualRow) => (
          <ScoreCell v={calcMACS(r.terms[tIdx] ?? emptyTG())} />
        ),
      },
      {
        title: "ACP",
        align: "center" as const,
        children: [
          {
            title: "1",
            width: 48,
            align: "center" as const,
            render: (_: any, r: AnnualRow) => (
              <ScoreCell v={r.terms[tIdx]?.ACP1 ?? null} />
            ),
          },
          {
            title: "2",
            width: 48,
            align: "center" as const,
            render: (_: any, r: AnnualRow) => (
              <ScoreCell v={r.terms[tIdx]?.ACP2 ?? null} />
            ),
          },
        ],
      },
      {
        title: "MAP",
        width: 58,
        align: "center" as const,
        render: (_: any, r: AnnualRow) => (
          <ScoreCell v={calcMAP(r.terms[tIdx] ?? emptyTG())} />
        ),
      },
      {
        title: "MT",
        width: 58,
        align: "center" as const,
        render: (_: any, r: AnnualRow) => {
          const mt = calcMT(r.terms[tIdx] ?? emptyTG());
          return (
            <span
              style={{ fontWeight: 700, fontSize: 14, color: scoreColor(mt) }}
            >
              {mt ?? "—"}
            </span>
          );
        },
      },
    ],
  }));

  const columns: ColumnsType<AnnualRow> = [
    {
      title: "Nº",
      width: 50,
      render: (_, __, i) => (
        <Text type="secondary">{String(i + 1).padStart(2, "0")}</Text>
      ),
    },
    {
      title: "Nome do Aluno",
      width: 220,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
          {r.identifier && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {r.identifier}
            </Text>
          )}
        </div>
      ),
    },
    ...termColumns,
    {
      title: "MA",
      width: 60,
      align: "center",
      render: (_, r) => {
        const ma = calcMA(r.terms);
        return (
          <span
            style={{ fontWeight: 700, fontSize: 14, color: scoreColor(ma) }}
          >
            {ma ?? "—"}
          </span>
        );
      },
    },
    {
      title: "Resultado",
      width: 100,
      align: "center",
      render: (_, r) => {
        const ma = calcMA(r.terms);
        if (ma === null) return <Tag>—</Tag>;
        return <Tag color={ma >= 10 ? "success" : "error"}>{approved(ma)}</Tag>;
      },
    },
  ];

  const mas = rows.map((r) => calcMA(r.terms));
  const avaliados = mas.filter((v) => v !== null).length;
  const pos = mas.filter((v): v is number => v !== null && v >= 10).length;
  const neg = mas.filter((v): v is number => v !== null && v < 10).length;

  return (
    <div>
      <Card
        style={{
          borderRadius: 12,
          marginBottom: 16,
          borderColor: "#4f46e520",
          background: "#fafafe",
        }}
        styles={{ body: { padding: "16px 20px" } }}
      >
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <Text style={{ fontWeight: 700, fontSize: 15 }}>
            Escola Comunitária da A.M.S — Ficha de Avaliação
          </Text>
        </div>
        <Row gutter={[16, 12]} align="bottom">
          <Col xs={24} md={8}>
            <Form.Item label="Turma" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Seleccionar turma"
                value={selSection}
                onChange={(v) => {
                  setSelSection(v);
                  setRows([]);
                }}
                options={sections.map((s) => ({
                  value: s.id,
                  label: `${s.name}${s.level?.name ? ` · ${s.level.name}` : ""}`,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Disciplina" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Seleccionar disciplina"
                value={selSubject}
                onChange={setSelSubject}
                disabled={!selSection}
                showSearch
                optionFilterProp="label"
                options={subjects.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={8}
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={exporting}
              disabled={rows.length === 0}
              onClick={handleExport}
              style={{ width: "100%" }}
            >
              Exportar Ficha (Excel)
            </Button>
          </Col>
        </Row>
      </Card>

      {!selSection || !selSubject ? (
        <Alert
          message="Seleccione a turma e a disciplina para ver a ficha anual completa."
          type="info"
          showIcon
          style={{ borderRadius: 10 }}
        />
      ) : (
        <>
          {avaliados > 0 && (
            <Row gutter={12} style={{ marginBottom: 14 }}>
              {[
                { label: "Avaliados", v: avaliados, color: "#4f46e5" },
                { label: "Aprovados", v: pos, color: "#16a34a" },
                { label: "Reprovados", v: neg, color: "#dc2626" },
                {
                  label: "% Aprovação",
                  v: `${avaliados ? Math.round((pos / avaliados) * 100) : 0}%`,
                  color: "#f59e0b",
                },
              ].map((s) => (
                <Col xs={6} key={s.label}>
                  <Card
                    size="small"
                    style={{ borderRadius: 10, textAlign: "center" }}
                    styles={{ body: { padding: "8px 0" } }}
                  >
                    <div
                      style={{ fontSize: 22, fontWeight: 700, color: s.color }}
                    >
                      {s.v}
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {s.label}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          <Card style={{ borderRadius: 12 }}>
            <Table
              dataSource={rows}
              columns={columns}
              rowKey="enrollmentId"
              loading={loading}
              pagination={false}
              size="small"
              bordered
              scroll={{ x: "max-content" }}
              locale={{ emptyText: "Nenhuma nota lançada ainda." }}
            />
          </Card>
        </>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function TeacherMarks() {
  const location = useLocation();
  const { user } = useAuthStore();
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/sections"), api.get("/subjects"), api.get("/terms")])
      .then(([s, sub, t]) => {
        setSections(s.data?.sections ?? []);
        setSubjects(sub.data?.subjects ?? []);
        setTerms(t.data?.terms ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Gestão de Notas
        </Title>
        <Text type="secondary">
          ACS (Avaliações Contínuas) · ACP (Avaliações com Prova) · MT (Média
          Trimestral) · MA (Média Anual)
        </Text>
      </div>
      <Tabs
        defaultActiveKey="lancar"
        type="card"
        items={[
          {
            key: "lancar",
            label: (
              <span>
                <EditOutlined /> Lançar Notas
              </span>
            ),
            children: (
              <TabLancar
                sections={sections}
                subjects={subjects}
                terms={terms}
                user={user}
                initialSection={location.state?.sectionId ?? null}
              />
            ),
          },
          {
            key: "trimestral",
            label: (
              <span>
                <TableOutlined /> Pauta Trimestral
              </span>
            ),
            children: (
              <TabPautaTrimestre
                sections={sections}
                subjects={subjects}
                terms={terms}
              />
            ),
          },
          {
            key: "anual",
            label: (
              <span>
                <DownloadOutlined /> Pauta Anual + Excel
              </span>
            ),
            children: (
              <TabPautaAnual
                sections={sections}
                subjects={subjects}
                terms={terms}
                user={user}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
