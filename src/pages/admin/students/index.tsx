import { HomeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Table } from "antd";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { useFetch } from "../../../utils/fetch";
import type { IStudent } from "../../../utils/type";
import { columns } from "./columns";

function Students() {
  const navigate = useNavigate();
  const { data, isPending } = useFetch(["students"], "students");
  const onEdit = () => {};
  const onDelete = () => {};
  console.log({ data });
  return (
    <>
      <CustomBreadcrumb
        title="Alunos"
        items={[
          {
            href: "/",
            title: <HomeOutlined />,
          },
          { title: "Alunos" },
        ]}
      />
      <Card
        title="Alunos"
        extra={
          <Button onClick={() => navigate("/alunos/adicionar-novo-aluno")}>
            <PlusOutlined />
          </Button>
        }
      >
        <Table<IStudent>
          key={"id"}
          columns={columns({ onEdit, onDelete })}
          loading={isPending}
          dataSource={data?.students || []}
        />
      </Card>
    </>
  );
}

export default Students;
