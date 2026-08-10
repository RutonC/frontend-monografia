// configuracoes/escola/index.tsx
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { Input } from "@/components/Input";
import axiosInstance from "@/utils/axiosInstance";
import { resolveAssetUrl } from "@/utils/constants";
import { useFetch } from "@/utils/fetch";
import { HomeOutlined, UploadOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  InputNumber,
  Row,
  Spin,
  Typography,
  Upload,
  message,
} from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

export default function EscolaSettings() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isPending } = useFetch(["settings"], "settings");
  const settings = data?.settings;

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
      defaultLateFeePercent: settings.defaultLateFeePercent
        ? Number(settings.defaultLateFeePercent) * 100
        : undefined,
      passingGrade: settings.passingGrade ? Number(settings.passingGrade) : undefined,
      maxGrade: settings.maxGrade ? Number(settings.maxGrade) : undefined,
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
      defaultLateFeePercent:
        values.defaultLateFeePercent != null
          ? values.defaultLateFeePercent / 100
          : undefined,
      passingGrade: values.passingGrade,
      maxGrade: values.maxGrade,
    };

    await save(payload);
    message.success("Definições da escola actualizadas com sucesso.");
  };

  const logoUrl = Form.useWatch("schoolLogo", form);

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
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Spin size="large" />
        </div>
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
              <Col span={8}>
                <Input.Text
                  label="Entidade de pagamento"
                  name="paymentEntityCode"
                  placeholder="Ex.: 12345"
                  help="Usada no slip de pagamento por entidade e referência."
                />
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Prazo de tolerância por defeito (dias)"
                  name="defaultGracePeriodDays"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Multa por atraso por defeito (%)"
                  name="defaultLateFeePercent"
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

            <Form.Item name="schoolLogo" hidden>
              <input type="hidden" />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={saving}>
              Guardar Definições
            </Button>
          </Form>
        </Card>
      )}
    </>
  );
}
