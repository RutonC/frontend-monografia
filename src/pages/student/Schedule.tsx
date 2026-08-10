// pages/student/Schedule.tsx — Horário do próprio aluno
import { CalendarOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Card, Col, Empty, Row, Skeleton, Space, Tag, Typography } from "antd";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { useMySchedule } from "@/hooks/useStudentSelf";

export default function StudentSchedule() {
  const { data, isPending } = useMySchedule();
  const schedule = (data as any)?.schedule ?? [];
  const section = (data as any)?.section;

  return (
    <>
      <CustomBreadcrumb
        title="Horário"
        items={[{ href: "/student", title: <HomeOutlined /> }, { title: "Horário" }]}
      />

      {isPending ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !schedule.length ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sem horário disponível" />
      ) : (
        <div>
          {section && (
            <Card
              size="small"
              style={{
                marginBottom: 16,
                background: "var(--color-background-secondary)",
                border: "none",
              }}
            >
              <Space>
                <CalendarOutlined />
                <Typography.Text>
                  <strong>{section.name}</strong> · {section.level} · {section.academicYear}
                </Typography.Text>
              </Space>
            </Card>
          )}

          <Row gutter={[12, 12]}>
            {schedule.map((ts: any) => (
              <Col key={`${ts.teacherId}-${ts.subjectId}`} xs={24} sm={12}>
                <Card size="small">
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Avatar
                      src={ts.teacher?.employee?.user?.avatar}
                      icon={<UserOutlined />}
                      size={36}
                    />
                    <div>
                      <Typography.Text strong style={{ display: "block", fontSize: 13 }}>
                        {ts.subject?.name}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {ts.teacher?.employee?.user?.firstName}{" "}
                        {ts.teacher?.employee?.user?.lastName}
                      </Typography.Text>
                    </div>
                    <Tag style={{ marginLeft: "auto" }}>{ts.subject?.code}</Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </>
  );
}
