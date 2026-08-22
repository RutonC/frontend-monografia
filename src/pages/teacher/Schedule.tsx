// pages/teacher/Schedule.tsx
import { Card, Col, Empty, Row, Select, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import AcademicYearSelect from "../../components/AcademicYearSelect";
import PageLoader from "../../components/PageLoader";
import { api } from "../../store/authStore";

const { Title, Text } = Typography;

const DAYS = [
  { key: "MONDAY", label: "Segunda-feira" },
  { key: "TUESDAY", label: "Terça-feira" },
  { key: "WEDNESDAY", label: "Quarta-feira" },
  { key: "THURSDAY", label: "Quinta-feira" },
  { key: "FRIDAY", label: "Sexta-feira" },
  { key: "SATURDAY", label: "Sábado" },
];

const TODAY_KEY = (() => {
  const d = new Date().getDay();
  return [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ][d];
})();

const PALETTE = [
  "#4f46e5",
  "#0ea5e9",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#be185d",
];

interface Schedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject?: { id: string; name: string };
  section?: { id: string; name: string };
  teacher?: {
    employee?: {
      user?: { firstName?: string; lastName?: string };
    };
  };
}

interface Section {
  id: string;
  name: string;
}

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function ScheduleBlock({ sch, color }: { sch: Schedule; color: string }) {
  return (
    <div
      style={{
        background: `${color}14`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
        padding: "10px 12px",
        marginBottom: 8,
      }}
    >
      <Text
        strong
        style={{ color, display: "block", fontSize: 13, lineHeight: 1.3 }}
      >
        {sch.subject?.name ?? "Sem disciplina"}
      </Text>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {sch.startTime} – {sch.endTime}
      </Text>
      {sch.section && (
        <div style={{ marginTop: 4 }}>
          <Tag
            style={{
              margin: 0,
              fontSize: 11,
              background: `${color}20`,
              borderColor: `${color}40`,
              color,
            }}
          >
            {sch.section.name}
          </Tag>
        </div>
      )}
    </div>
  );
}

export default function TeacherSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selSection, setSelSection] = useState<string | "all">("all");
  const [loading, setLoading] = useState(true);
  const [academicYearId, setAcademicYearId] = useState<string | undefined>();

  useEffect(() => {
    setLoading(true);
    const yearQuery = academicYearId ? `?academicYearId=${academicYearId}` : "";
    Promise.all([
      api.get(`/teacher/me/schedule${yearQuery}`),
      api.get(`/teacher/me/sections${yearQuery}`),
    ])
      .then(([schRes, secRes]) => {
        setSchedules(schRes.data?.schedules ?? []);
        setSections(secRes.data?.sections ?? []);
        // Primeira carga (sem ano escolhido) — adopta o ano que o
        // backend usou por defeito (o activo) para pré-seleccionar o filtro.
        if (!academicYearId && schRes.data?.academicYearId) {
          setAcademicYearId(schRes.data.academicYearId);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [academicYearId]);

  // Cor estável por disciplina
  const subjectColorMap = new Map<string, string>();
  schedules.forEach((s) => {
    if (s.subject && !subjectColorMap.has(s.subject.id)) {
      subjectColorMap.set(
        s.subject.id,
        PALETTE[subjectColorMap.size % PALETTE.length],
      );
    }
  });

  const filtered =
    selSection === "all"
      ? schedules
      : schedules.filter((s) => s.section?.id === selSection);

  // Agrupa por dia e ordena por hora
  const byDay = new Map<string, Schedule[]>();
  DAYS.forEach(({ key }) => byDay.set(key, []));
  filtered.forEach((s) => {
    const list = byDay.get(s.dayOfWeek);
    if (list) list.push(s);
  });
  byDay.forEach((list) =>
    list.sort((a, b) => timeToMin(a.startTime) - timeToMin(b.startTime)),
  );

  const total = filtered.length;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Horário Semanal
          </Title>
          <Text type="secondary">
            {total} aula{total !== 1 ? "s" : ""} por semana
          </Text>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <AcademicYearSelect value={academicYearId} onChange={setAcademicYearId} />
          <Select
            value={selSection}
            onChange={setSelSection}
            style={{ width: 220 }}
            options={[
              { value: "all", label: "Todas as turmas" },
              ...sections.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
      {/* Legenda de disciplinas */}
      {subjectColorMap.size > 0 && (
        <Card
          size="small"
          style={{ borderRadius: 10, marginBottom: 20 }}
          styles={{ body: { padding: "12px 16px" } }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[...subjectColorMap.entries()].map(([subId, color]) => {
              const name = schedules.find((s) => s.subject?.id === subId)
                ?.subject?.name;
              return (
                <Tag
                  key={subId}
                  style={{
                    background: `${color}18`,
                    borderColor: `${color}50`,
                    color,
                    margin: 0,
                  }}
                >
                  {name}
                </Tag>
              );
            })}
          </div>
        </Card>
      )}

      {/* Grelha de dias */}
      {total === 0 ? (
        <Card style={{ borderRadius: 12 }}>
          <Empty
            description="Sem aulas no horário."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {DAYS.map(({ key, label }) => {
            const daySchedules = byDay.get(key) ?? [];
            const isToday = key === TODAY_KEY;

            return (
              <Col xs={24} sm={12} md={8} lg={4} key={key}>
                <Card
                  size="small"
                  style={{
                    borderRadius: 12,
                    height: "100%",
                    border: isToday ? "2px solid #4f46e5" : undefined,
                    boxShadow: isToday ? "0 0 0 3px #4f46e510" : undefined,
                  }}
                  title={
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontWeight: isToday ? 700 : 600,
                          color: isToday ? "#4f46e5" : undefined,
                          fontSize: 13,
                        }}
                      >
                        {label}
                      </div>
                      {isToday && (
                        <Tag
                          color="purple"
                          style={{
                            margin: 0,
                            fontSize: 10,
                            lineHeight: "16px",
                          }}
                        >
                          Hoje
                        </Tag>
                      )}
                    </div>
                  }
                  styles={{ body: { padding: "8px 10px" } }}
                >
                  {daySchedules.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "16px 0",
                        color: "#ccc",
                        fontSize: 12,
                      }}
                    >
                      Sem aulas
                    </div>
                  ) : (
                    daySchedules.map((s) => (
                      <ScheduleBlock
                        key={s.id}
                        sch={s}
                        color={
                          subjectColorMap.get(s.subject?.id ?? "") ?? "#888"
                        }
                      />
                    ))
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
        </>
      )}
    </div>
  );
}
