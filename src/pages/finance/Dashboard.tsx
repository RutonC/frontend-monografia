// pages/finance/Dashboard.tsx
import {
  AlertOutlined,
  CreditCardOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import type { ColumnConfig, LineConfig, PieConfig } from "@ant-design/plots";
import { Column, Line, Pie } from "@ant-design/plots";
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

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 0 }).format(n);

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const { data, isPending } = useFetch(
    ["dashboard-finance"],
    "dashboard/finance",
  );

  const totalRevenue = data?.totalRevenue ?? 0;
  const totalOverdue = data?.totalOverdue ?? 0;
  const pendingConfirmation = data?.pendingConfirmation ?? 0;
  const revenueTrend = data?.revenueTrend ?? [];
  const byMethod = data?.byMethod ?? [];
  const finesTrend = data?.finesTrend ?? [];

  const revenueTrendConfig: LineConfig = {
    data: revenueTrend,
    xField: "month",
    yField: "total",
    height: 300,
    point: { shape: "circle" },
  };

  const methodConfig: PieConfig = {
    data: byMethod,
    angleField: "total",
    colorField: "method",
    innerRadius: 0.6,
    height: 300,
    legend: { color: { position: "right" } },
  };

  const finesConfig: ColumnConfig = {
    data: finesTrend,
    xField: "month",
    yField: "total",
    height: 300,
    style: { radiusTopLeft: 10, radiusTopRight: 10, fill: "#dc2626" },
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0 }}>
          Painel do Financeiro
        </Title>
        <Text type="secondary">
          {data?.academicYear ? `Ano lectivo ${data.academicYear}` : ""}
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={8}>
          <StatCard
            icon={<DollarCircleOutlined />}
            label="Receita Confirmada"
            value={`MZN ${fmt(totalRevenue)}`}
            color="#16a34a"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            icon={<AlertOutlined />}
            label="Total em Atraso"
            value={`MZN ${fmt(totalOverdue)}`}
            color="#dc2626"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            icon={<CreditCardOutlined />}
            label="Pagamentos por Confirmar"
            value={pendingConfirmation}
            color="#4f46e5"
            onClick={() => navigate("/finance/pagamentos-por-confirmar")}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Tendência de Cobrança"
            style={{ borderRadius: 12 }}
            loading={isPending}
          >
            <Line {...revenueTrendConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Repartição por Método de Pagamento"
            style={{ borderRadius: 12 }}
            loading={isPending}
          >
            <Pie {...methodConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Multas Aplicadas ao Longo do Tempo"
            style={{ borderRadius: 12 }}
            loading={isPending}
          >
            <Column {...finesConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Notícias" style={{ borderRadius: 12 }}>
            <NewsFeed limit={6} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
