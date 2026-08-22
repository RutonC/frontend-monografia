// pages/admin/students/add-new.tsx
import { HomeOutlined } from "@ant-design/icons";
import { Button, Card, Col, Flex, Form, Row, message } from "antd";
import { Content } from "antd/es/layout/layout";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { Input } from "../../../components/Input";
import { useAuthStore } from "../../../store/authStore";
import { useMutationPost } from "../../../utils/fetch";
import {
  biRegex,
  mozambiqueData,
  phoneRegex,
  provinceNameData,
  type DistrictName,
  type ProvinceName,
} from "../../../utils/helper";

export default function AddNewStudent() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSecretary = user?.type === "SECRETARY";
  const base = isSecretary ? "/secretary/alunos" : "/alunos";
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useMutationPost(["students"], "students");

  const [districts, setDistricts] = useState<readonly DistrictName[]>(
    mozambiqueData[provinceNameData[0]],
  );

  const handleProvinceChange = (value: ProvinceName) => {
    setDistricts(mozambiqueData[value] ?? mozambiqueData[provinceNameData[0]]);
    form.setFieldValue("districtOfBirth", undefined);
  };

  const handleAddNewStudent = async (values: any) => {
    // O backend novo espera guardian como sub-objecto
    // e não os campos soltos fatherName, motherName, etc.
    await mutateAsync({
      firstName: values.firstName,
      lastName: values.lastName,
      gender: values.gender, // "MALE" | "FEMALE" | "OTHER"
      cardIdentifyNumber: values.cardIdentifyNumber,
      birthday: values.birthday
        ? dayjs(values.birthday).toISOString()
        : undefined,
      email: values.email,
      phoneNumber: values.phoneNumber,
      address: values.address,
      naturalness: values.naturalness,
      provinceOfBirth: values.provinceOfBirth,
      districtOfBirth: values.districtOfBirth,
      personWithDisability: values.personWithDisability ?? "Não",
      placeOfIssue: values.placeOfIssue,
      validateDate: values.validateDate
        ? dayjs(values.validateDate).toISOString()
        : undefined,
      previousSchool: values.previousSchool,
      previousClass: values.previousClass,
      previousSchoolYear: values.previousSchoolYear,
      // encarregado como sub-objecto (novo schema)
      guardian: {
        firstName: values.guardianFirstName,
        lastName: values.guardianLastName,
        relation: values.guardianRelation,
        phoneNumber: values.guardianContact,
        email: values.guardianEmail,
        address: values.guardianAddress,
      },
      year: dayjs().format("YYYY"),
    });

    message.success("Aluno adicionado com sucesso!");
    form.resetFields();
    navigate(-1);
  };

  return (
    <>
      <CustomBreadcrumb
        title="Adicionar Novo Aluno"
        items={[
          { href: isSecretary ? "/secretary" : "/", title: <HomeOutlined /> },
          {
            title: "Alunos",
            href: "#",
            onClick: () => navigate(base),
          },
          { title: "Adicionar Novo Aluno" },
        ]}
        onPrev
      />
      <Content>
        <Form
          name="add-new-student"
          layout="vertical"
          form={form}
          onFinish={handleAddNewStudent}
        >
          <Flex vertical gap="middle">
            {/* ── Dados Pessoais ─────────────────────────── */}
            <Card title="Informações Pessoais">
              <Row gutter={[16, 16]}>
                <Col md={12} xs={24}>
                  <Input.Text
                    label="Nome do Aluno"
                    name="firstName"
                    placeholder="Nome"
                    required
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.Text
                    label="Apelido do Aluno"
                    name="lastName"
                    placeholder="Apelido"
                    required
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.Select
                    label="Género"
                    placeholder="Selecione o género"
                    name="gender"
                    options={[
                      { value: "MALE", label: "Masculino" },
                      { value: "FEMALE", label: "Feminino" },
                      { value: "OTHER", label: "Outro" },
                    ]}
                    required
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.DataPicker
                    label="Data de Nascimento"
                    name="birthday"
                    required
                    placeholder="Selecione a data"
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.Text
                    label="Nr. Bilhete de Identidade (BI)"
                    pattern={biRegex}
                    patternMessage="BI inválido"
                    name="cardIdentifyNumber"
                    placeholder="Ex.: 123456789A123B"
                    required
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.Text
                    label="Local de Emissão do BI"
                    name="placeOfIssue"
                    placeholder="Ex.: Beira"
                    required
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.DataPicker
                    label="Validade do BI"
                    name="validateDate"
                    required
                    placeholder="Selecione a data de validade"
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.Text
                    label="Nacionalidade"
                    name="naturalness"
                    placeholder="Ex.: Moçambicana"
                    required
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.Select
                    label="Província de Nascimento"
                    name="provinceOfBirth"
                    onChange={handleProvinceChange}
                    options={provinceNameData.map((p) => ({
                      label: p,
                      value: p,
                    }))}
                    required
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.Select
                    label="Distrito de Nascimento"
                    name="districtOfBirth"
                    options={districts.map((d) => ({ label: d, value: d }))}
                    required
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.Text
                    label="Número de Telefone"
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
                <Col md={12} xs={24}>
                  <Input.Text
                    label="Necessidades Especiais"
                    name="personWithDisability"
                    placeholder="Ex.: Não, Deficiência visual..."
                  />
                </Col>
              </Row>
            </Card>

            {/* ── Histórico Escolar ──────────────────────── */}
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

            {/* ── Encarregado de Educação ────────────────── */}
            <Card title="Encarregado de Educação">
              <Row gutter={[16, 16]}>
                <Col md={24} xs={24}>
                  <Input.Select
                    label="Relação com o Aluno"
                    placeholder="Selecione a relação"
                    name="guardianRelation"
                    options={[
                      { label: "Pai", value: "Pai" },
                      { label: "Mãe", value: "Mãe" },
                      { label: "Tio/Tia", value: "Tio/Tia" },
                      { label: "Avô/Avó", value: "Avô/Avó" },
                      { label: "Outro", value: "Outro" },
                    ]}
                    required
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.Text
                    label="Nome do Encarregado"
                    name="guardianFirstName"
                    placeholder="Nome"
                    required
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.Text
                    label="Apelido do Encarregado"
                    name="guardianLastName"
                    placeholder="Apelido"
                    required
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.Text
                    label="Telefone do Encarregado"
                    name="guardianContact"
                    pattern={phoneRegex}
                    patternMessage="Número inválido"
                    placeholder="Ex.: 845077861"
                    required
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Input.Text
                    type="email"
                    label="E-mail do Encarregado"
                    name="guardianEmail"
                    placeholder="email@exemplo.com"
                  />
                </Col>
                <Col md={24} xs={24}>
                  <Input.Text
                    label="Residência do Encarregado"
                    name="guardianAddress"
                    placeholder="Endereço completo"
                  />
                </Col>
              </Row>
            </Card>

            {/* ── Botões ─────────────────────────────────── */}
            <Flex gap="middle" justify="flex-end">
              <Button
                onClick={() => {
                  navigate(-1);
                  form.resetFields();
                }}
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={isPending}>
                Adicionar Aluno
              </Button>
            </Flex>
          </Flex>
        </Form>
      </Content>
    </>
  );
}
