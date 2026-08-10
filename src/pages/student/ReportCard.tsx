// pages/student/ReportCard.tsx — Boletim/Notas do próprio aluno
import { LockOutlined, HomeOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Row, Skeleton, Tag, Typography } from "antd";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { useMyGrades } from "@/hooks/useStudentSelf";
import { useAuthStore } from "@/store/authStore";
import { useFetch } from "@/utils/fetch";

const GRADE_TYPE_LABEL: Record<string, string> = {
  AC1: "Avaliação 1",
  AC2: "Avaliação 2",
  EXAM: "Exame",
  RETAKE: "Recurso",
};

function TermReportCard({
  studentId,
  termId,
  termName,
}: {
  studentId: string;
  termId: string;
  termName: string;
}) {
  const { data, isPending } = useFetch<{ reportCard?: any }>(
    ["report-card", studentId, termId],
    `students/${studentId}/report-card?termId=${termId}`,
  );

  if (isPending) return <Skeleton active paragraph={{ rows: 2 }} />;
  const card = data?.reportCard;
  if (!card) return null;

  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      title={`Boletim — ${termName}`}
      extra={
        card.termAverage !== null && (
          <Tag color={card.passed ? "success" : "error"}>
            Média: {card.termAverage.toFixed(1)} —{" "}
            {card.passed ? "Aprovado" : "Reprovado"}
          </Tag>
        )
      }
    >
      <Row gutter={[8, 8]}>
        {card.subjects.map((s: any) => (
          <Col key={s.subjectId} xs={12} sm={8} md={6}>
            <div style={{ textAlign: "center" }}>
              <Typography.Text
                style={{
                  fontSize: 11,
                  display: "block",
                  color: "var(--color-text-secondary)",
                }}
              >
                {s.subjectName}
              </Typography.Text>
              <Typography.Text
                strong
                style={{
                  fontSize: 16,
                  color:
                    s.average === null
                      ? "var(--color-text-secondary)"
                      : s.passed
                        ? "var(--color-text-success)"
                        : "var(--color-text-danger)",
                }}
              >
                {s.average === null ? "—" : s.average.toFixed(1)}
              </Typography.Text>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

export default function StudentReportCard() {
  const { user } = useAuthStore();
  const studentId = user?.id ?? "";
  const { data, isPending } = useMyGrades();

  return (
    <>
      <CustomBreadcrumb
        title="Boletim"
        items={[{ href: "/student", title: <HomeOutlined /> }, { title: "Boletim" }]}
      />

      {isPending ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (data as any)?.blocked ? (
        <Card
          style={{
            background: "var(--color-background-danger)",
            border: "0.5px solid var(--color-border-danger)",
            textAlign: "center",
          }}
        >
          <LockOutlined style={{ fontSize: 28, color: "var(--color-text-danger)" }} />
          <Typography.Title level={5} style={{ color: "var(--color-text-danger)", marginTop: 12 }}>
            Boletim bloqueado por mensalidades em atraso
          </Typography.Title>
          <Typography.Text style={{ display: "block", marginBottom: 4 }}>
            {(data as any).reason}
          </Typography.Text>
          {typeof (data as any).overdueTotal === "number" && (
            <Typography.Text strong>
              Total em atraso: MZN {(data as any).overdueTotal.toFixed(2)}
            </Typography.Text>
          )}
        </Card>
      ) : !Object.keys((data as any)?.grouped ?? {}).length ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sem notas registadas"
        />
      ) : (
        <div>
          {Array.from(
            new Map(
              ((data as any)?.grades ?? [])
                .filter((g: any) => g.termId && g.term?.name)
                .map((g: any) => [g.termId, g.term.name]),
            ).entries(),
          ).map(([termId, termName]) => (
            <TermReportCard
              key={termId as string}
              studentId={studentId}
              termId={termId as string}
              termName={termName as string}
            />
          ))}

          {Object.entries((data as any).grouped as Record<string, any>).map(
            ([term, subjects]) => (
              <Card key={term} title={term} size="small" style={{ marginBottom: 16 }}>
                {Object.entries(subjects as Record<string, any[]>).map(
                  ([subject, grades]) => (
                    <div key={subject} style={{ marginBottom: 16 }}>
                      <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
                        {subject}
                      </Typography.Text>
                      <Row gutter={[8, 8]}>
                        {grades.map((g: any) => (
                          <Col key={g.id} xs={12} sm={6}>
                            <Card
                              size="small"
                              style={{
                                background: "var(--color-background-secondary)",
                                border: "none",
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 22,
                                  fontWeight: 500,
                                  color:
                                    g.value >= 10
                                      ? "var(--color-text-success)"
                                      : "var(--color-text-danger)",
                                }}
                              >
                                {g.value.toFixed(1)}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                                {GRADE_TYPE_LABEL[g.type] ?? g.type}
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ),
                )}
              </Card>
            ),
          )}
        </div>
      )}
    </>
  );
}
