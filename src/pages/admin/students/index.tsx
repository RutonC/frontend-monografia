// pages/admin/students/index.tsx
import { HomeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Table, message } from "antd";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import Filters, { type FiltersState } from "../../../components/Filters";
import { useFetch, useMutationDel } from "../../../utils/fetch";
import type { IStudent } from "../../../utils/type";
import { columns } from "./columns";

export default function Students() {
  const navigate = useNavigate();

  const {
    data,
    isPending: loading,
    refetch,
  } = useFetch(["students"], "students");

  const { mutateAsyncDel } = useMutationDel(["students"], "students");

  const onEdit = (record: IStudent) => {
    navigate(`/alunos/editar/${record.id}`);
  };

  const onDelete = async (record: IStudent) => {
    await mutateAsyncDel(record.id);
    message.success("Aluno desactivado com sucesso.");
    refetch();
  };

  const onFiltersChange = (_: FiltersState) => {};

  return (
    <>
      <CustomBreadcrumb
        title="Alunos"
        items={[{ href: "/", title: <HomeOutlined /> }, { title: "Alunos" }]}
      />

      <Card
        title={<Filters onFiltersChange={onFiltersChange} />}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/alunos/adicionar-novo-aluno")}
          >
            Novo Aluno
          </Button>
        }
      >
        <Table<IStudent>
          rowKey="id"
          columns={columns({ onEdit, onDelete })}
          loading={loading}
          dataSource={data?.students ?? []}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          onRow={(record) => ({
            onClick: () => navigate(`/alunos/editar/${record.id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>
    </>
  );
}
