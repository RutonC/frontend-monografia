// pages/student/Documents.tsx — Documentos distribuídos pela escola ao
// próprio aluno (Fase 9). Só leitura/descarga — o upload é feito pela
// Secretaria/Admin no perfil do aluno.
import { DownloadOutlined, FileTextOutlined, HomeOutlined } from "@ant-design/icons";
import { Button, Card, Empty, List, Skeleton, Typography } from "antd";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { useAuthStore } from "@/store/authStore";
import { useFetch } from "@/utils/fetch";
import { intlDate } from "@/utils/intl";

export default function StudentDocuments() {
  const { user } = useAuthStore();
  const studentId = user?.id ?? "";

  const { data, isPending } = useFetch(
    ["student-documents", studentId],
    `student-documents?studentId=${studentId}`,
    { enabled: !!studentId },
  );
  const documents = data?.documents ?? [];

  return (
    <>
      <CustomBreadcrumb
        title="Documentos"
        items={[{ href: "/student", title: <HomeOutlined /> }, { title: "Documentos" }]}
      />
      <Card style={{ borderRadius: 12 }}>
        {isPending ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : !documents.length ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Sem documentos disponíveis"
          />
        ) : (
          <List
            dataSource={documents}
            renderItem={(d: any) => (
              <List.Item
                actions={[
                  <a key="download" href={d.url} target="_blank" rel="noreferrer">
                    <Button size="small" icon={<DownloadOutlined />}>
                      Descarregar
                    </Button>
                  </a>,
                ]}
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: 20 }} />}
                  title={d.label}
                  description={
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {intlDate(d.createdAt)}
                    </Typography.Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </>
  );
}
