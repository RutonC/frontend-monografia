// configuracoes/trimestres/index.tsx
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import DrawerFooter from "@/components/DrawerFooter";
import { Input } from "@/components/Input";
import { useFetch, useMutationPatch, useMutationPost } from "@/utils/fetch";
import type { IAcademicYear, ITerm } from "@/utils/type";
import { HomeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Drawer,
  Form,
  InputNumber,
  Table,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { columns } from "./columns";

const { Text } = Typography;

function toPercentInput(v?: number) {
  return v !== undefined && v !== null ? Number(v) * 100 : undefined;
}
function toPercentPayload(v?: number) {
  return v !== undefined && v !== null ? v / 100 : undefined;
}

export default function Trimestres() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("Adicionar Trimestre");
  const [drawerBtnTitle, setDrawerBtnTitle] = useState("Adicionar");
  const [form] = Form.useForm();

  const { data, refetch } = useFetch(["terms"], "terms?limit=100");
  const { data: yearsData } = useFetch(["academics"], "academics");
  const yearOptions = (yearsData?.academicYear ?? []).map((y: IAcademicYear) => ({
    label: y.year,
    value: y.id,
  }));

  const { mutateAsync, isPending } = useMutationPost(["terms"], "terms");
  const { mutateAsyncPatch, isPending: isPendingUpdate } = useMutationPatch(
    ["terms"],
    "terms",
  );

  const onShow = () => {
    form.resetFields();
    setDrawerTitle("Adicionar Trimestre");
    setDrawerBtnTitle("Adicionar");
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const onEdit = (record: ITerm) => {
    setDrawerTitle(`Editar ${record.name}`);
    setDrawerBtnTitle("Actualizar");
    form.setFieldsValue({
      id: record.id,
      name: record.name,
      academicYearId: record.academicYearId,
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      endDate: record.endDate ? dayjs(record.endDate) : undefined,
      monthlyFee:
        record.monthlyFee !== undefined && record.monthlyFee !== null
          ? Number(record.monthlyFee)
          : undefined,
      gracePeriodDays: record.gracePeriodDays,
      lateFeeWeek1Percent: toPercentInput(record.lateFeeWeek1Percent),
      lateFeeWeek2Percent: toPercentInput(record.lateFeeWeek2Percent),
      lateFeeWeek3PlusPercent: toPercentInput(record.lateFeeWeek3PlusPercent),
    });
    setOpen(true);
  };

  const onSubmit = async (values: any) => {
    const payload = {
      name: values.name,
      academicYearId: values.academicYearId,
      startDate: values.startDate ? dayjs(values.startDate).toISOString() : undefined,
      endDate: values.endDate ? dayjs(values.endDate).toISOString() : undefined,
      monthlyFee: values.monthlyFee,
      gracePeriodDays: values.gracePeriodDays,
      lateFeeWeek1Percent: toPercentPayload(values.lateFeeWeek1Percent),
      lateFeeWeek2Percent: toPercentPayload(values.lateFeeWeek2Percent),
      lateFeeWeek3PlusPercent: toPercentPayload(values.lateFeeWeek3PlusPercent),
    };

    if (values.id) {
      await mutateAsyncPatch({ id: values.id, body: payload });
      message.success("Trimestre actualizado com sucesso!");
    } else {
      await mutateAsync(payload);
      message.success("Trimestre criado com sucesso!");
    }

    refetch();
    onClose();
  };

  return (
    <>
      <CustomBreadcrumb
        title="Trimestres"
        items={[
          { title: <HomeOutlined />, href: "/" },
          {
            title: "Configurações",
            href: "#",
            onClick: () => navigate("/configuracoes"),
          },
          { title: "Trimestres" },
        ]}
      />

      <Card
        title="Trimestres"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={onShow}>
            Novo Trimestre
          </Button>
        }
      >
        <Table<ITerm>
          rowKey="id"
          columns={columns({ onEdit })}
          dataSource={data?.terms ?? []}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
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
            onOk={() => form.validateFields().then((values) => onSubmit(values))}
            loading={isPending || isPendingUpdate}
            cancelText="Cancelar"
            onClose={onClose}
          />
        }
      >
        <Form form={form} name="term-form" layout="vertical">
          <Input.Id name="id" />
          <Input.Text
            label="Nome do trimestre"
            name="name"
            placeholder="Ex.: 1º Trimestre"
            required
          />
          <Input.Select
            label="Ano Lectivo"
            name="academicYearId"
            placeholder="Seleccione o ano lectivo"
            options={yearOptions}
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
              placeholder="Seleccione a data de início"
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
              placeholder="Seleccione a data de fim"
            />
          </Form.Item>

          <Divider />
          <Text strong style={{ display: "block", marginBottom: 12 }}>
            Mensalidade e multa
          </Text>

          <Form.Item label="Mensalidade (MZN)" name="monthlyFee">
            <InputNumber min={0} style={{ width: "100%" }} placeholder="Ex.: 4500" />
          </Form.Item>
          <Form.Item
            label="Dias de tolerância"
            name="gracePeriodDays"
            help="Em branco usa o valor por defeito das Definições da Escola."
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Multa — 1ª semana de atraso (%)"
            name="lateFeeWeek1Percent"
            help="Em branco usa o valor por defeito das Definições da Escola."
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Multa — 2ª semana de atraso (%)" name="lateFeeWeek2Percent">
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Multa — 3ª semana em diante (%)"
            name="lateFeeWeek3PlusPercent"
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
