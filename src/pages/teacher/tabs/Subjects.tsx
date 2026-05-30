import type { TeacherSectionEntry } from "@/hooks/useTeacher";
import { BookOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Row, Skeleton, Tag, Typography } from "antd";
import styles from "./tabs.module.scss";

interface SubjectsProps {
  teacherSections: TeacherSectionEntry[];
  isPending: boolean;
}

export default function Subjects({
  teacherSections,
  isPending,
}: SubjectsProps) {
  if (isPending) {
    return (
      <Row gutter={[16, 16]}>
        {[1, 2, 3].map((k) => (
          <Col key={k} xs={24} sm={12} md={8} xl={6}>
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
        description="Nenhuma disciplina atribuída a este professor"
      />
    );
  }

  // Deduplica por subjectId — agrupa as turmas onde lecciona cada disciplina
  const subjectMap = new Map<
    string,
    { entry: TeacherSectionEntry; sections: string[] }
  >();

  teacherSections.forEach((ts) => {
    if (!subjectMap.has(ts.subjectId)) {
      subjectMap.set(ts.subjectId, { entry: ts, sections: [] });
    }
    subjectMap.get(ts.subjectId)!.sections.push(ts.section.name);
  });

  return (
    <Row gutter={[16, 16]}>
      {Array.from(subjectMap.values()).map(({ entry, sections }) => (
        <Col key={entry.subjectId} xs={24} sm={12} md={8} xl={6}>
          <Card size="small" className={styles.subjectCard} hoverable>
            <div className={styles.subjectIcon}>
              <BookOutlined />
            </div>
            <Typography.Title level={5} style={{ margin: "8px 0 4px" }}>
              {entry.subject.name}
            </Typography.Title>
            {entry?.subject?.description && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {entry?.subject?.description}
              </Typography.Text>
            )}
            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              {entry.subject.code && (
                <Tag color="default">{entry.subject.code}</Tag>
              )}
              {/* Turmas onde lecciona esta disciplina */}
              {sections.map((s) => (
                <Tag key={s} color="blue">
                  {s}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
