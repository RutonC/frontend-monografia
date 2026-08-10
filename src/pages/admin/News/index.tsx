// pages/admin/News/index.tsx — gestão de notícias (Admin/Secretária)
import {
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  PlusOutlined,
  PushpinFilled,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Drawer,
  Form,
  Input as AntInput,
  List,
  Popconfirm,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from "antd";
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
import { intl } from "../../../utils/intl";

const { Text } = Typography;

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
// têm leitura de notícias (só Admin/Secretária têm `can("manage","News")`).
export default function Noticias({ readOnly = false }: { readOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const { data, isPending, refetch } = useFetch(["news"], "news?limit=50");
  const { mutateAsync: createNews, isPending: creating } = useMutationPost(
    ["news"],
    "news",
  );
  const { mutateAsyncPatch: updateNews, isPending: updating } =
    useMutationPatch(["news"], "news");
  const { mutateAsyncDel: deleteNews } = useMutationDel(["news"], "news");

  const news = data?.news ?? [];

  const onOpenCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ scope: "ALL", pinned: false });
    setOpen(true);
  };

  const onOpenEdit = (item: any) => {
    setEditing(item);
    form.setFieldsValue({
      id: item.id,
      title: item.title,
      body: item.body,
      scope: item.scope,
      pinned: item.pinned,
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
      body: values.body,
      scope: values.scope ?? "ALL",
      pinned: !!values.pinned,
    };

    if (editing) {
      await updateNews({ id: editing.id, body: payload });
      message.success("Notícia actualizada.");
    } else {
      await createNews(payload);
      message.success("Notícia publicada com sucesso.");
    }

    refetch();
    onClose();
  };

  const handleDelete = async (id: string) => {
    await deleteNews(id);
    message.success("Notícia removida.");
    refetch();
  };

  return (
    <>
      <CustomBreadcrumb
        title="Notícias"
        items={[{ href: "/", title: <HomeOutlined /> }, { title: "Notícias" }]}
      />

      <Card
        title="Notícias publicadas"
        extra={
          !readOnly && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onOpenCreate}>
              Nova Notícia
            </Button>
          )
        }
      >
        <List
          loading={isPending}
          dataSource={news}
          locale={{ emptyText: "Sem notícias publicadas." }}
          renderItem={(item: any) => (
            <List.Item
              actions={
                readOnly
                  ? undefined
                  : [
                      <Button
                        key="edit"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => onOpenEdit(item)}
                      />,
                      <Popconfirm
                        key="del"
                        title="Remover esta notícia?"
                        okText="Sim"
                        cancelText="Não"
                        onConfirm={() => handleDelete(item.id)}
                      >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]
              }
            >
              <List.Item.Meta
                title={
                  <Space size={6}>
                    {item.pinned && (
                      <PushpinFilled style={{ color: "#4f3fc5", fontSize: 12 }} />
                    )}
                    <Text strong style={{ fontSize: 14 }}>
                      {item.title}
                    </Text>
                    <Tag color={SCOPE_COLOR[item.scope]} style={{ fontSize: 11 }}>
                      {SCOPE_LABEL[item.scope] ?? item.scope}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={2}>
                    <Text
                      type="secondary"
                      style={{ fontSize: 12 }}
                      ellipsis={{ tooltip: item.body }}
                    >
                      {item.body}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {item.author?.firstName} {item.author?.lastName} ·{" "}
                      {intl(item.publishedAt)}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Drawer
        title={editing ? "Editar Notícia" : "Nova Notícia"}
        open={open}
        size={480}
        placement="right"
        onClose={onClose}
        footer={
          <DrawerFooter
            okText={editing ? "Guardar" : "Publicar"}
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
            label="Título"
            name="title"
            required
            placeholder="Ex.: Início do ano lectivo 2026"
          />
          <Form.Item
            label="Conteúdo"
            name="body"
            rules={[{ required: true, message: "Escreva o conteúdo da notícia" }]}
          >
            <AntInput.TextArea
              placeholder="Escreva aqui o conteúdo da notícia..."
              rows={6}
            />
          </Form.Item>
          <Input.Select
            label="Visível para"
            name="scope"
            required
            options={SCOPE_OPTIONS}
            placeholder="Seleccione o público-alvo"
          />
          <Form.Item label="Fixar no topo" name="pinned" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
