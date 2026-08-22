// pages/student/Assessments.tsx — Fase 10: calendário de avaliações
// agendadas pelo professor, distinto de "Boletim" (o resultado em si).
import { CalendarOutlined, HomeOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Row, Skeleton, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import AcademicYearSelect from "@/components/AcademicYearSelect";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { useMySchedule } from "@/hooks/useStudentSelf";
import { api } from "@/store/authStore";

const GRADE_TYPE_LABEL: Record<string, string> = {
  ACS1: "1ª Aval. Contínua",
  ACS2: "2ª Aval. Contínua",
  ACS3: "3ª Aval. Contínua",
  ACP1: "1ª Aval. c/ Prova",
  ACP2: "2ª Aval. c/ Prova",
};

function AssessmentCard({ a, past }: { a: any; past?: boolean }) {
  return (
    <Col xs={24} sm={12} md={8}>
      <Card size="small" style={{ opacity: past ? 0.6 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <Typography.Text strong style={{ display: "block", fontSize: 13 }}>
              {a.subject?.name}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {a.term?.name}
            </Typography.Text>
          </div>
          <Tag color={past ? "default" : "processing"}>
            {GRADE_TYPE_LABEL[a.type] ?? a.type}
          </Tag>
        </div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <CalendarOutlined style={{ color: "var(--color-text-secondary)" }} />
          <Typography.Text style={{ fontSize: 13 }}>
            {dayjs(a.date).format("DD/MM/YYYY")}
          </Typography.Text>
        </div>
        {a.description && (
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12, display: "block", marginTop: 6 }}
          >
            {a.description}
          </Typography.Text>
        )}
      </Card>
    </Col>
  );
}

export default function StudentAssessments() {
  const [academicYearId, setAcademicYearId] = useState<string | undefined>();
  const { data: scheduleData, isPending: schedulePending } = useMySchedule(academicYearId);
  const sectionId = (scheduleData as any)?.section?.id as string | undefined;
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!academicYearId && (scheduleData as any)?.academicYearId) {
      setAcademicYearId((scheduleData as any).academicYearId);
    }
  }, [academicYearId, scheduleData]);

  useEffect(() => {
    if (!sectionId) {
      setAssessments([]);
      return;
    }
    setLoading(true);
    api
      .get(`/assessments?sectionId=${sectionId}`)
      .then((res) => setAssessments(res.data?.assessments ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sectionId]);

  const isPending = schedulePending || loading;
  const today = dayjs().startOf("day");
  const upcoming = assessments.filter((a) => !dayjs(a.date).isBefore(today, "day"));
  const past = assessments.filter((a) => dayjs(a.date).isBefore(today, "day"));

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
          title="Avaliações"
          items={[{ href: "/student", title: <HomeOutlined /> }, { title: "Avaliações" }]}
        />
        <AcademicYearSelect value={academicYearId} onChange={setAcademicYearId} />
      </div>

      {isPending ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !assessments.length ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sem avaliações agendadas"
        />
      ) : (
        <div>
          {upcoming.length > 0 && (
            <>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 12 }}
              >
                Próximas avaliações
              </Typography.Text>
              <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
                {upcoming.map((a) => (
                  <AssessmentCard a={a} key={a.id} />
                ))}
              </Row>
            </>
          )}

          {past.length > 0 && (
            <>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 12 }}
              >
                Já realizadas
              </Typography.Text>
              <Row gutter={[12, 12]}>
                {past.map((a) => (
                  <AssessmentCard a={a} past key={a.id} />
                ))}
              </Row>
            </>
          )}
        </div>
      )}
    </>
  );
}
