import { Card, Col, Row, Space, Typography } from "antd";

export default function Personal() {
  return (
    <Row gutter={[16, 16]}>
      <Col md={12} lg={12} xl={12} sm={24} xs={24}>
        <Card>
          <Space orientation="vertical" size="large">
            <Space orientation="vertical" size="small">
              <Typography.Title level={4}>Data de Nascimento</Typography.Title>
              <Typography.Text>15 de Abril de 1985</Typography.Text>
            </Space>
            <Space orientation="vertical" size="small">
              <Typography.Title level={4}>
                Experiência Profissional
              </Typography.Title>
              <Typography.Text>5 anos</Typography.Text>
            </Space>
          </Space>
        </Card>
      </Col>
      <Col md={12} lg={12} xl={12} sm={24} xs={24}>
        <Card>
          <Space orientation="vertical" size="large">
            <Space orientation="vertical" size="small">
              <Typography.Title level={4}>Nacionalidade</Typography.Title>
              <Typography.Text>Moçambicana</Typography.Text>
            </Space>
            <Space orientation="vertical" size="small">
              <Typography.Title level={4}>Endereço</Typography.Title>
              <Typography.Text>Rua Alfredo Lawley, Matacuane</Typography.Text>
            </Space>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
