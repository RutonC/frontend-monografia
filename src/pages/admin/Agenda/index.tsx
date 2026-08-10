// pages/admin/notas/pauta.tsx
// Pauta global por turma — notas consolidadas de todos os alunos
// por disciplina e trimestre. Botão de exportar PDF.
import {
  HomeOutlined,
  PrinterOutlined
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Row,
  Select,
  Skeleton,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useRef, useState } from "react";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { useFetch } from "../../../utils/fetch";
import type { IAcademicYear, ILevel, ISection } from "../../../utils/type";

const { Text, Title } = Typography;

const GRADE_TYPES = ["AC1", "AC2", "EXAM"] as const;
const GRADE_LABELS: Record<string, string> = {
  AC1: "AC1",
  AC2: "AC2",
  EXAM: "Exame",
};

// Calcula média simples
function avg(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export default function PautaGlobal() {
  const pautaRef = useRef<HTMLDivElement>(null);

  const [filterYear, setFilterYear] = useState<string | undefined>();
  const [filterLevel, setFilterLevel] = useState<string | undefined>();
  const [filterSection, setFilterSection] = useState<string | undefined>();
  const [filterTerm, setFilterTerm] = useState<string | undefined>();

  // Apoio
  const { data: yearsData } = useFetch(["academics"], "academics");
  const { data: levelsData } = useFetch(["levels"], "levels");
  const { data: sectionsData } = useFetch(
    ["sections", filterLevel ?? "", filterYear ?? ""],
    `sections?levelId=${filterLevel ?? ""}&academicYearId=${filterYear ?? ""}`,
    { enabled: !!filterLevel || !!filterYear },
  );
  const { data: termsData } = useFetch(
    ["terms", filterYear ?? ""],
    `terms?academicYearId=${filterYear ?? ""}`,
    { enabled: !!filterYear },
  );

  // Notas da turma seleccionada
  const { data: gradesData, isPending: loadingGrades } = useFetch(
    ["grades-section", filterSection ?? "", filterTerm ?? ""],
    `grades?sectionId=${filterSection}${filterTerm ? `&termId=${filterTerm}` : ""}`,
    { enabled: !!filterSection },
  );

  // Inscrições da turma (para lista de alunos)
  const { data: enrollmentsData } = useFetch(
    ["enrollments-section-pauta", filterSection ?? ""],
    `enrollments?sectionId=${filterSection}&status=APPROVED`,
    { enabled: !!filterSection },
  );

  // Detalhes da turma (disciplinas)
  const { data: sectionDetail } = useFetch(
    ["section-pauta", filterSection ?? ""],
    `sections/${filterSection}`,
    { enabled: !!filterSection },
  );

  // Média/situação oficiais — vêm do motor de cálculo do servidor
  // (média ponderada por peso, Recurso substitui Exame, limiar de
  // aprovação vem das Definições da escola). Só disponível quando um
  // trimestre específico está seleccionado; com "Todos os trimestres"
  // cai-se de volta à média simples calculada aqui.
  const { data: pautaData } = useFetch(
    ["pauta", filterSection ?? "", filterTerm ?? ""],
    `sections/${filterSection}/pauta?termId=${filterTerm}`,
    { enabled: !!filterSection && !!filterTerm },
  );
  const officialByStudent: Record<
    string,
    { average: number | null; passed: boolean | null }
  > = {};
  (pautaData?.rows ?? []).forEach((r: any) => {
    officialByStudent[r.studentId] = {
      average: r.termAverage,
      passed: r.passed,
    };
  });

  const yearOptions =
    yearsData?.academicYear?.map((y: IAcademicYear) => ({
      label: `${y.year}${y.active ? " ✓" : ""}`,
      value: y.id,
    })) ?? [];
  const levelOptions =
    levelsData?.levels?.map((l: ILevel) => ({
      label: l.name,
      value: l.id,
    })) ?? [];
  const sectionOptions =
    sectionsData?.sections?.map((s: ISection) => ({
      label: s.name,
      value: s.id,
    })) ?? [];
  const termOptions = [
    { label: "Todos os trimestres", value: "" },
    ...(termsData?.terms?.map((t: any) => ({ label: t.name, value: t.id })) ??
      []),
  ];

  const grades: any[] = gradesData?.grades ?? [];
  const enrollments: any[] = enrollmentsData?.enrollments ?? [];
  const subjects: any[] = sectionDetail?.section?.level?.subjects ?? [];

  // Indexar notas: gradeIndex[studentId][subjectId][type] = valor
  const gradeIndex: Record<string, Record<string, Record<string, number>>> = {};
  grades.forEach((g: any) => {
    if (!gradeIndex[g.studentId]) gradeIndex[g.studentId] = {};
    if (!gradeIndex[g.studentId][g.subjectId])
      gradeIndex[g.studentId][g.subjectId] = {};
    gradeIndex[g.studentId][g.subjectId][g.type] = Number(g.value);
  });

  // Colunas dinâmicas: uma por disciplina × tipo de nota
  const subjectCols = subjects.flatMap((s: any) =>
    GRADE_TYPES.map((type) => ({
      title: `${s.subject?.name ?? "—"} (${GRADE_LABELS[type]})`,
      key: `${s.subjectId}_${type}`,
      width: 100,
      render: (_: any, row: any) => {
        const val = gradeIndex[row.studentId]?.[s.subjectId]?.[type];
        if (val === undefined)
          return (
            <Text type="secondary" style={{ fontSize: 11 }}>
              —
            </Text>
          );
        return (
          <Text
            strong
            style={{
              fontSize: 13,
              color:
                val >= 10
                  ? "var(--color-text-success)"
                  : "var(--color-text-danger)",
            }}
          >
            {val.toFixed(1)}
          </Text>
        );
      },
    })),
  );

  // Média/situação oficiais quando disponíveis (motor de cálculo do
  // servidor — pesos + Recurso substitui Exame + limiar das Definições);
  // caso contrário, média simples calculada aqui como aproximação.
  const officialOrFallback = (studentId: string) => {
    const official = officialByStudent[studentId];
    if (official) return official;
    const allValues = subjects.flatMap((s: any) =>
      GRADE_TYPES.map(
        (type) => gradeIndex[studentId]?.[s.subjectId]?.[type],
      ).filter((v): v is number => v !== undefined),
    );
    const m = avg(allValues);
    return { average: m, passed: m === null ? null : m >= 10 };
  };

  // Coluna de média final
  const mediaCol = {
    title: "Média",
    key: "media",
    fixed: "right" as const,
    width: 80,
    render: (_: any, row: any) => {
      const { average, passed } = officialOrFallback(row.studentId);
      if (average === null) return "—";
      return (
        <Tag
          color={passed ? "success" : "error"}
          style={{ fontWeight: 600, fontSize: 13 }}
        >
          {average.toFixed(1)}
        </Tag>
      );
    },
  };

  const dataSource = enrollments.map((e: any, i: number) => ({
    key: e.studentId,
    numero: i + 1,
    studentId: e.studentId,
    firstName: e.student?.user?.firstName ?? "",
    lastName: e.student?.user?.lastName ?? "",
    identifier: e.student?.user?.identifier ?? "",
  }));

  // Impressão / PDF via janela do browser
  const handlePrint = () => {
    if (!filterSection) {
      message.warning("Seleccione uma turma primeiro.");
      return;
    }
    window.print();
  };

  const sectionName = sectionDetail?.section?.name ?? "";
  const levelName = sectionDetail?.section?.level?.name ?? "";
  const academicYear = sectionDetail?.section?.academicYear?.year ?? "";
  const selectedTermName =
    termsData?.terms?.find((t: any) => t.id === filterTerm)?.name ??
    "Todos os trimestres";

  return (
    <>
      <CustomBreadcrumb
        title="Pauta Global"
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Notas" },
          { title: "Pauta Global" },
        ]}
      />

      {/* Filtros */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={6}>
            <Text
              style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
            >
              Ano Lectivo
            </Text>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Ano"
              options={yearOptions}
              onChange={(v) => {
                setFilterYear(v);
                setFilterSection(undefined);
              }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Text
              style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
            >
              Classe
            </Text>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Classe"
              options={levelOptions}
              onChange={(v) => {
                setFilterLevel(v);
                setFilterSection(undefined);
              }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Text
              style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
            >
              Turma
            </Text>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Turma"
              options={sectionOptions}
              value={filterSection}
              onChange={setFilterSection}
              disabled={!filterLevel && !filterYear}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Text
              style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
            >
              Trimestre
            </Text>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              options={termOptions}
              value={filterTerm ?? ""}
              onChange={(v) => setFilterTerm(v || undefined)}
              disabled={!filterYear}
            />
          </Col>
        </Row>
        <Flex justify="flex-end" gap={8} style={{ marginTop: 12 }}>
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            disabled={!filterSection}
          >
            Imprimir / PDF
          </Button>
        </Flex>
      </Card>

      {/* Pauta */}
      {!filterSection && (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Seleccione uma turma para ver a pauta."
          />
        </Card>
      )}

      {filterSection && (
        <Card>
          {/* Cabeçalho da pauta (visível na impressão) */}
          <div ref={pautaRef} id="pauta-print">
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Title level={4} style={{ margin: 0 }}>
                Pauta de Avaliação — {levelName} {sectionName}
              </Title>
              <Text type="secondary">
                {academicYear} · {selectedTermName}
              </Text>
            </div>

            <Divider style={{ margin: "12px 0" }} />

            {loadingGrades ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <Table
                rowKey="key"
                dataSource={dataSource}
                scroll={{ x: "max-content" }}
                pagination={false}
                size="small"
                bordered
                columns={[
                  {
                    title: "Nº",
                    dataIndex: "numero",
                    width: 50,
                    fixed: "left",
                  },
                  {
                    title: "Nome Completo",
                    fixed: "left",
                    width: 200,
                    render: (_: any, r: any) => (
                      <Text style={{ fontSize: 13 }}>
                        {r.firstName} {r.lastName}
                      </Text>
                    ),
                  },
                  ...subjectCols,
                  mediaCol,
                  {
                    title: "Situação",
                    fixed: "right",
                    width: 90,
                    render: (_: any, row: any) => {
                      const { average, passed } = officialOrFallback(
                        row.studentId,
                      );
                      if (average === null) return "—";
                      return (
                        <Tag color={passed ? "success" : "error"}>
                          {passed ? "Aprovado" : "Reprovado"}
                        </Tag>
                      );
                    },
                  },
                ]}
              />
            )}

            {/* Rodapé da pauta */}
            {!loadingGrades && dataSource.length > 0 && (
              <div
                style={{
                  marginTop: 24,
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                }}
              >
                <Text type="secondary">
                  Total de alunos: {dataSource.length} · Aprovados:{" "}
                  {
                    dataSource.filter(
                      (row) => officialOrFallback(row.studentId).passed,
                    ).length
                  }
                </Text>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* CSS de impressão */}
      <style>{`
        @media print {
          body > *:not(#root) { display: none !important; }
          .ant-layout-sider, .ant-layout-header, nav, .ant-breadcrumb,
          .ant-card:not(:has(#pauta-print)),
          button, .ant-btn { display: none !important; }
          #pauta-print { display: block !important; }
          .ant-table { font-size: 11px; }
          @page { size: A4 landscape; margin: 1cm; }
        }
      `}</style>
    </>
  );
}
