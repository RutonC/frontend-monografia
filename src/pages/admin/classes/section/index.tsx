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
import type { ILevel, ISection } from "../../../../utils/type";
import { columns } from "./columns";

export default function Section() {
  const [open, setOpen] = useState<boolean>(false);
  const [drawerTitle, setDrawerTitle] = useState<string>(
    "Adicionar Nova Classe",
  );
  const [drawerBtnTitle, setDrawerBtnTitle] = useState<string>("Adicionar");
  const { message } = useMainContext();

  const [form] = Form.useForm();

  const { mutateAsync, isPending } = useMutationPost(["sections"], "sections");
  const { mutateAsyncPatch, isPending: isPendingUpdate } = useMutationPatch(
    ["sections"],
    "sections",
  );
  const { data, refetch } = useFetch(["sections"], "sections");
  const { data: levelsData } = useFetch(["levels"], "level");
  const onShow = () => {
    setOpen(true);
    setDrawerBtnTitle("Adicionar");
    setDrawerTitle("Adicionar Nova Turma");
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const onEdit = (values: any) => {
    setDrawerBtnTitle("Actualizar");
    setDrawerTitle("Editar a Turma");
    setOpen(true);
    form.setFieldsValue({
      id: values.id,
      name: values.name,
      capacity: values.capacity,
      levelId: values.levelId,
      status: {
        label: values.status ? "Activo" : "Desactivado",
        value: values.status,
      },
    });
  };

  const onAddNewSection = (values: any) => {
    mutateAsync({
      name: values.name,
      levelId: values.levelId,
      capacity: Number(values.capacity),
      status: values.status,
    }).then(() => {
      message.success("Turma criada com sucesso!");
      setOpen(false);
      refetch();
      form.resetFields();
    });
  };

  const onEditSection = (values: any) => {
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
      <Table<ISection>
        key="id"
        columns={columns({ onEdit, onEnable, enableLoading: isPendingUpdate })}
        dataSource={data?.sections || []}
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
                  onEditSection(values);
                } else {
                  onAddNewSection(values);
                }
              })
            }
            loading={isPending}
            cancelText="Cancelar"
            onClose={onClose}
          />
        }
      >
        <Form form={form} name="section-form" layout="vertical">
          <Input.Id name="id" />
          <Input.Text label="Nome da Turma" required name="name" />
          <Input.Select
            label="Selecione a Classe"
            required
            name="levelId"
            placeholder="Selecione a classe"
            options={
              levelsData?.levels?.map((level: ILevel) => ({
                label: level.name,
                value: level.id,
              })) || []
            }
          />
          <Input.Text
            label="Capacidade da turma"
            required
            name="capacity"
            pattern={/^\d+$/}
            patternMessage="Capacidade de alunos inválido, tente novamente"
          />
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
