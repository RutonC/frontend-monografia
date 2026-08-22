// pages/student/Attendance.tsx — Assiduidade do próprio aluno
import { HomeOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Progress, Row, Skeleton, Tag, Timeline, Typography } from "antd";
import { useEffect, useState } from "react";
import AcademicYearSelect from "@/components/AcademicYearSelect";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { useMyAttendance } from "@/hooks/useStudentSelf";
import { intlDate } from "@/utils/intl";

const STATUS_COLOR: Record<string, string> = {
  PRESENT: "success",
  ABSENT: "error",
  LATE: "warning",
  JUSTIFIED: "processing",
};

const STATUS_LABEL: Record<string, string> = {
  PRESENT: "Presente",
  ABSENT: "Falta",
  LATE: "Atraso",
  JUSTIFIED: "Justificada",
};

export default function StudentAttendance() {
  const [academicYearId, setAcademicYearId] = useState<string | undefined>();
  const { data, isPending } = useMyAttendance(undefined, academicYearId);
  const stats = (data as any)?.stats ?? [];
  const attendance = (data as any)?.attendance ?? [];

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
          title="Assiduidade"
          items={[{ href: "/student", title: <HomeOutlined /> }, { title: "Assiduidade" }]}
        />
        <AcademicYearSelect value={academicYearId} onChange={setAcademicYearId} />
      </div>

      {isPending ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !attendance.length ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sem registos de assiduidade"
        />
      ) : (
        <div>
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12, display: "block", marginBottom: 12 }}
          >
            Taxa de presença por disciplina
          </Typography.Text>
          <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
            {stats.map((s: any) => (
              <Col key={s.subject} xs={24} sm={12} md={8}>
                <Card size="small">
                  <Typography.Text strong style={{ fontSize: 13 }}>
                    {s.subject}
                  </Typography.Text>
                  <Progress
                    percent={s.presenceRate}
                    size="small"
                    strokeColor={
                      s.presenceRate >= 75
                        ? "#059669"
                        : s.presenceRate >= 50
                          ? "#d97706"
                          : "#dc2626"
                    }
                    style={{ margin: "6px 0 4px" }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      fontSize: 11,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <span>✅ {s.present} pres.</span>
                    <span>❌ {s.absent} falt.</span>
                    {s.late > 0 && <span>⏰ {s.late} atr.</span>}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Typography.Text
            type="secondary"
            style={{ fontSize: 12, display: "block", marginBottom: 12 }}
          >
            Últimos registos
          </Typography.Text>
          <Timeline
            items={attendance.slice(0, 20).map((a: any) => ({
              color:
                a.status === "PRESENT" ? "green" : a.status === "ABSENT" ? "red" : "orange",
              children: (
                <div>
                  <Tag color={STATUS_COLOR[a.status]} style={{ fontSize: 11 }}>
                    {STATUS_LABEL[a.status]}
                  </Tag>
                  <Typography.Text style={{ fontSize: 12, marginLeft: 6 }}>
                    {a.subject?.name}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                    {intlDate(a.date)}
                  </Typography.Text>
                  {a.remarks && (
                    <Typography.Text italic type="secondary" style={{ fontSize: 11 }}>
                      {a.remarks}
                    </Typography.Text>
                  )}
                </div>
              ),
            }))}
          />
        </div>
      )}
    </>
  );
}
