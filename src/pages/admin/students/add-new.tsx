import { HomeOutlined } from "@ant-design/icons";
import { Button, Card, Col, Flex, Form, Row } from "antd";
import { Content } from "antd/es/layout/layout";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { Input } from "../../../components/Input";
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
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useMutationPost(["students"], "students");
  const [districts, setDistricts] = useState<readonly DistrictName[]>(
    mozambiqueData[provinceNameData[0]],
  );
  const [secondCity, setSecondCity] = useState<DistrictName>(
    mozambiqueData[provinceNameData[0]][0],
  );

  const handleProvinceChange = (value: ProvinceName) => {
    setDistricts(mozambiqueData[value]);
    setSecondCity(mozambiqueData[value][0]);
  };

  const onSecondCityChange = (value: DistrictName) => {
    setSecondCity(value);
  };

  const handleAddNewStudent = async (values: any) => {
    console.log({ values });
    const {
      firstName,
      lastName,
      gender,
      cardIdentifyNumber,
      birthday,
      naturalness,
      districtOfBirth,
      provinceOfBirth,
      placeOfIssue,
      validateDate,
      fatherName,
      fatherContact,
      fatherEmail,
      fatherProfission,
      fatherWorkplace,
      motherAddress,
      motherContact,
      motherEmail,
      motherName,
      motherProfission,
      motherWorkplace,
      guardianAddress,
      guardianContact,
      guardianEmail,
      guardianName,
      guardianRelation,
      fatherAddress,
    } = values;

    const ano = dayjs().format("YYYY");

    await mutateAsync({
      firstName,
      lastName,
      gender,
      cardIdentifyNumber,
      birthday,
      naturalness,
      districtOfBirth,
      provinceOfBirth,
      placeOfIssue,
      validateDate,
      fatherName,
      fatherContact,
      fatherEmail,
      fatherProfission,
      fatherWorkplace,
      motherAddress,
      motherContact,
      motherEmail,
      motherName,
      motherProfission,
      motherWorkplace,
      guardianAddress,
      guardianContact,
      guardianEmail,
      guardianName,
      guardianRelation,
      year: ano,
      fatherAddress,
    }).then(() => {
      form.resetFields();
    });
  };

  return (
    <>
      <CustomBreadcrumb
        title="Adicionar Novo Aluno"
        items={[
          {
            href: "/",
            title: <HomeOutlined />,
          },
          { title: "Alunos" },
          { title: "Adicionar Novo Aluno" },
        ]}
      />
      <Content>
        <Form name="add-new-student" layout="vertical" form={form}>
          <Flex vertical gap="small">
            <Card title="Informações pessoais">
              <Row gutter={[16, 16]}>
                <Col md={12}>
                  <Input.Text label="Nome do Aluno" name="firstName" required />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Apelido do Aluno"
                    name="lastName"
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Select
                    label="Gênero"
                    placeholder="Selecione o gênero"
                    name="gender"
                    options={[
                      { value: "M", label: "Masculino" },
                      { value: "F", label: "Feminio" },
                    ]}
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.DataPicker
                    label="Data de Nascimento"
                    name="birthday"
                    required
                    placeholder="Selecione a data de nascimento"
                  />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Nr. Bilhete de Identidade (BI)"
                    pattern={biRegex}
                    name="cardIdentifyNumber"
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Local da Emissão do BI"
                    name="placeOfIssue"
                    patternMessage="BI inválido, tente novamente."
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.DataPicker
                    label="Válidade do BI"
                    name="validateDate"
                    required
                    placeholder="Selecione a data de validade do BI"
                  />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Nacionalidade"
                    name="naturalness"
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Select
                    label="Provincia de Nascimento"
                    defaultValue={provinceNameData[0]}
                    name="provinceOfBirth"
                    onChange={handleProvinceChange}
                    options={provinceNameData.map((province) => ({
                      label: province,
                      value: province,
                    }))}
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Select
                    label="Districto de Nascimento"
                    name="districtOfBirth"
                    value={secondCity}
                    onChange={onSecondCityChange}
                    options={districts.map((district) => ({
                      label: district,
                      value: district,
                    }))}
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Número de Telefone"
                    name="phoneNumber"
                    pattern={phoneRegex}
                    patternMessage="Número de telefone, Inválido"
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Text
                    type="email"
                    label="E-mail"
                    name="email"
                    required
                  />
                </Col>
              </Row>
            </Card>
            <Card title="Pais e Encarregado de Educação">
              <Row gutter={[16, 16]}>
                <Col md={12}>
                  <Input.Text label="Nome do Pai" name="fatherName" required />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Número de Telefone do Pai"
                    name="fatherContact"
                    pattern={phoneRegex}
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Ocupação do Pai"
                    name="fatherProfission"
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Residência do Pai"
                    name="fatherAddress"
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Text label="Nome do Mãe" name="motherName" required />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Número de Telefone do Mãe"
                    name="motherContact"
                    pattern={phoneRegex}
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Ocupação do Mãe"
                    name="motherProfission"
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Residência do Mãe"
                    name="motherAddress"
                    required
                  />
                </Col>

                <Col md={24}>
                  <Input.Select
                    label="Relação com o Encarregado"
                    placeholder="Selecione a Relação que têm com seu Encarregado"
                    name="guardianRelation"
                    options={[
                      { label: "Pai", value: "Pai" },
                      { label: "Mãe", value: "Mãe" },
                      { label: "Outro", value: "Outro" },
                    ]}
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Nome do Encarregado"
                    name="guardianName"
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Número de Telefone do Encarregado"
                    name="guardianContact"
                    pattern={phoneRegex}
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Text
                    type="email"
                    label="E-mail do Encarregado"
                    name="guardianEmail"
                    required
                  />
                </Col>
                <Col md={12}>
                  <Input.Text
                    label="Residência do Encarregado"
                    name="guardianAddress"
                    required
                  />
                </Col>
              </Row>
            </Card>
            <Flex gap="middle">
              <Button
                variant="outlined"
                color="red"
                block
                onClick={() => {
                  navigate(-1);
                  form.resetFields();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                block
                onClick={() =>
                  form.validateFields().then((values) => {
                    handleAddNewStudent(values);
                  })
                }
                loading={isPending}
              >
                Adicionar Novo Aluno
              </Button>
            </Flex>
          </Flex>
        </Form>
      </Content>
    </>
  );
}
