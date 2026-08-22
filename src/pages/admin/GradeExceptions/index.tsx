// pages/admin/GradeExceptions/index.tsx — Fase 4: excepções ao bloqueio
// de trimestre (RN — professor só lança/edita notas do trimestre
// corrente). Restrito a Admin/Secretaria (ver lib/ability.ts).
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import DrawerFooter from "@/components/DrawerFooter";
import { Input } from "@/components/Input";
import { useAuthStore } from "@/store/authStore";
import { useFetch, useMutationDel, useMutationPost } from "@/utils/fetch";
import { intlDate } from "@/utils/intl";
import type { IEmployee, IStudent, ISubject, ITerm } from "@/utils/type";
import { HomeOutlined, LockOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Input as AntInput,
  Popconfirm,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

interface GradeException {
  id: string;
  untilDate: string;
  reason?: string;
  teacher?: { employee?: { user?: { firstName?: string; lastName?: string } } };
  student?: { user?: { firstName?: string; lastName?: string; identifier?: string } };
  subject?: { name: string };
  term?: { name: string; academicYear?: { year: string } };
}

function personName(u?: { firstName?: string; lastName?: string }) {
  return `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim() || "—";
}

export default function GradeExceptions() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSecretary = user?.type === "SECRETARY";
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, refetch } = useFetch(["grade-exceptions"], "grade-exceptions?limit=50");
  const { data: teachersData } = useFetch(["teachers"], "teachers");
  const { data: studentsData } = useFetch(["students"], "students");
  const { data: subjectsData } = useFetch(["subjects"], "subjects");
  const { data: termsData } = useFetch(["terms-all"], "terms?limit=100");

  const { mutateAsync, isPending } = useMutationPost(
    ["grade-exceptions"],
    "grade-exceptions",
  );
  const { mutateAsyncDel, isPending: revoking } = useMutationDel(
    ["grade-exceptions"],
    "grade-exceptions",
  );

  const teacherOptions =
    teachersData?.employees?.map((e: IEmployee) => ({
      label: personName(e.user),
      value: e.teacher?.id ?? e.id,
    })) ?? [];

  const studentOptions =
    studentsData?.students?.map((s: IStudent) => ({
      label: `${personName(s.user)}${s.user?.identifier ? ` (${s.user.identifier})` : ""}`,
      value: s.id,
    })) ?? [];

  const subjectOptions =
    subjectsData?.subjects?.map((s: ISubject) => ({
      label: s.name,
      value: s.id,
    })) ?? [];

  const termOptions =
    termsData?.terms?.map((t: ITerm) => ({
      label: `${t.name}${t.academicYear?.year ? ` — ${t.academicYear.year}` : ""}`,
      value: t.id,
    })) ?? [];

  const onShow = () => {
    form.resetFields();
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const onSubmit = async (values: any) => {
    await mutateAsync({
      teacherId: values.teacherId,
      studentId: values.studentId,
      subjectId: values.subjectId,
      termId: values.termId,
      untilDate: dayjs(values.untilDate).toISOString(),
      reason: values.reason,
    });
    message.success("Excepção concedida com sucesso.");
    refetch();
    onClose();
  };

  const onRevoke = async (record: GradeException) => {
    await mutateAsyncDel(record.id);
    message.success("Excepção revogada.");
    refetch();
  };

  const columns: ColumnsType<GradeException> = [
    {
      title: "Professor",
      key: "teacher",
      render: (_, r) => personName(r.teacher?.employee?.user),
    },
    {
      title: "Aluno",
      key: "student",
      render: (_, r) => (
        <div>
          <div>{personName(r.student?.user)}</div>
          {r.student?.user?.identifier && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {r.student.user.identifier}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Disciplina",
      key: "subject",
      render: (_, r) => r.subject?.name ?? "—",
    },
    {
      title: "Trimestre",
      key: "term",
      render: (_, r) =>
        `${r.term?.name ?? "—"}${r.term?.academicYear?.year ? ` (${r.term.academicYear.year})` : ""}`,
    },
    {
      title: "Válida até",
      key: "untilDate",
      render: (_, r) => {
        const expired = new Date(r.untilDate) < new Date();
        return (
          <Tag color={expired ? "default" : "success"}>{intlDate(r.untilDate)}</Tag>
        );
      },
    },
    {
      title: "Motivo",
      dataIndex: "reason",
      key: "reason",
      render: (v) => v || <Text type="secondary">—</Text>,
    },
    {
      title: "Acções",
      key: "actions",
      fixed: "right",
      width: "6rem",
      render: (_, record) => (
        <Popconfirm
          title="Revogar esta excepção?"
          okText="Sim"
          cancelText="Não"
          onConfirm={() => onRevoke(record)}
        >
          <Button danger size="small" loading={revoking}>
            Revogar
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <CustomBreadcrumb
        title="Excepções de Trimestre"
        items={
          isSecretary
            ? [
                { title: <HomeOutlined />, href: "/secretary" },
                { title: "Excepções" },
              ]
            : [
                { title: <HomeOutlined />, href: "/" },
                {
                  title: "Notas",
                  href: "#",
                  onClick: () => navigate("/notas"),
                },
                { title: "Excepções" },
              ]
        }
      />

      <Card
        title={
          <span>
            <LockOutlined style={{ marginRight: 8 }} />
            Excepções ao bloqueio de trimestre
          </span>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={onShow}>
            Nova Excepção
          </Button>
        }
      >
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Por defeito, um professor só lança/edita notas do trimestre corrente.
          Conceda aqui uma excepção pontual — para um professor, aluno,
          disciplina e trimestre específicos — quando for preciso corrigir um
          caso de um trimestre já fechado.
        </Text>
        <Table<GradeException>
          rowKey="id"
          columns={columns}
          dataSource={data?.exceptions ?? []}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <Drawer
        title="Nova Excepção"
        open={open}
        size={478}
        placement="right"
        onClose={onClose}
        footer={
          <DrawerFooter
            okText="Conceder"
            onOk={() => form.validateFields().then((values) => onSubmit(values))}
            loading={isPending}
            cancelText="Cancelar"
            onClose={onClose}
          />
        }
      >
        <Form form={form} name="grade-exception-form" layout="vertical">
          <Input.Select
            label="Professor"
            name="teacherId"
            placeholder="Seleccione o professor"
            options={teacherOptions}
            search
            required
          />
          <Input.Select
            label="Aluno"
            name="studentId"
            placeholder="Seleccione o aluno"
            options={studentOptions}
            search
            required
          />
          <Input.Select
            label="Disciplina"
            name="subjectId"
            placeholder="Seleccione a disciplina"
            options={subjectOptions}
            search
            required
          />
          <Input.Select
            label="Trimestre"
            name="termId"
            placeholder="Seleccione o trimestre"
            options={termOptions}
            search
            required
          />
          <Form.Item
            label="Válida até"
            name="untilDate"
            rules={[{ required: true, message: "Campo obrigatório" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Seleccione a data-limite"
              disabledDate={(d) => d.isBefore(dayjs(), "day")}
            />
          </Form.Item>
          <Form.Item label="Motivo (opcional)" name="reason">
            <AntInput.TextArea
              rows={3}
              placeholder="Ex.: aluno perdeu o teste por doença, professor precisa de lançar a recuperação."
            />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
