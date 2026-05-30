// pages/admin/assiduidade/index.tsx
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  SaveOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Radio,
  Row,
  Select,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { useFetch, useMutationPost } from "../../../utils/fetch";
import type { IAcademicYear, ILevel, ISection } from "../../../utils/type";

const { Text } = Typography;

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "JUSTIFIED";

type AttRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  identifier: string;
  avatar?: string;
  status: AttendanceStatus;
  remarks: string;
};

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PRESENT: {
    label: "Presente",
    color: "success",
    icon: <CheckCircleOutlined />,
  },
  ABSENT: { label: "Falta", color: "error", icon: <CloseCircleOutlined /> },
  LATE: { label: "Atraso", color: "warning", icon: <ClockCircleOutlined /> },
  JUSTIFIED: {
    label: "Justificada",
    color: "processing",
    icon: <WarningOutlined />,
  },
};

export default function RegistarAssiduidade() {
  const [filterYear, setFilterYear] = useState<string | undefined>();
  const [filterLevel, setFilterLevel] = useState<string | undefined>();
  const [filterSection, setFilterSection] = useState<string | undefined>();
  const [filterSubject, setFilterSubject] = useState<string | undefined>();
  const [filterTerm, setFilterTerm] = useState<string | undefined>();
  const [date, setDate] = useState<dayjs.Dayjs>(dayjs());
  const [rows, setRows] = useState<AttRow[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { data: yearsData } = useFetch(["academics"], "academics");
  const { data: levelsData } = useFetch(["levels"], "levels");
  const { data: sectionsData } = useFetch(
    ["sections", filterLevel ?? "", filterYear ?? ""],
    `sections?levelId=${filterLevel ?? ""}&academicYearId=${filterYear ?? ""}`,
    { enabled: !!filterLevel || !!filterYear },
  );
  const { data: sectionDetail } = useFetch(
    ["section-subjects", filterSection ?? ""],
    `sections/${filterSection}`,
    { enabled: !!filterSection },
  );
  const { data: termsData } = useFetch(
    ["terms", filterYear ?? ""],
    `terms?academicYearId=${filterYear ?? ""}`,
    { enabled: !!filterYear },
  );
  const { data: enrollmentsData } = useFetch(
    ["enrollments-att", filterSection ?? ""],
    `enrollments?sectionId=${filterSection}&status=APPROVED`,
    { enabled: !!filterSection },
  );

  const { mutateAsync: bulkCreate, isPending: saving } = useMutationPost(
    ["attendance"],
    "attendance/bulk",
  );

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
      teacherId: sectionDetail.section?.teacherSections?.find(
        (ts: any) => ts.subjectId === s.subjectId,
      )?.teacherId,
    })) ?? [];
  const termOptions =
    termsData?.terms?.map((t: any) => ({
      label: t.name,
      value: t.id,
    })) ?? [];

  const handleLoad = () => {
    const enrollments = enrollmentsData?.enrollments ?? [];
    if (!enrollments.length) {
      message.warning("Nenhum aluno inscrito nesta turma.");
      return;
    }
    setRows(
      enrollments.map((e: any) => ({
        studentId: e.studentId,
        firstName: e.student?.user?.firstName ?? "",
        lastName: e.student?.user?.lastName ?? "",
        identifier: e.student?.user?.identifier ?? "",
        avatar: e.student?.user?.avatar,
        status: "PRESENT" as AttendanceStatus,
        remarks: "",
      })),
    );
    setSubmitted(false);
  };

  const handleStatusChange = (studentId: string, val: AttendanceStatus) => {
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: val } : r)),
    );
  };

  // Estatísticas em tempo real
  const stats = {
    present: rows.filter((r) => r.status === "PRESENT").length,
    absent: rows.filter((r) => r.status === "ABSENT").length,
    late: rows.filter((r) => r.status === "LATE").length,
    justified: rows.filter((r) => r.status === "JUSTIFIED").length,
  };

  const selectedSubjectObj = subjectOptions.find(
    (s: any) => s.value === filterSubject,
  );

  const handleSave = async () => {
    if (!filterSubject || !filterTerm || !filterSection) {
      message.error("Seleccione a disciplina, turma e trimestre.");
      return;
    }

    await bulkCreate({
      date: date.toISOString(),
      subjectId: filterSubject,
      termId: filterTerm,
      teacherId: selectedSubjectObj?.teacherId ?? "",
      sectionId: filterSection,
      records: rows.map((r) => ({
        studentId: r.studentId,
        status: r.status,
        remarks: r.remarks || undefined,
      })),
    });

    message.success(`Assiduidade registada para ${rows.length} alunos.`);
    setSubmitted(true);
  };

  const markAll = (status: AttendanceStatus) => {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  return (
    <>
      <CustomBreadcrumb
        title="Registar Assiduidade"
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Assiduidade" },
        ]}
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
              Data da Aula
            </Text>
            <DatePicker
              style={{ width: "100%", marginTop: 4 }}
              value={date}
              onChange={(d) => d && setDate(d)}
              format="DD/MM/YYYY"
            />
          </Col>
        </Row>
        <Flex justify="flex-end" style={{ marginTop: 12 }}>
          <Button
            type="primary"
            disabled={!filterSection || !filterYear}
            onClick={handleLoad}
          >
            Carregar Alunos
          </Button>
        </Flex>
      </Card>

      {rows.length > 0 && (
        <>
          {/* Estatísticas */}
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {(["present", "absent", "late", "justified"] as const).map((k) => {
              const cfg = STATUS_CONFIG[k.toUpperCase() as AttendanceStatus];
              return (
                <Col key={k} xs={12} sm={6}>
                  <Card
                    style={{
                      background: "var(--color-background-secondary)",
                      border: "none",
                    }}
                  >
                    <Statistic
                      title={cfg.label}
                      value={stats[k]}
                      suffix={`/ ${rows.length}`}
                      valueStyle={{ fontSize: 18 }}
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>

          <Card
            title={
              <Flex align="center" gap={8}>
                <span>Assiduidade — {date.format("DD/MM/YYYY")}</span>
                <Tag color="blue">
                  {subjectOptions.find((s: any) => s.value === filterSubject)
                    ?.label ?? "—"}
                </Tag>
              </Flex>
            }
            extra={
              <Flex gap={8}>
                <Button size="small" onClick={() => markAll("PRESENT")}>
                  Todos presentes
                </Button>
                <Button size="small" danger onClick={() => markAll("ABSENT")}>
                  Todos ausentes
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                  disabled={submitted}
                >
                  {submitted ? "Registado ✓" : "Registar"}
                </Button>
              </Flex>
            }
          >
            {submitted && (
              <Alert
                type="success"
                showIcon
                message="Assiduidade registada com sucesso para esta aula."
                style={{ marginBottom: 16 }}
              />
            )}

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
                  render: (_: any, r: AttRow) => (
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
                  title: "Estado",
                  width: "22rem",
                  render: (_: any, r: AttRow) => (
                    <Radio.Group
                      value={r.status}
                      onChange={(e) =>
                        handleStatusChange(r.studentId, e.target.value)
                      }
                      disabled={submitted}
                      size="small"
                      optionType="button"
                      buttonStyle="solid"
                    >
                      {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(
                        (k) => (
                          <Radio.Button key={k} value={k}>
                            {STATUS_CONFIG[k].label}
                          </Radio.Button>
                        ),
                      )}
                    </Radio.Group>
                  ),
                },
                {
                  title: "Estado",
                  width: "8rem",
                  render: (_: any, r: AttRow) => {
                    const cfg = STATUS_CONFIG[r.status];
                    return (
                      <Tag color={cfg.color} icon={cfg.icon}>
                        {cfg.label}
                      </Tag>
                    );
                  },
                },
              ]}
            />
          </Card>
        </>
      )}
    </>
  );
}
