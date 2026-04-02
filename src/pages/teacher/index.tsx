import { HomeOutlined } from "@ant-design/icons";
import { Card, Col, Row } from "antd";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { TeacherCard } from "../../components/TeacherCard";
import styles from "./index.module.scss";

export default function Teacher() {
  const navigate = useNavigate();
  return (
    <>
      <CustomBreadcrumb
        title="Professores"
        items={[{ title: <HomeOutlined /> }, { title: "Professores" }]}
      />
      <Card className={styles.container}>
        <Row gutter={[16, 16]}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}
              xl={8}
              key={index}
              onClick={() => navigate("/professores/perfil")}
            >
              <TeacherCard
                teacher={{
                  firstName: "Edmilton",
                  lastName: "Muende",
                  email: "edmilton.muende@university.edu",
                  phoneNumber: "+258 84 123 4567",
                  avatar: "",
                  position: "Professor de Ciência da Computação",
                  academicLevel: "Doutor",
                  department: { name: "Departamento de Informática" },
                  specialization: "",
                  subjects: [],
                  schedule: "",
                }}
                accentColor="#4f3fc5"
              />
            </Col>
          ))}
        </Row>
      </Card>
    </>
  );
}
