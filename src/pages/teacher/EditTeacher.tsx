import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { Input } from "@/components/Input";
import { useFetch, useMutationPatch } from "@/utils/fetch";
import {
  biRegex,
  departmentPositions,
  nuitRegex,
  phoneRegex,
  wageRegex,
} from "@/utils/helper";
import type { IDepartment } from "@/utils/type";
import { HomeOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Row,
  Spin,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const dateFormat = "DD/MM/YYYY";

export default function EditTeacher() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: teacherData, isPending: loadingTeacher } = useFetch(
    ["teacher", id!],
    `teachers/${id}`,
    { enabled: !!id },
  );

  const { data: allDepartments } = useFetch(["departments"], "departments");
  const { mutateAsyncPatch, isPending } = useMutationPatch(
    ["employees"],
    "employees",
  );

  const [selectedDepartmentName, setSelectedDepartmentName] = useState<
    string | null
  >(null);

  const teacher = teacherData?.employee;

  // Preencher o formulário quando os dados chegam
  useEffect(() => {
    if (!teacher) return;

    const user = teacher.user ?? teacher;
    const emp = teacher.employee ?? teacher;

    setSelectedDepartmentName(emp?.department?.name ?? null);

    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      gender: user.gender,
      nuitNumber: user.nuitNumber,
      cardIdentifyNumber: user.cardIdentifyNumber,
      birthday: user.birthday ? dayjs(user.birthday) : undefined,
      departmentId: emp?.department?.id,
      position: emp?.position,
      academicLevel: emp?.academicLevel,
      specialization: emp?.teacher?.specialization,
      wage: emp?.wage ? String(emp.wage) : undefined,
    });
  }, [teacher, form]);

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

  const handleEdit = async (values: any) => {
    await mutateAsyncPatch({
      id: id!,
      body: {
        firstName: values.firstName,
        lastName: values.lastName,
        nuitNumber: values.nuitNumber,
        cardIdentifyNumber: values.cardIdentifyNumber,
        gender: values.gender,
        departmentId: values.departmentId,
        position: values.position,
        specialization: values.specialization,
        academicLevel: values.academicLevel,
        wage: Number(values.wage),
        phoneNumber: values.phoneNumber,
        address: values.address,
        birthday: values.birthday
          ? dayjs(values.birthday).toISOString()
          : undefined,
        email: values.email,
      },
    });

    message.success("Professor actualizado com sucesso!");
    navigate(-1);
  };

  if (loadingTeacher) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 400 }}>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <>
      <CustomBreadcrumb
        title="Editar Professor"
        items={[
          { title: <HomeOutlined /> },
          {
            title: "Professores",
            href: "#",
            onClick: () => navigate("/professores"),
          },
          { title: "Editar Professor" },
        ]}
        onPrev
      />

      <Form
        name="form_edit_teacher"
        form={form}
        layout="vertical"
        onFinish={handleEdit}
      >
        <Flex vertical gap="middle">
          <Card title="Informações pessoais">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Input.Text label="Nome" name="firstName" required />
              </Col>
              <Col xs={24} sm={12}>
                <Input.Text label="Apelido" name="lastName" required />
              </Col>
              <Col xs={24} sm={12}>
                <Input.Text label="E-mail" name="email" required />
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Data de nascimento" name="birthday">
                  <DatePicker format={dateFormat} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Input.Text
                  label="Telefone"
                  name="phoneNumber"
                  pattern={phoneRegex}
                  patternMessage="Número inválido"
                  required
                />
              </Col>
              <Col xs={24} sm={12}>
                <Input.Select
                  label="Género"
                  name="gender"
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
                />
              </Col>
              <Col xs={24} sm={12}>
                <Input.Text
                  label="Bilhete de Identidade"
                  name="cardIdentifyNumber"
                  pattern={biRegex}
                  patternMessage="BI inválido"
                />
              </Col>
              <Col xs={24}>
                <Input.Text label="Endereço" name="address" required />
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
                  required
                />
              </Col>
              <Col xs={24} sm={12}>
                <Input.Select
                  label="Cargo"
                  name="position"
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
                <Input.Text label="Especialização" name="specialization" />
              </Col>
              <Col xs={24} sm={12}>
                <Input.Text
                  label="Salário (MZN)"
                  name="wage"
                  pattern={wageRegex}
                  patternMessage="Salário inválido"
                  required
                />
              </Col>
            </Row>
          </Card>

          <Flex justify="flex-end" gap="small">
            <Button onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              Guardar Alterações
            </Button>
          </Flex>
        </Flex>
      </Form>
    </>
  );
}
