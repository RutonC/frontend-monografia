// pages/guardian/Dashboard.tsx
import { useGuardianDashboard } from "@/hooks/useGuardian";
import {
  AlertOutlined,
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { LineConfig, PieConfig } from "@ant-design/plots";
import { Line, Pie } from "@ant-design/plots";
import {
  Avatar,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import NewsFeed from "@/components/NewsFeed";

export default function GuardianDashboard() {
  const navigate = useNavigate();
  const { data, isPending } = useGuardianDashboard();

  const {
    guardian,
    summary = [],
    totalStudents = 0,
    totalOverdue = 0,
    gradesTrend = [],
    paymentMethodBreakdown = [],
  } = data ?? {};

  const gradesTrendData = gradesTrend.flatMap((s: any) =>
    s.terms.map((t: any) => ({
      studentName: s.studentName,
      termName: t.termName,
      average: t.average,
    })),
  );
  const hasGradesTrend = gradesTrendData.length > 0;
  const hasPaymentBreakdown = paymentMethodBreakdown.length > 0;

  const gradesTrendConfig: LineConfig = {
    data: gradesTrendData,
    xField: "termName",
    yField: "average",
    colorField: "studentName",
    height: 280,
    point: { shape: "circle" },
    axis: { y: { title: "Média (0–20)" } },
  };

  const paymentMethodConfig: PieConfig = {
    data: paymentMethodBreakdown,
    angleField: "total",
    colorField: "method",
    innerRadius: 0.6,
    height: 280,
    legend: { color: { position: "right" } },
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Saudação */}
      {isPending ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <div style={{ marginBottom: 24 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Olá, {guardian?.firstName ?? "Encarregado"} 👋
          </Typography.Title>
          <Typography.Text type="secondary">
            Aqui encontra todos os dados dos seus educandos.
          </Typography.Text>
        </div>
      )}

      {/* Métricas rápidas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={6}>
          <Card
            size="small"
            style={{
              background: "var(--color-background-secondary)",
              border: "none",
            }}
          >
            <Statistic
              title="Educandos"
              value={totalStudents}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card
            size="small"
            style={{
              background: "var(--color-background-secondary)",
              border: "none",
            }}
          >
            <Statistic
              title="Propinas em atraso"
              value={totalOverdue}
              prefix="MZN"
              valueStyle={{ color: totalOverdue > 0 ? "#dc2626" : "inherit" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Cartões por educando */}
      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, display: "block", marginBottom: 12 }}
      >
        Os meus educandos
      </Typography.Text>

      <Row gutter={[16, 16]}>
        {isPending
          ? [1, 2].map((k) => (
              <Col key={k} xs={24} sm={12} md={8}>
                <Card size="small">
                  <Skeleton active avatar paragraph={{ rows: 3 }} />
                </Card>
              </Col>
            ))
          : summary.map((item) => (
              <Col key={item.student.id} xs={24} sm={12} md={8}>
                <Card
                  size="small"
                  hoverable
                  onClick={() =>
                    navigate(`/guardian/educandos/${item.student.id}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{ display: "flex", gap: 12, alignItems: "center" }}
                  >
                    <Avatar
                      src={item.student.avatar}
                      icon={<UserOutlined />}
                      size={44}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Typography.Text strong style={{ display: "block" }}>
                        {item.student.firstName} {item.student.lastName}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {item.enrollment?.level} · {item.enrollment?.section}
                      </Typography.Text>
                      <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
                        {item.financial.overdueCount > 0 && (
                          <Tag
                            color="error"
                            icon={<AlertOutlined />}
                            style={{ fontSize: 11 }}
                          >
                            {item.financial.overdueCount} propina
                            {item.financial.overdueCount > 1 ? "s" : ""} em
                            atraso
                          </Tag>
                        )}
                        {item.enrollment?.academicYear && (
                          <Tag
                            icon={<CalendarOutlined />}
                            style={{ fontSize: 11 }}
                          >
                            {item.enrollment.academicYear}
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
      </Row>

      {/* Gráficos */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Tendência de Médias por Educando" size="small">
            {hasGradesTrend ? (
              <Line {...gradesTrendConfig} />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Ainda sem trimestres com notas lançadas"
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Repartição por Método de Pagamento" size="small">
            {hasPaymentBreakdown ? (
              <Pie {...paymentMethodConfig} />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Ainda sem pagamentos confirmados"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Notícias */}
      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, display: "block", margin: "24px 0 12px" }}
      >
        Notícias
      </Typography.Text>
      <Card size="small">
        <NewsFeed limit={5} />
      </Card>
    </div>
  );
}
