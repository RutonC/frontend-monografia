// pages/admin/reports/AttendanceReport.tsx

import {
  DownloadOutlined,
  PrinterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Progress,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { api } from "../../../store/authStore";

const { Text } = Typography;

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
}
interface Term {
  id: string;
  name: string;
}
interface Subject {
  id: string;
  name: string;
}

interface AttRow {
  studentId: string;
  name: string;
  identifier?: string;
  present: number;
  absent: number;
  late: number;
  justified: number;
  total: number;
  pctPresence: number;
}

function statusColor(pct: number) {
  if (pct >= 75) return "#52c41a";
  if (pct >= 50) return "#faad14";
  return "#ff4d4f";
}

export default function AttendanceReport() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  const [selYear, setSelYear] = useState<string | null>(null);
  const [selLevel, setSelLevel] = useState<string | null>(null);
  const [selSection, setSelSection] = useState<string | null>(null);
  const [selTerm, setSelTerm] = useState<string | null>(null);
  const [selSubject, setSelSubject] = useState<string | null>(null);

  const [rows, setRows] = useState<AttRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

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
      .finally(() => setBooting(false));
  }, []);

  useEffect(() => {
    if (!selYear && !selLevel) {
      setSections([]);
      return;
    }
    const q = new URLSearchParams();
    if (selYear) q.set("academicYearId", selYear);
    if (selLevel) q.set("levelId", selLevel);
    api
      .get(`/sections?${q}`)
      .then((r) => setSections(r.data?.sections ?? []))
      .catch(console.error);
  }, [selYear, selLevel]);

  useEffect(() => {
    if (!selYear) {
      setTerms([]);
      return;
    }
    api
      .get(`/terms?academicYearId=${selYear}`)
      .then((r) => setTerms(r.data?.terms ?? []))
      .catch(console.error);
  }, [selYear]);

  const handleSearch = async () => {
    if (!selSection) return;
    setLoading(true);
    try {
      // Busca matrículas
      const eRes = await api.get(
        `/enrollments?sectionId=${selSection}&status=APPROVED`,
      );
      const enrollments: any[] = eRes.data?.enrollments ?? [];

      // Monta query de assiduidade
      const q = new URLSearchParams({ sectionId: selSection });
      if (selTerm) q.set("termId", selTerm);
      if (selSubject) q.set("subjectId", selSubject);

      const aRes = await api.get(`/attendance?${q}&limit=9999`);
      const attendance: any[] = aRes.data?.attendance ?? [];

      // Agrega por estudante
      const map = new Map<
        string,
        { present: number; absent: number; late: number; justified: number }
      >();
      attendance.forEach((a: any) => {
        if (!map.has(a.studentId))
          map.set(a.studentId, {
            present: 0,
            absent: 0,
            late: 0,
            justified: 0,
          });
        const entry = map.get(a.studentId)!;
        const s = (a.status ?? "").toUpperCase();
        if (s === "PRESENT") entry.present++;
        if (s === "ABSENT") entry.absent++;
        if (s === "LATE") entry.late++;
        if (s === "JUSTIFIED") entry.justified++;
      });

      setRows(
        enrollments.map((e) => {
          const u = e.student?.user ?? {};
          const name = `${u.lastName ?? ""} ${u.firstName ?? ""}`.trim();
          const agg = map.get(e.studentId) ?? {
            present: 0,
            absent: 0,
            late: 0,
            justified: 0,
          };
          const total = agg.present + agg.absent + agg.late + agg.justified;
          const pctPresence =
            total > 0
              ? Math.round(((agg.present + agg.late) / total) * 100)
              : 0;
          return {
            studentId: e.studentId,
            name,
            identifier: u.identifier,
            ...agg,
            total,
            pctPresence,
          };
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExcelExport = () => {
    import("xlsx").then((XLSX) => {
      const header = [
        "Nº",
        "Nome",
        "Identificador",
        "Presentes",
        "Ausentes",
        "Atrasados",
        "Justificados",
        "Total",
        "% Presença",
        "Estado",
      ];
      const data = rows.map((r, i) => [
        String(i + 1).padStart(2, "0"),
        r.name,
        r.identifier ?? "",
        r.present,
        r.absent,
        r.late,
        r.justified,
        r.total,
        `${r.pctPresence}%`,
        r.pctPresence >= 75
          ? "Regular"
          : r.pctPresence >= 50
            ? "Em Risco"
            : "Crítico",
      ]);
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
      ws["!cols"] = [
        { wch: 4 },
        { wch: 28 },
        { wch: 14 },
        { wch: 10 },
        { wch: 10 },
        { wch: 11 },
        { wch: 13 },
        { wch: 8 },
        { wch: 10 },
        { wch: 10 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, "Assiduidade");
      const termName = terms.find((t) => t.id === selTerm)?.name ?? "Anual";
      XLSX.writeFile(wb, `Assiduidade_${termName}.xlsx`);
    });
  };

  const totalPresent = rows.reduce((acc, r) => acc + r.present, 0);
  const totalAbsent = rows.reduce((acc, r) => acc + r.absent, 0);
  const avgPct = rows.length
    ? Math.round(rows.reduce((acc, r) => acc + r.pctPresence, 0) / rows.length)
    : 0;
  const critical = rows.filter((r) => r.pctPresence < 50).length;

  const columns: ColumnsType<AttRow> = [
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
      title: "Presentes",
      width: 100,
      align: "center",
      render: (_, r) => <Tag color="success">{r.present}</Tag>,
    },
    {
      title: "Ausentes",
      width: 100,
      align: "center",
      render: (_, r) => <Tag color="error">{r.absent}</Tag>,
    },
    {
      title: "Atrasados",
      width: 100,
      align: "center",
      render: (_, r) => <Tag color="warning">{r.late}</Tag>,
    },
    {
      title: "Justificados",
      width: 110,
      align: "center",
      render: (_, r) => <Tag color="default">{r.justified}</Tag>,
    },
    { title: "Total", width: 80, align: "center", dataIndex: "total" },
    {
      title: "% Presença",
      width: 150,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Progress
            percent={r.pctPresence}
            size="small"
            strokeColor={statusColor(r.pctPresence)}
            style={{ flex: 1, margin: 0 }}
            showInfo={false}
          />
          <Text
            style={{
              fontWeight: 700,
              color: statusColor(r.pctPresence),
              minWidth: 36,
            }}
          >
            {r.pctPresence}%
          </Text>
        </div>
      ),
    },
    {
      title: "Estado",
      width: 100,
      align: "center",
      render: (_, r) => {
        if (r.pctPresence >= 75) return <Tag color="success">Regular</Tag>;
        if (r.pctPresence >= 50) return <Tag color="warning">Em Risco</Tag>;
        return <Tag color="error">Crítico</Tag>;
      },
    },
  ];

  if (booting)
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div>
      {/* Filtros */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="bottom">
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="Ano Lectivo" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Ano"
                value={selYear}
                onChange={(v) => {
                  setSelYear(v);
                  setSelSection(null);
                }}
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
                value={selLevel}
                onChange={(v) => {
                  setSelLevel(v);
                  setSelSection(null);
                }}
                options={levels.map((l) => ({ value: l.id, label: l.name }))}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="Turma" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Turma"
                value={selSection}
                onChange={setSelSection}
                disabled={sections.length === 0}
                options={sections.map((s) => ({ value: s.id, label: s.name }))}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="Trimestre" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Todos"
                value={selTerm}
                onChange={setSelTerm}
                disabled={terms.length === 0}
                options={terms.map((t) => ({ value: t.id, label: t.name }))}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="Disciplina" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Todas"
                value={selSubject}
                onChange={setSelSubject}
                disabled={!selSection}
                showSearch
                optionFilterProp="label"
                options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={4}
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={loading}
              onClick={handleSearch}
              disabled={!selSection}
              style={{ width: "100%" }}
            >
              Carregar
            </Button>
          </Col>
        </Row>
      </Card>

      {rows.length === 0 && !loading && (
        <Alert
          message="Seleccione a turma e clique em Carregar para ver o relatório de assiduidade."
          type="info"
          showIcon
          style={{ borderRadius: 10 }}
        />
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <Spin size="large" />
        </div>
      )}

      {rows.length > 0 && !loading && (
        <>
          {/* Resumo */}
          <Row gutter={12} style={{ marginBottom: 16 }}>
            {[
              { label: "Total Presenças", v: totalPresent, color: "#16a34a" },
              { label: "Total Ausências", v: totalAbsent, color: "#dc2626" },
              { label: "Média Presença", v: `${avgPct}%`, color: "#4f46e5" },
              { label: "Alunos Críticos", v: critical, color: "#f59e0b" },
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
              rowKey="studentId"
              pagination={{ pageSize: 25 }}
              size="small"
              bordered
              locale={{ emptyText: "Nenhum registo de assiduidade." }}
            />
          </Card>
        </>
      )}
    </div>
  );
}
