// pages/admin/horario/index.tsx
import {
  CalendarOutlined,
  DeleteOutlined,
  HomeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  TimePicker,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import DrawerFooter from "../../../components/DrawerFooter";
import { Input } from "../../../components/Input";
import {
  useFetch,
  useMutationDel,
  useMutationPost
} from "../../../utils/fetch";
import type {
  IAcademicYear,
  IEmployee,
  ILevel,
  ISection,
} from "../../../utils/type";

const { Text } = Typography;

const DAYS: { key: string; label: string; short: string }[] = [
  { key: "MONDAY", label: "Segunda-feira", short: "Seg" },
  { key: "TUESDAY", label: "Terça-feira", short: "Ter" },
  { key: "WEDNESDAY", label: "Quarta-feira", short: "Qua" },
  { key: "THURSDAY", label: "Quinta-feira", short: "Qui" },
  { key: "FRIDAY", label: "Sexta-feira", short: "Sex" },
  { key: "SATURDAY", label: "Sábado", short: "Sáb" },
];

const DAY_COLOR: Record<string, string> = {
  MONDAY: "#4f3fc5",
  TUESDAY: "#0891b2",
  WEDNESDAY: "#059669",
  THURSDAY: "#d97706",
  FRIDAY: "#dc2626",
  SATURDAY: "#7c3aed",
};

export default function Horario() {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterYear, setFilterYear] = useState<string | undefined>();
  const [filterLevel, setFilterLevel] = useState<string | undefined>();
  const [filterSection, setFilterSection] = useState<string | undefined>();

  // Dados de filtro
  const { data: yearsData } = useFetch(["academics"], "academics");
  const { data: levelsData } = useFetch(["levels"], "levels");
  const { data: sectionsData } = useFetch(
    ["sections", filterLevel ?? "", filterYear ?? ""],
    `sections?levelId=${filterLevel ?? ""}&academicYearId=${filterYear ?? ""}`,
    { enabled: !!filterLevel || !!filterYear },
  );

  // Horário da turma seleccionada
  const {
    data: scheduleData,
    isPending: loadingSchedule,
    refetch,
  } = useFetch(
    ["schedules", filterSection ?? ""],
    `schedules?sectionId=${filterSection}`,
    { enabled: !!filterSection },
  );

  // Para o drawer de criar
  const { data: subjectsForSection } = useFetch(
    ["section-subjects", filterSection ?? ""],
    `sections/${filterSection}`,
    { enabled: !!filterSection },
  );

  const { data: teachersData } = useFetch(["teachers"], "teachers");

  const { mutateAsync: createSchedule, isPending: creating } = useMutationPost(
    ["schedules"],
    "schedules",
  );
  const { mutateAsyncDel: deleteSchedule } = useMutationDel(
    ["schedules"],
    "schedules",
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

  // Disciplinas disponíveis na turma (via TeacherSection)
  const subjectOptions =
    subjectsForSection?.section?.teacherSections?.map((ts: any) => ({
      label: ts.subject?.name,
      value: ts.subjectId,
      teacherId: ts.teacherId,
      raw: ts,
    })) ?? [];

  const teacherOptions =
    teachersData?.employees?.map((e: IEmployee) => ({
      label: `${e.user?.firstName} ${e.user?.lastName}`.trim(),
      value: e.teacher?.id ?? e.id,
      avatar: e.user?.avatar,
    })) ?? [];

  const grouped: Record<string, any[]> = scheduleData?.grouped ?? {};

  const handleDelete = async (id: string) => {
    await deleteSchedule(id);
    message.success("Aula removida do horário.");
    refetch();
  };

  const handleCreate = async (values: any) => {
    await createSchedule({
      sectionId: filterSection,
      subjectId: values.subjectId,
      teacherId: values.teacherId,
      dayOfWeek: values.dayOfWeek,
      startTime: values.startTime
        ? dayjs(values.startTime).format("HH:mm")
        : values.startTime,
      endTime: values.endTime
        ? dayjs(values.endTime).format("HH:mm")
        : values.endTime,
    });

    message.success("Aula adicionada ao horário.");
    refetch();
    setDrawerOpen(false);
    form.resetFields();
  };

  // Auto-preencher professor ao seleccionar disciplina
  const handleSubjectChange = (val: string) => {
    const ts = subjectOptions.find((s: any) => s.value === val);
    if (ts?.teacherId) {
      form.setFieldValue("teacherId", ts.teacherId);
    }
  };

  return (
    <>
      <CustomBreadcrumb
        title="Horário Semanal"
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Horário Semanal" },
        ]}
      />

      {/* Filtros */}
      <Card
        size="small"
        style={{ marginBottom: 16 }}
        title={
          <Space wrap>
            <Select
              placeholder="Ano lectivo"
              options={yearOptions}
              onChange={(v) => {
                setFilterYear(v);
                setFilterSection(undefined);
              }}
              allowClear
              style={{ width: 150 }}
            />
            <Select
              placeholder="Classe"
              options={levelOptions}
              onChange={(v) => {
                setFilterLevel(v);
                setFilterSection(undefined);
              }}
              allowClear
              style={{ width: 130 }}
            />
            <Select
              placeholder="Turma"
              options={sectionOptions}
              value={filterSection}
              onChange={setFilterSection}
              disabled={!filterLevel && !filterYear}
              allowClear
              style={{ width: 130 }}
            />
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={!filterSection}
            onClick={() => setDrawerOpen(true)}
          >
            Adicionar Aula
          </Button>
        }
      />

      {/* Grade semanal */}
      {!filterSection && (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Seleccione uma turma para ver o horário semanal."
          />
        </Card>
      )}

      {filterSection && (
        <Row gutter={[12, 12]}>
          {DAYS.map((day) => {
            const slots = grouped[day.key] ?? [];
            const color = DAY_COLOR[day.key];

            return (
              <Col key={day.key} xs={24} sm={12} md={8} lg={4}>
                <Card
                  size="small"
                  title={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <CalendarOutlined style={{ color }} />
                      <Text strong style={{ color, fontSize: 13 }}>
                        {day.short}
                      </Text>
                      <Tag
                        style={{
                          marginLeft: "auto",
                          background: color + "22",
                          borderColor: color + "55",
                          color,
                          fontSize: 10,
                        }}
                      >
                        {slots.length}
                      </Tag>
                    </div>
                  }
                  loading={loadingSchedule}
                  style={{ minHeight: 180 }}
                >
                  {slots.length === 0 ? (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Sem aulas
                    </Text>
                  ) : (
                    slots
                      .sort((a: any, b: any) =>
                        a.startTime.localeCompare(b.startTime),
                      )
                      .map((slot: any) => (
                        <div
                          key={slot.id}
                          style={{
                            background: "var(--color-background-secondary)",
                            border: `1px solid ${color}33`,
                            borderLeft: `3px solid ${color}`,
                            borderRadius: 6,
                            padding: "6px 8px",
                            marginBottom: 8,
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <Text strong style={{ fontSize: 12, color }}>
                              {slot.subject?.name}
                            </Text>
                            <Popconfirm
                              title="Remover esta aula?"
                              okText="Sim"
                              cancelText="Não"
                              onConfirm={() => handleDelete(slot.id)}
                            >
                              <Button
                                size="small"
                                type="text"
                                danger
                                icon={
                                  <DeleteOutlined style={{ fontSize: 10 }} />
                                }
                                style={{ padding: "0 4px", height: "auto" }}
                              />
                            </Popconfirm>
                          </div>
                          <Text
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {slot.startTime} – {slot.endTime}
                          </Text>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              marginTop: 4,
                            }}
                          >
                            <Avatar
                              size={16}
                              src={slot.teacher?.employee?.user?.avatar}
                              style={{ fontSize: 10 }}
                            >
                              {slot.teacher?.employee?.user?.firstName?.[0]}
                            </Avatar>
                            <Text
                              style={{
                                fontSize: 10,
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              {slot.teacher?.employee?.user?.firstName}{" "}
                              {slot.teacher?.employee?.user?.lastName}
                            </Text>
                          </div>
                        </div>
                      ))
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Drawer — Adicionar Aula */}
      <Drawer
        title="Adicionar Aula ao Horário"
        open={drawerOpen}
        size={420}
        placement="right"
        onClose={() => {
          setDrawerOpen(false);
          form.resetFields();
        }}
        footer={
          <DrawerFooter
            okText="Adicionar"
            onOk={() => form.validateFields().then(handleCreate)}
            loading={creating}
            cancelText="Cancelar"
            onClose={() => {
              setDrawerOpen(false);
              form.resetFields();
            }}
          />
        }
      >
        <Form form={form} layout="vertical">
          <Input.Select
            label="Dia da Semana"
            name="dayOfWeek"
            required
            options={DAYS.map((d) => ({ label: d.label, value: d.key }))}
            placeholder="Seleccione o dia"
          />
          <Form.Item
            label="Hora de Início"
            name="startTime"
            rules={[{ required: true }]}
          >
            <TimePicker
              format="HH:mm"
              minuteStep={15}
              style={{ width: "100%" }}
              placeholder="08:00"
            />
          </Form.Item>
          <Form.Item
            label="Hora de Fim"
            name="endTime"
            rules={[{ required: true }]}
          >
            <TimePicker
              format="HH:mm"
              minuteStep={15}
              style={{ width: "100%" }}
              placeholder="09:30"
            />
          </Form.Item>
          <Input.Select
            label="Disciplina"
            name="subjectId"
            required
            options={subjectOptions}
            onChange={handleSubjectChange}
            placeholder={
              subjectOptions.length
                ? "Seleccione a disciplina"
                : "Nenhuma disciplina atribuída a esta turma"
            }
            disabled={!subjectOptions.length}
          />
          <Input.Select
            label="Professor"
            name="teacherId"
            required
            options={teacherOptions}
            placeholder="Seleccione o professor"
          />
        </Form>
      </Drawer>
    </>
  );
}
