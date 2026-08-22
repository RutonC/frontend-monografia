// pages/student/ReportCard.tsx — Boletim/Notas do próprio aluno
import { LockOutlined, HomeOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Row, Select, Skeleton, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AcademicYearSelect from "@/components/AcademicYearSelect";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { useMyGrades } from "@/hooks/useStudentSelf";
import { useAuthStore } from "@/store/authStore";
import { useFetch } from "@/utils/fetch";

const GRADE_TYPE_LABEL: Record<string, string> = {
  ACS1: "1ª Aval. Contínua",
  ACS2: "2ª Aval. Contínua",
  ACS3: "3ª Aval. Contínua",
  ACP1: "1ª Aval. c/ Prova",
  ACP2: "2ª Aval. c/ Prova",
};

function GradeChip({ grade }: { grade: any }) {
  return (
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
            grade.value >= 10
              ? "var(--color-text-success)"
              : "var(--color-text-danger)",
        }}
      >
        {grade.value.toFixed(1)}
      </div>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
        {GRADE_TYPE_LABEL[grade.type] ?? grade.type}
      </div>
    </Card>
  );
}

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
  const location = useLocation();
  const studentId = user?.id ?? "";
  const [academicYearId, setAcademicYearId] = useState<string | undefined>();
  // Atalho "Ver Notas" a partir de /student/disciplinas (Fase 9) — já
  // chega com a disciplina pré-seleccionada.
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    (location.state as { subjectName?: string } | null)?.subjectName,
  );
  const { data, isPending } = useMyGrades(undefined, academicYearId);

  // Primeira carga (sem ano escolhido) — adopta o ano que o backend usou
  // por defeito (o activo) para pré-seleccionar o filtro.
  useEffect(() => {
    if (!academicYearId && (data as any)?.academicYearId) {
      setAcademicYearId((data as any).academicYearId);
    }
  }, [academicYearId, data]);

  const grouped = (data as any)?.grouped as
    | Record<string, Record<string, any[]>>
    | undefined;
  const subjectOptions = grouped
    ? Array.from(
        new Set(Object.values(grouped).flatMap((s) => Object.keys(s))),
      ).sort()
    : [];

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
          title="Boletim"
          items={[{ href: "/student", title: <HomeOutlined /> }, { title: "Boletim" }]}
        />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {subjectOptions.length > 0 && (
            <Select
              value={selectedSubject}
              onChange={setSelectedSubject}
              allowClear
              placeholder="Todas as disciplinas"
              style={{ minWidth: 200 }}
              options={subjectOptions.map((s) => ({ value: s, label: s }))}
            />
          )}
          <AcademicYearSelect value={academicYearId} onChange={setAcademicYearId} />
        </div>
      </div>

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

          {selectedSubject ? (
            // Uma disciplina — lado a lado por trimestre, para
            // acompanhar a evolução ao longo do ano.
            <Card
              title={`Evolução — ${selectedSubject}`}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[12, 12]}>
                {Object.entries((data as any).grouped as Record<string, any>).map(
                  ([term, subjects]) => {
                    const grades = (subjects as Record<string, any[]>)[
                      selectedSubject
                    ];
                    return (
                      <Col key={term} xs={24} sm={12} md={8}>
                        <Card size="small" title={term}>
                          {!grades?.length ? (
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              Sem notas lançadas.
                            </Typography.Text>
                          ) : (
                            <Row gutter={[8, 8]}>
                              {grades.map((g: any) => (
                                <Col key={g.id} xs={12}>
                                  <GradeChip grade={g} />
                                </Col>
                              ))}
                            </Row>
                          )}
                        </Card>
                      </Col>
                    );
                  },
                )}
              </Row>
            </Card>
          ) : (
            Object.entries((data as any).grouped as Record<string, any>).map(
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
                              <GradeChip grade={g} />
                            </Col>
                          ))}
                        </Row>
                      </div>
                    ),
                  )}
                </Card>
              ),
            )
          )}
        </div>
      )}
    </>
  );
}
