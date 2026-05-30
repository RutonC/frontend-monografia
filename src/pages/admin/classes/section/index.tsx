import DrawerFooter from "@/components/DrawerFooter";
import Filters from "@/components/Filters";
import { Input } from "@/components/Input";
import {
  useFetch,
  useMutationDel,
  useMutationPatch,
  useMutationPost,
} from "@/utils/fetch";
import type { IAcademicYear, IEmployee, ILevel, ISection } from "@/utils/type";
import {
  DeleteOutlined,
  PlusOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Form,
  List,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import { columns } from "./columns";

export default function Section() {
  // ── Estado CRUD ───────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("Adicionar Nova Turma");
  const [drawerBtnTitle, setDrawerBtnTitle] = useState("Adicionar");
  const [form] = Form.useForm();

  // ── Estado do painel de detalhes ──────────────────────────
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSection, setDetailSection] = useState<any>(null);

  // ── Estado do modal de atribuir professor ─────────────────
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSubjectId, setAssignSubjectId] = useState<string | null>(null);
  const [assignForm] = Form.useForm();

  // ── Dados ─────────────────────────────────────────────────
  const { data, refetch } = useFetch(["sections"], "sections");
  const { data: levelsData } = useFetch(["levels"], "levels");
  const { data: academicYearsData } = useFetch(["academics"], "academics");
  const { data: teachersData } = useFetch(["teachers"], "teachers");

  // Detalhes completos da secção seleccionada
  const { data: sectionDetail, refetch: refetchDetail } = useFetch(
    ["section", detailSection?.id ?? ""],
    `sections/${detailSection?.id}`,
    { enabled: !!detailSection?.id },
  );

  const { mutateAsync, isPending } = useMutationPost(["sections"], "sections");
  const { mutateAsyncPatch, isPending: isPendingUpdate } = useMutationPatch(
    ["sections"],
    "sections",
  );
  const { mutateAsync: mutateAssignTeacher, isPending: assigningTeacher } =
    useMutationPost(["teacher-sections"], "teacher-sections");
  const { mutateAsyncDel: mutateRemoveTeacher } = useMutationDel(
    ["teacher-sections"],
    "teacher-sections",
  );

  // ── Opções ────────────────────────────────────────────────
  const levelOptions =
    levelsData?.levels?.map((l: ILevel) => ({
      label: l.name,
      value: l.id,
    })) ?? [];

  const academicYearOptions =
    academicYearsData?.academicYear?.map((y: IAcademicYear) => ({
      label: y.year,
      value: y.id,
    })) ?? [];

  const teacherOptions =
    teachersData?.employees?.map((e: IEmployee) => ({
      label: `${e.user?.firstName ?? ""} ${e.user?.lastName ?? ""}`.trim(),
      value: e.teacher?.id ?? e.id,
      specialization: (e.teacher as any)?.specialization,
      avatar: e.user?.avatar,
    })) ?? [];

  // Disciplinas da classe da secção (via SubjectOnLevel)
  const sectionSubjects: any[] =
    sectionDetail?.section?.level?.subjects ??
    sectionDetail?.section?.subjects ??
    [];

  // Professor já atribuído a cada disciplina nesta turma
  const teacherSections: any[] = sectionDetail?.section?.teacherSections ?? [];

  const getTeacherForSubject = (subjectId: string) =>
    teacherSections.find((ts: any) => ts.subjectId === subjectId);

  // ── Handlers — CRUD ───────────────────────────────────────
  const onShow = () => {
    form.resetFields();
    setDrawerTitle("Adicionar Nova Turma");
    setDrawerBtnTitle("Adicionar");
    const activeYear = academicYearsData?.academicYear?.find(
      (y: IAcademicYear) => y.active,
    );
    if (activeYear) form.setFieldValue("academicYearId", activeYear.id);
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const onEdit = (record: ISection) => {
    setDrawerTitle(`Editar Turma: ${record.name}`);
    setDrawerBtnTitle("Actualizar");
    form.setFieldsValue({
      id: record.id,
      name: record.name,
      capacity: record.capacity,
      levelId: (record as any).levelId,
      academicYearId: (record as any).academicYearId,
      status: record.status,
    });
    setOpen(true);
  };

  const onEnable = (record: ISection) => {
    mutateAsyncPatch({
      id: record.id,
      body: { status: !record.status },
    }).then((res) => {
      message.success(res?.message ?? "Estado actualizado.");
      refetch();
    });
  };

  const onSubmit = async (values: any) => {
    const payload = {
      name: values.name,
      levelId: values.levelId,
      academicYearId: values.academicYearId,
      capacity: Number(values.capacity),
      status: values.status ?? true,
    };
    if (values.id) {
      await mutateAsyncPatch({ id: values.id, body: payload });
      message.success("Turma actualizada com sucesso!");
    } else {
      await mutateAsync(payload);
      message.success("Turma criada com sucesso!");
    }
    refetch();
    onClose();
  };

  // ── Handlers — Detalhes / Atribuir professor ──────────────
  const onViewDetail = (record: ISection) => {
    setDetailSection(record);
    setDetailOpen(true);
  };

  const onOpenAssignTeacher = (subjectId: string) => {
    setAssignSubjectId(subjectId);
    assignForm.resetFields();

    // Pré-seleccionar professor já atribuído
    const existing = getTeacherForSubject(subjectId);
    if (existing) assignForm.setFieldValue("teacherId", existing.teacherId);

    setAssignOpen(true);
  };

  const handleAssignTeacher = async () => {
    const values = await assignForm.validateFields();
    await mutateAssignTeacher({
      teacherId: values.teacherId,
      sectionId: detailSection.id,
      subjectId: assignSubjectId,
    });
    message.success("Professor atribuído com sucesso!");
    refetchDetail();
    setAssignOpen(false);
  };

  const handleRemoveTeacher = async (teacherId: string, subjectId: string) => {
    await mutateRemoveTeacher(
      JSON.stringify({ teacherId, sectionId: detailSection.id, subjectId }),
    );
    message.success("Atribuição removida.");
    refetchDetail();
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <Card
        title={<Filters onFiltersChange={() => {}} />}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={onShow}>
              Nova Turma
            </Button>
          </Space>
        }
      >
        <Table<ISection>
          rowKey="id"
          columns={columns({
            onEdit,
            onEnable,
            onViewDetail,
            enableLoading: isPendingUpdate,
          })}
          dataSource={data?.sections ?? []}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* ── Drawer — Criar / Editar turma ─────────────────── */}
      <Drawer
        title={drawerTitle}
        open={open}
        size={478}
        placement="right"
        onClose={onClose}
        footer={
          <DrawerFooter
            okText={drawerBtnTitle}
            onOk={() => form.validateFields().then(onSubmit)}
            loading={isPending || isPendingUpdate}
            cancelText="Cancelar"
            onClose={onClose}
          />
        }
      >
        <Form form={form} name="section-form" layout="vertical">
          <Input.Id name="id" />
          <Input.Text
            label="Nome da Turma"
            required
            name="name"
            placeholder="Ex.: 10.ª A"
          />
          <Input.Select
            label="Ano Lectivo"
            required
            name="academicYearId"
            placeholder="Selecione o ano lectivo"
            options={academicYearOptions}
          />
          <Input.Select
            label="Classe"
            required
            name="levelId"
            placeholder="Selecione a classe"
            options={levelOptions}
          />
          <Input.Text
            label="Capacidade"
            required
            name="capacity"
            placeholder="Ex.: 35"
            pattern={/^\d+$/}
            patternMessage="Apenas números inteiros"
          />
          <Input.Select
            label="Estado"
            name="status"
            placeholder="Selecione o estado"
            options={[
              { label: "Activo", value: true },
              { label: "Desactivo", value: false },
            ]}
          />
        </Form>
      </Drawer>

      {/* ── Drawer — Detalhes da turma ────────────────────── */}
      <Drawer
        title={
          <div>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {detailSection?.name}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {(detailSection as any)?.level?.name} ·{" "}
              {(detailSection as any)?.academicYear?.year}
            </Typography.Text>
          </div>
        }
        open={detailOpen}
        width={560}
        placement="right"
        onClose={() => setDetailOpen(false)}
        footer={null}
      >
        {/* Resumo */}
        <Descriptions size="small" column={2} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Capacidade">
            {detailSection?.capacity}
          </Descriptions.Item>
          <Descriptions.Item label="Alunos">
            {sectionDetail?.section?._count?.enrollments ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag color={detailSection?.status ? "green" : "red"}>
              {detailSection?.status ? "Activo" : "Desactivado"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="vertical">Disciplinas e Professores</Divider>

        {sectionSubjects.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nenhuma disciplina associada a esta classe. Associe disciplinas primeiro em Disciplinas."
          />
        ) : (
          <List
            dataSource={sectionSubjects}
            renderItem={(item: any) => {
              const subjectId = item.subjectId ?? item.subject?.id ?? item.id;
              const subjectName = item.subject?.name ?? item.name ?? "—";
              const assigned = getTeacherForSubject(subjectId);
              const teacher = assigned?.teacher?.employee?.user;

              return (
                <List.Item
                  style={{
                    background: "#fafafa",
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 8,
                  }}
                  actions={[
                    <Button
                      key="assign"
                      size="small"
                      type={assigned ? "default" : "primary"}
                      icon={<UserAddOutlined />}
                      onClick={() => onOpenAssignTeacher(subjectId)}
                    >
                      {assigned ? "Trocar" : "Atribuir"}
                    </Button>,
                    assigned && (
                      <Popconfirm
                        key="remove"
                        title="Remover atribuição?"
                        okText="Sim"
                        cancelText="Não"
                        onConfirm={() =>
                          handleRemoveTeacher(assigned.teacherId, subjectId)
                        }
                      >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    ),
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar size="small" style={{ background: "#4f3fc5" }}>
                        {subjectName[0]}
                      </Avatar>
                    }
                    title={<strong>{subjectName}</strong>}
                    description={
                      assigned && teacher ? (
                        <span style={{ fontSize: 12 }}>
                          👨‍🏫{" "}
                          {`${teacher.firstName ?? ""} ${teacher.lastName ?? ""}`.trim()}
                        </span>
                      ) : (
                        <Tag color="warning" style={{ fontSize: 11 }}>
                          Sem professor
                        </Tag>
                      )
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Drawer>

      {/* ── Modal — Atribuir professor a disciplina ────────── */}
      <Modal
        title="Atribuir Professor"
        open={assignOpen}
        onCancel={() => setAssignOpen(false)}
        onOk={handleAssignTeacher}
        okText="Atribuir"
        cancelText="Cancelar"
        confirmLoading={assigningTeacher}
      >
        <Form form={assignForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Professor"
            name="teacherId"
            rules={[{ required: true, message: "Selecione um professor" }]}
          >
            <Select
              placeholder="Selecione o professor"
              style={{ width: "100%" }}
              showSearch
              filterOption={(input, opt) =>
                String(opt?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              optionRender={(opt) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar size="small" src={opt.data.avatar}>
                    {(opt.data.label as string)?.[0]}
                  </Avatar>
                  <div>
                    <div>{opt.data.label}</div>
                    {opt.data.specialization && (
                      <div style={{ fontSize: 11, color: "#8c8c8c" }}>
                        {opt.data.specialization}
                      </div>
                    )}
                  </div>
                </div>
              )}
              options={teacherOptions}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
