// pages/finance/PendingConfirmations.tsx
// Pagamentos auto-reportados por encarregados/alunos (referência ou
// depósito), à espera de confirmação da Secretária/Financeiro.
// Partilhado entre os menus de Secretária e Financeiro.
import { CheckOutlined, FileSearchOutlined, HomeOutlined, UnlockOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  DatePicker,
  Form,
  Input as AntInput,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { useAuthStore } from "../../store/authStore";
import { useFetch, useMutationPatch } from "../../utils/fetch";
import { intl } from "../../utils/intl";

// Só Admin/Superadmin/Financeiro têm can("manage","FinancialOverride")
// no backend — a Secretária vê esta página mas não este botão.
const CAN_OVERRIDE = ["ADMIN", "SUPERADMIN", "FINANCE"];

const METHOD_LABEL: Record<string, string> = {
  CASH: "Numerário",
  TRANSFER: "Transferência",
  MULTICAIXA: "Multicaixa",
  MPESA: "M-Pesa",
  REFERENCE: "Referência",
  OTHER: "Outro",
};

export default function PendingConfirmations() {
  const { user } = useAuthStore();
  const canOverride = CAN_OVERRIDE.includes(user?.type ?? "");
  const [unblockStudentId, setUnblockStudentId] = useState<string | null>(
    null,
  );
  const [unblockForm] = Form.useForm();

  const { data, isPending, refetch } = useFetch(
    ["payments", "unconfirmed"],
    "payments?confirmed=false",
  );
  const payments = data?.payments ?? [];

  const { mutateAsyncPatch, isPending: confirming } = useMutationPatch(
    ["payments", "unconfirmed"],
    "payments",
  );

  const { mutateAsyncPatch: mutateOverride, isPending: overriding } =
    useMutationPatch(["payments", "unconfirmed"], "students");

  const handleUnblock = async () => {
    if (!unblockStudentId) return;
    const values = await unblockForm.validateFields();
    try {
      await mutateOverride({
        id: unblockStudentId,
        urlParams: "financial-override",
        body: { untilDate: values.untilDate.toISOString(), reason: values.reason },
      });
      message.success("Aluno desbloqueado temporariamente.");
      unblockForm.resetFields();
      setUnblockStudentId(null);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Não foi possível desbloquear o aluno.",
      );
    }
  };

  const handleConfirm = (id: string) => {
    Modal.confirm({
      title: "Confirmar este pagamento?",
      content:
        "A factura será marcada como paga (se o valor cobrir o total) e o aluno deixa de estar bloqueado por esta dívida.",
      okText: "Confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await mutateAsyncPatch({ id, urlParams: "confirm", body: {} });
          message.success("Pagamento confirmado.");
          refetch();
        } catch (error: any) {
          message.error(
            error?.response?.data?.message ??
              "Não foi possível confirmar o pagamento.",
          );
        }
      },
    });
  };

  return (
    <>
      <CustomBreadcrumb
        title="Pagamentos por Confirmar"
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Pagamentos por Confirmar" },
        ]}
      />

      <Card title="Auto-reportados por encarregados/alunos">
        <Table
          rowKey="id"
          loading={isPending}
          dataSource={payments}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          columns={[
            {
              title: "Aluno",
              render: (_, r: any) => {
                const u = r.invoice?.enrollment?.student?.user;
                return (
                  <Space>
                    <Avatar size="small" src={u?.avatar}>
                      {u?.firstName?.[0]}
                    </Avatar>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {u?.firstName} {u?.lastName}
                    </Typography.Text>
                  </Space>
                );
              },
            },
            {
              title: "Factura",
              render: (_, r: any) =>
                r.invoice?.description ?? r.invoice?.term?.name ?? "—",
            },
            {
              title: "Valor",
              render: (_, r: any) => `MZN ${Number(r.amountPaid).toFixed(2)}`,
            },
            {
              title: "Método",
              render: (_, r: any) => (
                <Tag>{METHOD_LABEL[r.method] ?? r.method}</Tag>
              ),
            },
            {
              title: "Referência",
              dataIndex: "reference",
              render: (v: string) => v ?? "—",
            },
            {
              title: "Comprovativo",
              render: (_, r: any) =>
                r.proofUrl ? (
                  <a href={r.proofUrl} target="_blank" rel="noreferrer">
                    <FileSearchOutlined /> Ver
                  </a>
                ) : (
                  "—"
                ),
            },
            {
              title: "Reportado em",
              render: (_, r: any) =>
                r.createdAt ? intl(r.createdAt) : "—",
            },
            {
              title: "Acções",
              fixed: "right",
              width: canOverride ? "16rem" : "10rem",
              render: (_, r: any) => (
                <Space>
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckOutlined />}
                    loading={confirming}
                    onClick={() => handleConfirm(r.id)}
                  >
                    Confirmar
                  </Button>
                  {canOverride && (
                    <Button
                      size="small"
                      icon={<UnlockOutlined />}
                      onClick={() =>
                        setUnblockStudentId(r.invoice?.enrollment?.student?.id)
                      }
                    >
                      Desbloquear aluno
                    </Button>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Desbloquear aluno temporariamente"
        open={!!unblockStudentId}
        onCancel={() => setUnblockStudentId(null)}
        okText="Desbloquear"
        cancelText="Cancelar"
        confirmLoading={overriding}
        onOk={handleUnblock}
      >
        <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
          A dívida não é apagada — só a consulta de notas volta a ficar
          disponível até à data escolhida.
        </Typography.Paragraph>
        <Form form={unblockForm} layout="vertical">
          <Form.Item
            label="Desbloqueado até"
            name="untilDate"
            rules={[{ required: true, message: "Campo obrigatório" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item label="Motivo (opcional)" name="reason">
            <AntInput.TextArea rows={2} placeholder="Ex.: negociação em curso" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
