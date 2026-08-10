import {
  ContactsOutlined,
  MoneyCollectOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ColumnConfig, PieConfig } from "@ant-design/plots";
import { Column, Pie } from "@ant-design/plots";
import { Card, Col, Flex, Layout, Row, Typography } from "antd";
import EventsCalendar from "../../../components/EventsCalendar";
import NewsFeed from "../../../components/NewsFeed";
import { useFetch } from "../../../utils/fetch";

function Dashboard() {
  const { data, isPending } = useFetch(["dashboard-admin"], "dashboard/admin");

  const totals = data?.totals ?? {
    students: 0,
    teachers: 0,
    employees: 0,
    activeEnrollments: 0,
  };
  const enrollmentsByLevel = data?.enrollmentsByLevel ?? [];
  const genderDistribution = data?.genderDistribution ?? [];
  const revenue = data?.revenue ?? { expected: 0, collected: 0, academicYear: null };
  const overdueByLevel = data?.overdueByLevel ?? [];

  const cardItemsInfo = [
    {
      id: "1",
      title: "Estudantes",
      numero: totals.students,
      icon: (
        <TeamOutlined
          style={{ padding: 10, backgroundColor: "#2294f565", borderRadius: 100, color: "#2294f5" }}
        />
      ),
    },
    {
      id: "2",
      title: "Professores",
      numero: totals.teachers,
      icon: (
        <ContactsOutlined
          style={{ padding: 10, backgroundColor: "#7415c865", borderRadius: 100, color: "#7415c8" }}
        />
      ),
    },
    {
      id: "3",
      title: "Funcionários",
      numero: totals.employees,
      icon: (
        <TeamOutlined
          style={{ padding: 10, backgroundColor: "#2294f565", borderRadius: 100, color: "#2294f5" }}
        />
      ),
    },
    {
      id: "4",
      title: "Matrículas Activas",
      numero: totals.activeEnrollments,
      icon: (
        <MoneyCollectOutlined
          style={{ padding: 10, backgroundColor: "#14d74f65", borderRadius: 100, color: "#14d74f" }}
        />
      ),
    },
  ];

  const enrollmentConfig: ColumnConfig = {
    data: enrollmentsByLevel,
    xField: "level",
    yField: "count",
    height: 320,
    style: { radiusTopLeft: 10, radiusTopRight: 10 },
  };

  const revenueConfig: ColumnConfig = {
    data: [
      { type: "Esperada", valor: revenue.expected },
      { type: "Cobrada", valor: revenue.collected },
    ],
    xField: "type",
    yField: "valor",
    colorField: "type",
    height: 320,
    style: { radiusTopLeft: 10, radiusTopRight: 10 },
  };

  const genderConfig: PieConfig = {
    data: genderDistribution,
    angleField: "count",
    colorField: "gender",
    innerRadius: 0.6,
    height: 320,
    legend: { color: { position: "right" } },
  };

  const overdueConfig: ColumnConfig = {
    data: overdueByLevel,
    xField: "level",
    yField: "count",
    height: 320,
    style: { radiusTopLeft: 10, radiusTopRight: 10, fill: "#dc2626" },
  };

  return (
    <Layout.Content>
      <Row gutter={[16, 16]}>
        {cardItemsInfo.map((card, index) => (
          <Col span={6} key={index}>
            <Card title={card.title} extra={card.icon}>
              <Flex>
                <Typography.Title level={3}>{card.numero}</Typography.Title>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
        <Col span={12}>
          <Card title="Matrículas por Classe" loading={isPending}>
            <Column {...enrollmentConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Alunos por Género" loading={isPending}>
            <Pie {...genderConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
        <Col span={12}>
          <Card
            title={`Receita ${revenue.academicYear ?? ""} — Esperada vs Cobrada`}
            loading={isPending}
          >
            <Column {...revenueConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Facturas em Atraso por Classe" loading={isPending}>
            <Column {...overdueConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
        <Col span={16}>
          <Card title="Quadro de Avisos">
            <NewsFeed limit={6} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Calendário de Eventos">
            <EventsCalendar />
          </Card>
        </Col>
      </Row>
    </Layout.Content>
  );
}

export default Dashboard;
