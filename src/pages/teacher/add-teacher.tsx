import { HomeOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Flex, Form, Row, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { Input } from "../../components/Input";
import { useFetch, useMutationPost } from "../../utils/fetch";
import {
  biRegex,
  departmentPositions,
  nuitRegex,
  phoneRegex,
  wageRegex,
} from "../../utils/helper";
import type { IDepartment } from "../../utils/type";

const dateFormat = "DD/MM/YYYY";

export default function AddTeacher() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { data: allDepartments } = useFetch(["departments"], "departments");
  const { mutateAsync, isPending } = useMutationPost(
    ["employees"],
    "employees",
  );

  const [selectedDepartmentName, setSelectedDepartmentName] = useState<
    string | null
  >(null);

  const departmentOptions =
    allDepartments?.departments?.map((d: IDepartment) => ({
      label: d.name,
      value: d.id,
    })) ?? [];

  const positionOptions = selectedDepartmentName
    ? (departmentPositions[selectedDepartmentName] ?? []).map((p: string) => ({
        label: p,
        value: p,
      }))
    : [];

  const handleDepartmentChange = (departmentId: string) => {
    const selected = allDepartments?.departments?.find(
      (d: IDepartment) => d.id === departmentId,
    );
    setSelectedDepartmentName(selected?.name ?? null);
    form.setFieldValue("position", undefined);
  };

  const handleAddTeacher = async (values: any) => {
    await mutateAsync({
      firstName: values.firstName,
      lastName: values.lastName,
      nuitNumber: values.nuitNumber,
      cardIdentifyNumber: values.cardIdentifyNumber,
      gender: values.gender, // "MALE" | "FEMALE" | "OTHER"
      departmentId: values.departmentId,
      position: values.position,
      specialization: values.specialization,
      academicLevel: values.academicLevel,
      wage: Number(values.wage),
      phoneNumber: values.phoneNumber,
      address: values.address,
      // dayjs → ISO string para o backend (coerce.date() aceita)
      birthday: values.birthday
        ? dayjs(values.birthday).toISOString()
        : undefined,
      email: values.email,
      year: String(new Date().getFullYear()),
      password: "Ams@12345",
      isTeacher: true,
    });

    message.success("Professor adicionado com sucesso!");
    form.resetFields();
    setSelectedDepartmentName(null);
    navigate(-1);
  };

  return (
    <>
      <CustomBreadcrumb
        title="Adicionar um Professor"
        items={[
          { title: <HomeOutlined /> },
          {
            title: "Professores",
            href: "#",
            onClick: () => navigate("/professores"),
          },
          { title: "Adicionar Professor" },
        ]}
        onPrev
      />

      <Form
        name="form_new_teacher"
        form={form}
        layout="vertical"
        onFinish={handleAddTeacher}
      >
        <Flex vertical gap="middle">
          <Card title="Informações pessoais">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Input.Text
                  label="Nome"
                  name="firstName"
                  placeholder="Nome do professor"
                  required
                />
              </Col>
              <Col xs={24} sm={12}>
                <Input.Text
                  label="Apelido"
                  name="lastName"
                  placeholder="Apelido do professor"
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
                <Form.Item
                  label="Data de nascimento"
                  name="birthday"
                  rules={[{ required: true, message: "Campo obrigatório" }]}
                >
                  <DatePicker
                    placeholder="Selecione a data"
                    format={dateFormat}
                    style={{ width: "100%" }}
                    disabledDate={(d) => d && d > dayjs().subtract(18, "year")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Input.Text
                  label="Número de telefone"
                  name="phoneNumber"
                  placeholder="845077861"
                  pattern={phoneRegex}
                  patternMessage="Número inválido — 9 dígitos (ex.: 845077861)"
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
                  label="Bilhete de Identidade (BI)"
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
                  placeholder="Endereço do professor"
                  required
                />
              </Col>
            </Row>
          </Card>

          <Card title="Departamento e Cargo">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Input.Select
                  label="Departamento"
                  name="departmentId"
                  onChange={handleDepartmentChange}
                  options={departmentOptions}
                  placeholder="Selecione o departamento"
                  required
                />
              </Col>
              <Col xs={24} sm={12}>
                <Input.Select
                  label="Cargo"
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
          </Card>

          <Card title="Informações Académicas">
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
                  label="Especialização"
                  name="specialization"
                  placeholder="Ex.: Matemática, Física..."
                />
              </Col>
              <Col xs={24} sm={12}>
                <Input.Text
                  label="Salário (MZN)"
                  name="wage"
                  pattern={wageRegex}
                  patternMessage="Salário inválido (ex.: 25000 ou 25000.00)"
                  placeholder="Ex.: 25000.00"
                  required
                />
              </Col>
            </Row>
          </Card>

          <Flex justify="flex-end" gap="small">
            <Button onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              Adicionar Professor
            </Button>
          </Flex>
        </Flex>
      </Form>
    </>
  );
}
