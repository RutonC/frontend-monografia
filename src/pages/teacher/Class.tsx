// pages/teacher/Class.tsx
import { BookOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import {
  Avatar,
  Card,
  Col,
  Empty,
  Row,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { BiBarChart, BiCheckCircle } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import AcademicYearSelect from "../../components/AcademicYearSelect";
import PageLoader from "../../components/PageLoader";
import { api } from "../../store/authStore";

const { Title, Text } = Typography;

interface TeacherSection {
  id: string;
  subject?: { id: string; name: string };
}

interface Section {
  id: string;
  name: string;
  capacity: number;
  level?: { name: string };
  academicYear?: { year: string };
  teacherSections?: TeacherSection[];
  _count?: { enrollments: number; teacherSections: number };
}

const PALETTE = [
  "#4f46e5",
  "#0ea5e9",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
];

export default function TeacherClass() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYearId, setAcademicYearId] = useState<string | undefined>();

  useEffect(() => {
    setLoading(true);
    api
      .get(
        `/teacher/me/sections${academicYearId ? `?academicYearId=${academicYearId}` : ""}`,
      )
      .then((res) => {
        setSections(res.data?.sections ?? []);
        // Primeira carga (sem ano escolhido) — adopta o ano que o
        // backend usou por defeito (o activo) para pré-seleccionar o filtro.
        if (!academicYearId && res.data?.academicYearId) {
          setAcademicYearId(res.data.academicYearId);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [academicYearId]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Minhas Turmas
          </Title>
          <Text type="secondary">
            {sections?.length} turma{sections?.length !== 1 ? "s" : ""} atribuída
            {sections?.length !== 1 ? "s" : ""}
          </Text>
        </div>
        <AcademicYearSelect value={academicYearId} onChange={setAcademicYearId} />
      </div>

      {loading ? (
        <PageLoader />
      ) : sections?.length === 0 ? (
        <Card style={{ borderRadius: 12 }}>
          <Empty
            description="Nenhuma turma atribuída neste ano lectivo."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {sections?.map((section, idx) => {
            const color = PALETTE[idx % PALETTE.length];
            const enrolled = section._count?.enrollments ?? 0;
            const capacity = section.capacity ?? 40;
            const pct = Math.min(100, Math.round((enrolled / capacity) * 100));
            const subjects =
              section?.teacherSections
                ?.map((ts) => ts.subject)
                .filter(Boolean) ?? [];

            return (
              <Col xs={24} sm={12} lg={6} key={section.id}>
                <Card
                  hoverable
                  style={{ borderRadius: 14, overflow: "hidden" }}
                  styles={{ body: { padding: 0 } }}
                >
                  {/* Cabeçalho colorido */}
                  <div
                    style={{
                      background: color,
                      padding: "20px 24px 16px",
                      color: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>
                          {section.name}
                        </div>
                        <div
                          style={{ opacity: 0.85, fontSize: 13, marginTop: 2 }}
                        >
                          {section.level?.name ?? "—"} ·{" "}
                          {section.academicYear?.year ?? "Ano actual"}
                        </div>
                      </div>
                      <Avatar
                        size={42}
                        style={{
                          background: "rgba(255,255,255,0.25)",
                          color: "#fff",
                        }}
                        icon={<BookOutlined />}
                      />
                    </div>

                    {/* Barra de ocupação */}
                    <div style={{ marginTop: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          marginBottom: 4,
                          opacity: 0.9,
                        }}
                      >
                        <span>Ocupação</span>
                        <span>
                          {enrolled}/{capacity}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: "rgba(255,255,255,0.3)",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: "#fff",
                            borderRadius: 4,
                            transition: "width 0.5s",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Corpo */}
                  <div style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <TeamOutlined style={{ color }} />
                        <Text style={{ fontSize: 13 }}>
                          <strong>{enrolled}</strong> alunos
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <UserOutlined style={{ color: "#888" }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Cap. {capacity}
                        </Text>
                      </div>
                    </div>

                    {/* Disciplinas que o professor lecciona nesta turma */}
                    {subjects.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 12,
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          As minhas disciplinas
                        </Text>
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
                        >
                          {subjects.slice(0, 4).map((sub) => (
                            <Tag
                              key={sub!.id}
                              color="blue"
                              style={{ margin: 0 }}
                            >
                              {sub!.name}
                            </Tag>
                          ))}
                          {subjects.length > 4 && (
                            <Tooltip
                              title={subjects
                                .slice(4)
                                .map((s) => s!.name)
                                .join(", ")}
                            >
                              <Tag color="default" style={{ margin: 0 }}>
                                +{subjects.length - 4}
                              </Tag>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Acções */}
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        paddingTop: 14,
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color,
                          cursor: "pointer",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        onClick={() =>
                          navigate("/teacher/notas", {
                            state: { sectionId: section.id },
                          })
                        }
                      >
                        <BiBarChart /> Notas
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#0ea5e9",
                          cursor: "pointer",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        onClick={() =>
                          navigate("/teacher/assiduidade", {
                            state: { sectionId: section.id },
                          })
                        }
                      >
                        <BiCheckCircle /> Assiduidade
                      </span>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
