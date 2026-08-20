// pages/admin/inscricao/lista.tsx
import {
  EyeOutlined,
  HomeOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { useFetch } from "../../../utils/fetch";
import { intlDate } from "../../../utils/intl";
import type { IAcademicYear, IEnrollment, ILevel } from "../../../utils/type";

const STATUS_COLOR: Record<string, string> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "error",
  CANCELLED: "default",
};

const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Aprovado",
  PENDING: "Pendente",
  REJECTED: "Reprovado",
  CANCELLED: "Cancelado",
};

export default function ListaInscricoes() {
  const navigate = useNavigate();
  const [filterYear, setFilterYear] = useState<string | undefined>();
  const [filterLevel, setFilterLevel] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  const { data: yearsData } = useFetch(["academics"], "academics");
  const { data: levelsData } = useFetch(["levels"], "levels");

  const queryStr = [
    filterYear ? `academicYearId=${filterYear}` : "",
    filterLevel ? `levelId=${filterLevel}` : "",
    filterStatus ? `status=${filterStatus}` : "",
  ]
    .filter(Boolean)
    .join("&");

  const { data, isPending } = useFetch(
    ["enrollments", filterYear ?? "", filterLevel ?? "", filterStatus ?? ""],
    `enrollments?${queryStr}`,
  );

  const yearOptions =
    yearsData?.academicYear?.map((y: IAcademicYear) => ({
      label: `${y.year}${y.active ? " ✓" : ""}`,
      value: y.id,
    })) ?? [];

  const levelOptions =
    levelsData?.levels?.map((l: ILevel) => ({
      label: l.name,
      value: l.id,
    })) ?? [];

  return (
    <>
      <CustomBreadcrumb
        title="Inscrições"
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Inscrições" },
        ]}
      />

      <Card
        title={
          <Space wrap>
            <Select
              placeholder="Ano lectivo"
              options={yearOptions}
              onChange={setFilterYear}
              allowClear
              style={{ width: 150 }}
            />
            <Select
              placeholder="Classe"
              options={levelOptions}
              onChange={setFilterLevel}
              allowClear
              style={{ width: 140 }}
            />
            <Select
              placeholder="Estado"
              onChange={setFilterStatus}
              allowClear
              style={{ width: 140 }}
              options={[
                { label: "Aprovado", value: "APPROVED" },
                { label: "Pendente", value: "PENDING" },
                { label: "Reprovado", value: "REJECTED" },
                { label: "Cancelado", value: "CANCELLED" },
              ]}
            />
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Actualizar inscrição existente">
              <Button
                icon={<SwapOutlined />}
                onClick={() => navigate("/inscricao/actualizar")}
              >
                Actualizar
              </Button>
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/inscricao/nova")}
            >
              Nova Inscrição
            </Button>
          </Space>
        }
      >
        <Table<IEnrollment>
          rowKey="id"
          loading={isPending}
          dataSource={data?.enrollments ?? []}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 12 }}
          columns={[
            {
              title: "Aluno",
              render: (_, r: any) => (
                <Space>
                  <Avatar shape="square" src={r.student?.user?.avatar}>
                    {r.student?.user?.firstName?.[0]}
                  </Avatar>
                  <div>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {r.student?.user?.firstName} {r.student?.user?.lastName}
                    </Typography.Text>
                    <br />
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: 11, fontFamily: "monospace" }}
                    >
                      {r.student?.user?.identifier}
                    </Typography.Text>
                  </div>
                </Space>
              ),
            },
            {
              title: "Classe",
              render: (_, r: any) => r.level?.name ?? "—",
            },
            {
              title: "Turma",
              render: (_, r: any) => r.section?.name ?? "—",
            },
            {
              title: "Ano Lectivo",
              render: (_, r: any) => r.academicYear?.year ?? "—",
            },
            {
              title: "Estado",
              render: (_, r: any) => (
                <Tag
                  color={STATUS_COLOR[r.status] ?? "default"}
                  variant="outlined"
                >
                  {STATUS_LABEL[r.status] ?? r.status}
                </Tag>
              ),
            },
            {
              title: "Propinas",
              render: (_, r: any) => {
                const pending = r.invoices?.length ?? 0;
                return pending > 0 ? (
                  <Tag color="warning" variant="outlined">
                    {pending} pendente{pending > 1 ? "s" : ""}
                  </Tag>
                ) : (
                  <Tag color="success" variant="outlined">
                    Em dia
                  </Tag>
                );
              },
            },
            {
              title: "Data",
              render: (_, r: any) =>
                r.createdAt ? intlDate(r.createdAt) : "—",
            },
            {
              title: "Acções",
              fixed: "right",
              width: "8rem",
              render: (_, r: any) => (
                <Space>
                  <Tooltip title="Ver detalhes">
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/inscricao/${r.id}`)}
                    />
                  </Tooltip>
                  <Tooltip title="Actualizar">
                    <Button
                      icon={<SwapOutlined />}
                      onClick={() => navigate("/inscricao/actualizar")}
                    />
                  </Tooltip>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
