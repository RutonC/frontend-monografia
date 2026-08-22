// pages/admin/students/index.tsx
import { HomeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import Filters, { type FiltersState } from "../../../components/Filters";
import ResponsiveTable from "../../../components/ResponsiveTable";
import { useAuthStore } from "../../../store/authStore";
import { useFetch, useMutationDel } from "../../../utils/fetch";
import type { IStudent } from "../../../utils/type";
import { columns } from "./columns";

// Partilhado entre Admin (/alunos/...) e Secretaria (/secretary/alunos/...)
// — sem isto, os links de criar/editar da Secretaria caem num RoleRoute
// só de Admin e voltam-na em silêncio ao painel dela.
export default function Students() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSecretary = user?.type === "SECRETARY";
  const base = isSecretary ? "/secretary/alunos" : "/alunos";

  const {
    data,
    isPending: loading,
    refetch,
  } = useFetch(["students"], "students");

  const { mutateAsyncDel } = useMutationDel(["students"], "students");

  const onEdit = (record: IStudent) => {
    navigate(`${base}/editar/${record.id}`);
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
        items={[
          { href: isSecretary ? "/secretary" : "/", title: <HomeOutlined /> },
          { title: "Alunos" },
        ]}
      />

      <Card
        title={<Filters onFiltersChange={onFiltersChange} />}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`${base}/adicionar-novo-aluno`)}
          >
            Novo Aluno
          </Button>
        }
      >
        <ResponsiveTable<IStudent>
          rowKey="id"
          columns={columns({ onEdit, onDelete })}
          loading={loading}
          dataSource={data?.students ?? []}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          onRow={(record) => ({
            onClick: () => navigate(`${base}/editar/${record.id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>
    </>
  );
}
