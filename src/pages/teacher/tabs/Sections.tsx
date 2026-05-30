// tabs/Sections.tsx
import type { TeacherSectionEntry } from "@/hooks/useTeacher";
import { TeamOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Row, Skeleton, Tag, Typography } from "antd";
import styles from "./tabs.module.scss";

interface SectionsProps {
  teacherSections: TeacherSectionEntry[];
  isPending: boolean;
}

export default function Sections({
  teacherSections,
  isPending,
}: SectionsProps) {
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
        description="Nenhuma turma associada a este professor"
      />
    );
  }

  // Deduplica por sectionId — agrupa as disciplinas que lecciona em cada turma
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

  return (
    <Row gutter={[16, 16]}>
      {Array.from(sectionMap.values()).map(({ entry, subjects }) => (
        <Col key={entry.sectionId} xs={24} sm={12} md={8} xl={6}>
          <Card size="small" className={styles.sectionCard} hoverable>
            <div className={styles.sectionIcon}>
              <TeamOutlined />
            </div>
            <Typography.Title level={5} style={{ margin: "8px 0 4px" }}>
              {entry.section.name}
            </Typography.Title>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              <Tag color="geekblue">{entry.section.level?.name ?? "—"}</Tag>
              {/* ✅ ano lectivo vem de academicYear.year não .name */}
              <Tag color="cyan">{entry.section.academicYear?.year ?? "—"}</Tag>
            </div>
            {/* Disciplinas que lecciona nesta turma */}
            {subjects.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                }}
              >
                {subjects.map((s) => (
                  <Tag key={s} color="purple" style={{ fontSize: 11 }}>
                    {s}
                  </Tag>
                ))}
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
