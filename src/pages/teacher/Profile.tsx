import { HomeOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Tag, Typography } from "antd";
import { BiEditAlt, BiTrash } from "react-icons/bi";
import { useNavigate } from "react-router";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import styles from "./index.module.scss";
import TeacherTabs from "./tabs";

export default function TeacherProfile() {
  const navigate = useNavigate();
  return (
    <>
      <CustomBreadcrumb
        title="Perfil do Professor"
        items={[
          { title: <HomeOutlined /> },
          {
            href: "#",
            onClick: () => navigate("/professores"),
            title: "Professores",
          },
          { title: "Perfil do Professor" },
        ]}
      />
      <Row gutter={[16, 16]}>
        <Col md={5} lg={5} xl={5} sm={24} xs={24}>
          <div className={styles.imageContainer}>
            <img
              src="https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="profile-teacher"
              className={styles.profileImage}
            />
          </div>
        </Col>
        <Col md={19} lg={19} xl={19} sm={24} xs={24}>
          <Card
            className={styles.profileCard}
            title="Informações do Professor"
            extra={
              <Space>
                <Tag variant="outlined" color="success" className={styles.tag}>
                  Activo
                </Tag>
                <Button icon={<BiTrash />} danger>
                  Suspender
                </Button>
                <Button icon={<BiEditAlt />}>Editar</Button>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col md={12} lg={12} xl={12} sm={24}>
                <Space orientation="vertical" size="large">
                  <Space orientation="vertical" size="small">
                    <Typography.Title level={4}>
                      Edmilton Arnaldo Muende
                    </Typography.Title>
                    <Typography.Text>Professor de Matemática</Typography.Text>
                  </Space>
                  <Space orientation="vertical" size="small">
                    <Typography.Title level={4}>
                      Tipo de contracto:
                    </Typography.Title>
                    <Typography.Text>Permanente</Typography.Text>
                  </Space>
                  <Space orientation="vertical" size="small">
                    <Typography.Title level={4}>
                      Data de ingresso:
                    </Typography.Title>
                    <Typography.Text>Abril de 2023</Typography.Text>
                  </Space>
                </Space>
              </Col>
              <Col md={12} lg={12} xl={12} sm={24}>
                <Space orientation="vertical" size="large">
                  <Space orientation="vertical" size="small">
                    <Typography.Title level={4}>E-mail</Typography.Title>
                    <Typography.Text>
                      edmilton.muende@universidade.edu.mz
                    </Typography.Text>
                  </Space>
                  <Space orientation="vertical" size="small">
                    <Typography.Title level={4}>Contacto:</Typography.Title>
                    <Typography.Text>+258 84 123 456</Typography.Text>
                  </Space>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24}>
          <TeacherTabs />
        </Col>
      </Row>
    </>
  );
}
