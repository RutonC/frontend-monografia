// pages/admin/financeiro/pagamentos.tsx
import {
  DollarOutlined,
  HomeOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import DrawerFooter from "../../../components/DrawerFooter";
import { Input } from "../../../components/Input";
import {
  useFetch,
  useMutationDel,
  useMutationPost,
} from "../../../utils/fetch";
import { intl, intlDate } from "../../../utils/intl";
import type { IAcademicYear } from "../../../utils/type";

const METHOD_LABEL: Record<string, string> = {
  CASH: "Numerário",
  TRANSFER: "Transferência",
  MULTICAIXA: "Multicaixa",
  MPESA: "M-Pesa",
  OTHER: "Outro",
};

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

export default function Pagamentos() {
  const [payOpen, setPayOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [filterYear, setFilterYear] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [form] = Form.useForm();

  // Facturas (invoices) — a base da vista financeira
  const queryStr = [
    filterYear ? `academicYearId=${filterYear}` : "",
    filterStatus ? `status=${filterStatus}` : "",
  ]
    .filter(Boolean)
    .join("&");

  const {
    data: invoicesData,
    isPending: loadingInvoices,
    refetch,
  } = useFetch(
    ["invoices", filterYear ?? "", filterStatus ?? ""],
    `invoices?${queryStr}`,
  );

  const { data: paymentsData, isPending: loadingPayments } = useFetch(
    ["payments"],
    "payments",
  );

  const { data: yearsData } = useFetch(["academics"], "academics");

  const { mutateAsync: createPayment, isPending: paying } = useMutationPost(
    ["payments", "invoices"],
    "payments",
  );

  const { mutateAsyncDel: deletePayment } = useMutationDel(
    ["payments", "invoices"],
    "payments",
  );

  const yearOptions =
    yearsData?.academicYear?.map((y: IAcademicYear) => ({
      label: `${y.year}${y.active ? " ✓" : ""}`,
      value: y.id,
    })) ?? [];

  const invoices = invoicesData?.invoices ?? [];
  const payments = paymentsData?.payments ?? [];

  // Métricas rápidas
  const totalPaid = invoices
    .filter((i: any) => i.status === "PAID")
    .reduce((s: number, i: any) => s + Number(i.amount), 0);
  const totalPending = invoices
    .filter((i: any) => i.status === "UNPAID")
    .reduce((s: number, i: any) => s + Number(i.amount), 0);
  const totalOverdue = invoices
    .filter((i: any) => i.status === "OVERDUE")
    .reduce((s: number, i: any) => s + Number(i.amount), 0);

  const openPayDrawer = (invoice: any) => {
    setSelectedInvoice(invoice);
    form.setFieldsValue({
      invoiceId: invoice.id,
      paymentDate: dayjs(),
      method: "CASH",
    });
    setPayOpen(true);
  };

  const handlePay = async (values: any) => {
    await createPayment({
      invoiceId: selectedInvoice.id,
      amountPaid: Number(values.amountPaid),
      method: values.method,
      paymentDate: values.paymentDate
        ? dayjs(values.paymentDate).toISOString()
        : new Date().toISOString(),
      reference: values.reference,
      notes: values.notes,
    });

    message.success("Pagamento registado com sucesso!");
    refetch();
    setPayOpen(false);
    form.resetFields();
    setSelectedInvoice(null);
  };

  const handleDeletePayment = (id: string) => {
    Modal.confirm({
      title: "Remover pagamento?",
      content: "O estado da factura será recalculado automaticamente.",
      okText: "Remover",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        await deletePayment(id);
        message.success("Pagamento removido.");
        refetch();
      },
    });
  };

  return (
    <>
      <CustomBreadcrumb
        title="Pagamentos e Propinas"
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Financeiro" },
          { title: "Pagamentos" },
        ]}
      />

      {/* Métricas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={6}>
          <Card
            style={{
              background: "var(--color-background-secondary)",
              border: "none",
            }}
          >
            <Statistic
              title="Total pago"
              value={totalPaid}
              precision={2}
              prefix="MZN"
              valueStyle={{ color: "var(--color-text-success)", fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card
            style={{
              background: "var(--color-background-secondary)",
              border: "none",
            }}
          >
            <Statistic
              title="Pendente"
              value={totalPending}
              precision={2}
              prefix="MZN"
              valueStyle={{ color: "var(--color-text-warning)", fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card
            style={{
              background: "var(--color-background-secondary)",
              border: "none",
            }}
          >
            <Statistic
              title="Em atraso"
              value={totalOverdue}
              precision={2}
              prefix="MZN"
              valueStyle={{ color: "var(--color-text-danger)", fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card
            style={{
              background: "var(--color-background-secondary)",
              border: "none",
            }}
          >
            <Statistic
              title="Facturas totais"
              value={invoices.length}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabela de facturas */}
      <Card
        title="Facturas / Propinas"
        extra={
          <Space>
            <Select
              placeholder="Ano lectivo"
              options={yearOptions}
              onChange={setFilterYear}
              allowClear
              style={{ width: 150 }}
            />
            <Select
              placeholder="Estado"
              onChange={setFilterStatus}
              allowClear
              style={{ width: 140 }}
              options={[
                { label: "Pendente", value: "UNPAID" },
                { label: "Pago", value: "PAID" },
                { label: "Em atraso", value: "OVERDUE" },
                { label: "Cancelado", value: "CANCELLED" },
              ]}
            />
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Table
          rowKey="id"
          loading={loadingInvoices}
          dataSource={invoices}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: "Aluno",
              render: (_, r: any) => {
                const u = r.enrollment?.student?.user;
                return (
                  <Space>
                    <Avatar size="small" src={u?.avatar}>
                      {u?.firstName?.[0]}
                    </Avatar>
                    <div>
                      <Typography.Text style={{ fontSize: 13 }}>
                        {u?.firstName} {u?.lastName}
                      </Typography.Text>
                      <br />
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 11, fontFamily: "monospace" }}
                      >
                        {u?.identifier}
                      </Typography.Text>
                    </div>
                  </Space>
                );
              },
            },
            {
              title: "Turma",
              render: (_, r: any) => r.enrollment?.section?.name ?? "—",
            },
            {
              title: "Trimestre",
              render: (_, r: any) => r.term?.name ?? "—",
            },
            {
              title: "Descrição",
              dataIndex: "description",
              render: (v: string) => v ?? "—",
              ellipsis: true,
            },
            {
              title: "Valor",
              render: (_, r: any) => `MZN ${Number(r.amount).toFixed(2)}`,
            },
            {
              title: "Vencimento",
              render: (_, r: any) => (r.dueDate ? intlDate(r.dueDate) : "—"),
              sorter: (a: any, b: any) =>
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
            },
            {
              title: "Estado",
              render: (_, r: any) => (
                <Tag color={INVOICE_STATUS_COLOR[r.status]}>
                  {INVOICE_STATUS_LABEL[r.status] ?? r.status}
                </Tag>
              ),
              filters: [
                { text: "Pendente", value: "UNPAID" },
                { text: "Pago", value: "PAID" },
                { text: "Em atraso", value: "OVERDUE" },
              ],
              onFilter: (val: any, rec: any) => rec.status === val,
            },
            {
              title: "Multa",
              render: (_, r: any) =>
                r.fines?.length > 0 ? (
                  <Tag color="red">Multa aplicada</Tag>
                ) : r.finePercent ? (
                  <Tag color="orange">
                    {(Number(r.finePercent) * 100).toFixed(0)}% multa
                  </Tag>
                ) : (
                  "—"
                ),
            },
            {
              title: "Acções",
              fixed: "right",
              width: "8rem",
              render: (_, r: any) => (
                <Button
                  size="small"
                  type={r.status === "PAID" ? "default" : "primary"}
                  icon={<DollarOutlined />}
                  disabled={r.status === "PAID" || r.status === "CANCELLED"}
                  onClick={() => openPayDrawer(r)}
                >
                  {r.status === "PAID" ? "Pago" : "Registar Pag."}
                </Button>
              ),
            },
          ]}
        />
      </Card>

      {/* Tabela de pagamentos realizados */}
      <Card title="Histórico de Pagamentos">
        <Table
          rowKey="id"
          loading={loadingPayments}
          dataSource={payments}
          pagination={{ pageSize: 8 }}
          columns={[
            {
              title: "Aluno",
              render: (_, r: any) => {
                const u = r.invoice?.enrollment?.student?.user;
                return u ? `${u.firstName} ${u.lastName}` : "—";
              },
            },
            {
              title: "Factura",
              render: (_, r: any) =>
                r.invoice?.description ?? r.invoice?.term?.name ?? "—",
            },
            {
              title: "Valor pago",
              render: (_, r: any) => `MZN ${Number(r.amountPaid).toFixed(2)}`,
            },
            {
              title: "Método",
              render: (_, r: any) => METHOD_LABEL[r.method] ?? r.method,
            },
            {
              title: "Referência",
              dataIndex: "reference",
              render: (v: string) => v ?? "—",
            },
            {
              title: "Data",
              render: (_, r: any) =>
                r.paymentDate ? intl(r.paymentDate) : "—",
            },
            {
              title: "",
              fixed: "right",
              width: "5rem",
              render: (_, r: any) => (
                <Button
                  size="small"
                  danger
                  onClick={() => handleDeletePayment(r.id)}
                >
                  Remover
                </Button>
              ),
            },
          ]}
        />
      </Card>

      {/* Drawer — Registar pagamento */}
      <Drawer
        title="Registar Pagamento"
        open={payOpen}
        size={480}
        placement="right"
        onClose={() => {
          setPayOpen(false);
          form.resetFields();
          setSelectedInvoice(null);
        }}
        footer={
          <DrawerFooter
            okText="Registar Pagamento"
            onOk={() => form.validateFields().then(handlePay)}
            loading={paying}
            cancelText="Cancelar"
            onClose={() => {
              setPayOpen(false);
              form.resetFields();
            }}
          />
        }
      >
        {selectedInvoice && (
          <Descriptions size="small" column={1} style={{ marginBottom: 20 }}>
            <Descriptions.Item label="Aluno">
              {selectedInvoice.enrollment?.student?.user?.firstName}{" "}
              {selectedInvoice.enrollment?.student?.user?.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Factura">
              {selectedInvoice.description ?? selectedInvoice.term?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Valor total">
              MZN {Number(selectedInvoice.amount).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Vencimento">
              {selectedInvoice.dueDate
                ? intlDate(selectedInvoice.dueDate)
                : "—"}
            </Descriptions.Item>
          </Descriptions>
        )}

        <Form form={form} layout="vertical">
          <Input.Id name="invoiceId" />
          <Input.Text
            label="Valor a pagar (MZN)"
            name="amountPaid"
            required
            placeholder={
              selectedInvoice
                ? `Máx.: MZN ${Number(selectedInvoice.amount).toFixed(2)}`
                : "0.00"
            }
            pattern={/^\d+(\.\d{1,2})?$/}
            patternMessage="Valor inválido"
          />
          <Input.Select
            label="Método de pagamento"
            name="method"
            required
            options={[
              { label: "Numerário", value: "CASH" },
              { label: "Transferência", value: "TRANSFER" },
              { label: "Multicaixa", value: "MULTICAIXA" },
              { label: "M-Pesa", value: "MPESA" },
              { label: "Outro", value: "OTHER" },
            ]}
          />
          <Input.Text
            label="Referência (opcional)"
            name="reference"
            placeholder="Nº de referência ou comprovativo"
          />
          <Input.Text
            label="Notas (opcional)"
            name="notes"
            placeholder="Observações adicionais"
          />
        </Form>
      </Drawer>
    </>
  );
}
