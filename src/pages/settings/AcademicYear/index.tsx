// configuracoes/ano-lectivo/index.tsx
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import DrawerFooter from "@/components/DrawerFooter";
import { Input } from "@/components/Input";
import { useFetch, useMutationPatch, useMutationPost } from "@/utils/fetch";
import type { IAcademicYear } from "@/utils/type";
import { HomeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Table,
  message
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { columns } from "./columns";

export default function AnoLectivo() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("Adicionar Ano Lectivo");
  const [drawerBtnTitle, setDrawerBtnTitle] = useState("Adicionar");
  const [form] = Form.useForm();

  const { data, refetch } = useFetch(["academics"], "academics");
  const { mutateAsync, isPending } = useMutationPost(
    ["academics"],
    "academics",
  );
  const { mutateAsyncPatch, isPending: isPendingUpdate } = useMutationPatch(
    ["academics"],
    "academics",
  );

  const onShow = () => {
    form.resetFields();
    setDrawerTitle("Adicionar Ano Lectivo");
    setDrawerBtnTitle("Adicionar");
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const onEdit = (record: IAcademicYear) => {
    setDrawerTitle(`Editar Ano Lectivo ${record.year}`);
    setDrawerBtnTitle("Actualizar");
    form.setFieldsValue({
      id: record.id,
      year: record.year,
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      endDate: record.endDate ? dayjs(record.endDate) : undefined,
      active: record.active,
    });
    setOpen(true);
  };

  const onEnable = (record: IAcademicYear) => {
    mutateAsyncPatch({
      id: record.id,
      body: { active: !record.active },
    }).then(() => {
      message.success(
        record.active ? "Ano lectivo desactivado." : "Ano lectivo activado.",
      );
      refetch();
    });
  };

  const onSubmit = async (values: any) => {
    const payload = {
      year: values.year,
      startDate: dayjs(values.startDate).toISOString(),
      endDate: dayjs(values.endDate).toISOString(),
      active: values.active ?? false,
    };

    if (values.id) {
      await mutateAsyncPatch({ id: values.id, body: payload });
      message.success("Ano lectivo actualizado com sucesso!");
    } else {
      await mutateAsync(payload);
      message.success("Ano lectivo criado com sucesso!");
    }

    refetch();
    onClose();
  };

  return (
    <>
      <CustomBreadcrumb
        title="Ano Lectivo"
        items={[
          { title: <HomeOutlined />, href: "/" },
          {
            title: "Configurações",
            href: "#",
            onClick: () => navigate("/configuracoes"),
          },
          { title: "Ano Lectivo" },
        ]}
      />

      <Card
        title="Anos Lectivos"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={onShow}>
            Novo Ano Lectivo
          </Button>
        }
      >
        <Table<IAcademicYear>
          rowKey="id"
          columns={columns({
            onEdit,
            onEnable,
            enableLoading: isPendingUpdate,
          })}
          dataSource={data?.academicYear ?? []}
          pagination={{ pageSize: 10 }}
        />
      </Card>

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
        <Form form={form} name="academic-year-form" layout="vertical">
          <Input.Id name="id" />
          <Input.Text
            label="Ano Lectivo"
            name="year"
            placeholder="Ex.: 2026"
            required
          />
          <Form.Item
            label="Data de Início"
            name="startDate"
            rules={[{ required: true, message: "Campo obrigatório" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Selecione a data de início"
            />
          </Form.Item>
          <Form.Item
            label="Data de Fim"
            name="endDate"
            rules={[{ required: true, message: "Campo obrigatório" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Selecione a data de fim"
            />
          </Form.Item>
          <Input.Select
            label="Estado"
            name="active"
            placeholder="Selecione o estado"
            options={[
              { label: "Activo", value: true },
              { label: "Inactivo", value: false },
            ]}
          />
        </Form>
      </Drawer>
    </>
  );
}
