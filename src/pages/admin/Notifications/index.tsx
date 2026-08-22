// pages/admin/Notifications/index.tsx — lista completa e paginada de
// notificações (Fase 8). GET /notifications já existia (paginado) só sem
// consumidor no frontend — o sino (NotificationBell) só mostra as 10 mais
// recentes. Partilhada entre Aluno e Encarregado, mesmo padrão de
// Mensagens/Eventos/Notícias.
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { useAuthStore } from "@/store/authStore";
import axiosInstance from "@/utils/axiosInstance";
import { useFetch } from "@/utils/fetch";
import { intl } from "@/utils/intl";
import { HomeOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Empty, List, Pagination, Space, Typography } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 15;

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const homeHref = user?.type === "STUDENT" ? "/student" : "/guardian";

  const { data, isPending } = useFetch<{
    notifications: NotificationItem[];
    unreadCount: number;
    total: number;
  }>(["notifications-page", String(page)], `notifications?page=${page}&limit=${PAGE_SIZE}`);

  const notifications = data?.notifications ?? [];
  const total = data?.total ?? 0;
  const unreadCount = data?.unreadCount ?? 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications-page"] });
    queryClient.invalidateQueries({ queryKey: ["notifications-bell"] });
  };

  const { mutateAsync: markRead } = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.patch(`/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: invalidate,
  });

  const { mutateAsync: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.patch("/notifications/read-all");
      return res.data;
    },
    onSuccess: invalidate,
  });

  const handleClick = async (n: NotificationItem) => {
    if (!n.read) await markRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <>
      <CustomBreadcrumb
        title="Notificações"
        items={[
          { href: homeHref, title: <HomeOutlined /> },
          { title: "Notificações" },
        ]}
      />
      <Card
        style={{ borderRadius: 12 }}
        title={
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Typography.Text strong>Todas as notificações</Typography.Text>
            {unreadCount > 0 && (
              <Button
                type="link"
                size="small"
                loading={markingAll}
                onClick={() => markAllRead()}
              >
                Marcar todas como lidas
              </Button>
            )}
          </Space>
        }
      >
        <List
          loading={isPending}
          dataSource={notifications}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Sem notificações"
              />
            ),
          }}
          renderItem={(n) => (
            <List.Item
              style={{
                cursor: n.link ? "pointer" : "default",
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 2,
                background: n.read
                  ? "transparent"
                  : "var(--color-background-secondary)",
                borderLeft: n.read
                  ? "3px solid transparent"
                  : "3px solid #4f3fc5",
              }}
              onClick={() => handleClick(n)}
            >
              <List.Item.Meta
                title={
                  <Typography.Text strong={!n.read}>{n.title}</Typography.Text>
                }
                description={
                  <>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {n.body}
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {intl(n.createdAt)}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
        {total > PAGE_SIZE && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={total}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        )}
      </Card>
    </>
  );
}
