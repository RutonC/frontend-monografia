// pages/admin/inscricao/index.tsx
import {
  BookOutlined,
  HomeOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Result,
  Row,
  Skeleton,
  Steps,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { Input } from "../../../components/Input";
import { useFetch, useMutationPost } from "../../../utils/fetch";
import type {
  IAcademicYear,
  ILevel,
  ISection,
  IStudent,
} from "../../../utils/type";

const { Title, Text } = Typography;

const STEP_LABELS = [
  { title: "Aluno", description: "Seleccionar aluno" },
  { title: "Classe & Turma", description: "Escolher onde vai estudar" },
  { title: "Confirmação", description: "Rever e confirmar" },
];

export default function NovaInscricao() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);

  // Selecções do utilizador
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null | any>(
    null,
  );
  const [selectedLevel, setSelectedLevel] = useState<ILevel | null>(null);
  const [selectedSection, setSelectedSection] = useState<ISection | null>(null);
  const [selectedYear, setSelectedYear] = useState<IAcademicYear | null>(null);
  const [done, setDone] = useState<any>(null);

  // Dados
  const { data: studentsData, isPending: loadingStudents } = useFetch(
    ["students"],
    "students",
  );
  const { data: yearsData } = useFetch(["academics"], "academics");
  const { data: levelsData } = useFetch(["levels"], "levels");

  // Turmas filtradas pela classe seleccionada
  const { data: sectionsData, isPending: loadingSections } = useFetch(
    ["sections", selectedLevel?.id ?? "", selectedYear?.id ?? ""],
    `sections?levelId=${selectedLevel?.id}&academicYearId=${selectedYear?.id}`,
    { enabled: !!selectedLevel?.id && !!selectedYear?.id },
  );

  // Disciplinas da classe seleccionada
  const { data: levelDetail, isPending: loadingSubjects } = useFetch(
    ["level-subjects", selectedLevel?.id ?? ""],
    `levels/${selectedLevel?.id}/subjects`,
    { enabled: !!selectedLevel?.id },
  );

  const { mutateAsync, isPending: enrolling } = useMutationPost(
    ["enrollments"],
    "enrollments",
  );

  const yearOptions =
    yearsData?.academicYear?.map((y: IAcademicYear) => ({
      label: `${y.year}${y.active ? " (activo)" : ""}`,
      value: y.id,
      raw: y,
    })) ?? [];

  const levelOptions =
    levelsData?.levels?.map((l: ILevel) => ({
      label: l.name,
      value: l.id,
      raw: l,
    })) ?? [];

  const sectionOptions =
    sectionsData?.sections?.map((s: ISection & { _count?: any }) => ({
      label: `${s.name} — ${s._count?.enrollments ?? 0}/${s.capacity} alunos`,
      value: s.id,
      raw: s,
      disabled: (s._count?.enrollments ?? 0) >= s.capacity,
    })) ?? [];

  const subjects: any[] = levelDetail?.level?.subjects ?? [];

  // Aluno seleccionado já tem matrícula neste ano?
  const alreadyEnrolled = selectedStudent?.enrollment?.some(
    (e: any) =>
      e.academicYearId === selectedYear?.id && e.status !== "CANCELLED",
  );

  const handleConfirm = async () => {
    if (!selectedStudent || !selectedLevel || !selectedSection || !selectedYear)
      return;

    try {
      const result = await mutateAsync({
        studentId: selectedStudent.id,
        levelId: selectedLevel.id,
        sectionId: selectedSection.id,
        academicYearId: selectedYear.id,
      });
      setDone(result);
      message.success("Inscrição efectuada com sucesso!");
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ?? "Erro ao efectuar inscrição.",
      );
    }
  };

  if (done) {
    const invoices = done.enrollment?.invoices ?? [];
    return (
      <Result
        status="success"
        title="Inscrição efectuada com sucesso!"
        subTitle={`${selectedStudent?.user?.firstName} ${selectedStudent?.user?.lastName} inscrito(a) na turma ${selectedSection?.name}.`}
        extra={[
          <Button
            type="primary"
            key="new"
            onClick={() => {
              setDone(null);
              setStep(0);
              setSelectedStudent(null);
              setSelectedLevel(null);
              setSelectedSection(null);
              setSelectedYear(null);
              form.resetFields();
            }}
          >
            Nova Inscrição
          </Button>,
          <Button key="list" onClick={() => navigate("/inscricao/lista")}>
            Ver Inscrições
          </Button>,
        ]}
      >
        {invoices.length > 0 && (
          <Card
            title="Mensalidades geradas"
            size="small"
            style={{ maxWidth: 520, margin: "0 auto" }}
          >
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={invoices}
              columns={[
                {
                  title: "Trimestre",
                  render: (_: any, r: any) => r.term?.name ?? "—",
                },
                {
                  title: "Valor",
                  render: (_: any, r: any) =>
                    `MZN ${Number(r.amount).toFixed(2)}`,
                },
                {
                  title: "Vencimento",
                  render: (_: any, r: any) =>
                    new Date(r.dueDate).toLocaleDateString("pt-MZ"),
                },
                {
                  title: "Estado",
                  render: () => <Tag color="warning">Pendente</Tag>,
                },
              ]}
            />
          </Card>
        )}
      </Result>
    );
  }

  return (
    <>
      <CustomBreadcrumb
        title="Nova Inscrição"
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Inscrições" },
          { title: "Nova Inscrição" },
        ]}
        onPrev
      />

      <Row gutter={[24, 24]}>
        {/* Steps lateral */}
        <Col xs={24} md={6}>
          <Card size="small">
            <Steps
              direction="vertical"
              current={step}
              size="small"
              items={STEP_LABELS}
            />
          </Card>
        </Col>

        {/* Conteúdo do passo */}
        <Col xs={24} md={18}>
          <Card>
            {/* ── Passo 0: Seleccionar Aluno ──────────────────── */}
            {step === 0 && (
              <div>
                <Title level={5} style={{ marginBottom: 16 }}>
                  Seleccione o aluno a inscrever
                </Title>
                <Input.Select
                  label="Ano Lectivo"
                  name="academicYearId"
                  required
                  options={yearOptions}
                  onChange={(v: string) => {
                    const y = yearsData?.academicYear?.find(
                      (a: IAcademicYear) => a.id === v,
                    );
                    setSelectedYear(y ?? null);
                  }}
                  placeholder="Seleccione o ano lectivo"
                />

                <div style={{ marginTop: 16, marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Alunos disponíveis
                  </Text>
                </div>

                <Table
                  rowKey="id"
                  size="small"
                  loading={loadingStudents}
                  dataSource={studentsData?.students ?? []}
                  rowSelection={{
                    type: "radio",
                    selectedRowKeys: selectedStudent
                      ? [selectedStudent.id]
                      : [],
                    onChange: (_, rows: any) =>
                      setSelectedStudent(rows[0] ?? null),
                  }}
                  onRow={(record: any) => ({
                    onClick: () => setSelectedStudent(record),
                    style: { cursor: "pointer" },
                  })}
                  columns={[
                    {
                      title: "Nome",
                      render: (_, r: IStudent) => (
                        <Flex align="center" gap={8}>
                          <Avatar shape="square" src={r.user?.avatar}>
                            {r.user?.firstName?.[0]}
                          </Avatar>
                          <span>
                            {r.user?.firstName} {r.user?.lastName}
                          </span>
                        </Flex>
                      ),
                    },
                    {
                      title: "Identificador",
                      render: (_, r: IStudent) => (
                        <Text code style={{ fontSize: 11 }}>
                          {r.user?.identifier}
                        </Text>
                      ),
                    },
                    {
                      title: "Estado",
                      render: (_, r: IStudent) => (
                        <Tag
                          color={
                            r.user?.status === "ACTIVE" ? "success" : "default"
                          }
                          variant="outlined"
                        >
                          {r.user?.status === "ACTIVE" ? "Activo" : "Inactivo"}
                        </Tag>
                      ),
                    },
                  ]}
                  pagination={{ pageSize: 8 }}
                />

                {selectedStudent && alreadyEnrolled && (
                  <Alert
                    type="warning"
                    icon={<WarningOutlined />}
                    showIcon
                    message={`${selectedStudent.user?.firstName} já tem inscrição activa neste ano lectivo. Use "Actualizar Inscrição" se pretende mudar de turma.`}
                    style={{ marginTop: 12 }}
                  />
                )}

                <Flex justify="flex-end" style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    disabled={
                      !selectedStudent || !selectedYear || !!alreadyEnrolled
                    }
                    onClick={() => setStep(1)}
                  >
                    Próximo
                  </Button>
                </Flex>
              </div>
            )}

            {/* ── Passo 1: Classe & Turma ─────────────────────── */}
            {step === 1 && (
              <div>
                <Title level={5} style={{ marginBottom: 16 }}>
                  Seleccione a classe e turma
                </Title>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Input.Select
                      label="Classe"
                      name="levelId"
                      required
                      options={levelOptions}
                      onChange={(v: string) => {
                        const l = levelsData?.levels?.find(
                          (lv: ILevel) => lv.id === v,
                        );
                        setSelectedLevel(l ?? null);
                        setSelectedSection(null);
                      }}
                      placeholder="Seleccione a classe"
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Input.Select
                      label="Turma"
                      name="sectionId"
                      required
                      disabled={!selectedLevel || loadingSections}
                      options={sectionOptions}
                      onChange={(v: string) => {
                        const s = sectionsData?.sections?.find(
                          (sc: ISection) => sc.id === v,
                        );
                        setSelectedSection(s ?? null);
                      }}
                      placeholder={
                        selectedLevel
                          ? "Seleccione a turma"
                          : "Seleccione primeiro a classe"
                      }
                    />
                  </Col>
                </Row>

                {/* Disciplinas da classe */}
                {selectedLevel && (
                  <div style={{ marginTop: 20 }}>
                    <Flex align="center" gap={8} style={{ marginBottom: 10 }}>
                      <BookOutlined />
                      <Text strong style={{ fontSize: 13 }}>
                        Disciplinas da {selectedLevel.name}
                      </Text>
                    </Flex>
                    {loadingSubjects ? (
                      <Skeleton active paragraph={{ rows: 2 }} />
                    ) : subjects.length === 0 ? (
                      <Alert
                        type="info"
                        message="Nenhuma disciplina atribuída a esta classe ainda."
                      />
                    ) : (
                      <Flex wrap gap={6}>
                        {subjects.map((s: any) => (
                          <Tag
                            key={s.subjectId}
                            color="blue"
                            icon={<BookOutlined />}
                          >
                            {s.subject?.name}
                            {s.credits ? ` · ${s.credits}h/sem` : ""}
                          </Tag>
                        ))}
                      </Flex>
                    )}
                  </div>
                )}

                <Flex justify="space-between" style={{ marginTop: 20 }}>
                  <Button onClick={() => setStep(0)}>Voltar</Button>
                  <Button
                    type="primary"
                    disabled={!selectedSection}
                    onClick={() => setStep(2)}
                  >
                    Próximo
                  </Button>
                </Flex>
              </div>
            )}

            {/* ── Passo 2: Confirmação ─────────────────────────── */}
            {step === 2 && (
              <div>
                <Title level={5} style={{ marginBottom: 16 }}>
                  Confirmar inscrição
                </Title>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Card
                      size="small"
                      style={{
                        background: "var(--color-background-secondary)",
                        border: "none",
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Aluno
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text strong>
                          {selectedStudent?.user?.firstName}{" "}
                          {selectedStudent?.user?.lastName}
                        </Text>
                        <br />
                        <Text code style={{ fontSize: 11 }}>
                          {selectedStudent?.user?.identifier}
                        </Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card
                      size="small"
                      style={{
                        background: "var(--color-background-secondary)",
                        border: "none",
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Ano Lectivo
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text strong>{selectedYear?.year}</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card
                      size="small"
                      style={{
                        background: "var(--color-background-secondary)",
                        border: "none",
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Classe
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text strong>{selectedLevel?.name}</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card
                      size="small"
                      style={{
                        background: "var(--color-background-secondary)",
                        border: "none",
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Turma
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <TeamOutlined style={{ marginRight: 6 }} />
                        <Text strong>{selectedSection?.name}</Text>
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Alert
                  type="info"
                  showIcon
                  style={{ marginTop: 16 }}
                  message="Ao confirmar, serão geradas automaticamente as mensalidades para todos os trimestres do ano lectivo seleccionado."
                />

                <Flex justify="space-between" style={{ marginTop: 20 }}>
                  <Button onClick={() => setStep(1)}>Voltar</Button>
                  <Button
                    type="primary"
                    loading={enrolling}
                    onClick={handleConfirm}
                  >
                    Confirmar Inscrição
                  </Button>
                </Flex>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
}
