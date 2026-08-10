// pages/secretary/Dashboard.tsx
import {
  ClockCircleOutlined,
  CreditCardOutlined,
  FileExclamationOutlined,
} from "@ant-design/icons";
import type { ColumnConfig, LineConfig } from "@ant-design/plots";
import { Column, Line } from "@ant-design/plots";
import { Card, Col, Row, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import NewsFeed from "../../components/NewsFeed";
import { useFetch } from "../../utils/fetch";

const { Title, Text } = Typography;

function StatCard({
  icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      style={{ borderRadius: 12, cursor: onClick ? "pointer" : "default" }}
      styles={{ body: { padding: "20px 24px" } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            fontSize: 22,
          }}
        >
          {icon}
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {label}
          </Text>
          <div
            style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, color }}
          >
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function SecretaryDashboard() {
  const navigate = useNavigate();
  const { data, isPending } = useFetch(
    ["dashboard-secretary"],
    "dashboard/secretary",
  );

  const pendingEnrollments = data?.pendingEnrollments ?? 0;
  const incompleteRegistrations = data?.incompleteRegistrations ?? 0;
  const unconfirmedPayments = data?.unconfirmedPayments ?? 0;
  const enrollmentsByMonth = data?.enrollmentsByMonth ?? [];
  const occupancy = data?.occupancy ?? [];

  const occupancyData = occupancy.map((o: any) => ({
    section: o.section,
    rate: o.capacity > 0 ? Math.round((o.enrolled / o.capacity) * 100) : 0,
    enrolled: o.enrolled,
    capacity: o.capacity,
  }));

  const enrollmentTrendConfig: LineConfig = {
    data: enrollmentsByMonth,
    xField: "month",
    yField: "count",
    height: 300,
    point: { shape: "circle" },
  };

  const occupancyConfig: ColumnConfig = {
    data: occupancyData,
    xField: "section",
    yField: "rate",
    height: 300,
    style: { radiusTopLeft: 10, radiusTopRight: 10 },
    axis: { y: { title: "% ocupação" } },
    tooltip: {
      items: [
        (d: any) => ({ name: "Ocupação", value: `${d.rate}%` }),
        (d: any) => ({
          name: "Matriculados",
          value: `${d.enrolled}/${d.capacity}`,
        }),
      ],
    },
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0 }}>
          Painel da Secretária
        </Title>
        <Text type="secondary">
          {new Date().toLocaleDateString("pt-PT", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={8}>
          <StatCard
            icon={<ClockCircleOutlined />}
            label="Matrículas Pendentes"
            value={pendingEnrollments}
            color="#f59e0b"
            onClick={() => navigate("/secretary/inscricao/lista")}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            icon={<FileExclamationOutlined />}
            label="Registos Incompletos"
            value={incompleteRegistrations}
            color="#dc2626"
            onClick={() => navigate("/secretary/alunos")}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            icon={<CreditCardOutlined />}
            label="Pagamentos por Confirmar"
            value={unconfirmedPayments}
            color="#4f46e5"
            onClick={() => navigate("/secretary/pagamentos-por-confirmar")}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Novas Matrículas por Mês"
            style={{ borderRadius: 12 }}
            loading={isPending}
          >
            <Line {...enrollmentTrendConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Ocupação de Turmas vs Capacidade"
            style={{ borderRadius: 12 }}
            loading={isPending}
          >
            <Column {...occupancyConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Notícias" style={{ borderRadius: 12 }}>
            <NewsFeed limit={6} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
