// tabs/Schedule.tsx
// O modelo Schedule ainda não existe no backend.
// Por agora mostramos as turmas e disciplinas agrupadas por classe
// como uma visão de "horário base" — quando o modelo existir, bastará
// trocar a prop teacherSections por schedules.

import type { TeacherSectionEntry } from "@/hooks/useTeacher";
import { BookOutlined, TeamOutlined } from "@ant-design/icons";
import {
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Tag,
  Timeline,
  Typography,
} from "antd";
import styles from "./tabs.module.scss";

interface ScheduleProps {
  teacherSections: TeacherSectionEntry[];
  isPending: boolean;
}

// Cores por classe para diferenciar visualmente
const LEVEL_COLORS = [
  "#4f3fc5",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#be185d",
];

export default function Schedule({
  teacherSections,
  isPending,
}: ScheduleProps) {
  if (isPending) {
    return (
      <Row gutter={[16, 16]}>
        {[1, 2, 3].map((k) => (
          <Col key={k} xs={24} sm={12} md={8}>
            <Card size="small">
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (!teacherSections.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Nenhuma aula atribuída a este professor"
      />
    );
  }

  // Agrupar por turma (section)
  const sectionMap = new Map<
    string,
    { entry: TeacherSectionEntry; subjects: string[] }
  >();

  teacherSections.forEach((ts) => {
    if (!sectionMap.has(ts.sectionId)) {
      sectionMap.set(ts.sectionId, { entry: ts, subjects: [] });
    }
    sectionMap.get(ts.sectionId)!.subjects.push(ts.subject.name);
  });

  const grouped = Array.from(sectionMap.values());

  return (
    <>
      <Typography.Text
        type="secondary"
        style={{ display: "block", marginBottom: 16 }}
      >
        Calendário de aulas detalhado disponível quando os horários forem
        configurados. Abaixo estão as turmas e disciplinas atribuídas a este
        professor.
      </Typography.Text>

      <Row gutter={[16, 16]}>
        {grouped.map(({ entry, subjects }, idx) => {
          const color = LEVEL_COLORS[idx % LEVEL_COLORS.length];

          return (
            <Col key={entry.sectionId} xs={24} sm={24} md={12} xl={8}>
              <Card
                size="small"
                className={styles.scheduleCard}
                title={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <TeamOutlined style={{ color }} />
                    <Typography.Text strong style={{ color }}>
                      {entry.section.name}
                    </Typography.Text>
                    <Tag
                      style={{
                        marginLeft: "auto",
                        background: color + "22",
                        borderColor: color + "55",
                        color,
                      }}
                    >
                      {subjects.length} disciplina
                      {subjects.length !== 1 ? "s" : ""}
                    </Tag>
                  </div>
                }
              >
                <div style={{ marginBottom: 8, display: "flex", gap: 4 }}>
                  <Tag color="geekblue">{entry.section.level?.name ?? "—"}</Tag>
                  <Tag color="cyan">
                    {entry.section.academicYear?.year ?? "—"}
                  </Tag>
                </div>

                <Timeline
                  items={subjects.map((subjectName) => ({
                    color,
                    dot: <BookOutlined style={{ fontSize: 12 }} />,
                    children: (
                      <div className={styles.scheduleItem}>
                        <Typography.Text strong>{subjectName}</Typography.Text>
                      </div>
                    ),
                  }))}
                />
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
}
