import {
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { BiBuilding, BiEditAlt, BiTrash } from "react-icons/bi";
import { useNavigate, useParams } from "react-router";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { useTeacherProfile } from "../../hooks/useTeacher";
import styles from "./index.module.scss";
import TeacherTabs from "./tabs";

export default function TeacherProfile() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerRect, setHeaderRect] = useState({
    height: 0,
    left: 0,
    width: 0,
  });

  const { data, isPending } = useTeacherProfile(slug ?? "");

  const teacher = data?.teacher;
  const employee = teacher?.employee;
  const fullName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "—";

  const statusColor: Record<string, string> = {
    ACTIVE: "success",
    INACTIVE: "error",
    SUSPENDED: "warning",
  };

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver(() => {
      const rect = headerRef.current!.getBoundingClientRect();
      setHeaderRect({
        height: rect.height,
        left: rect.left,
        width: rect.width,
      });
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

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
          { title: fullName },
        ]}
        onPrev
      />

      <Row gutter={[16, 16]}>
        {/* Avatar */}
        <Col md={5} lg={5} xl={5} sm={24} xs={24} ref={headerRef}>
          <div className={styles.imageContainer}>
            {isPending ? (
              <Skeleton.Avatar
                active
                size={160}
                shape="square"
                style={{
                  height: headerRect.height,
                  width: headerRect.width - 20,
                }}
              />
            ) : (
              <Avatar
                src={teacher?.avatar}
                icon={!teacher?.avatar && <UserOutlined />}
                size={160}
                shape="square"
                className={styles.profileImage}
                style={{
                  width: "100%",
                  height: headerRect.height,
                }}
              />
            )}
          </div>
        </Col>

        {/* Info principal */}
        <Col md={19} lg={19} xl={19} sm={24} xs={24}>
          <Card
            className={styles.profileCard}
            title="Informações do Professor"
            extra={
              isPending ? null : (
                <Space>
                  <Tag
                    variant="outlined"
                    color={
                      statusColor[teacher?.status ?? "ACTIVE"] ?? "success"
                    }
                    className={styles.tag}
                  >
                    {teacher?.status === "ACTIVE"
                      ? "Activo"
                      : teacher?.status === "SUSPENDED"
                        ? "Suspenso"
                        : "Inactivo"}
                  </Tag>
                  <Button icon={<BiTrash />} danger>
                    Suspender
                  </Button>
                  <Button
                    icon={<BiEditAlt />}
                    onClick={() => navigate(`/professores/editar/${slug}`)}
                  >
                    Editar
                  </Button>
                </Space>
              )
            }
          >
            {isPending ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <Row gutter={[16, 16]}>
                <Col md={12} lg={12} xl={12} sm={24}>
                  <Space direction="vertical" size="large">
                    <div>
                      <Typography.Title level={4} style={{ margin: 0 }}>
                        {fullName}
                      </Typography.Title>
                      <Typography.Text type="secondary">
                        {employee?.position ?? "Professor"}
                        {employee?.teacher?.specialization
                          ? ` · ${employee.teacher.specialization}`
                          : ""}
                      </Typography.Text>
                    </div>

                    <Space>
                      <BiBuilding />
                      <Typography.Text>
                        {employee?.department?.name ?? "—"}
                      </Typography.Text>
                    </Space>

                    <div>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        Nível académico
                      </Typography.Text>
                      <br />
                      <Typography.Text strong>
                        {employee?.academicLevel ?? "—"}
                      </Typography.Text>
                    </div>
                  </Space>
                </Col>

                <Col md={12} lg={12} xl={12} sm={24}>
                  <Space direction="vertical" size="large">
                    <Space>
                      <MailOutlined />
                      <Typography.Text>{teacher?.email ?? "—"}</Typography.Text>
                    </Space>

                    <Space>
                      <PhoneOutlined />
                      <Typography.Text>
                        {teacher?.phoneNumber ?? "—"}
                      </Typography.Text>
                    </Space>

                    <div>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        Identificador
                      </Typography.Text>
                      <br />
                      <Typography.Text code copyable style={{ fontSize: 13 }}>
                        {teacher?.identifier ?? "—"}
                      </Typography.Text>
                    </div>
                  </Space>
                </Col>
              </Row>
            )}
          </Card>
        </Col>

        {/* Tabs */}
        <Col span={24}>
          <TeacherTabs teacher={teacher} isPending={isPending} />
        </Col>
      </Row>
    </>
  );
}
