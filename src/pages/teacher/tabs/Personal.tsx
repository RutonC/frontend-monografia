import type { TeacherProfile } from "@/hooks/useTeacher";
import { Card, Col, Descriptions, Row, Skeleton } from "antd";

interface PersonalProps {
  teacher?: TeacherProfile;
  isPending: boolean;
}

const GENDER_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-MZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Personal({ teacher, isPending }: PersonalProps) {
  if (isPending) {
    return (
      <Row gutter={[16, 16]}>
        <Col md={12} sm={24}>
          <Card>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </Col>
        <Col md={12} sm={24}>
          <Card>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </Col>
      </Row>
    );
  }

  const employee = teacher?.employee;

  return (
    <Row gutter={[16, 16]}>
      <Col md={12} lg={12} xl={12} sm={24} xs={24}>
        <Card title="Informação Pessoal" size="small">
          <Descriptions
            column={1}
            size="small"
            labelStyle={{ fontWeight: 600 }}
          >
            <Descriptions.Item label="Data de Nascimento">
              {formatDate(teacher?.birthday)}
            </Descriptions.Item>
            <Descriptions.Item label="Género">
              {GENDER_LABEL[teacher?.gender ?? ""] ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Endereço">
              {teacher?.address ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Telefone">
              {teacher?.phoneNumber ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {teacher?.email ?? "—"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      <Col md={12} lg={12} xl={12} sm={24} xs={24}>
        <Card title="Informação Profissional" size="small">
          <Descriptions
            column={1}
            size="small"
            labelStyle={{ fontWeight: 600 }}
          >
            <Descriptions.Item label="Cargo">
              {employee?.position ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Departamento">
              {employee?.department?.name ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Nível Académico">
              {employee?.academicLevel ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Especialização">
              {employee?.teacher?.specialization ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Identificador">
              {teacher?.identifier ?? "—"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
    </Row>
  );
}
