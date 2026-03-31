import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Form, Space, Table } from "antd";
import { useState } from "react";
import DrawerFooter from "../../../../components/DrawerFooter";
import Filters from "../../../../components/Filters";
import { Input } from "../../../../components/Input";
import { useMainContext } from "../../../../context/main.context";
import {
  useFetch,
  useMutationPatch,
  useMutationPost,
} from "../../../../utils/fetch";
import type { ILevel } from "../../../../utils/type";
import { columns } from "./columns";

export default function Level() {
  const [open, setOpen] = useState<boolean>(false);
  const [drawerTitle, setDrawerTitle] = useState<string>(
    "Adicionar Nova Classe",
  );
  const [drawerBtnTitle, setDrawerBtnTitle] = useState<string>("Adicionar");
  const { message } = useMainContext();

  const [form] = Form.useForm();

  const { mutateAsync, isPending } = useMutationPost(["levels"], "level");
  const { mutateAsyncPatch, isPending: isPendingUpdate } = useMutationPatch(
    ["levels"],
    "level",
  );
  const { data, refetch } = useFetch(["level"], "level");

  const onShow = () => {
    setOpen(true);
    setDrawerBtnTitle("Adicionar");
    setDrawerTitle("Adicionar Nova Classe");
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };
  console.log(data);

  const onEdit = (values: any) => {
    console.log(values);
    setDrawerBtnTitle("Actualizar");
    setDrawerTitle("Editar a Classe");
    setOpen(true);
    form.setFieldsValue({
      id: values.id,
      name: values.name,
      status: {
        label: values.status ? "Activo" : "Desactivado",
        value: values.status,
      },
    });
  };

  const onAddNewLevel = (values: any) => {
    console.log(values);

    mutateAsync({
      name: values.name,
      status: values.status,
      description: "",
    }).then(() => {
      message.success("Classe criado com sucesso!");
      setOpen(false);
      refetch();
      form.resetFields();
    });
  };

  const onEditLevel = (values: any) => {
    console.log(values);
  };

  const onEnable = (values: any) => {
    mutateAsyncPatch({ id: values.id, body: { status: !values.status } }).then(
      (values) => {
        message.success(values.message);
        refetch();
      },
    );
  };

  const onFiltersChange = (filters: any) => {};

  return (
    <Card
      title={<Filters onFiltersChange={onFiltersChange} />}
      extra={
        <Space>
          <Button onClick={onShow} icon={<PlusOutlined />} />
        </Space>
      }
    >
      <Table<ILevel>
        key="id"
        columns={columns({ onEdit, onEnable, enableLoading: isPendingUpdate })}
        dataSource={data?.levels || []}
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
              form.validateFields().then((values) => {
                if (values.id) {
                  onEditLevel(values);
                } else {
                  onAddNewLevel(values);
                }
              })
            }
            loading={isPending}
            cancelText="Cancelar"
            onClose={onClose}
          />
        }
      >
        <Form form={form} name="level-form" layout="vertical">
          <Input.Id name="id" />
          <Input.Text label="Nome da Classe" required name="name" />
          <Input.Select
            label="Estado"
            required
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
