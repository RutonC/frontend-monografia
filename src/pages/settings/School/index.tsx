// configuracoes/escola/index.tsx
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { Input } from "@/components/Input";
import PageLoader from "@/components/PageLoader";
import axiosInstance from "@/utils/axiosInstance";
import { resolveAssetUrl } from "@/utils/constants";
import { useFetch } from "@/utils/fetch";
import { HomeOutlined, MailOutlined, UploadOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input as AntInput,
  InputNumber,
  Modal,
  Row,
  Select,
  Switch,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

export default function EscolaSettings() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isPending } = useFetch(["settings"], "settings");
  const settings = data?.settings;

  const { data: adminsData } = useFetch(["users", "ADMIN"], "users?type=ADMIN");
  const { data: superadminsData } = useFetch(
    ["users", "SUPERADMIN"],
    "users?type=SUPERADMIN",
  );
  const adminOptions = [
    ...(adminsData?.users ?? []),
    ...(superadminsData?.users ?? []),
  ].map((u: any) => ({
    label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.identifier,
    value: u.id,
  }));

  useEffect(() => {
    if (!settings) return;
    form.setFieldsValue({
      schoolName: settings.schoolName,
      schoolAddress: settings.schoolAddress,
      schoolPhone: settings.schoolPhone,
      schoolEmail: settings.schoolEmail,
      currency: settings.currency,
      schoolLogo: settings.schoolLogo,
      paymentEntityCode: settings.paymentEntityCode,
      defaultGracePeriodDays: settings.defaultGracePeriodDays,
      defaultLateFeeWeek1Percent: settings.defaultLateFeeWeek1Percent
        ? Number(settings.defaultLateFeeWeek1Percent) * 100
        : undefined,
      defaultLateFeeWeek2Percent: settings.defaultLateFeeWeek2Percent
        ? Number(settings.defaultLateFeeWeek2Percent) * 100
        : undefined,
      defaultLateFeeWeek3PlusPercent: settings.defaultLateFeeWeek3PlusPercent
        ? Number(settings.defaultLateFeeWeek3PlusPercent) * 100
        : undefined,
      passingGrade: settings.passingGrade ? Number(settings.passingGrade) : undefined,
      maxGrade: settings.maxGrade ? Number(settings.maxGrade) : undefined,
      smtpHost: settings.smtpHost,
      smtpPort: settings.smtpPort,
      smtpSecurity: settings.smtpSecurity ?? "NONE",
      smtpAuthType: settings.smtpAuthType,
      smtpUsername: settings.smtpUsername,
      noReplyAddress: settings.noReplyAddress,
      allowedEmailDomains: settings.allowedEmailDomains ?? [],
      blockedEmailDomains: settings.blockedEmailDomains ?? [],
      maintenanceMode: settings.maintenanceMode ?? false,
      maintenanceMessage: settings.maintenanceMessage,
      notifyLoginFailuresTo: settings.notifyLoginFailuresTo ?? [],
      allowedIps: settings.allowedIps ?? [],
      blockedIps: settings.blockedIps ?? [],
      allowIpListFirst: settings.allowIpListFirst ?? false,
    });
  }, [settings, form]);

  const { mutateAsync: save, isPending: saving } = useMutation({
    mutationFn: async (body: any) => {
      const res = await axiosInstance.patch("/settings", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const { mutateAsync: uploadLogo, isPending: uploadingLogo } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "logos");
      const res = await axiosInstance.post("/assets/upload", formData);
      return res.data.url as string;
    },
  });

  const handleLogoUpload = async ({ file }: { file: File }) => {
    try {
      const url = await uploadLogo(file);
      form.setFieldValue("schoolLogo", url);
      message.success("Logótipo enviado. Guarde para aplicar.");
    } catch {
      message.error("Não foi possível enviar o logótipo.");
    }
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      schoolName: values.schoolName,
      schoolAddress: values.schoolAddress,
      schoolPhone: values.schoolPhone,
      schoolEmail: values.schoolEmail,
      currency: values.currency,
      schoolLogo: values.schoolLogo,
      paymentEntityCode: values.paymentEntityCode,
      defaultGracePeriodDays: values.defaultGracePeriodDays,
      defaultLateFeeWeek1Percent:
        values.defaultLateFeeWeek1Percent != null
          ? values.defaultLateFeeWeek1Percent / 100
          : undefined,
      defaultLateFeeWeek2Percent:
        values.defaultLateFeeWeek2Percent != null
          ? values.defaultLateFeeWeek2Percent / 100
          : undefined,
      defaultLateFeeWeek3PlusPercent:
        values.defaultLateFeeWeek3PlusPercent != null
          ? values.defaultLateFeeWeek3PlusPercent / 100
          : undefined,
      passingGrade: values.passingGrade,
      maxGrade: values.maxGrade,
      smtpHost: values.smtpHost,
      smtpPort: values.smtpPort,
      smtpSecurity: values.smtpSecurity,
      smtpAuthType: values.smtpAuthType,
      smtpUsername: values.smtpUsername,
      // campo separado — ausente aqui nunca apaga a password já guardada
      // (ver "Alterar palavra-passe SMTP" mais abaixo).
      noReplyAddress: values.noReplyAddress,
      allowedEmailDomains: values.allowedEmailDomains,
      blockedEmailDomains: values.blockedEmailDomains,
      maintenanceMode: values.maintenanceMode,
      maintenanceMessage: values.maintenanceMessage,
      notifyLoginFailuresTo: values.notifyLoginFailuresTo,
      allowedIps: values.allowedIps,
      blockedIps: values.blockedIps,
      allowIpListFirst: values.allowIpListFirst,
    };

    await save(payload);
    message.success("Definições da escola actualizadas com sucesso.");
  };

  const logoUrl = Form.useWatch("schoolLogo", form);

  // ── Password SMTP — campo separado do form principal para nunca a
  // enviar sem intenção explícita (o form principal nunca a inclui).
  const [smtpPasswordDraft, setSmtpPasswordDraft] = useState("");
  const { mutateAsync: saveSmtpPassword, isPending: savingPassword } = useMutation({
    mutationFn: async (smtpPassword: string) => {
      const res = await axiosInstance.patch("/settings", { smtpPassword });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const handleSaveSmtpPassword = async () => {
    await saveSmtpPassword(smtpPasswordDraft);
    message.success(
      smtpPasswordDraft
        ? "Password SMTP actualizada."
        : "Password SMTP removida.",
    );
    setSmtpPasswordDraft("");
  };

  // ── Testar configuração de e-mail ──────────────────────────────
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testAddress, setTestAddress] = useState("");
  const { mutateAsync: testEmail, isPending: testingEmail } = useMutation({
    mutationFn: async (to: string) => {
      const res = await axiosInstance.post("/settings/email/test", { to });
      return res.data;
    },
  });

  const handleTestEmail = async () => {
    try {
      await testEmail(testAddress);
      message.success("E-mail de teste enviado com sucesso.");
      setTestModalOpen(false);
      setTestAddress("");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Não foi possível enviar o e-mail de teste.",
      );
    }
  };

  return (
    <>
      <CustomBreadcrumb
        title="Escola"
        items={[
          { title: <HomeOutlined />, href: "/" },
          {
            title: "Configurações",
            href: "#",
            onClick: () => navigate("/configuracoes"),
          },
          { title: "Escola" },
        ]}
      />

      {isPending ? (
        <PageLoader />
      ) : (
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ currency: "MZN" }}
          >
            <Text strong style={{ fontSize: 15, display: "block", marginBottom: 16 }}>
              Identidade da escola
            </Text>
            <Row gutter={16}>
              <Col span={4}>
                <Form.Item label="Logótipo">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Avatar shape="square" size={80} src={resolveAssetUrl(logoUrl)}>
                      {!logoUrl && "Logo"}
                    </Avatar>
                    <Upload
                      showUploadList={false}
                      customRequest={({ file }) =>
                        handleLogoUpload({ file: file as File })
                      }
                    >
                      <Button
                        size="small"
                        icon={<UploadOutlined />}
                        loading={uploadingLogo}
                      >
                        Enviar
                      </Button>
                    </Upload>
                  </div>
                </Form.Item>
              </Col>
              <Col span={20}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Input.Text
                      label="Nome da escola"
                      name="schoolName"
                      placeholder="Ex.: Escola Comunitária da AMS"
                    />
                  </Col>
                  <Col span={12}>
                    <Input.Text
                      label="Moeda"
                      name="currency"
                      placeholder="Ex.: MZN"
                    />
                  </Col>
                  <Col span={12}>
                    <Input.Text
                      label="Contacto (telefone)"
                      name="schoolPhone"
                      placeholder="Ex.: +258 84 000 0000"
                    />
                  </Col>
                  <Col span={12}>
                    <Input.Text
                      label="Contacto (email)"
                      name="schoolEmail"
                      placeholder="Ex.: geral@escola.co.mz"
                    />
                  </Col>
                  <Col span={24}>
                    <Input.Text
                      label="Morada"
                      name="schoolAddress"
                      placeholder="Ex.: Beira, Sofala, Moçambique"
                    />
                  </Col>
                </Row>
              </Col>
            </Row>

            <Divider />

            <Text strong style={{ fontSize: 15, display: "block", marginBottom: 16 }}>
              Pagamentos
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <Input.Text
                  label="Entidade de pagamento"
                  name="paymentEntityCode"
                  placeholder="Ex.: 12345"
                  help="Usada no slip de pagamento por entidade e referência."
                />
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Prazo de tolerância por defeito (dias)"
                  name="defaultGracePeriodDays"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
              Multa por atraso, por defeito — escalonada por semana. Cada
              trimestre pode definir os seus próprios valores em{" "}
              <a href="/trimestres">Configurações → Trimestres</a>; em branco
              aqui usa estes valores.
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="1ª semana de atraso (%)"
                  name="defaultLateFeeWeek1Percent"
                >
                  <InputNumber min={0} max={100} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="2ª semana de atraso (%)"
                  name="defaultLateFeeWeek2Percent"
                >
                  <InputNumber min={0} max={100} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="3ª semana em diante (%)"
                  name="defaultLateFeeWeek3PlusPercent"
                >
                  <InputNumber min={0} max={100} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Text strong style={{ fontSize: 15, display: "block", marginBottom: 16 }}>
              Escala de avaliação
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Nota de aprovação" name="passingGrade">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Nota máxima" name="maxGrade">
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Text strong style={{ fontSize: 15, display: "block", marginBottom: 16 }}>
              E-mail (SMTP)
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <Input.Text
                  label="Servidor SMTP"
                  name="smtpHost"
                  placeholder="Ex.: smtp.gmail.com"
                />
              </Col>
              <Col span={6}>
                <Form.Item label="Porta" name="smtpPort">
                  <InputNumber min={1} max={65535} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Segurança" name="smtpSecurity">
                  <Select
                    options={[
                      { label: "Nenhuma", value: "NONE" },
                      { label: "SSL", value: "SSL" },
                      { label: "TLS", value: "TLS" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Input.Text
                  label="Tipo de autenticação"
                  name="smtpAuthType"
                  placeholder="Ex.: LOGIN"
                />
              </Col>
              <Col span={8}>
                <Input.Text
                  label="Utilizador SMTP"
                  name="smtpUsername"
                  placeholder="Ex.: geral@escola.co.mz"
                />
              </Col>
              <Col span={8}>
                <Input.Text
                  label="Endereço de envio (no-reply)"
                  name="noReplyAddress"
                  placeholder="Ex.: no-reply@escola.co.mz"
                />
              </Col>
              <Col span={24}>
                <Form.Item label="Password SMTP">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <AntInput.Password
                      value={smtpPasswordDraft}
                      onChange={(e) => setSmtpPasswordDraft(e.target.value)}
                      placeholder={
                        settings?.smtpPasswordSet
                          ? "•••••••• (deixe em branco para manter)"
                          : "Ainda não configurada"
                      }
                      style={{ maxWidth: 320 }}
                    />
                    <Button
                      onClick={handleSaveSmtpPassword}
                      loading={savingPassword}
                    >
                      {smtpPasswordDraft ? "Guardar password" : "Remover password"}
                    </Button>
                    {settings?.smtpPasswordSet && (
                      <Tag color="green">Password configurada</Tag>
                    )}
                  </div>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Button
                  icon={<MailOutlined />}
                  onClick={() => setTestModalOpen(true)}
                >
                  Testar configuração
                </Button>
              </Col>
            </Row>

            <Divider />

            <Text strong style={{ fontSize: 15, display: "block", marginBottom: 16 }}>
              Domínios de e-mail
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Domínios permitidos"
                  name="allowedEmailDomains"
                  help="Se preenchido, só estes domínios podem ser usados em contas novas. Vazio = qualquer domínio, excepto os bloqueados."
                >
                  <Select
                    mode="tags"
                    open={false}
                    placeholder="Ex.: ams.edu.mz"
                    tokenSeparators={[",", " "]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Domínios bloqueados"
                  name="blockedEmailDomains"
                  help="Domínios rejeitados em contas novas (ignorado se o domínio estiver na lista de permitidos)."
                >
                  <Select
                    mode="tags"
                    open={false}
                    placeholder="Ex.: gmail.com"
                    tokenSeparators={[",", " "]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Text strong style={{ fontSize: 15, display: "block", marginBottom: 16 }}>
              Modo de manutenção
            </Text>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Activo"
                  name="maintenanceMode"
                  valuePropName="checked"
                  help="Enquanto activo, só Admin/Super Admin conseguem usar a plataforma — os restantes vêem a mensagem abaixo."
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Mensagem para os utilizadores" name="maintenanceMessage">
                  <AntInput.TextArea
                    rows={2}
                    placeholder="Ex.: Estamos a fazer manutenção. Voltamos em breve."
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Text strong style={{ fontSize: 15, display: "block", marginBottom: 16 }}>
              Alertas de tentativas de login falhadas
            </Text>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Notificar (in-app e por e-mail, conforme as preferências de cada um)"
                  name="notifyLoginFailuresTo"
                  help="Disparado ao atingir o limite de tentativas de login já configurado no servidor (6 em 5 minutos)."
                >
                  <Select
                    mode="multiple"
                    placeholder="Seleccione os administradores a notificar"
                    options={adminOptions}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Text strong style={{ fontSize: 15, display: "block", marginBottom: 16 }}>
              Restringir acesso por IP
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="IPs permitidos"
                  name="allowedIps"
                  help="Se preenchido, só estes IPs (exactos ou por prefixo, ex.: 10.0.0.) acedem à plataforma."
                >
                  <Select mode="tags" open={false} placeholder="Ex.: 10.0.0." tokenSeparators={[",", " "]} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="IPs bloqueados"
                  name="blockedIps"
                  help="Estes IPs nunca acedem à plataforma."
                >
                  <Select mode="tags" open={false} placeholder="Ex.: 203.0.113.5" tokenSeparators={[",", " "]} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Processar primeiro a lista de permissões"
                  name="allowIpListFirst"
                  valuePropName="checked"
                  help="Só importa quando um IP está nas duas listas em simultâneo: decide qual delas vence."
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="schoolLogo" hidden>
              <input type="hidden" />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={saving}>
              Guardar Definições
            </Button>
          </Form>
        </Card>
      )}

      <Modal
        open={testModalOpen}
        title="Testar configuração de e-mail"
        okText="Enviar"
        cancelText="Cancelar"
        okButtonProps={{ loading: testingEmail, disabled: !testAddress }}
        onCancel={() => setTestModalOpen(false)}
        onOk={handleTestEmail}
      >
        <Form layout="vertical">
          <Form.Item label="Enviar e-mail de teste para">
            <AntInput
              type="email"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              placeholder="ex.: admin@escola.co.mz"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
