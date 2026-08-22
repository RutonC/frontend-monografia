// pages/admin/notas/index.tsx
import { CheckOutlined, HomeOutlined, SaveOutlined } from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  InputNumber,
  Row,
  Select,
  Table,
  Tag,
  Typography,
  message
} from "antd";
import { useState } from "react";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { useFetch, useMutationPost } from "../../../utils/fetch";
import type { IAcademicYear, ILevel, ISection } from "../../../utils/type";

const { Text } = Typography;

const GRADE_TYPES = [
  { label: "ACS 1 — 1ª Avaliação Contínua", value: "ACS1" },
  { label: "ACS 2 — 2ª Avaliação Contínua", value: "ACS2" },
  { label: "ACS 3 — 3ª Avaliação Contínua", value: "ACS3" },
  { label: "ACP 1 — 1ª Avaliação com Prova", value: "ACP1" },
  { label: "ACP 2 — 2ª Avaliação com Prova", value: "ACP2" },
];

type GradeRow = {
  studentId: string;
  enrollmentId: string;
  firstName: string;
  lastName: string;
  identifier: string;
  avatar?: string;
  value: number | null;
};

export default function LancamentoNotas() {
  // Filtros
  const [filterYear, setFilterYear] = useState<string | undefined>();
  const [filterSection, setFilterSection] = useState<string | undefined>();
  const [filterSubject, setFilterSubject] = useState<string | undefined>();
  const [filterTerm, setFilterTerm] = useState<string | undefined>();
  const [gradeType, setGradeType] = useState<string>("ACS1");
  const [rows, setRows] = useState<GradeRow[]>([]);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  // Dados de apoio
  const { data: yearsData } = useFetch(["academics"], "academics");
  const { data: levelsData } = useFetch(["levels"], "levels");
  const [filterLevel, setFilterLevel] = useState<string | undefined>();

  const { data: sectionsData } = useFetch(
    ["sections", filterLevel ?? "", filterYear ?? ""],
    `sections?levelId=${filterLevel ?? ""}&academicYearId=${filterYear ?? ""}`,
    { enabled: !!filterLevel || !!filterYear },
  );

  const { data: sectionDetail } = useFetch(
    ["section-detail", filterSection ?? ""],
    `sections/${filterSection}`,
    { enabled: !!filterSection },
  );

  const { data: termsData } = useFetch(
    ["terms", filterYear ?? ""],
    `terms?academicYearId=${filterYear ?? ""}`,
    { enabled: !!filterYear },
  );

  const { data: enrollmentsData } = useFetch(
    ["enrollments-section", filterSection ?? ""],
    `enrollments?sectionId=${filterSection}&status=APPROVED`,
    { enabled: !!filterSection },
  );

  const { mutateAsync: createGrade, isPending: saving } = useMutationPost(
    ["grades"],
    "grades",
  );

  // Opções
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

  const subjectOptions =
    sectionDetail?.section?.level?.subjects?.map((s: any) => ({
      label: s.subject?.name,
      value: s.subjectId,
    })) ?? [];

  const termOptions =
    termsData?.terms?.map((t: any) => ({
      label: t.name,
      value: t.id,
    })) ?? [];

  // Ao seleccionar turma, montar os alunos inscritos
  const handleLoadStudents = () => {
    const enrollments = enrollmentsData?.enrollments ?? [];
    if (!enrollments.length) {
      message.warning("Nenhum aluno inscrito nesta turma.");
      return;
    }
    const mapped: GradeRow[] = enrollments.map((e: any) => ({
      studentId: e.studentId,
      enrollmentId: e.id,
      firstName: e.student?.user?.firstName ?? "",
      lastName: e.student?.user?.lastName ?? "",
      identifier: e.student?.user?.identifier ?? "",
      avatar: e.student?.user?.avatar,
      value: null,
    }));
    setRows(mapped);
    setSaved({});
  };

  const handleValueChange = (studentId: string, val: number | null) => {
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, value: val } : r)),
    );
  };

  // Guardar tudo de uma vez
  const handleSaveAll = async () => {
    if (!filterSubject || !filterTerm) {
      message.error("Seleccione a disciplina e o trimestre.");
      return;
    }

    const toSave = rows.filter((r) => r.value !== null && !saved[r.studentId]);
    if (!toSave.length) {
      message.info("Nenhuma nota nova para guardar.");
      return;
    }

    let ok = 0;
    let errors = 0;
    for (const row of toSave) {
      try {
        await createGrade({
          studentId: row.studentId,
          enrollmentId: row.enrollmentId,
          subjectId: filterSubject,
          termId: filterTerm,
          teacherId: "", // preenchido pelo backend via req.user
          type: gradeType,
          value: row.value,
          weight: 1,
        });
        setSaved((prev) => ({ ...prev, [row.studentId]: true }));
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
      message.error(`${errors} nota${errors > 1 ? "s" : ""} com erro.`);
  };

  const canLoad = !!filterSection && !!filterYear;

  return (
    <>
      <CustomBreadcrumb
        title="Lançamento de Notas"
        items={[{ href: "/", title: <HomeOutlined /> }, { title: "Notas" }]}
      />

      {/* Filtros */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} md={4}>
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
                setRows([]);
              }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
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
                setRows([]);
              }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
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
              onChange={(v) => {
                setFilterSection(v);
                setRows([]);
                setSaved({});
              }}
              disabled={!filterLevel && !filterYear}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Text
              style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
            >
              Disciplina
            </Text>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Disciplina"
              options={subjectOptions}
              value={filterSubject}
              onChange={setFilterSubject}
              disabled={!filterSection}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Text
              style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
            >
              Trimestre
            </Text>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Trimestre"
              options={termOptions}
              value={filterTerm}
              onChange={setFilterTerm}
              disabled={!filterYear}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Text
              style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
            >
              Tipo de avaliação
            </Text>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              options={GRADE_TYPES}
              value={gradeType}
              onChange={setGradeType}
            />
          </Col>
        </Row>
        <Flex justify="flex-end" style={{ marginTop: 12 }}>
          <Button
            type="primary"
            disabled={!canLoad}
            onClick={handleLoadStudents}
          >
            Carregar Alunos
          </Button>
        </Flex>
      </Card>

      {/* Tabela de notas */}
      {rows.length > 0 && (
        <Card
          title={
            <Flex align="center" gap={8}>
              <span>
                {sectionDetail?.section?.level?.name} ·{" "}
                {sectionDetail?.section?.name}
              </span>
              <Tag color="blue">
                {GRADE_TYPES.find((t) => t.value === gradeType)?.label}
              </Tag>
            </Flex>
          }
          extra={
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSaveAll}
            >
              Guardar Todas (
              {
                rows.filter((r) => r.value !== null && !saved[r.studentId])
                  .length
              }
              )
            </Button>
          }
        >
          <Alert
            type="info"
            showIcon
            message="Preencha as notas de 0 a 20. Clique em Guardar Todas para submeter."
            style={{ marginBottom: 16 }}
          />
          <Table
            rowKey="studentId"
            dataSource={rows}
            pagination={false}
            size="small"
            columns={[
              {
                title: "Nº",
                width: "3rem",
                render: (_: any, __: any, i: number) => i + 1,
              },
              {
                title: "Aluno",
                render: (_: any, r: GradeRow) => (
                  <Flex align="center" gap={8}>
                    <Avatar size="small" src={r.avatar}>
                      {r.firstName[0]}
                    </Avatar>
                    <div>
                      <Text style={{ fontSize: 13 }}>
                        {r.firstName} {r.lastName}
                      </Text>
                      <br />
                      <Text
                        type="secondary"
                        style={{ fontSize: 11, fontFamily: "monospace" }}
                      >
                        {r.identifier}
                      </Text>
                    </div>
                  </Flex>
                ),
              },
              {
                title: "Nota (0–20)",
                width: "12rem",
                render: (_: any, r: GradeRow) => (
                  <InputNumber
                    min={0}
                    max={20}
                    step={0.5}
                    precision={1}
                    value={r.value ?? undefined}
                    onChange={(v) => handleValueChange(r.studentId, v)}
                    disabled={saved[r.studentId]}
                    style={{ width: 100 }}
                    placeholder="0.0"
                    status={
                      r.value !== null && r.value < 10 ? "warning" : undefined
                    }
                  />
                ),
              },
              {
                title: "Resultado",
                width: "8rem",
                render: (_: any, r: GradeRow) => {
                  if (saved[r.studentId]) {
                    return (
                      <Tag color="success" icon={<CheckOutlined />}>
                        Guardado
                      </Tag>
                    );
                  }
                  if (r.value === null) return "—";
                  return (
                    <Tag color={r.value >= 10 ? "success" : "error"}>
                      {r.value >= 10 ? "Positiva" : "Negativa"}
                    </Tag>
                  );
                },
              },
            ]}
          />
        </Card>
      )}
    </>
  );
}
