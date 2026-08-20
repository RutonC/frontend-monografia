// pages/admin/encarregados/index.tsx
import {
  EyeOutlined,
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Drawer, Space, Tag, Typography } from "antd";
import { useState } from "react";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import Filters from "../../../components/Filters";
import ResponsiveTable from "../../../components/ResponsiveTable";
import { useFetch } from "../../../utils/fetch";

const { Text, Title } = Typography;

export default function Encarregados() {
  const [detail, setDetail] = useState<any>(null);

  const { data, isPending } = useFetch(["guardians"], "guardians");
  const guardians = data?.guardians ?? [];

  return (
    <>
      <CustomBreadcrumb
        title="Encarregados de Educação"
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Encarregados" },
        ]}
      />

      <Card title={<Filters onFiltersChange={() => {}} />}>
        <ResponsiveTable
          rowKey="id"
          loading={isPending}
          dataSource={guardians}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 12 }}
          columns={[
            {
              title: "Encarregado",
              render: (_, r: any) => (
                <Space>
                  <Avatar src={r.user?.avatar} shape="square">
                    {r.user?.firstName?.[0]}
                  </Avatar>
                  <div>
                    <Text style={{ fontSize: 13 }}>
                      {r.user?.firstName} {r.user?.lastName}
                    </Text>
                    <br />
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, fontFamily: "monospace" }}
                    >
                      {r.user?.identifier}
                    </Text>
                  </div>
                </Space>
              ),
            },
            {
              title: "Contacto",
              render: (_, r: any) => (
                <Space orientation="vertical" size={0}>
                  <Text style={{ fontSize: 12 }}>
                    <PhoneOutlined style={{ marginRight: 4 }} />
                    {r.user?.phoneNumber ?? "—"}
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    <MailOutlined style={{ marginRight: 4 }} />
                    {r.user?.email ?? "—"}
                  </Text>
                </Space>
              ),
            },
            {
              title: "Relação",
              render: (_, r: any) => r.relation ?? "—",
            },
            {
              title: "Educandos",
              render: (_, r: any) => (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {r.students?.map((s: any) => (
                    <Tag
                      key={s.id}
                      color="blue"
                      style={{ fontSize: 11 }}
                      variant="outlined"
                    >
                      {s.user?.firstName} {s.user?.lastName}
                      {s.enrollment?.[0]?.level
                        ? ` — ${s.enrollment[0].level.name}`
                        : ""}
                    </Tag>
                  ))}
                  {(!r.students || r.students.length === 0) && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Sem educandos
                    </Text>
                  )}
                </div>
              ),
            },
            {
              title: "Estado",
              render: (_, r: any) => (
                <Tag
                  color={r.user?.status === "ACTIVE" ? "success" : "default"}
                  variant="outlined"
                >
                  {r.user?.status === "ACTIVE" ? "Activo" : r.user?.status}
                </Tag>
              ),
            },
            {
              title: "",
              fixed: "right",
              width: "6rem",
              render: (_, r: any) => (
                <Button icon={<EyeOutlined />} onClick={() => setDetail(r)}>
                  Ver
                </Button>
              ),
            },
          ]}
        />
      </Card>

      {/* Drawer de detalhe */}
      <Drawer
        title={`${detail?.user?.firstName ?? ""} ${detail?.user?.lastName ?? ""}`}
        open={!!detail}
        onClose={() => setDetail(null)}
        width={480}
        footer={null}
      >
        {detail && (
          <div>
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Card
                size="small"
                style={{
                  background: "var(--color-background-secondary)",
                  border: "none",
                }}
              >
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Identificador
                </Text>
                <div>
                  <Text code style={{ fontSize: 12 }}>
                    {detail.user?.identifier}
                  </Text>
                </div>
              </Card>
              <Card
                size="small"
                style={{
                  background: "var(--color-background-secondary)",
                  border: "none",
                }}
              >
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Contactos
                </Text>
                <div>
                  <Text style={{ fontSize: 13 }}>
                    📞 {detail.user?.phoneNumber ?? "—"}
                  </Text>
                  <br />
                  <Text style={{ fontSize: 13 }}>
                    ✉️ {detail.user?.email ?? "—"}
                  </Text>
                </div>
              </Card>
              <Card
                size="small"
                style={{
                  background: "var(--color-background-secondary)",
                  border: "none",
                }}
              >
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Relação com o(s) educando(s)
                </Text>
                <div>
                  <Tag>{detail.relation ?? "—"}</Tag>
                </div>
              </Card>

              <Title level={5} style={{ margin: "16px 0 8px" }}>
                Educandos ({detail.students?.length ?? 0})
              </Title>

              {detail.students?.map((s: any) => (
                <Card key={s.id} size="small">
                  <Space>
                    <Avatar src={s.user?.avatar} size="small">
                      {s.user?.firstName?.[0]}
                    </Avatar>
                    <div>
                      <Text style={{ fontSize: 13 }}>
                        {s.user?.firstName} {s.user?.lastName}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {s.enrollment?.[0]?.level?.name ?? "Sem classe"}
                        {s.enrollment?.[0]?.section
                          ? ` · ${s.enrollment[0].section.name}`
                          : ""}
                      </Text>
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>
          </div>
        )}
      </Drawer>
    </>
  );
}
