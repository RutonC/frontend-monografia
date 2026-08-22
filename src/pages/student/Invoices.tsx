// pages/student/Invoices.tsx — Propinas/Facturas do próprio aluno
import {
  AlertOutlined,
  CopyOutlined,
  HomeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Form,
  Input as AntInput,
  InputNumber,
  message,
  Modal,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
  Upload,
} from "antd";
import { useState } from "react";
import AcademicYearSelect from "@/components/AcademicYearSelect";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { useMyInvoices } from "@/hooks/useStudentSelf";
import { useAuthStore } from "@/store/authStore";
import axiosInstance from "@/utils/axiosInstance";
import { useFetch, useMutationPost } from "@/utils/fetch";
import { intlDate } from "@/utils/intl";

const INVOICE_STATUS_COLOR: Record<string, string> = {
  PAID: "success",
  UNPAID: "warning",
  OVERDUE: "error",
  CANCELLED: "default",
};

const INVOICE_STATUS_LABEL: Record<string, string> = {
  PAID: "Pago",
  UNPAID: "Pendente",
  OVERDUE: "Em atraso",
  CANCELLED: "Cancelado",
};

function ReportPaymentModal({
  studentId,
  invoiceId,
  open,
  onClose,
}: {
  studentId: string;
  invoiceId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [form] = Form.useForm();
  const [proofUrl, setProofUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  const { mutateAsync, isPending } = useMutationPost(
    ["student-self", "invoices", studentId],
    `students/${studentId}/invoices/${invoiceId}/report-payment`,
  );

  const handleUpload = async ({ file }: { file: File }) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "payment-proofs");
      const res = await axiosInstance.post("/assets/upload", formData);
      setProofUrl(res.data.url);
      message.success("Comprovativo anexado.");
    } catch {
      message.error("Não foi possível enviar o comprovativo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      await mutateAsync({ ...values, proofUrl });
      message.success(
        "Pagamento reportado. Aguarda confirmação da Secretaria/Financeiro.",
      );
      form.resetFields();
      setProofUrl(undefined);
      onClose();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ?? "Não foi possível reportar o pagamento.",
      );
    }
  };

  return (
    <Modal
      title="Reportar pagamento"
      open={open}
      onCancel={onClose}
      okText="Reportar"
      cancelText="Cancelar"
      confirmLoading={isPending}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Método"
          name="method"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <Select
            placeholder="Como pagou?"
            options={[
              { label: "Referência (entidade/referência)", value: "REFERENCE" },
              { label: "Depósito/Transferência bancária", value: "TRANSFER" },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="Valor pago (MZN)"
          name="amountPaid"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Referência/comprovativo (nº do talão, etc.)" name="reference">
          <AntInput placeholder="Opcional" />
        </Form.Item>
        <Form.Item label="Notas" name="notes">
          <AntInput.TextArea rows={2} placeholder="Opcional" />
        </Form.Item>
        <Form.Item label="Anexar comprovativo">
          <Upload
            customRequest={({ file }) => handleUpload({ file: file as File })}
            showUploadList={false}
            accept="image/*,.pdf"
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              {proofUrl ? "Comprovativo anexado ✓" : "Escolher ficheiro"}
            </Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default function StudentInvoices() {
  const { user } = useAuthStore();
  const studentId = user?.id ?? "";
  const [academicYearId, setAcademicYearId] = useState<string | undefined>();
  const { data, isPending } = useMyInvoices(academicYearId);
  const { data: settingsData } = useFetch<{ settings: { paymentEntityCode?: string } }>(
    ["settings"],
    "settings",
  );
  const invoices = (data as any)?.invoices ?? [];
  const totalPending = (data as any)?.totalPending ?? 0;
  const entityCode = settingsData?.settings?.paymentEntityCode;
  const [reportingInvoiceId, setReportingInvoiceId] = useState<string | null>(null);

  const copyReference = (reference: string) => {
    navigator.clipboard
      .writeText(reference)
      .then(() => message.success("Referência copiada."))
      .catch(() => message.error("Não foi possível copiar."));
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <CustomBreadcrumb
          title="Propinas"
          items={[{ href: "/student", title: <HomeOutlined /> }, { title: "Propinas" }]}
        />
        <AcademicYearSelect
          value={academicYearId}
          onChange={setAcademicYearId}
          allowClear
          clearLabel="Todos os anos"
        />
      </div>

      {isPending ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !invoices.length ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sem facturas registadas" />
      ) : (
        <div>
          {totalPending > 0 && (
            <Card
              size="small"
              style={{
                marginBottom: 16,
                background: "var(--color-background-danger)",
                border: "0.5px solid var(--color-border-danger)",
              }}
            >
              <Space>
                <AlertOutlined style={{ color: "var(--color-text-danger)" }} />
                <Typography.Text style={{ color: "var(--color-text-danger)" }}>
                  Total em dívida: <strong>MZN {totalPending.toFixed(2)}</strong>
                </Typography.Text>
              </Space>
            </Card>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {invoices.map((inv: any) => {
              const payable = inv.status === "UNPAID" || inv.status === "OVERDUE";
              return (
                <Card key={inv.id} size="small">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <Typography.Text strong style={{ fontSize: 13 }}>
                        {inv.description ?? inv.term?.name ?? "Propina"}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                        Vencimento: {intlDate(inv.dueDate)}
                      </Typography.Text>
                      {inv.balance > 0 && inv.status !== "PAID" && (
                        <Typography.Text type="danger" style={{ fontSize: 12 }}>
                          Em dívida: MZN {inv.balance.toFixed(2)}
                        </Typography.Text>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Tag color={INVOICE_STATUS_COLOR[inv.status]}>
                        {INVOICE_STATUS_LABEL[inv.status]}
                      </Tag>
                      <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
                        MZN {Number(inv.amount).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {payable && inv.paymentReference && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 10,
                        borderRadius: 6,
                        background: "var(--color-background-secondary)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 12 }}>
                        <Typography.Text type="secondary">Entidade: </Typography.Text>
                        <Typography.Text strong>{entityCode ?? "—"}</Typography.Text>
                        <Typography.Text type="secondary" style={{ marginLeft: 12 }}>
                          Referência:{" "}
                        </Typography.Text>
                        <Typography.Text strong>{inv.paymentReference}</Typography.Text>
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => copyReference(inv.paymentReference)}
                        />
                      </div>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => setReportingInvoiceId(inv.id)}
                      >
                        Reportei o pagamento
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {reportingInvoiceId && (
        <ReportPaymentModal
          studentId={studentId}
          invoiceId={reportingInvoiceId}
          open={!!reportingInvoiceId}
          onClose={() => setReportingInvoiceId(null)}
        />
      )}
    </>
  );
}
