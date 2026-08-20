// pages/admin/eventos/index.tsx
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Form,
  List,
  Popconfirm,
  Row,
  Space,
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
  useMutationPatch,
  useMutationPost,
} from "../../../utils/fetch";
import { intlDate } from "../../../utils/intl";

const { Text, Title } = Typography;

const SCOPE_OPTIONS = [
  { label: "Toda a escola", value: "ALL" },
  { label: "Alunos", value: "STUDENTS" },
  { label: "Encarregados", value: "GUARDIANS" },
  { label: "Professores", value: "TEACHERS" },
  { label: "Funcionários", value: "EMPLOYEES" },
];

const SCOPE_COLOR: Record<string, string> = {
  ALL: "blue",
  STUDENTS: "green",
  GUARDIANS: "orange",
  TEACHERS: "purple",
  EMPLOYEES: "cyan",
};

const SCOPE_LABEL: Record<string, string> = {
  ALL: "Toda a escola",
  STUDENTS: "Alunos",
  GUARDIANS: "Encarregados",
  TEACHERS: "Professores",
  EMPLOYEES: "Funcionários",
};

// `readOnly` esconde a criação/edição/remoção — usado por perfis que só
// têm leitura de eventos (Secretária/Financeiro/Professor: `authorize`
// de escrita em /events exige "manage all", só Admin/SUPERADMIN têm).
export default function Eventos({ readOnly = false }: { readOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const { data, isPending, refetch } = useFetch(["events"], "events");
  const { mutateAsync: createEvent, isPending: creating } = useMutationPost(
    ["events"],
    "events",
  );
  const { mutateAsyncPatch: updateEvent, isPending: updating } =
    useMutationPatch(["events"], "events");
  const { mutateAsyncDel: deleteEvent } = useMutationDel(["events"], "events");

  const events = data?.events ?? [];

  // Separar eventos futuros / passados
  const now = dayjs();
  const upcoming = events.filter((e: any) => dayjs(e.startDate).isAfter(now));
  const past = events.filter((e: any) => !dayjs(e.startDate).isAfter(now));

  const onOpenCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const onOpenEdit = (event: any) => {
    setEditing(event);
    form.setFieldsValue({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: dayjs(event.startDate),
      endDate: event.endDate ? dayjs(event.endDate) : undefined,
      location: event.location,
      scope: event.scope,
    });
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
    setEditing(null);
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      title: values.title,
      description: values.description,
      startDate: dayjs(values.startDate).toISOString(),
      endDate: values.endDate ? dayjs(values.endDate).toISOString() : undefined,
      location: values.location,
      scope: values.scope ?? "ALL",
    };

    if (editing) {
      await updateEvent({ id: editing.id, body: payload });
      message.success("Evento actualizado.");
    } else {
      await createEvent(payload);
      message.success("Evento criado com sucesso.");
    }

    refetch();
    onClose();
  };

  const handleDelete = async (id: string) => {
    await deleteEvent(id);
    message.success("Evento removido.");
    refetch();
  };

  const EventCard = ({ event }: { event: any }) => {
    const isUpcoming = dayjs(event.startDate).isAfter(now);
    return (
      <List.Item
        actions={
          readOnly
            ? undefined
            : [
                <Button
                  key="edit"
                  icon={<EditOutlined />}
                  onClick={() => onOpenEdit(event)}
                />,
                <Popconfirm
                  key="del"
                  title="Remover este evento?"
                  okText="Sim"
                  cancelText="Não"
                  onConfirm={() => handleDelete(event.id)}
                >
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]
        }
      >
        <List.Item.Meta
          avatar={
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: isUpcoming ? "#4f3fc522" : "#f0f0f0",
                border: `1px solid ${isUpcoming ? "#4f3fc5" : "#d9d9d9"}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: isUpcoming ? "#4f3fc5" : "#999",
                  lineHeight: 1,
                }}
              >
                {dayjs(event.startDate).format("DD")}
              </Text>
              <Text
                style={{ fontSize: 10, color: isUpcoming ? "#4f3fc5" : "#999" }}
              >
                {dayjs(event.startDate).format("MMM").toUpperCase()}
              </Text>
            </div>
          }
          title={
            <Space>
              <Text strong style={{ fontSize: 14 }}>
                {event.title}
              </Text>
              <Tag
                color={SCOPE_COLOR[event.scope]}
                style={{ fontSize: 11 }}
                variant="outlined"
              >
                {SCOPE_LABEL[event.scope] ?? event.scope}
              </Tag>
            </Space>
          }
          description={
            <Space direction="vertical" size={2}>
              {event.description && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {event.description}
                </Text>
              )}
              <Text type="secondary" style={{ fontSize: 11 }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {intlDate(event.startDate)}
                {event.endDate && event.endDate !== event.startDate
                  ? ` → ${intlDate(event.endDate)}`
                  : ""}
                {event.location ? ` · 📍 ${event.location}` : ""}
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
        title="Eventos"
        items={[{ href: "/", title: <HomeOutlined /> }, { title: "Eventos" }]}
      />

      <Row gutter={[16, 16]}>
        {/* Próximos eventos */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <Title level={5} style={{ margin: 0 }}>
                  Próximos Eventos
                </Title>
                <Badge count={upcoming.length} color="#4f3fc5" />
              </Space>
            }
            extra={
              !readOnly && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={onOpenCreate}
                >
                  Novo Evento
                </Button>
              )
            }
          >
            <List
              loading={isPending}
              dataSource={upcoming}
              locale={{ emptyText: "Sem eventos futuros." }}
              renderItem={(event: any) => <EventCard event={event} />}
            />
          </Card>
        </Col>

        {/* Eventos passados */}
        <Col xs={24} lg={10}>
          <Card title="Eventos Passados">
            <List
              loading={isPending}
              dataSource={past}
              locale={{ emptyText: "Sem eventos anteriores." }}
              renderItem={(event: any) => <EventCard event={event} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Drawer criar/editar */}
      <Drawer
        title={editing ? "Editar Evento" : "Novo Evento"}
        open={open}
        size={480}
        placement="right"
        onClose={onClose}
        footer={
          <DrawerFooter
            okText={editing ? "Guardar" : "Criar Evento"}
            onOk={() => form.validateFields().then(handleSubmit)}
            loading={creating || updating}
            cancelText="Cancelar"
            onClose={onClose}
          />
        }
      >
        <Form form={form} layout="vertical">
          <Input.Id name="id" />
          <Input.Text
            label="Título do evento"
            name="title"
            required
            placeholder="Ex.: Dia de abertura do ano lectivo"
          />
          <Input.Text
            label="Descrição"
            name="description"
            placeholder="Detalhes do evento (opcional)"
          />
          <Form.Item
            label="Data de início"
            name="startDate"
            rules={[{ required: true, message: "Campo obrigatório" }]}
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
              placeholder="Seleccione a data e hora"
            />
          </Form.Item>
          <Form.Item label="Data de fim (opcional)" name="endDate">
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
              placeholder="Seleccione a data e hora"
            />
          </Form.Item>
          <Input.Text
            label="Local"
            name="location"
            placeholder="Ex.: Sala de conferências, Pátio da escola"
          />
          <Input.Select
            label="Visível para"
            name="scope"
            required
            options={SCOPE_OPTIONS}
            placeholder="Seleccione o público-alvo"
          />
        </Form>
      </Drawer>
    </>
  );
}
