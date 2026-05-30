// pages/mensagens/index.tsx
// Usado tanto pelo admin/professor (compose completo)
// como pelo guardian (só inbox + reply)
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import DrawerFooter from "@/components/DrawerFooter";
import { Input } from "@/components/Input";
import { useAuthStore } from "@/store/authStore";
import { useFetch, useMutationDel, useMutationPost } from "@/utils/fetch";
import { intl } from "@/utils/intl";
import {
  DeleteOutlined,
  HomeOutlined,
  InboxOutlined,
  MailOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Input as AntInput,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Form,
  List,
  Popconfirm,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
  message
} from "antd";
import { useState } from "react";

const { Text, Title } = Typography;

const TYPE_COLOR: Record<string, string> = {
  TEACHER: "blue",
  ADMIN: "purple",
  GUARDIAN: "orange",
};

export default function Mensagens() {
  const { user } = useAuthStore();
  const isGuardian = user?.type === "GUARDIAN";

  const [composeOpen, setComposeOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form] = Form.useForm();

  // Dados
  const {
    data: inboxData,
    isPending: loadingInbox,
    refetch: refetchInbox,
  } = useFetch(["inbox"], "messages/inbox");

  const {
    data: sentData,
    isPending: loadingSent,
    refetch: refetchSent,
  } = useFetch(["sent"], "messages/sent", { enabled: !isGuardian });

  // Guardiões a quem o professor pode enviar mensagem
  const { data: guardiansData } = useFetch(
    ["msg-guardians"],
    "messages/guardians",
    { enabled: !isGuardian },
  );

  const { mutateAsync: sendMessage, isPending: sending } = useMutationPost(
    ["inbox", "sent"],
    "messages",
  );
  const { mutateAsyncDel: deleteMessage } = useMutationDel(
    ["inbox", "sent"],
    "messages",
  );

  const inbox = inboxData?.messages ?? [];
  const sent = sentData?.messages ?? [];
  const unread = inboxData?.unread ?? 0;
  const guardians = guardiansData?.guardians ?? [];

  const recipientOptions = guardians.map((g: any) => ({
    label: `${g.firstName} ${g.lastName} — Encarregado`,
    value: g.id,
  }));

  const handleSend = async (values: any) => {
    await sendMessage({
      recipientId: values.recipientId,
      subject: values.subject,
      body: values.body,
    });
    message.success("Mensagem enviada com sucesso.");
    refetchInbox();
    refetchSent();
    setComposeOpen(false);
    form.resetFields();
  };

  const handleDelete = async (id: string) => {
    await deleteMessage(id);
    message.success("Mensagem removida.");
    refetchInbox();
    refetchSent();
    if (selected?.id === id) setSelected(null);
  };

  const openMessage = (msg: any) => {
    setSelected(msg);
  };

  const MessageItem = ({ msg, isSent }: { msg: any; isSent?: boolean }) => {
    const contact = isSent ? msg.recipient : msg.sender;
    const isUnread = !isSent && !msg.read;

    return (
      <List.Item
        style={{
          background: isUnread
            ? "var(--color-background-secondary)"
            : "transparent",
          borderRadius: 8,
          marginBottom: 4,
          padding: "10px 12px",
          cursor: "pointer",
          borderLeft: isUnread ? "3px solid #4f3fc5" : "3px solid transparent",
        }}
        onClick={() => openMessage(msg)}
        actions={[
          <Popconfirm
            key="del"
            title="Apagar mensagem?"
            okText="Sim"
            cancelText="Não"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(msg.id);
            }}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>,
        ]}
      >
        <List.Item.Meta
          avatar={
            <Avatar src={contact?.avatar} size="small">
              {contact?.firstName?.[0]}
            </Avatar>
          }
          title={
            <Space>
              <Text strong={isUnread} style={{ fontSize: 13 }}>
                {msg.subject}
              </Text>
              {isUnread && <Badge color="#4f3fc5" />}
            </Space>
          }
          description={
            <Space size={6}>
              <Tag
                color={TYPE_COLOR[contact?.type] ?? "default"}
                style={{ fontSize: 10 }}
              >
                {contact?.firstName} {contact?.lastName}
              </Tag>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {intl(msg.createdAt)}
              </Text>
            </Space>
          }
        />
      </List.Item>
    );
  };

  return (
    <>
      <CustomBreadcrumb
        title="Mensagens"
        items={[
          { href: isGuardian ? "/guardian" : "/", title: <HomeOutlined /> },
          { title: "Mensagens" },
        ]}
      />

      <Row gutter={[16, 16]}>
        {/* Lista de mensagens */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <InboxOutlined />
                <span>Mensagens</span>
              </Space>
            }
            extra={
              !isGuardian && (
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  onClick={() => setComposeOpen(true)}
                >
                  Escrever
                </Button>
              )
            }
          >
            <Tabs
              size="small"
              items={[
                {
                  key: "inbox",
                  label: (
                    <Badge count={unread} size="small" offset={[6, -2]}>
                      Recebidas
                    </Badge>
                  ),
                  children: (
                    <List
                      loading={loadingInbox}
                      dataSource={inbox}
                      locale={{
                        emptyText: (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Sem mensagens"
                          />
                        ),
                      }}
                      renderItem={(msg: any) => (
                        <MessageItem key={msg.id} msg={msg} />
                      )}
                    />
                  ),
                },
                ...(!isGuardian
                  ? [
                      {
                        key: "sent",
                        label: "Enviadas",
                        children: (
                          <List
                            loading={loadingSent}
                            dataSource={sent}
                            locale={{
                              emptyText: (
                                <Empty
                                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                                  description="Sem mensagens enviadas"
                                />
                              ),
                            }}
                            renderItem={(msg: any) => (
                              <MessageItem key={msg.id} msg={msg} isSent />
                            )}
                          />
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </Card>
        </Col>

        {/* Detalhe da mensagem seleccionada */}
        <Col xs={24} lg={14}>
          {!selected ? (
            <Card
              style={{
                minHeight: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Empty
                image={
                  <MailOutlined
                    style={{
                      fontSize: 48,
                      color: "var(--color-text-tertiary)",
                    }}
                  />
                }
                description="Seleccione uma mensagem para ler"
              />
            </Card>
          ) : (
            <Card
              title={
                <Space>
                  <Avatar src={selected.sender?.avatar} size="small">
                    {selected.sender?.firstName?.[0]}
                  </Avatar>
                  <div>
                    <Text strong style={{ fontSize: 14 }}>
                      {selected.subject}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      De: {selected.sender?.firstName}{" "}
                      {selected.sender?.lastName}
                      {" · "}
                      {intl(selected.createdAt)}
                    </Text>
                  </div>
                </Space>
              }
              extra={
                <Popconfirm
                  title="Apagar mensagem?"
                  okText="Sim"
                  cancelText="Não"
                  onConfirm={() => handleDelete(selected.id)}
                >
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              }
            >
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "var(--color-text-primary)",
                  minHeight: 120,
                }}
              >
                {selected.body}
              </div>

              <Descriptions size="small" column={2} style={{ marginTop: 20 }}>
                <Descriptions.Item label="Enviado a">
                  {intl(selected.createdAt)}
                </Descriptions.Item>
                {selected.readAt && (
                  <Descriptions.Item label="Lido a">
                    {intl(selected.readAt)}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>
      </Row>

      {/* Drawer — Escrever mensagem */}
      <Drawer
        title="Nova Mensagem"
        open={composeOpen}
        size={480}
        placement="right"
        onClose={() => {
          setComposeOpen(false);
          form.resetFields();
        }}
        footer={
          <DrawerFooter
            okText="Enviar Mensagem"
            onOk={() => form.validateFields().then(handleSend)}
            loading={sending}
            cancelText="Cancelar"
            onClose={() => {
              setComposeOpen(false);
              form.resetFields();
            }}
          />
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Para (Encarregado)"
            name="recipientId"
            rules={[{ required: true, message: "Seleccione o destinatário" }]}
          >
            <Select
              placeholder="Seleccione o encarregado"
              options={recipientOptions}
              showSearch={{
                filterOption: (input, opt) =>
                  String(opt?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase()),
              }}
              // filterOption={(input, opt) =>
              //   String(opt?.label ?? "").toLowerCase().includes(input.toLowerCase())
              // }
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Input.Text
            label="Assunto"
            name="subject"
            required
            placeholder="Ex.: Reunião de avaliação"
          />
          <Form.Item
            label="Mensagem"
            name="body"
            rules={[{ required: true, message: "Escreva a mensagem" }]}
          >
            <AntInput.TextArea
              name="body"
              placeholder="Escreva aqui a sua mensagem..."
              rows={6}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
