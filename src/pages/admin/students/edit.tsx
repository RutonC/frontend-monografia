// pages/admin/students/edit.tsx
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
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { Input } from "../../../components/Input";
import { useFetch, useMutationPatch } from "../../../utils/fetch";
import {
  biRegex,
  mozambiqueData,
  phoneRegex,
  provinceNameData,
  type DistrictName,
  type ProvinceName,
} from "../../../utils/helper";

const DATE_FORMAT = "DD/MM/YYYY";

export default function EditStudent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [districts, setDistricts] = useState<readonly DistrictName[]>(
    mozambiqueData[provinceNameData[0]],
  );

  // Carregar dados do aluno
  const { data: studentData, isPending: loading } = useFetch(
    ["student", id!],
    `students/${id}`,
    { enabled: !!id },
  );

  const { mutateAsyncPatch, isPending: saving } = useMutationPatch(
    ["students"],
    "students",
  );

  const student = studentData?.student;

  // Preencher formulário quando os dados chegam
  useEffect(() => {
    if (!student) return;

    const u = student.user ?? student;
    const s = student.student ?? student;

    // Actualizar distritos se tiver província guardada
    if (s.provinceOfBirth) {
      setDistricts(
        mozambiqueData[s.provinceOfBirth as ProvinceName] ??
          mozambiqueData[provinceNameData[0]],
      );
    }

    form.setFieldsValue({
      // Dados do User
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phoneNumber: u.phoneNumber,
      address: u.address,
      gender: u.gender,
      birthday: u.birthday ? dayjs(u.birthday) : undefined,
      cardIdentifyNumber: u.cardIdentifyNumber,

      // Dados do Student
      naturalness: s.naturalness,
      provinceOfBirth: s.provinceOfBirth,
      districtOfBirth: s.districtOfBirth,
      personWithDisability: s.personWithDisability,
      placeOfIssue: s.placeOfIssue,
      validateDate: s.validateDate ? dayjs(s.validateDate) : undefined,
      previousSchool: s.previousSchool,
      previousClass: s.previousClass,
      previousSchoolYear: s.previousSchoolYear,
    });
  }, [student, form]);

  const handleSave = async (values: any) => {
    await mutateAsyncPatch({
      id: id!,
      body: {
        // User
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address,
        gender: values.gender,
        birthday: values.birthday
          ? dayjs(values.birthday).toISOString()
          : undefined,
        cardIdentifyNumber: values.cardIdentifyNumber,
        // Student
        naturalness: values.naturalness,
        provinceOfBirth: values.provinceOfBirth,
        districtOfBirth: values.districtOfBirth,
        personWithDisability: values.personWithDisability,
        placeOfIssue: values.placeOfIssue,
        validateDate: values.validateDate
          ? dayjs(values.validateDate).toISOString()
          : undefined,
        previousSchool: values.previousSchool,
        previousClass: values.previousClass,
        previousSchoolYear: values.previousSchoolYear,
      },
    });

    message.success("Dados do aluno actualizados com sucesso!");
    navigate(-1);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 400 }}>
        <Spin size="large" />
      </Flex>
    );
  }

  const fullName = student
    ? `${student.user?.firstName ?? ""} ${student.user?.lastName ?? ""}`.trim()
    : "Aluno";

  return (
    <>
      <CustomBreadcrumb
        title="Editar Aluno"
        items={[
          { href: "/", title: <HomeOutlined /> },
          {
            title: "Alunos",
            href: "#",
            onClick: () => navigate("/alunos"),
          },
          { title: fullName },
        ]}
        onPrev
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        name="edit-student"
      >
        <Flex vertical gap="middle">
          {/* ── Dados Pessoais ─────────────────────────────── */}
          <Card title="Informações Pessoais">
            <Row gutter={[16, 16]}>
              <Col md={12} xs={24}>
                <Input.Text label="Nome" name="firstName" required />
              </Col>
              <Col md={12} xs={24}>
                <Input.Text label="Apelido" name="lastName" required />
              </Col>
              <Col md={12} xs={24}>
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
              <Col md={12} xs={24}>
                <Form.Item label="Data de Nascimento" name="birthday">
                  <DatePicker
                    format={DATE_FORMAT}
                    style={{ width: "100%" }}
                    placeholder="Selecione a data"
                  />
                </Form.Item>
              </Col>
              <Col md={12} xs={24}>
                <Input.Text
                  label="Bilhete de Identidade"
                  name="cardIdentifyNumber"
                  pattern={biRegex}
                  patternMessage="BI inválido (12 dígitos + 1 letra)"
                  required
                />
              </Col>
              <Col md={12} xs={24}>
                <Input.Text
                  label="Local de Emissão do BI"
                  name="placeOfIssue"
                  placeholder="Ex.: Beira"
                />
              </Col>
              <Col md={12} xs={24}>
                <Form.Item label="Validade do BI" name="validateDate">
                  <DatePicker
                    format={DATE_FORMAT}
                    style={{ width: "100%" }}
                    placeholder="Selecione a data de validade"
                  />
                </Form.Item>
              </Col>
              <Col md={12} xs={24}>
                <Input.Text
                  label="Telefone"
                  name="phoneNumber"
                  pattern={phoneRegex}
                  patternMessage="Número inválido"
                  placeholder="Ex.: 845077861"
                />
              </Col>
              <Col md={12} xs={24}>
                <Input.Text
                  type="email"
                  label="E-mail"
                  name="email"
                  placeholder="email@exemplo.com"
                />
              </Col>
              <Col md={24} xs={24}>
                <Input.Text
                  label="Endereço"
                  name="address"
                  placeholder="Endereço completo"
                />
              </Col>
            </Row>
          </Card>

          {/* ── Naturalidade ───────────────────────────────── */}
          <Card title="Naturalidade">
            <Row gutter={[16, 16]}>
              <Col md={12} xs={24}>
                <Input.Text
                  label="Nacionalidade"
                  name="naturalness"
                  placeholder="Ex.: Moçambicana"
                />
              </Col>
              <Col md={12} xs={24}>
                <Input.Select
                  label="Província de Nascimento"
                  name="provinceOfBirth"
                  onChange={(v: ProvinceName) => {
                    setDistricts(
                      mozambiqueData[v] ?? mozambiqueData[provinceNameData[0]],
                    );
                    form.setFieldValue("districtOfBirth", undefined);
                  }}
                  options={provinceNameData.map((p) => ({
                    label: p,
                    value: p,
                  }))}
                />
              </Col>
              <Col md={12} xs={24}>
                <Input.Select
                  label="Distrito de Nascimento"
                  name="districtOfBirth"
                  options={districts.map((d) => ({ label: d, value: d }))}
                />
              </Col>
              <Col md={12} xs={24}>
                <Input.Text
                  label="Necessidades Especiais"
                  name="personWithDisability"
                  placeholder="Ex.: Não, Deficiência visual..."
                />
              </Col>
            </Row>
          </Card>

          {/* ── Histórico Escolar ──────────────────────────── */}
          <Card title="Histórico Escolar Anterior">
            <Row gutter={[16, 16]}>
              <Col md={12} xs={24}>
                <Input.Text
                  label="Escola Anterior"
                  name="previousSchool"
                  placeholder="Nome da escola anterior"
                />
              </Col>
              <Col md={12} xs={24}>
                <Input.Text
                  label="Classe Anterior"
                  name="previousClass"
                  placeholder="Ex.: 9.ª Classe"
                />
              </Col>
              <Col md={12} xs={24}>
                <Input.Text
                  label="Ano Lectivo Anterior"
                  name="previousSchoolYear"
                  placeholder="Ex.: 2025"
                />
              </Col>
            </Row>
          </Card>

          {/* ── Botões ─────────────────────────────────────── */}
          <Flex justify="flex-end" gap="small">
            <Button onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Guardar Alterações
            </Button>
          </Flex>
        </Flex>
      </Form>
    </>
  );
}
