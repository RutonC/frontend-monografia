// pages/admin/inscricao/actualizar.tsx
import { HomeOutlined, SwapOutlined, WarningOutlined } from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Row,
  Select,
  Skeleton,
  Tag,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { Input } from "../../../components/Input";
import { useFetch, useMutationPatch } from "../../../utils/fetch";
import { intlDate } from "../../../utils/intl";
import type { IAcademicYear, IEnrollment, ILevel } from "../../../utils/type";

const { Text } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  APPROVED: { color: "success", label: "Aprovado" },
  PENDING: { color: "warning", label: "Pendente" },
  REJECTED: { color: "error", label: "Reprovado" },
  CANCELLED: { color: "default", label: "Cancelado" },
};

export default function ActualizarInscricao() {
  const navigate = useNavigate();

  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<
    string | null
  >(null);
  const [newSectionId, setNewSectionId] = useState<string | null>(null);
  const [newLevelId, setNewLevelId] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);

  // Dados
  const { data: yearsData } = useFetch(["academics"], "academics");
  const { data: levelsData } = useFetch(["levels"], "levels");

  const { data: enrollmentsData, isPending: loadingEnrollments } = useFetch(
    ["enrollments", filterYear ?? "", filterLevel ?? ""],
    `enrollments?academicYearId=${filterYear ?? ""}&levelId=${filterLevel ?? ""}&status=APPROVED`,
    { enabled: true },
  );

  const { data: enrollmentDetail, isPending: loadingDetail } = useFetch(
    ["enrollment", selectedEnrollmentId ?? ""],
    `enrollments/${selectedEnrollmentId}`,
    { enabled: !!selectedEnrollmentId },
  );

  // Turmas da nova classe para mudar
  const { data: newSectionsData } = useFetch(
    ["sections-new", newLevelId ?? "", filterYear ?? ""],
    `sections?levelId=${newLevelId}&academicYearId=${filterYear ?? ""}`,
    { enabled: !!newLevelId && !!filterYear },
  );

  const { mutateAsyncPatch, isPending: updating } = useMutationPatch(
    ["enrollments"],
    "enrollments",
  );

  const enrollment: IEnrollment & { invoices?: any[] } =
    enrollmentDetail?.enrollment;

  const yearOptions =
    yearsData?.academicYear?.map((y: IAcademicYear) => ({
      label: `${y.year}${y.active ? " (activo)" : ""}`,
      value: y.id,
    })) ?? [];

  const levelOptions =
    levelsData?.levels?.map((l: ILevel) => ({
      label: l.name,
      value: l.id,
    })) ?? [];

  const enrollmentOptions =
    enrollmentsData?.enrollments?.map((e: any) => ({
      label: `${e.student?.user?.firstName} ${e.student?.user?.lastName} — ${e.section?.name}`,
      value: e.id,
    })) ?? [];

  const newSectionOptions =
    newSectionsData?.sections?.map((s: any) => ({
      label: `${s.name} — ${s._count?.enrollments ?? 0}/${s.capacity} alunos`,
      value: s.id,
      disabled: (s._count?.enrollments ?? 0) >= s.capacity,
    })) ?? [];

  const handleUpdate = async () => {
    if (!selectedEnrollmentId) return;
    if (!newSectionId && !newLevelId) {
      message.warning("Seleccione a nova turma ou classe para actualizar.");
      return;
    }

    try {
      await mutateAsyncPatch({
        id: selectedEnrollmentId,
        body: {
          ...(newSectionId && { sectionId: newSectionId }),
          ...(newLevelId && { levelId: newLevelId }),
          status: "APPROVED",
        },
      });

      message.success(
        "Inscrição actualizada com sucesso! Novas mensalidades geradas.",
      );
      setSelectedEnrollmentId(null);
      setNewSectionId(null);
      setNewLevelId(null);
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? "Erro ao actualizar.");
    }
  };

  const pendingInvoices =
    enrollment?.invoices?.filter(
      (i: any) => i.status === "UNPAID" || i.status === "OVERDUE",
    ) ?? [];

  return (
    <>
      <CustomBreadcrumb
        title="Actualizar Inscrição"
        items={[
          { href: "/", title: <HomeOutlined /> },
          {
            title: "Inscrições",
            href: "#",
            onClick: () => navigate("/inscricao"),
          },
          { title: "Actualizar Inscrição" },
        ]}
        onPrev
      />

      <Row gutter={[24, 24]}>
        {/* Filtros + selecção */}
        <Col xs={24} lg={10}>
          <Card title="Seleccionar inscrição" size="small">
            <Flex vertical gap={12}>
              <div>
                <Text
                  style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
                >
                  Filtrar por ano lectivo
                </Text>
                <Select
                  style={{ width: "100%", marginTop: 4 }}
                  placeholder="Seleccione o ano"
                  options={yearOptions}
                  onChange={(v) => {
                    setFilterYear(v);
                    setSelectedEnrollmentId(null);
                  }}
                  allowClear
                />
              </div>
              <div>
                <Text
                  style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
                >
                  Filtrar por classe
                </Text>
                <Select
                  style={{ width: "100%", marginTop: 4 }}
                  placeholder="Seleccione a classe"
                  options={levelOptions}
                  onChange={(v) => {
                    setFilterLevel(v);
                    setSelectedEnrollmentId(null);
                  }}
                  allowClear
                />
              </div>
              <div>
                <Text
                  style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
                >
                  Inscrição do aluno
                </Text>
                <Select
                  style={{ width: "100%", marginTop: 4 }}
                  placeholder="Seleccione o aluno"
                  options={enrollmentOptions}
                  value={selectedEnrollmentId}
                  onChange={(v) => {
                    setSelectedEnrollmentId(v);
                    setNewSectionId(null);
                    setNewLevelId(null);
                  }}
                  loading={loadingEnrollments}
                  showSearch
                  filterOption={(input, opt) =>
                    String(opt?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  allowClear
                />
              </div>
            </Flex>
          </Card>
        </Col>

        {/* Detalhes + acção */}
        <Col xs={24} lg={14}>
          {!selectedEnrollmentId && (
            <Card>
              <Flex
                vertical
                align="center"
                justify="center"
                style={{ minHeight: 200, color: "var(--color-text-tertiary)" }}
              >
                <SwapOutlined style={{ fontSize: 32, marginBottom: 12 }} />
                <Text type="secondary">
                  Seleccione uma inscrição para ver os detalhes e actualizar.
                </Text>
              </Flex>
            </Card>
          )}

          {selectedEnrollmentId && loadingDetail && (
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          )}

          {selectedEnrollmentId && !loadingDetail && enrollment && (
            <Flex vertical gap={16}>
              {/* Dados actuais */}
              <Card title="Inscrição actual" size="small">
                <Descriptions size="small" column={2}>
                  <Descriptions.Item label="Aluno">
                    <Flex align="center" gap={6}>
                      <Avatar
                        shape="square"
                        src={enrollment.student?.user?.avatar}
                      >
                        {enrollment.student?.user?.firstName?.[0]}
                      </Avatar>
                      <span>
                        {enrollment.student?.user?.firstName}{" "}
                        {enrollment.student?.user?.lastName}
                      </span>
                    </Flex>
                  </Descriptions.Item>
                  <Descriptions.Item label="Estado">
                    <Tag
                      color={STATUS_MAP[enrollment.status]?.color}
                      variant="outlined"
                    >
                      {STATUS_MAP[enrollment.status]?.label ??
                        enrollment.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Classe">
                    {enrollment.level?.name ?? "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Turma">
                    {enrollment.section?.name ?? "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ano Lectivo">
                    {enrollment.academicYear?.year ?? "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Data">
                    {enrollment.createdAt
                      ? intlDate(enrollment.createdAt)
                      : "—"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Aviso de propinas pendentes */}
              {pendingInvoices.length > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  message={`Este aluno tem ${pendingInvoices.length} propina(s) por pagar. Ao mudar de turma, as mensalidades não pagas serão anuladas e novas serão geradas.`}
                />
              )}

              {/* Nova turma */}
              <Card title="Actualizar para" size="small">
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={12}>
                    <Input.Select
                      label="Nova Classe (opcional)"
                      name="newLevelId"
                      options={levelOptions}
                      onChange={(v: string) => {
                        setNewLevelId(v);
                        setNewSectionId(null);
                      }}
                      placeholder="Manter a mesma classe"
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Input.Select
                      label="Nova Turma"
                      name="newSectionId"
                      options={newSectionOptions}
                      disabled={!newLevelId && !filterLevel}
                      onChange={(v: string) => setNewSectionId(v)}
                      placeholder="Seleccione a nova turma"
                    />
                  </Col>
                </Row>

                <Alert
                  type="info"
                  showIcon
                  style={{ marginTop: 12 }}
                  message="Se mudar apenas de turma dentro da mesma classe, as disciplinas mantêm-se. Novas mensalidades serão geradas automaticamente."
                />

                <Flex justify="flex-end" style={{ marginTop: 16 }} gap={8}>
                  <Button onClick={() => setSelectedEnrollmentId(null)}>
                    Cancelar
                  </Button>
                  <Button
                    type="primary"
                    icon={<SwapOutlined />}
                    loading={updating}
                    onClick={handleUpdate}
                    disabled={!newSectionId}
                  >
                    Actualizar Inscrição
                  </Button>
                </Flex>
              </Card>
            </Flex>
          )}
        </Col>
      </Row>
    </>
  );
}
