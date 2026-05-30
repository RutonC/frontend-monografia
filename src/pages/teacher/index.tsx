import Filters, { type FiltersState } from "@/components/Filters";
import { baseURL } from "@/utils/constants";
import { HomeOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Pagination, Row, Spin } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { TeacherCard } from "../../components/TeacherCard";
import styles from "./index.module.scss";

const PAGE_SIZE = 12;

export default function Teacher() {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>({});

  const fetchTeachers = async (currentPage: number, f: FiltersState) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE),
        ...(f.searchQuery && { search: f.searchQuery }),
        ...(f.status !== undefined && { status: String(f.status) }),
      });

      const res = await fetch(`${baseURL.API_URL}teachers?${params}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setTeachers(data.employees);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounce na pesquisa — evita chamada a cada tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchTeachers(1, filters);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    fetchTeachers(page, filters);
  }, [page]);

  const onFiltersChange = (values: FiltersState) => {
    setFilters(values);
  };

  return (
    <>
      <CustomBreadcrumb
        title="Professores"
        items={[{ title: <HomeOutlined /> }, { title: "Professores" }]}
      />
      <Card
        className={styles.container}
        title={
          <Filters
            onFiltersChange={onFiltersChange}
            addButtonTitle="Adicionar Professor"
            addOnClick={() => navigate("/professores/adicionar-novo-professor")}
          />
        }
      >
        <Spin spinning={loading}>
          {teachers.length === 0 && !loading ? (
            <Empty description="Nenhum professor encontrado" />
          ) : (
            <Row gutter={[16, 16]}>
              {teachers.map((emp) => (
                <Col
                  xs={24}
                  sm={24}
                  md={8}
                  lg={8}
                  xl={6}
                  key={emp.id}
                  onClick={() =>
                    navigate(`/professores/perfil/${emp.user?.slug}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <TeacherCard
                    teacher={{
                      firstName: emp.user?.firstName ?? "",
                      lastName: emp.user?.lastName ?? "",
                      email: emp.user?.email ?? "",
                      phoneNumber: emp.user?.phoneNumber ?? "",
                      avatar: emp.user?.avatar ?? "",
                      position: emp.position ?? "Professor",
                      academicLevel: emp.academicLevel ?? "",
                      department: emp.department,
                      specialization: emp.teacher?.specialization ?? "",
                      subjects: [],
                      schedule: "",
                    }}
                    accentColor="#4f3fc5"
                  />
                </Col>
              ))}
            </Row>
          )}
        </Spin>

        {total > PAGE_SIZE && (
          <Pagination
            style={{ marginTop: 24, textAlign: "right" }}
            current={page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        )}
      </Card>
    </>
  );
}
