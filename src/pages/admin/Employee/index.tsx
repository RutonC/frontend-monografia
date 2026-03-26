import { HomeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Form,
  Modal,
  Row,
  Table,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { Input } from "../../../components/Input";
import {
  useFetch,
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
const dateFormat = "YYYY/MM/DD";

function Employee() {
  const { data: allDepartments } = useFetch(["departments"], "departments");
  const { mutateAsync, isPending } = useMutationPost(["employee"], "employee");
  const { mutateAsyncPatch, isPending: isPendingUpdate } = useMutationPatch(
    ["employee"],
    "employee",
  );
  const {
    data: allEmployee,
    refetch,
    isPending: loadingEmployee,
  } = useFetch(["employee"], "employee");

  const [open, setOpen] = useState(false);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<
    string | null
  >(null);
  const [modalOkText, setModalOkText] = useState("Adicionar novo Funcionário");
  const [modalTitle, setModalTitle] = useState("Adicionar Funcionário");
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [form] = Form.useForm();

  const departmentOptions =
    allDepartments?.departments?.map((d: IDepartment) => ({
      label: d.name,
      value: d.id, // ← id real para enviar ao backend
    })) ?? [];

  const positionOptions = selectedDepartmentName
    ? (departmentPositions[selectedDepartmentName] ?? []).map((p) => ({
        label: p,
        value: p,
      }))
    : [];

  const onShowModal = () => {
    setModalOkText("Adicionar novo Funcionário");
    setModalTitle("Adicionar Funcionário");
    setOpen(true);
  };

  const handleDepartmentChange = (departmentId: any) => {
    const selected = allDepartments?.departments?.find(
      (d: IDepartment) => d.id === departmentId,
    );
    setSelectedDepartmentName(selected?.name ?? null);
    form.setFieldValue("position", undefined);
  };

  const handleAddNewEmployee = async (values: any) => {
    const {
      firstName,
      lastName,
      nuitNumber,
      departmentId,
      cardIdentifyNumber,
      gender,
      academicLevel,
      wage,
      phoneNumber,
      address,
      birthday,
      email,
      position,
      specialization,
    } = values;
    let isTeacher = false;

    if (selectedDepartmentName === "Professor") {
      isTeacher = true;
    }
    mutateAsync({
      firstName,
      lastName,
      nuitNumber,
      cardIdentifyNumber,
      gender,
      departmentId,
      position,
      specialization,
      academicLevel,
      wage: Number(wage),
      phoneNumber,
      address,
      birthday,
      email,
      year: "2026",
      password: "ams.12345",
      isTeacher,
    }).then(() => {
      form.resetFields();
      setSelectedDepartmentName("");
      refetch();
      setOpen(false);
    });
  };

  const handleEditEmployee = async (values: any) => {
    const {
      firstName,
      lastName,
      nuitNumber,
      cardIdentifyNumber,
      gender,
      departmentId,
      position,
      specialization,
      academicLevel,
      wage,
      phoneNumber,
      address,
      birthday,
      email,
    } = values;

    await mutateAsyncPatch({
      id: values.id,
      body: {
        firstName,
        lastName,
        nuitNumber,
        cardIdentifyNumber,
        gender,
        departmentId,
        position,
        specialization,
        academicLevel,
        wage: Number(wage),
        phoneNumber,
        address,
        birthday,
        email,
      },
    }).then(() => {
      form.resetFields();
      setSelectedDepartmentName("");
      refetch();
      setOpen(false);
    });
  };

  const onEdit = (values: any) => {
    const { academicLevel, wage, position, user, teacher, specialization } =
      values;
    console.log("Dados do funcionário: ", values);
    setModalOkText("Editando Funcionário");
    setModalTitle("Actualizar Dados Funcionário");
    setOpen(true);

    if (teacher) {
      setIsTeacher(true);
    } else {
      setIsTeacher(false);
    }

    form.setFieldsValue({
      id: values.id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      nuitNumber: user?.nuitNumber,
      cardIdentifyNumber: user?.cardIdentifyNumber,
      gender: {
        value: values?.user?.gender,
        label: values?.user?.gender === "M" ? "Masculino" : "Feminino",
      },
      departmentId: {
        value: values?.department?.id,
        label: values?.department?.name,
      },
      position: { value: "", label: position },
      specialization,
      academicLevel: { value: "", label: academicLevel },
      wage,
      phoneNumber: user?.phoneNumber,
      address: user?.address,
      birthday: dayjs(user?.birthday),
      email: user?.email,
    });
  };

  const onDelete = () => {};

  return (
    <>
      <CustomBreadcrumb
        items={[
          {
            href: "/",
            title: <HomeOutlined />,
          },
          { title: "Funcionários" },
        ]}
        title="Funcionários"
      />
      <Card
        title="Funcionários"
        extra={
          <Button onClick={onShowModal}>
            <PlusOutlined />
          </Button>
        }
      >
        <Table<IEmployee>
          columns={columns({ onEdit, onDelete })}
          loading={loadingEmployee}
          dataSource={allEmployee?.employees || []}
        />
        <Modal
          open={open}
          cancelText="Cancelar"
          onCancel={() => {
            setOpen(false);
            form.resetFields();
            setSelectedDepartmentName("");
          }}
          okButtonProps={{
            loading: isPending || isPendingUpdate,
          }}
          okText={modalOkText}
          title={modalTitle}
          width={"60%"}
          onOk={() =>
            form.validateFields().then((values) => {
              if (values.id) {
                handleEditEmployee(values);
              } else {
                handleAddNewEmployee(values);
              }
            })
          }
        >
          <Form name="form_new_teacher" form={form} layout="vertical" lang="pt">
            <Input.Id name="id" />
            <Collapse defaultActiveKey={["1", "2"]}>
              <Panel header="Informações pessoais" key="1">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Input.Text
                      label="Nome do Funcionário"
                      name="firstName"
                      placeholder="Insira o nome do funcionário"
                      required
                    />
                  </Col>
                  <Col span={12}>
                    <Input.Text
                      label="Apelido"
                      name="lastName"
                      placeholder="Insira o apelido do funcionário"
                      required
                    />
                  </Col>
                  <Col span={12}>
                    <Input.Text
                      label="E-mail"
                      name="email"
                      placeholder="Insira o e-mail do funcionário"
                      required
                    />
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Data de nascimento"
                      name="birthday"
                      rules={[
                        {
                          required: true,
                          message:
                            "É de caracter obrigatório preencher o campo",
                        },
                      ]}
                    >
                      <DatePicker
                        defaultValue={dayjs("2015/01/01", dateFormat)}
                        maxDate={dayjs("2024/01/01")}
                        format={dateFormat}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Input.Text
                      label="Número de telefone"
                      name="phoneNumber"
                      placeholder="Insira o número de telefone do funcionário"
                      pattern={phoneRegex}
                      patternMessage="Número de telefone inválido, deve ter 9 dígitos (ex.:845077861)"
                      message="É de caracter obrigatório preencher esse campo"
                      required
                    />
                  </Col>
                  <Col span={12}>
                    <Input.Select
                      label="Genêro"
                      name="gender"
                      placeholder="Insira o genêro do funcionário"
                      message="É de caracter obrigatório preencher esse campo"
                      required
                      options={[
                        { label: "Masculino", value: "M" },
                        { label: "Feminino", value: "F" },
                      ]}
                    />
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Input.Text
                      label="NUIT"
                      name="nuitNumber"
                      pattern={nuitRegex}
                      patternMessage="NUIT inválido, tente novamente."
                      placeholder="Insira o número do nuit do funcionário"
                      message="É de caracter obrigatório preencher esse campo"
                      required
                    />
                  </Col>
                  <Col span={12}>
                    <Input.Text
                      label="Nr. Bilhete de Identidade (BI)"
                      name="cardIdentifyNumber"
                      pattern={biRegex}
                      patternMessage="BI inválido, tente novamente"
                      placeholder="Insira o número de BI do funcionário"
                      message="É de caracter obrigatório preencher esse campo"
                      required
                    />
                  </Col>
                </Row>
              </Panel>
              <Panel header="Departamento & Função" key="2">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Input.Select
                      label="Departamento"
                      name="departmentId"
                      onChange={handleDepartmentChange}
                      options={departmentOptions}
                      placeholder="Selecione a função do funcionario"
                    />
                  </Col>
                  <Col span={12}>
                    <Input.Select
                      label="Função do funcionário"
                      name="position"
                      placeholder={
                        selectedDepartmentName
                          ? "Selecione o cargo"
                          : "Selecione primeiro o departamento"
                      }
                      options={positionOptions}
                      disabled={!selectedDepartmentName}
                      required
                    />
                  </Col>
                </Row>
              </Panel>
              <Panel header="Outras informações" key="3">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Input.Select
                      label="Nível Académico"
                      name="academicLevel"
                      placeholder="Selecione o nível académico do funcionário"
                      options={[
                        {
                          label: "Pós-graduação",
                          value: "Pós-graduação",
                        },
                        { label: "Licenciado", value: "Licenciado" },
                        { label: "Mestrado", value: "Mestrado" },
                        { label: "Doutorado", value: "Doutorado" },
                      ]}
                      required
                    />
                  </Col>
                  <Col span={12}>
                    <Input.Text
                      label="Salário"
                      name="wage"
                      pattern={wageRegex}
                      patternMessage="Salário inválido, o salário deve ser inteiro ou decimal (ex.: 2000, 2000.00)"
                      placeholder="Insira o salário do funcionário"
                      required
                    />
                  </Col>
                  {isTeacher && (
                    <>
                      <Col span={12}>
                        <Input.Text
                          label="Experiênca"
                          name="expiriences"
                          placeholder="Insira o experiênca do funcionário"
                          required
                        />
                      </Col>
                      <Col span={12}>
                        <Input.Text
                          label="Especialização"
                          name="specialization"
                          placeholder="Insira a especialização do funcionário"
                          message="É de caracter obrigatório preencher o campo"
                          required
                        />
                      </Col>
                    </>
                  )}
                  <Col span={24}>
                    <Input.Text
                      label="Endereço"
                      name="address"
                      placeholder="Insira o endereço do funcionário"
                      message="É de caracter obrigatório preencher o campo"
                      required
                    />
                  </Col>
                </Row>
              </Panel>
            </Collapse>
          </Form>
        </Modal>
      </Card>
    </>
  );
}

export default Employee;
