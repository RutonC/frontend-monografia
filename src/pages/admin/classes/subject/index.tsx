// pages/admin/disciplinas/index.tsx
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import DrawerFooter from "@/components/DrawerFooter";
import Filters from "@/components/Filters";
import { Input } from "@/components/Input";
import {
  useFetch,
  useMutationDel,
  useMutationPatch,
  useMutationPost,
} from "@/utils/fetch";
import type { IEmployee, ILevel, ISubject } from "@/utils/type";
import {
  CheckCircleOutlined,
  HomeOutlined,
  PlusOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Divider,
  Drawer,
  Empty,
  Form,
  Select,
  Steps,
  Table,
  Tag,
  Typography,
  message
} from "antd";
import { useState } from "react";
import { columns } from "./columns";

const { Text } = Typography;

export default function Disciplinas() {
  // ── Estado CRUD ───────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("Adicionar Disciplina");
  const [drawerBtnTitle, setDrawerBtnTitle] = useState("Adicionar");
  const [form] = Form.useForm();

  // ── Estado do drawer de atribuição ────────────────────────────
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignStep, setAssignStep] = useState<0 | 1>(0);
  const [selectedSubject, setSelectedSubject] = useState<ISubject | null>(null);

  // Passo 0: classes escolhidas e respectivos créditos
  const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>([]);
  const [credits, setCredits] = useState<Record<string, number | null>>({});

  // Passo 1: professor escolhido por turma { sectionId → teacherId }
  const [sectionTeachers, setSectionTeachers] = useState<
    Record<string, string>
  >({});

  // ── Dados fixos (sempre carregados) ───────────────────────────
  const { data, refetch } = useFetch(["subjects"], "subjects");
  const { data: levelsData } = useFetch(["levels"], "levels");
  const { data: teachersData } = useFetch(["teachers"], "teachers");

  // Turmas: UMA query que busca todas as secções de uma vez.
  // Passamos os levelIds como query string — o backend já suporta &levelId=
  // Aqui usamos a rota GET /sections sem filtro e filtramos no frontend,
  // porque sections já são poucas e já vêm com level incluído.
  // Só activamos no passo 1 quando há classes seleccionadas.
  const { data: sectionsData, isPending: loadingSections } = useFetch(
    ["sections-all"],
    "sections",
    { enabled: assignStep === 1 && selectedLevelIds.length > 0 },
  );

  // Mutations
  const { mutateAsync: mutateCreate, isPending: creating } = useMutationPost(
    ["subjects"],
    "subjects",
  );
  const { mutateAsyncPatch: mutateUpdate, isPending: updating } =
    useMutationPatch(["subjects"], "subjects");
  const { mutateAsyncDel: mutateDelete } = useMutationDel(
    ["subjects"],
    "subjects",
  );
  const { mutateAsync: mutateAssignLevel, isPending: assigningLevel } =
    useMutationPost(["subjects"], "level-subject");
  const { mutateAsync: mutateAssignTeacher, isPending: assigningTeacher } =
    useMutationPost(["teacher-sections"], "teacher-sections");

  // ── Opções derivadas (sem hooks) ──────────────────────────────
  const allLevels: ILevel[] = levelsData?.levels ?? [];
  const allSections: any[] = sectionsData?.sections ?? [];

  // Classes que esta disciplina já tem
  const alreadyAssociatedLevelIds = new Set<string>(
    (selectedSubject as any)?.levels?.map((l: any) => l.levelId) ?? [],
  );

  const levelOptions = allLevels.map((l) => ({
    label: alreadyAssociatedLevelIds.has(l.id) ? `${l.name} ✓` : l.name,
    value: l.id,
    disabled: alreadyAssociatedLevelIds.has(l.id),
  }));

  const teacherOptions = (teachersData?.employees ?? []).map(
    (e: IEmployee) => ({
      label: `${e.user?.firstName ?? ""} ${e.user?.lastName ?? ""}`.trim(),
      value: e.teacher?.id ?? e.id,
      specialization: (e.teacher as any)?.specialization,
      avatar: e.user?.avatar,
    }),
  );

  // Turmas agrupadas por classe (calculado a partir de allSections)
  // Só mostramos as turmas das classes que o utilizador seleccionou
  const sectionsByLevel: Record<string, any[]> = {};
  for (const levelId of selectedLevelIds) {
    sectionsByLevel[levelId] = allSections.filter(
      (s) => s.levelId === levelId || s.level?.id === levelId,
    );
  }

  // ── Handlers CRUD ─────────────────────────────────────────────
  const onShow = () => {
    form.resetFields();
    setDrawerTitle("Adicionar Disciplina");
    setDrawerBtnTitle("Adicionar");
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const onEdit = (record: ISubject) => {
    setDrawerTitle(`Editar: ${record.name}`);
    setDrawerBtnTitle("Actualizar");
    form.setFieldsValue({
      id: record.id,
      name: record.name,
      code: record.code,
      description: record.description,
    });
    setOpen(true);
  };

  const onDelete = async (record: ISubject) => {
    await mutateDelete(record.id);
    message.success("Disciplina removida.");
    refetch();
  };

  const onSubmit = async (values: any) => {
    if (values.id) {
      await mutateUpdate({
        id: values.id,
        body: {
          name: values.name,
          code: values.code,
          description: values.description,
        },
      });
      message.success("Disciplina actualizada!");
    } else {
      await mutateCreate({
        name: values.name,
        code: values.code,
        description: values.description ?? "",
      });
      message.success("Disciplina criada!");
    }
    refetch();
    onClose();
  };

  // ── Handlers atribuição ───────────────────────────────────────
  const onAssign = (record: ISubject) => {
    setSelectedSubject(record);
    setAssignStep(0);
    setSelectedLevelIds([]);
    setCredits({});
    setSectionTeachers({});
    setAssignOpen(true);
  };

  const onCloseAssign = () => {
    setAssignOpen(false);
    setSelectedSubject(null);
    setSelectedLevelIds([]);
    setCredits({});
    setSectionTeachers({});
    setAssignStep(0);
  };

  // Passo 0 → 1: associar disciplina às classes novas e avançar
  const handleGoToStep1 = async () => {
    if (!selectedLevelIds.length) {
      message.warning("Seleccione pelo menos uma classe.");
      return;
    }

    const newLevelIds = selectedLevelIds.filter(
      (id) => !alreadyAssociatedLevelIds.has(id),
    );

    for (const levelId of newLevelIds) {
      await mutateAssignLevel({
        levelId,
        subjectIds: [selectedSubject!.id],
        credits: credits[levelId] ?? undefined,
      });
    }

    if (newLevelIds.length) {
      message.success(
        `"${selectedSubject?.name}" associada a ${newLevelIds.length} classe${newLevelIds.length > 1 ? "s" : ""}.`,
      );
      refetch();
    }

    setAssignStep(1);
  };

  // Guardar professor por turma
  const handleSaveTeachers = async () => {
    const entries = Object.entries(sectionTeachers).filter(([, v]) => !!v);
    if (!entries.length) {
      message.warning("Atribua pelo menos um professor a uma turma.");
      return;
    }

    let ok = 0,
      duplicados = 0;
    for (const [sectionId, teacherId] of entries) {
      try {
        await mutateAssignTeacher({
          teacherId,
          sectionId,
          subjectId: selectedSubject!.id,
        });
        ok++;
      } catch {
        duplicados++;
      }
    }

    if (ok)
      message.success(
        `${ok} atribuição${ok > 1 ? "ões" : ""} guardada${ok > 1 ? "s" : ""}!`,
      );
    if (duplicados)
      message.warning(
        `${duplicados} já existia${duplicados > 1 ? "m" : ""} e foi${duplicados > 1 ? "ram" : ""} ignorada${duplicados > 1 ? "s" : ""}.`,
      );

    onCloseAssign();
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <CustomBreadcrumb
        title="Disciplinas"
        items={[
          { title: <HomeOutlined />, href: "/" },
          { title: "Disciplinas" },
        ]}
      />

      <Card
        title={<Filters onFiltersChange={() => {}} />}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={onShow}>
            Nova Disciplina
          </Button>
        }
      >
        <Table<ISubject>
          rowKey="id"
          columns={columns({ onEdit, onAssign, onDelete })}
          dataSource={data?.subjects ?? []}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* ── Drawer CRUD ─────────────────────────────────────── */}
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
            loading={creating || updating}
            cancelText="Cancelar"
            onClose={onClose}
          />
        }
      >
        <Form form={form} name="subject-form" layout="vertical">
          <Input.Id name="id" />
          <Input.Text
            label="Nome da Disciplina"
            required
            name="name"
            placeholder="Ex.: Matemática"
          />
          <Input.Text
            label="Código (opcional)"
            name="code"
            placeholder="Ex.: MAT-01"
          />
          <Input.Text
            label="Descrição"
            name="description"
            placeholder="Descrição opcional"
          />
        </Form>
      </Drawer>

      {/* ── Drawer Atribuição ────────────────────────────────── */}
      <Drawer
        title={
          <div>
            <Text strong style={{ fontSize: 15 }}>
              Atribuir: {selectedSubject?.name}
            </Text>
            <div style={{ marginTop: 14 }}>
              <Steps
                size="small"
                current={assignStep}
                items={[
                  { title: "Classes", description: "Escolher classes" },
                  { title: "Professores", description: "Um por turma" },
                ]}
              />
            </div>
          </div>
        }
        open={assignOpen}
        width={580}
        placement="right"
        onClose={onCloseAssign}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={onCloseAssign}>Cancelar</Button>

            {assignStep === 0 ? (
              <Button
                type="primary"
                loading={assigningLevel}
                onClick={handleGoToStep1}
                disabled={!selectedLevelIds.length}
              >
                Próximo — Atribuir Professores
              </Button>
            ) : (
              <>
                <Button onClick={() => setAssignStep(0)}>Voltar</Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={assigningTeacher}
                  onClick={handleSaveTeachers}
                  disabled={!Object.keys(sectionTeachers).length}
                >
                  Guardar Atribuições
                </Button>
              </>
            )}
          </div>
        }
      >
        {/* ── Passo 0: escolher classes ─────────────────────── */}
        {assignStep === 0 && (
          <div>
            <Alert
              type="info"
              showIcon
              message="Seleccione as classes onde esta disciplina será leccionada. Pode escolher várias ao mesmo tempo."
              style={{ marginBottom: 20 }}
            />

            {/* Classes já associadas */}
            {alreadyAssociatedLevelIds.size > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Já associada a:
                </Text>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                    marginTop: 4,
                  }}
                >
                  {(selectedSubject as any)?.levels?.map((l: any) => (
                    <Tag key={l.levelId} color="blue">
                      {l.level?.name ?? l.levelId}
                    </Tag>
                  ))}
                </div>
                <Divider style={{ margin: "12px 0" }} />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <Text
                style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
              >
                Classes a associar
              </Text>
              <Select
                mode="multiple"
                placeholder="Seleccione as classes"
                options={levelOptions}
                value={selectedLevelIds}
                onChange={(ids: string[]) => {
                  setSelectedLevelIds(ids);
                  // Limpa créditos de classes que foram removidas
                  setCredits((prev) => {
                    const next: Record<string, number | null> = {};
                    for (const id of ids) next[id] = prev[id] ?? null;
                    return next;
                  });
                }}
                style={{ width: "100%", marginTop: 4 }}
                allowClear
              />
            </div>

            {/* Créditos por classe */}
            {selectedLevelIds.length > 0 && (
              <>
                <Divider style={{ margin: "16px 0" }} />
                <Text
                  strong
                  style={{ fontSize: 13, display: "block", marginBottom: 12 }}
                >
                  Horas / semana por classe (opcional)
                </Text>
                {selectedLevelIds.map((levelId) => {
                  const level = allLevels.find((l) => l.id === levelId);
                  const isNew = !alreadyAssociatedLevelIds.has(levelId);
                  return (
                    <div
                      key={levelId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <Tag
                        color={isNew ? "blue" : "default"}
                        style={{ minWidth: 90, textAlign: "center" }}
                      >
                        {level?.name ?? levelId}
                      </Tag>
                      <Select
                        placeholder="Horas/sem"
                        style={{ width: 160 }}
                        value={credits[levelId] ?? undefined}
                        onChange={(v) =>
                          setCredits((prev) => ({
                            ...prev,
                            [levelId]: v ?? null,
                          }))
                        }
                        options={[1, 2, 3, 4, 5, 6].map((n) => ({
                          label: `${n}h/semana`,
                          value: n,
                        }))}
                        allowClear
                      />
                      {!isNew && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          (já associada)
                        </Text>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── Passo 1: professor por turma ──────────────────── */}
        {assignStep === 1 && (
          <div>
            <Alert
              type="info"
              showIcon
              message={
                <span>
                  Cada turma pode ter um professor diferente para{" "}
                  <strong>{selectedSubject?.name}</strong>.
                </span>
              }
              style={{ marginBottom: 20 }}
            />

            {selectedLevelIds.length === 0 && (
              <Empty description="Nenhuma classe seleccionada." />
            )}

            {selectedLevelIds.map((levelId) => {
              const level = allLevels.find((l) => l.id === levelId);
              const sections = sectionsByLevel[levelId] ?? [];

              return (
                <div key={levelId} style={{ marginBottom: 28 }}>
                  {/* Cabeçalho da classe */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                      paddingBottom: 6,
                      borderBottom: "1px solid var(--color-border-tertiary)",
                    }}
                  >
                    <Tag
                      color="blue"
                      style={{ fontSize: 13, padding: "2px 10px" }}
                    >
                      {level?.name ?? levelId}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {loadingSections
                        ? "A carregar turmas..."
                        : `${sections.length} turma${sections.length !== 1 ? "s" : ""}`}
                    </Text>
                    {credits[levelId] && (
                      <Tag
                        color="purple"
                        style={{ marginLeft: "auto", fontSize: 11 }}
                      >
                        {credits[levelId]}h/semana
                      </Tag>
                    )}
                  </div>

                  {!loadingSections && sections.length === 0 && (
                    <Alert
                      type="warning"
                      showIcon
                      message={`A classe ${level?.name ?? ""} ainda não tem turmas. Crie as turmas em Turmas & Classes.`}
                      style={{ marginBottom: 8 }}
                    />
                  )}

                  {sections.map((section: any) => {
                    const assignedTeacherId = sectionTeachers[section.id];
                    const assignedTeacher = teacherOptions.find(
                      (t: any) => t.value === assignedTeacherId,
                    );

                    return (
                      <div
                        key={section.id}
                        style={{
                          background: "var(--color-background-secondary)",
                          borderRadius: 8,
                          padding: "10px 12px",
                          marginBottom: 8,
                          border: assignedTeacherId
                            ? "1px solid #059669"
                            : "1px solid var(--color-border-tertiary)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <UserAddOutlined
                            style={{
                              color: assignedTeacherId ? "#059669" : "#8c8c8c",
                            }}
                          />
                          <Text strong style={{ fontSize: 13 }}>
                            Turma {section.name}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {section.academicYear?.year ?? ""}
                          </Text>
                          {assignedTeacher && (
                            <Tag
                              color="success"
                              icon={<CheckCircleOutlined />}
                              style={{ marginLeft: "auto", fontSize: 11 }}
                            >
                              {assignedTeacher.label}
                            </Tag>
                          )}
                        </div>

                        {/* Select do professor — inline, sem hook dentro do map */}
                        <Select
                          placeholder="Seleccionar professor"
                          style={{ width: "100%" }}
                          value={sectionTeachers[section.id] ?? undefined}
                          onChange={(v) =>
                            setSectionTeachers((prev) => ({
                              ...prev,
                              [section.id]: v,
                            }))
                          }
                          optionRender={(opt) => (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Avatar size="small" src={opt.data.avatar}>
                                {(opt.data.label as string)?.[0]}
                              </Avatar>
                              <div>
                                <div style={{ fontSize: 13 }}>
                                  {opt.data.label}
                                </div>
                                {opt.data.specialization && (
                                  <div
                                    style={{ fontSize: 11, color: "#8c8c8c" }}
                                  >
                                    {opt.data.specialization}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          options={teacherOptions}
                          showSearch
                          filterOption={(input, opt) =>
                            String(opt?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          allowClear
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </Drawer>
    </>
  );
}
