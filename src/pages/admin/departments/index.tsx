import { HomeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Modal, Table, type TableProps } from "antd";
import { useState } from "react";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { Input } from "../../../components/Input";
import {
  useFetch,
  useMutationPatch,
  useMutationPost,
} from "../../../utils/fetch";
import type { IDepartment } from "../../../utils/type";
import { columns } from "./columns";

type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];

function Departments() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [btnTitle, setBtnTitle] = useState<string>("");
  const [form] = Form.useForm();

  const { mutateAsync, isPending } = useMutationPost(
    ["departments"],
    "departments",
  );

  const { mutateAsyncPatch } = useMutationPatch(["departments"], "departments");

  const {
    data: allDepartments,
    refetch,
    isPending: loading,
  } = useFetch(["departments"], "departments");

  const onShowModal = () => {
    setTitle("Adicionar novo Departamento");
    setBtnTitle("Adicionar");
    setOpen(true);
  };

  const onAddNewDepartment = async (values: any) => {
    mutateAsync({ name: values.name }).then(() => {
      refetch();
      setOpen(false);
      form.resetFields();
    });
  };

  const onEdit = (values: any) => {
    form.setFieldsValue({ id: values?.id });
    form.setFieldsValue({ name: values?.name });
    setTitle("Editando departamento");
    setBtnTitle("Actualizar");
    setOpen(true);
  };

  const onEditDepartment = async (values: any) => {
    mutateAsyncPatch({ id: values.id, body: { name: values.name } }).then(
      () => {
        refetch();
        setOpen(false);
        form.resetFields();
      },
    );
  };

  const onDelete = (values: any) => {
    console.log(values);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<IDepartment> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <>
      <CustomBreadcrumb
        items={[
          {
            href: "/",
            title: <HomeOutlined />,
          },
          { title: "Departamentos" },
        ]}
        title="Departamentos"
      />
      <Card
        title="Informações dos departamentos"
        extra={
          <Button onClick={onShowModal}>
            <PlusOutlined />
          </Button>
        }
      >
        <Table<IDepartment>
          rowKey="id"
          rowSelection={rowSelection}
          loading={loading}
          columns={columns({ onEdit, onDelete })}
          onRow={(record) => {
            return {
              onClick: () => onEdit(record),
            };
          }}
          dataSource={allDepartments?.departments || []}
          pagination={{ pageSize: 7 }}
        />
      </Card>

      <Modal
        open={open}
        title={title}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        okButtonProps={{
          loading: isPending,
        }}
        okText={btnTitle}
        cancelText="Cancelar"
        onOk={() =>
          form.validateFields().then((values) => {
            if (values.id) {
              onEditDepartment(values);
            } else {
              onAddNewDepartment(values);
            }
          })
        }
      >
        <Form name="form_department" layout="vertical" form={form}>
          <Input.Id label="ID" name="id" />
          <Input.Text
            label="Nome do departamento"
            name="name"
            placeholder="Digite o nome do departamento"
            required
            message="Campo obrigatório"
          />
        </Form>
      </Modal>
    </>
  );
}

export default Departments;
