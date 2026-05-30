// pages/admin/Employee/index.tsx
import { HomeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Drawer,
  Form,
  Row,
  Table,
  message,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import DrawerFooter from "../../../components/DrawerFooter";
import Filters from "../../../components/Filters";
import { Input } from "../../../components/Input";
import {
  useFetch,
  useMutationDel,
  useMutationPatch,
  useMutationPost,
} from "../../../utils/fetch";
import {
  biRegex,
  departmentPositions,
  nuitRegex,
  phoneRegex,
  wageRegex,
} from "../../../utils/helper";
import type { IDepartment, IEmployee } from "../../../utils/type";
import { columns } from "./columns";

const { Panel } = Collapse;
const DATE_FORMAT = "DD/MM/YYYY";

export default function Employee() {
  // ── Estado ────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(
    null,
  );
  const [selectedDeptName, setSelectedDeptName] = useState<string | null>(null);
  const [editDeptName, setEditDeptName] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // ── Dados ─────────────────────────────────────────────────
  const { data: deptsData } = useFetch(["departments"], "departments");
  const {
    data: employeesData,
    isPending: loadingList,
    refetch,
  } = useFetch(["employees"], "employees");

  const { mutateAsync: mutateCreate, isPending: creating } = useMutationPost(
    ["employees"],
    "employees",
  );
  const { mutateAsyncPatch: mutateUpdate, isPending: updating } =
    useMutationPatch(["employees"], "employees");
  const { mutateAsyncPatch: mutateSuspend, isPending: suspending } =
    useMutationPatch(["employees"], "employees");
  const { mutateAsyncDel: mutateDelete } = useMutationDel(
    ["employees"],
    "employees",
  );

  // ── Opções de departamento ────────────────────────────────
  const deptOptions =
    deptsData?.departments?.map((d: IDepartment) => ({
      label: d.name,
      value: d.id,
    })) ?? [];

  const positionOptions = (deptName: string | null) =>
    deptName
      ? (departmentPositions[deptName] ?? []).map((p: string) => ({
          label: p,
          value: p,
        }))
      : [];

  // ── Handlers — Criar ──────────────────────────────────────
  const onOpenAdd = () => {
    addForm.resetFields();
    setSelectedDeptName(null);
    setIsTeacher(false);
    setAddOpen(true);
  };

  const onCloseAdd = () => {
    setAddOpen(false);
    addForm.resetFields();
  };

  const handleDeptChangeAdd = (id: string) => {
    const dept = deptsData?.departments?.find((d: IDepartment) => d.id === id);
    setSelectedDeptName(dept?.name ?? null);
    setIsTeacher(dept?.name?.toLowerCase().includes("professor") ?? false);
    addForm.setFieldValue("position", undefined);
  };

  const handleCreate = async (values: any) => {
    await mutateCreate({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      gender: values.gender,
      birthday: values.birthday
        ? dayjs(values.birthday).toISOString()
        : undefined,
      address: values.address,
      nuitNumber: values.nuitNumber,
      cardIdentifyNumber: values.cardIdentifyNumber,
      departmentId: values.departmentId,
      position: values.position,
      academicLevel: values.academicLevel,
      wage: Number(values.wage),
      specialization: values.specialization,
      year: String(new Date().getFullYear()),
      password: "Ams@12345",
      isTeacher,
    });

    message.success("Funcionário adicionado com sucesso!");
    refetch();
    onCloseAdd();
  };

  // ── Handlers — Editar ─────────────────────────────────────
  const onEdit = (record: IEmployee) => {
    setSelectedEmployee(record);
    setEditDeptName(record.department?.name ?? null);
    setIsTeacher(!!record.teacher);

    editForm.setFieldsValue({
      id: record.id,
      firstName: record.user?.firstName,
      lastName: record.user?.lastName,
      email: record.user?.email,
      phoneNumber: record.user?.phoneNumber,
      gender: record.user?.gender,
      birthday: record.user?.birthday ? dayjs(record.user.birthday) : undefined,
      address: record.user?.address,
      nuitNumber: record.user?.nuitNumber,
      cardIdentifyNumber: record.user?.cardIdentifyNumber,
      departmentId: record.department?.id,
      position: record.position,
      academicLevel: record.academicLevel,
      wage: record.wage ? String(record.wage) : undefined,
      specialization: (record.teacher as any)?.specialization,
    });

    setEditOpen(true);
  };

  const onCloseEdit = () => {
    setEditOpen(false);
    editForm.resetFields();
    setSelectedEmployee(null);
  };

  const handleDeptChangeEdit = (id: string) => {
    const dept = deptsData?.departments?.find((d: IDepartment) => d.id === id);
    setEditDeptName(dept?.name ?? null);
    setIsTeacher(dept?.name?.toLowerCase().includes("professor") ?? false);
    editForm.setFieldValue("position", undefined);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedEmployee) return;

    await mutateUpdate({
      id: selectedEmployee.id,
      body: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        birthday: values.birthday
          ? dayjs(values.birthday).toISOString()
          : undefined,
        address: values.address,
        nuitNumber: values.nuitNumber,
        cardIdentifyNumber: values.cardIdentifyNumber,
        departmentId: values.departmentId,
        position: values.position,
        academicLevel: values.academicLevel,
        wage: Number(values.wage),
        specialization: values.specialization,
      },
    });

    message.success("Funcionário actualizado com sucesso!");
    refetch();
    onCloseEdit();
  };

  // ── Handlers — Suspender / Eliminar ──────────────────────
  const onSuspend = async (record: IEmployee) => {
    const isSuspended = record.user?.status === "SUSPENDED";
    await mutateSuspend({
      id: record.id,
      urlParams: "suspend",
      body: {},
    });
    message.success(
      isSuspended ? "Conta reactivada." : "Funcionário suspenso.",
    );
    refetch();
  };

  const onDelete = async (record: IEmployee) => {
    await mutateDelete(record.id);
    message.success("Funcionário removido com sucesso.");
    refetch();
  };

  // ── Formulário reutilizável ───────────────────────────────
  const EmployeeForm = ({
    form,
    deptName,
    onDeptChange,
    showTeacherFields,
  }: {
    form: any;
    deptName: string | null;
    onDeptChange: (id: string) => void;
    showTeacherFields: boolean;
  }) => (
    <Form form={form} layout="vertical">
      <Input.Id name="id" />
      <Collapse defaultActiveKey={["1", "2", "3"]} ghost>
        <Panel header="Informações Pessoais" key="1">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Input.Text
                label="Nome"
                name="firstName"
                placeholder="Nome do funcionário"
                required
              />
            </Col>
            <Col xs={24} sm={12}>
              <Input.Text
                label="Apelido"
                name="lastName"
                placeholder="Apelido do funcionário"
                required
              />
            </Col>
            <Col xs={24} sm={12}>
              <Input.Text
                label="E-mail"
                name="email"
                placeholder="email@exemplo.com"
                required
              />
            </Col>
            <Col xs={24} sm={12}>
              <Input.Text
                label="Telefone"
                name="phoneNumber"
                placeholder="845077861"
                pattern={phoneRegex}
                patternMessage="9 dígitos (ex.: 845077861)"
                required
              />
            </Col>
            <Col xs={24} sm={12}>
              <Input.Select
                label="Género"
                name="gender"
                placeholder="Selecione o género"
                required
                options={[
                  { label: "Masculino", value: "MALE" },
                  { label: "Feminino", value: "FEMALE" },
                  { label: "Outro", value: "OTHER" },
                ]}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Data de Nascimento"
                name="birthday"
                rules={[{ required: true, message: "Campo obrigatório" }]}
              >
                <DatePicker
                  format={DATE_FORMAT}
                  style={{ width: "100%" }}
                  placeholder="Selecione a data"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Input.Text
                label="NUIT"
                name="nuitNumber"
                pattern={nuitRegex}
                patternMessage="NUIT inválido"
                placeholder="Ex.: 123456789"
                required
              />
            </Col>
            <Col xs={24} sm={12}>
              <Input.Text
                label="Bilhete de Identidade"
                name="cardIdentifyNumber"
                pattern={biRegex}
                patternMessage="BI inválido"
                placeholder="Ex.: 123456789A123B"
                required
              />
            </Col>
            <Col xs={24}>
              <Input.Text
                label="Endereço"
                name="address"
                placeholder="Endereço completo"
                required
              />
            </Col>
          </Row>
        </Panel>

        <Panel header="Departamento & Cargo" key="2">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Input.Select
                label="Departamento"
                name="departmentId"
                onChange={onDeptChange}
                options={deptOptions}
                placeholder="Selecione o departamento"
                required
              />
            </Col>
            <Col xs={24} sm={12}>
              <Input.Select
                label="Cargo"
                name="position"
                placeholder={
                  deptName
                    ? "Selecione o cargo"
                    : "Selecione primeiro o departamento"
                }
                options={positionOptions(deptName)}
                disabled={!deptName}
                required
              />
            </Col>
          </Row>
        </Panel>

        <Panel header="Informações Profissionais" key="3">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Input.Select
                label="Nível Académico"
                name="academicLevel"
                placeholder="Selecione o nível académico"
                options={[
                  { label: "Pós-graduação", value: "Pós-graduação" },
                  { label: "Licenciado", value: "Licenciado" },
                  { label: "Mestrado", value: "Mestrado" },
                  { label: "Doutorado", value: "Doutorado" },
                ]}
                required
              />
            </Col>
            <Col xs={24} sm={12}>
              <Input.Text
                label="Salário (MZN)"
                name="wage"
                pattern={wageRegex}
                patternMessage="Valor inválido (ex.: 25000 ou 25000.00)"
                placeholder="Ex.: 25000.00"
                required
              />
            </Col>
            {showTeacherFields && (
              <Col xs={24} sm={12}>
                <Input.Text
                  label="Especialização"
                  name="specialization"
                  placeholder="Ex.: Matemática, Física..."
                />
              </Col>
            )}
          </Row>
        </Panel>
      </Collapse>
    </Form>
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <CustomBreadcrumb
        title="Funcionários"
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Funcionários" },
        ]}
      />

      <Card
        title={<Filters onFiltersChange={() => {}} />}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={onOpenAdd}>
            Novo Funcionário
          </Button>
        }
      >
        <Table<IEmployee>
          rowKey="id"
          columns={columns({
            onEdit,
            onDelete,
            onSuspend,
            suspendLoading: suspending,
          })}
          loading={loadingList}
          dataSource={employeesData?.employees ?? []}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* ── Drawer — Adicionar ─────────────────────────────── */}
      <Drawer
        title="Adicionar Funcionário"
        open={addOpen}
        size={600}
        placement="right"
        onClose={onCloseAdd}
        footer={
          <DrawerFooter
            okText="Adicionar"
            onOk={() => addForm.validateFields().then((v) => handleCreate(v))}
            loading={creating}
            cancelText="Cancelar"
            onClose={onCloseAdd}
          />
        }
      >
        <EmployeeForm
          form={addForm}
          deptName={selectedDeptName}
          onDeptChange={handleDeptChangeAdd}
          showTeacherFields={isTeacher}
        />
      </Drawer>

      {/* ── Drawer — Editar ────────────────────────────────── */}
      <Drawer
        title={`Editar: ${selectedEmployee?.user?.firstName ?? ""} ${selectedEmployee?.user?.lastName ?? ""}`}
        open={editOpen}
        size={600}
        placement="right"
        onClose={onCloseEdit}
        footer={
          <DrawerFooter
            okText="Guardar Alterações"
            onOk={() => editForm.validateFields().then((v) => handleUpdate(v))}
            loading={updating}
            cancelText="Cancelar"
            onClose={onCloseEdit}
          />
        }
      >
        <EmployeeForm
          form={editForm}
          deptName={editDeptName}
          onDeptChange={handleDeptChangeEdit}
          showTeacherFields={isTeacher}
        />
      </Drawer>
    </>
  );
}
