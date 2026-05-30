// pages/guardian/Dashboard.tsx
import { useGuardianDashboard } from "@/hooks/useGuardian";
import {
  AlertOutlined,
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Card,
  Col,
  Row,
  Skeleton,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";

export default function GuardianDashboard() {
  const navigate = useNavigate();
  const { data, isPending } = useGuardianDashboard();

  const {
    guardian,
    summary = [],
    totalStudents = 0,
    totalOverdue = 0,
  } = data ?? {};

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
    </div>
  );
}
