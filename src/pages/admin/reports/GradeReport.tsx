// pages/admin/reports/GradeReport.tsx
// Relatório de Notas — Ficha Anual + Pauta Trimestral + Por Aluno
// Requer: npm install xlsx

import {
  DownloadOutlined,
  PrinterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Row,
  Select,
  Table,
  Tabs,
  Tag,
  Typography
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useRef, useState } from "react";
import PageLoader from "../../../components/PageLoader";
import { api } from "../../../store/authStore";
import type { StudentFichaRow, TermGrades } from "../../../utils/fichaExcel";
import {
  approved,
  calcMA,
  calcMACS,
  calcMAP,
  calcMT,
  gerarFichaExcel,
} from "../../../utils/fichaExcel";

const { Title, Text } = Typography;

// ─────────────────────────────────────────────────────────────────
//  Tipos
// ─────────────────────────────────────────────────────────────────

interface AcademicYear {
  id: string;
  year: string;
  active?: boolean;
}
interface Level {
  id: string;
  name: string;
}
interface Section {
  id: string;
  name: string;
  level?: { name: string };
  academicYear?: { name: string };
}
interface Subject {
  id: string;
  name: string;
}
interface Term {
  id: string;
  name: string;
}

interface AnnualRow {
  enrollmentId: string;
  studentId: string;
  name: string;
  identifier?: string;
  avatar?: string;
  terms: TermGrades[];
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

// ─────────────────────────────────────────────────────────────────
//  Célula de pontuação com cor
// ─────────────────────────────────────────────────────────────────

function scoreColor(v: number | null) {
  if (v === null) return "#ccc";
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

// ─────────────────────────────────────────────────────────────────
//  Hook: carrega dados base (anos, classes, turmas, disciplinas, trimestres)
// ─────────────────────────────────────────────────────────────────

function useBaseData() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/academics"),
      api.get("/levels"),
      api.get("/subjects"),
    ])
      .then(([yr, lv, sub]) => {
        setYears(yr.data?.academicYear ?? yr.data?.years ?? []);
        setLevels(lv.data?.levels ?? []);
        setSubjects(sub.data?.subjects ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { years, levels, subjects, loading };
}

// ─────────────────────────────────────────────────────────────────
//  Filtros partilhados
// ─────────────────────────────────────────────────────────────────

interface Filters {
  yearId: string | null;
  levelId: string | null;
  sectionId: string | null;
  subjectId: string | null;
}

interface FilterPanelProps {
  years: AcademicYear[];
  levels: Level[];
  subjects: Subject[];
  showSubject?: boolean;
  value: Filters;
  onChange: (f: Partial<Filters>) => void;
  onSearch: () => void;
  searching: boolean;
}

function FilterPanel({
  years,
  levels,
  subjects,
  showSubject = true,
  value,
  onChange,
  onSearch,
  searching,
}: FilterPanelProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  // Carrega turmas quando year ou level muda
  useEffect(() => {
    if (!value.yearId && !value.levelId) {
      setSections([]);
      return;
    }
    const q = new URLSearchParams();
    if (value.yearId) q.set("academicYearId", value.yearId);
    if (value.levelId) q.set("levelId", value.levelId);
    api
      .get(`/sections?${q}`)
      .then((r) => setSections(r.data?.sections ?? []))
      .catch(console.error);
  }, [value.yearId, value.levelId]);

  // Carrega trimestres quando year muda
  useEffect(() => {
    if (!value.yearId) {
      setTerms([]);
      return;
    }
    api
      .get(`/terms?academicYearId=${value.yearId}`)
      .then((r) => setTerms(r.data?.terms ?? []))
      .catch(console.error);
  }, [value.yearId]);

  // Expõe termos para o pai (via data-attr)
  const termsRef = useRef(terms);
  termsRef.current = terms;

  return (
    <Card style={{ borderRadius: 12, marginBottom: 16 }}>
      <Row gutter={[12, 12]} align="bottom">
        <Col xs={24} sm={12} md={4}>
          <Form.Item label="Ano Lectivo" style={{ marginBottom: 0 }}>
            <Select
              placeholder="Ano"
              value={value.yearId}
              onChange={(v) => onChange({ yearId: v, sectionId: null })}
              options={years.map((y) => ({
                value: y.id,
                label: `${y.year}${y.active ? " ✓" : ""}`,
              }))}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Form.Item label="Classe" style={{ marginBottom: 0 }}>
            <Select
              placeholder="Classe"
              value={value.levelId}
              onChange={(v) => onChange({ levelId: v, sectionId: null })}
              options={levels.map((l) => ({ value: l.id, label: l.name }))}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Form.Item label="Turma" style={{ marginBottom: 0 }}>
            <Select
              placeholder="Turma"
              value={value.sectionId}
              onChange={(v) => onChange({ sectionId: v })}
              disabled={sections.length === 0}
              options={sections.map((s) => ({ value: s.id, label: s.name }))}
              allowClear
            />
          </Form.Item>
        </Col>
        {showSubject && (
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="Disciplina" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Disciplina"
                value={value.subjectId}
                onChange={(v) => onChange({ subjectId: v })}
                disabled={!value.sectionId}
                showSearch
                optionFilterProp="label"
                options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                allowClear
              />
            </Form.Item>
          </Col>
        )}
        <Col xs={24} md={4} style={{ display: "flex", alignItems: "flex-end" }}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={searching}
            onClick={onSearch}
            disabled={!value.sectionId || (showSubject && !value.subjectId)}
            style={{ width: "100%" }}
          >
            Carregar
          </Button>
        </Col>
      </Row>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Hook: carrega linhas da ficha anual
// ─────────────────────────────────────────────────────────────────

function useAnnualRows(
  sectionId: string | null,
  subjectId: string | null,
  yearId: string | null,
) {
  const [rows, setRows] = useState<AnnualRow[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!sectionId || !subjectId) {
      setRows([]);
      return;
    }
    setLoading(true);

    try {
      const [eRes, tRes] = await Promise.all([
        api.get(`/enrollments?sectionId=${sectionId}&status=APPROVED`),
        yearId ? api.get(`/terms?academicYearId=${yearId}`) : api.get("/terms"),
      ]);

      const enrollments: any[] = eRes.data?.enrollments ?? [];
      const termsData: Term[] = tRes.data?.terms ?? [];
      setTerms(termsData);

      // Carrega notas para cada trimestre em paralelo
      const gradeResponses = await Promise.all(
        termsData.map((t) =>
          api.get(`/grades?subjectId=${subjectId}&termId=${t.id}`),
        ),
      );

      // Mapa: studentId → termId → type → value
      const master = new Map<string, Map<string, Map<string, number>>>();
      gradeResponses.forEach((gRes, tIdx) => {
        const tid = termsData[tIdx]?.id;
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
          const sm = master.get(e.studentId) ?? new Map();
          return {
            enrollmentId: e.id,
            studentId: e.studentId,
            name: `${u.lastName ?? ""} ${u.firstName ?? ""}`.trim(),
            identifier: u.identifier,
            avatar: u.avatar,
            terms: termsData.map((t) => {
              const tm = sm.get(t.id) ?? new Map();
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { rows, terms, loading, load };
}

// ─────────────────────────────────────────────────────────────────
//  Tab: Ficha Anual
// ─────────────────────────────────────────────────────────────────

function TabFichaAnual({
  years,
  levels,
  subjects,
}: {
  years: AcademicYear[];
  levels: Level[];
  subjects: Subject[];
}) {
  const [filters, setFilters] = useState<Filters>({
    yearId: null,
    levelId: null,
    sectionId: null,
    subjectId: null,
  });
  const [sectionMeta, setSectionMeta] = useState<Section | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { rows, terms, loading, load } = useAnnualRows(
    filters.sectionId,
    filters.subjectId,
    filters.yearId,
  );

  const handleSearch = async () => {
    if (filters.sectionId) {
      const r = await api.get(`/sections/${filters.sectionId}`);
      setSectionMeta(r.data?.section ?? null);
    }
    load();
  };

  const handleExcelExport = () => {
    if (!rows.length) return;
    gerarFichaExcel({
      teacherName: "—",
      className: sectionMeta?.level?.name ?? "—",
      sectionName: sectionMeta?.name ?? "—",
      subjectName:
        subjects.find((s) => s.id === filters.subjectId)?.name ?? "—",
      year:
        years.find((y) => y.id === filters.yearId)?.year ??
        new Date().getFullYear().toString(),
      students: rows.map((r) => ({
        name: r.name,
        identifier: r.identifier,
        terms: r.terms,
      })) as StudentFichaRow[],
    });
  };

  const handlePrint = () => window.print();

  // Colunas dinâmicas por trimestre
  const termColumns = terms.map((term, tIdx) => ({
    title: term.name,
    children: [
      {
        title: "ACS",
        align: "center" as const,
        children: [
          {
            title: "1",
            width: 46,
            align: "center" as const,
            render: (_: any, r: AnnualRow) => (
              <ScoreCell v={r.terms[tIdx]?.ACS1 ?? null} />
            ),
          },
          {
            title: "2",
            width: 46,
            align: "center" as const,
            render: (_: any, r: AnnualRow) => (
              <ScoreCell v={r.terms[tIdx]?.ACS2 ?? null} />
            ),
          },
          {
            title: "3",
            width: 46,
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
            width: 46,
            align: "center" as const,
            render: (_: any, r: AnnualRow) => (
              <ScoreCell v={r.terms[tIdx]?.ACP1 ?? null} />
            ),
          },
          {
            title: "2",
            width: 46,
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar
            src={r.avatar}
            size={28}
            style={{ background: "#4f46e5", flexShrink: 0 }}
          >
            {r.name?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
            {r.identifier && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {r.identifier}
              </Text>
            )}
          </div>
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
      <FilterPanel
        years={years}
        levels={levels}
        subjects={subjects}
        value={filters}
        onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
        onSearch={handleSearch}
        searching={loading}
      />

      {!rows.length && !loading && (
        <Alert
          message="Seleccione o ano lectivo, classe, turma e disciplina para carregar a ficha anual."
          type="info"
          showIcon
          style={{ borderRadius: 10 }}
        />
      )}

      {loading && <PageLoader padding={60} />}

      {rows.length > 0 && !loading && (
        <>
          {/* Cabeçalho tipo ficha */}
          <div
            className="print-header"
            style={{
              textAlign: "center",
              padding: "12px 0 8px",
              borderBottom: "2px solid #4f46e5",
              marginBottom: 16,
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              Escola Comunitária da A.M.S
            </Title>
            <Text type="secondary">
              Ficha de Avaliação —{" "}
              {subjects.find((s) => s.id === filters.subjectId)?.name}
            </Text>
            <div style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 13 }}>
                {sectionMeta?.level?.name ?? "—"} · Turma{" "}
                {sectionMeta?.name ?? "—"} ·{" "}
                {years.find((y) => y.id === filters.yearId)?.year ?? "—"}
              </Text>
            </div>
          </div>

          {/* Resumo */}
          <Row gutter={12} style={{ marginBottom: 16 }}>
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
                    style={{ fontSize: 20, fontWeight: 700, color: s.color }}
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

          {/* Acções */}
          <div
            style={{ display: "flex", gap: 10, marginBottom: 14 }}
            className="no-print"
          >
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              onClick={handleExcelExport}
            >
              Exportar Excel (Ficha Oficial)
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              Imprimir / PDF
            </Button>
          </div>

          {/* Tabela */}
          <div ref={printRef}>
            <Table
              dataSource={rows}
              columns={columns}
              rowKey="enrollmentId"
              pagination={false}
              size="small"
              bordered
              scroll={{ x: "max-content" }}
              locale={{ emptyText: "Nenhuma nota lançada ainda." }}
              summary={(data) => {
                if (!data.length) return null;
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row
                      style={{ background: "#f8faff", fontWeight: 600 }}
                    >
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <Text strong style={{ fontSize: 12 }}>
                          Resumo por Trimestre
                        </Text>
                      </Table.Summary.Cell>
                      {terms.map((_, tIdx) => {
                        const mts = data.map((r) =>
                          calcMT(r.terms[tIdx] ?? emptyTG()),
                        );
                        const tPos = mts.filter(
                          (v): v is number => v !== null && v >= 10,
                        ).length;
                        const tNeg = mts.filter(
                          (v): v is number => v !== null && v < 10,
                        ).length;
                        const tTot = mts.filter((v) => v !== null).length;
                        return (
                          <Table.Summary.Cell
                            key={tIdx}
                            index={tIdx + 2}
                            colSpan={8}
                          >
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              Av:{tTot} Pos:{tPos}(
                              {tTot ? Math.round((tPos / tTot) * 100) : 0}%)
                              Neg:{tNeg}
                            </Text>
                          </Table.Summary.Cell>
                        );
                      })}
                      <Table.Summary.Cell index={terms.length + 2} colSpan={2}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Pos:{pos} Neg:{neg}{" "}
                          {avaliados ? Math.round((pos / avaliados) * 100) : 0}%
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Tab: Pauta Trimestral
// ─────────────────────────────────────────────────────────────────

interface TermRow {
  enrollmentId: string;
  studentId: string;
  name: string;
  identifier?: string;
  avatar?: string;
  ACS1: number | null;
  ACS2: number | null;
  ACS3: number | null;
  ACP1: number | null;
  ACP2: number | null;
}

function TabPautaTrimestral({
  years,
  levels,
  subjects,
}: {
  years: AcademicYear[];
  levels: Level[];
  subjects: Subject[];
}) {
  const [filters, setFilters] = useState<Filters>({
    yearId: null,
    levelId: null,
    sectionId: null,
    subjectId: null,
  });
  const [selTerm, setSelTerm] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [rows, setRows] = useState<TermRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Trimestres baseados no ano
  useEffect(() => {
    if (!filters.yearId) {
      setTerms([]);
      return;
    }
    api
      .get(`/terms?academicYearId=${filters.yearId}`)
      .then((r) => setTerms(r.data?.terms ?? []))
      .catch(console.error);
  }, [filters.yearId]);

  const handleSearch = async () => {
    if (!filters.sectionId || !filters.subjectId || !selTerm) return;
    setLoading(true);
    try {
      const [eRes, gRes] = await Promise.all([
        api.get(`/enrollments?sectionId=${filters.sectionId}&status=APPROVED`),
        api.get(`/grades?subjectId=${filters.subjectId}&termId=${selTerm}`),
      ]);
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
            avatar: u.avatar,
            ACS1: sm.get("ACS1") ?? null,
            ACS2: sm.get("ACS2") ?? null,
            ACS3: sm.get("ACS3") ?? null,
            ACP1: sm.get("ACP1") ?? null,
            ACP2: sm.get("ACP2") ?? null,
          };
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const rowToTG = (r: TermRow): TermGrades => ({
    ...emptyTG(),
    ACS1: r.ACS1,
    ACS2: r.ACS2,
    ACS3: r.ACS3,
    ACP1: r.ACP1,
    ACP2: r.ACP2,
  });

  const handleExcelExport = () => {
    // Excel simples: uma folha com as notas do trimestre
    import("xlsx").then((XLSX) => {
      const termName = terms.find((t) => t.id === selTerm)?.name ?? "Trimestre";
      const subjectName =
        subjects.find((s) => s.id === filters.subjectId)?.name ?? "";
      const wb = XLSX.utils.book_new();
      const header = [
        "Nº",
        "Nome",
        "ACS1",
        "ACS2",
        "ACS3",
        "MACS",
        "ACP1",
        "ACP2",
        "MAP",
        "MT",
        "Resultado",
      ];
      const data = rows.map((r, i) => {
        const tg = rowToTG(r);
        const mt = calcMT(tg);
        return [
          String(i + 1).padStart(2, "0"),
          r.name,
          r.ACS1 ?? "",
          r.ACS2 ?? "",
          r.ACS3 ?? "",
          calcMACS(tg) ?? "",
          r.ACP1 ?? "",
          r.ACP2 ?? "",
          calcMAP(tg) ?? "",
          mt ?? "",
          mt !== null ? (mt >= 10 ? "Positiva" : "Negativa") : "—",
        ];
      });
      const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
      ws["!cols"] = [
        { wch: 4 },
        { wch: 28 },
        { wch: 7 },
        { wch: 7 },
        { wch: 7 },
        { wch: 7 },
        { wch: 7 },
        { wch: 7 },
        { wch: 7 },
        { wch: 7 },
        { wch: 10 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, termName);
      XLSX.writeFile(wb, `Pauta_${subjectName}_${termName}.xlsx`);
    });
  };

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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar
            src={r.avatar}
            size={28}
            style={{ background: "#4f46e5", flexShrink: 0 }}
          >
            {r.name?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
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
      {/* Filtros + selecção de trimestre */}
      <FilterPanel
        years={years}
        levels={levels}
        subjects={subjects}
        value={filters}
        onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
        onSearch={handleSearch}
        searching={loading}
      />
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Form.Item label="Trimestre" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Seleccionar trimestre"
            value={selTerm}
            onChange={setSelTerm}
            disabled={terms.length === 0}
            options={terms.map((t) => ({ value: t.id, label: t.name }))}
            style={{ width: 260 }}
          />
        </Form.Item>
      </Card>

      {rows.length === 0 && !loading && (
        <Alert
          message="Seleccione os filtros e clique em Carregar para ver a pauta."
          type="info"
          showIcon
          style={{ borderRadius: 10 }}
        />
      )}

      {loading && <PageLoader padding={60} />}

      {rows.length > 0 && !loading && (
        <>
          {avaliados > 0 && (
            <Row gutter={12} style={{ marginBottom: 14 }}>
              {[
                { label: "Avaliados", v: avaliados, color: "#4f46e5" },
                { label: "Positivas", v: pos, color: "#16a34a" },
                { label: "Negativas", v: neg, color: "#dc2626" },
                {
                  label: "% Positivo",
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
                      style={{ fontSize: 20, fontWeight: 700, color: s.color }}
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

          <div
            style={{ display: "flex", gap: 10, marginBottom: 14 }}
            className="no-print"
          >
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              onClick={handleExcelExport}
            >
              Exportar Excel
            </Button>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              Imprimir / PDF
            </Button>
          </div>

          <Card style={{ borderRadius: 12 }}>
            <Table
              dataSource={rows}
              columns={columns}
              rowKey="enrollmentId"
              pagination={false}
              size="small"
              bordered
              scroll={{ x: "max-content" }}
              locale={{ emptyText: "Nenhuma nota lançada." }}
            />
          </Card>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Tab: Boletim por Aluno
// ─────────────────────────────────────────────────────────────────

function TabBoletimAluno({
  years,
  levels,
  subjects,
}: {
  years: AcademicYear[];
  levels: Level[];
  subjects: Subject[];
}) {
  const [filters, setFilters] = useState<Filters>({
    yearId: null,
    levelId: null,
    sectionId: null,
    subjectId: null,
  });
  const [students, setStudents] = useState<any[]>([]);
  const [selStudent, setSelStudent] = useState<string | null>(null);
  const [annualRows, setAnnualRows] = useState<AnnualRow[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Carrega alunos da turma
  useEffect(() => {
    if (!filters.sectionId) {
      setStudents([]);
      setSelStudent(null);
      return;
    }
    setLoadingStudents(true);
    api
      .get(`/enrollments?sectionId=${filters.sectionId}&status=APPROVED`)
      .then((r) => setStudents(r.data?.enrollments ?? []))
      .catch(console.error)
      .finally(() => setLoadingStudents(false));
  }, [filters.sectionId]);

  const handleSearch = async () => {
    if (!filters.sectionId || !selStudent) return;
    setLoading(true);
    try {
      const tRes = filters.yearId
        ? await api.get(`/terms?academicYearId=${filters.yearId}`)
        : await api.get("/terms");
      const termsData: Term[] = tRes.data?.terms ?? [];
      setTerms(termsData);

      // Busca notas de TODAS as disciplinas para este aluno
      const subjectsToFetch = filters.subjectId
        ? [filters.subjectId]
        : subjects.map((s) => s.id);

      const enroll = students.find((e) => e.studentId === selStudent);
      if (!enroll) return;

      const u = enroll.student?.user ?? {};
      const masterSubject = new Map<string, TermGrades[]>();

      await Promise.all(
        subjectsToFetch.map(async (subId) => {
          const gradeResponses = await Promise.all(
            termsData.map((t) =>
              api.get(`/grades?subjectId=${subId}&termId=${t.id}`),
            ),
          );
          const studentGrades = new Map<string, Map<string, number>>();
          gradeResponses.forEach((gRes, tIdx) => {
            const tid = termsData[tIdx]?.id;
            if (!tid) return;
            (gRes.data?.grades ?? []).forEach((g: any) => {
              if (g.studentId !== selStudent) return;
              if (!studentGrades.has(tid)) studentGrades.set(tid, new Map());
              studentGrades.get(tid)!.set(g.type, g.value);
            });
          });
          const termGrades = termsData.map((t) => {
            const tm = studentGrades.get(t.id) ?? new Map();
            return {
              termName: t.name,
              termId: t.id,
              ACS1: tm.get("ACS1") ?? null,
              ACS2: tm.get("ACS2") ?? null,
              ACS3: tm.get("ACS3") ?? null,
              ACP1: tm.get("ACP1") ?? null,
              ACP2: tm.get("ACP2") ?? null,
            };
          });
          masterSubject.set(subId, termGrades);
        }),
      );

      // Uma linha por disciplina
      setAnnualRows(
        subjectsToFetch.map((subId) => ({
          enrollmentId: enroll.id,
          studentId: selStudent,
          name: subjects.find((s) => s.id === subId)?.name ?? subId, // nome da disciplina como "nome"
          identifier: u.identifier,
          avatar: u.avatar,
          terms: masterSubject.get(subId) ?? termsData.map(() => emptyTG()),
        })),
      );
    } finally {
      setLoading(false);
    }
  };

  const studentObj = students.find((e) => e.studentId === selStudent);
  const studentName = studentObj
    ? `${studentObj.student?.user?.firstName ?? ""} ${studentObj.student?.user?.lastName ?? ""}`.trim()
    : "";

  const termColumns = terms.map((term, tIdx) => ({
    title: term.name,
    children: [
      {
        title: "MACS",
        width: 60,
        align: "center" as const,
        render: (_: any, r: AnnualRow) => (
          <ScoreCell v={calcMACS(r.terms[tIdx] ?? emptyTG())} />
        ),
      },
      {
        title: "MAP",
        width: 60,
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
            <span style={{ fontWeight: 700, color: scoreColor(mt) }}>
              {mt ?? "—"}
            </span>
          );
        },
      },
    ],
  }));

  const columns: ColumnsType<AnnualRow> = [
    {
      title: "Disciplina",
      dataIndex: "name",
      render: (v) => (
        <Text strong style={{ fontSize: 13 }}>
          {v}
        </Text>
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

  return (
    <div>
      <FilterPanel
        years={years}
        levels={levels}
        subjects={subjects}
        value={filters}
        showSubject={false}
        onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
        onSearch={() => {}}
        searching={false}
      />
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="bottom">
          <Col xs={24} md={10}>
            <Form.Item label="Aluno" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Seleccionar aluno"
                value={selStudent}
                onChange={setSelStudent}
                loading={loadingStudents}
                disabled={!filters.sectionId}
                showSearch
                optionFilterProp="label"
                options={students.map((e) => ({
                  value: e.studentId,
                  label:
                    `${e.student?.user?.firstName ?? ""} ${e.student?.user?.lastName ?? ""} — ${e.student?.user?.identifier ?? ""}`.trim(),
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label=" " style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                loading={loading}
                onClick={handleSearch}
                disabled={!selStudent}
                style={{ width: "100%" }}
              >
                Ver Boletim
              </Button>
            </Form.Item>
          </Col>
          {annualRows.length > 0 && (
            <Col xs={24} md={6}>
              <Form.Item label=" " style={{ marginBottom: 0 }}>
                <Button
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                  style={{ width: "100%" }}
                >
                  Imprimir / PDF
                </Button>
              </Form.Item>
            </Col>
          )}
        </Row>
      </Card>

      {loading && <PageLoader padding={60} />}

      {!loading && annualRows.length === 0 && (
        <Alert
          message="Seleccione a turma, o aluno e clique em 'Ver Boletim'."
          type="info"
          showIcon
          style={{ borderRadius: 10 }}
        />
      )}

      {!loading && annualRows.length > 0 && (
        <Card style={{ borderRadius: 12 }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: 16,
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: 12,
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              Boletim Individual — {studentName}
            </Title>
            <Text type="secondary">
              Turma {filters.sectionId} ·{" "}
              {years.find((y) => y.id === filters.yearId)?.year ?? "—"}
            </Text>
          </div>
          <Table
            dataSource={annualRows}
            columns={columns}
            rowKey="name"
            pagination={false}
            size="small"
            bordered
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Sem notas lançadas." }}
          />
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Export principal
// ─────────────────────────────────────────────────────────────────

export default function GradeReport() {
  const { years, levels, subjects, loading } = useBaseData();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Tabs
      type="card"
      items={[
        {
          key: "anual",
          label: "Ficha Anual",
          children: (
            <TabFichaAnual years={years} levels={levels} subjects={subjects} />
          ),
        },
        {
          key: "trimestral",
          label: "Pauta Trimestral",
          children: (
            <TabPautaTrimestral
              years={years}
              levels={levels}
              subjects={subjects}
            />
          ),
        },
        {
          key: "boletim",
          label: "Boletim por Aluno",
          children: (
            <TabBoletimAluno
              years={years}
              levels={levels}
              subjects={subjects}
            />
          ),
        },
      ]}
    />
  );
}
