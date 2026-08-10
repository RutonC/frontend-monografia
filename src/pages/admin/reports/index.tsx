import {
  BarChartOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  HomeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Tabs, Typography } from "antd";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import AttendanceReport from "./AttendanceReport";
import GradeReport from "./GradeReport";

const { Title, Text } = Typography;

// ─────────────────────────────────────────────────────────────────
//  Cards de categoria (apenas decorativos no topo)
// ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    key: "grades",
    icon: <BarChartOutlined style={{ fontSize: 28, color: "#4f46e5" }} />,
    title: "Relatório de Notas",
    description: "Ficha anual · Pauta trimestral · Boletim por aluno",
    color: "#4f46e5",
    bg: "#f0eeff",
  },
  {
    key: "attendance",
    icon: <CheckCircleOutlined style={{ fontSize: 28, color: "#16a34a" }} />,
    title: "Relatório de Assiduidade",
    description: "Presenças, ausências e faltas justificadas por turma",
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    key: "financial",
    icon: <CreditCardOutlined style={{ fontSize: 28, color: "#f59e0b" }} />,
    title: "Relatório Financeiro",
    description: "Propinas pagas, em atraso e dívidas — em breve",
    color: "#f59e0b",
    bg: "#fffbeb",
    disabled: true,
  },
  {
    key: "enrollments",
    icon: <TeamOutlined style={{ fontSize: 28, color: "#0ea5e9" }} />,
    title: "Relatório de Matrículas",
    description: "Inscrições activas, canceladas e por turma",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    disabled: true,
  },
];

// ─────────────────────────────────────────────────────────────────
//  Componente placeholder para relatórios ainda não implementados
// ─────────────────────────────────────────────────────────────────

function ComingSoon({ title }: { title: string }) {
  return (
    <Card style={{ borderRadius: 12, textAlign: "center", padding: "60px 0" }}>
      <Text type="secondary" style={{ fontSize: 15 }}>
        🚧 {title} — em desenvolvimento
      </Text>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Export principal
// ─────────────────────────────────────────────────────────────────

export default function Reports() {
  return (
    <>
      <CustomBreadcrumb
        title="Relatórios"
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Relatórios" },
        ]}
      />

      {/* Cards de visão geral */}
      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        {CATEGORIES.map((c) => (
          <Col xs={24} sm={12} lg={6} key={c.key}>
            <Card
              style={{
                borderRadius: 12,
                background: c.bg,
                border: `1px solid ${c.color}22`,
                opacity: c.disabled ? 0.55 : 1,
              }}
              styles={{ body: { padding: "16px 20px" } }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: `${c.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {c.icon}
                </div>
                <div>
                  <Text strong style={{ fontSize: 14, display: "block" }}>
                    {c.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {c.description}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tabs com os relatórios reais */}
      <Tabs
        type="card"
        size="large"
        items={[
          {
            key: "grades",
            label: (
              <span>
                <BarChartOutlined /> Notas
              </span>
            ),
            children: (
              <div style={{ paddingTop: 16 }}>
                <Title level={4} style={{ margin: "0 0 16px 0" }}>
                  Relatório de Notas
                </Title>
                <GradeReport />
              </div>
            ),
          },
          {
            key: "attendance",
            label: (
              <span>
                <CheckCircleOutlined /> Assiduidade
              </span>
            ),
            children: (
              <div style={{ paddingTop: 16 }}>
                <Title level={4} style={{ margin: "0 0 16px 0" }}>
                  Relatório de Assiduidade
                </Title>
                <AttendanceReport />
              </div>
            ),
          },
          {
            key: "financial",
            label: (
              <span>
                <CreditCardOutlined /> Financeiro
              </span>
            ),
            disabled: true,
            children: <ComingSoon title="Relatório Financeiro" />,
          },
          {
            key: "enrollments",
            label: (
              <span>
                <TeamOutlined /> Matrículas
              </span>
            ),
            disabled: true,
            children: <ComingSoon title="Relatório de Matrículas" />,
          },
        ]}
      />
    </>
  );
}
