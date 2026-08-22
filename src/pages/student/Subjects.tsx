// pages/student/Subjects.tsx — Disciplinas da turma corrente do aluno
// (Fase 9). Reaproveita o mesmo endpoint que Horário já usa
// (students/:id/schedule → na prática, as TeacherSection da matrícula
// activa) — só muda a apresentação, com atalhos para Notas/Horário.
import { BarChartOutlined, CalendarOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Col, Empty, Row, Skeleton, Space, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AcademicYearSelect from "@/components/AcademicYearSelect";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { useMySchedule } from "@/hooks/useStudentSelf";

export default function StudentSubjects() {
  const navigate = useNavigate();
  const [academicYearId, setAcademicYearId] = useState<string | undefined>();
  const { data, isPending } = useMySchedule(academicYearId);
  const subjects = (data as any)?.schedule ?? [];
  const section = (data as any)?.section;

  useEffect(() => {
    if (!academicYearId && (data as any)?.academicYearId) {
      setAcademicYearId((data as any).academicYearId);
    }
  }, [academicYearId, data]);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <CustomBreadcrumb
          title="Disciplinas"
          items={[{ href: "/student", title: <HomeOutlined /> }, { title: "Disciplinas" }]}
        />
        <AcademicYearSelect value={academicYearId} onChange={setAcademicYearId} />
      </div>

      {isPending ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !subjects.length ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sem disciplinas disponíveis"
        />
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
              <Typography.Text>
                <strong>{section.name}</strong> · {section.level} · {section.academicYear}
              </Typography.Text>
            </Card>
          )}

          <Row gutter={[12, 12]}>
            {subjects.map((ts: any) => (
              <Col key={`${ts.teacherId}-${ts.subjectId}`} xs={24} sm={12} md={8}>
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
                    {ts.subject?.code && (
                      <Tag style={{ marginLeft: "auto" }}>{ts.subject.code}</Tag>
                    )}
                  </div>
                  <Space style={{ marginTop: 12 }}>
                    <Button
                      size="small"
                      icon={<BarChartOutlined />}
                      onClick={() =>
                        navigate("/student/boletim", {
                          state: { subjectName: ts.subject?.name },
                        })
                      }
                    >
                      Notas
                    </Button>
                    <Button
                      size="small"
                      icon={<CalendarOutlined />}
                      onClick={() => navigate("/student/horario")}
                    >
                      Horário
                    </Button>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </>
  );
}
