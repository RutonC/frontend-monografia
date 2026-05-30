// classes/level/index.tsx
import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Form, Space, Table, message } from "antd";
import { useState } from "react";
import DrawerFooter from "../../../../components/DrawerFooter";
import Filters from "../../../../components/Filters";
import { Input } from "../../../../components/Input";
import {
  useFetch,
  useMutationPatch,
  useMutationPost,
} from "../../../../utils/fetch";
import type { ILevel } from "../../../../utils/type";
import { columns } from "./columns";

export default function Level() {
  const [open, setOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("Adicionar Nova Classe");
  const [drawerBtnTitle, setDrawerBtnTitle] = useState("Adicionar");
  const [form] = Form.useForm();

  const { data, refetch } = useFetch(["levels"], "levels");
  const { mutateAsync, isPending } = useMutationPost(["levels"], "levels");
  const { mutateAsyncPatch, isPending: isPendingUpdate } = useMutationPatch(
    ["levels"],
    "levels",
  );

  const onShow = () => {
    form.resetFields();
    setDrawerTitle("Adicionar Nova Classe");
    setDrawerBtnTitle("Adicionar");
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const onEdit = (record: ILevel) => {
    setDrawerTitle(`Editar Classe: ${record.name}`);
    setDrawerBtnTitle("Actualizar");
    form.setFieldsValue({
      id: record.id,
      name: record.name,
      description: (record as any).description ?? "",
      status: record.status,
    });
    setOpen(true);
  };

  const onEnable = (record: ILevel) => {
    mutateAsyncPatch({
      id: record.id,
      body: { status: !record.status },
    }).then((res) => {
      message.success(res?.message ?? "Estado actualizado.");
      refetch();
    });
  };

  const onSubmit = async (values: any) => {
    if (values.id) {
      await mutateAsyncPatch({
        id: values.id,
        body: {
          name: values.name,
          description: values.description,
          status: values.status,
        },
      });
      message.success("Classe actualizada com sucesso!");
    } else {
      await mutateAsync({
        name: values.name,
        description: values.description ?? "",
        status: values.status ?? true,
      });
      message.success("Classe criada com sucesso!");
    }
    refetch();
    onClose();
  };

  return (
    <Card
      title={<Filters onFiltersChange={() => {}} />}
      extra={
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={onShow}>
            Nova Classe
          </Button>
        </Space>
      }
    >
      <Table<ILevel>
        rowKey="id"
        columns={columns({ onEdit, onEnable, enableLoading: isPendingUpdate })}
        dataSource={data?.levels ?? []}
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={drawerTitle}
        open={open}
        size={478}
        placement="right"
        onClose={onClose}
        footer={
          <DrawerFooter
            okText={drawerBtnTitle}
            onOk={() =>
              form.validateFields().then((values) => onSubmit(values))
            }
            loading={isPending || isPendingUpdate}
            cancelText="Cancelar"
            onClose={onClose}
          />
        }
      >
        <Form form={form} name="level-form" layout="vertical">
          <Input.Id name="id" />
          <Input.Text
            label="Nome da Classe"
            required
            name="name"
            placeholder="Ex.: 8.ª Classe"
          />
          <Input.Text
            label="Descrição"
            name="description"
            placeholder="Descrição opcional"
          />
          <Input.Select
            label="Estado"
            name="status"
            placeholder="Selecione o estado"
            options={[
              { label: "Activo", value: true },
              { label: "Desactivo", value: false },
            ]}
          />
        </Form>
      </Drawer>
    </Card>
  );
}
