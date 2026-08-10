import axiosInstance from "@/utils/axiosInstance";
import { intl } from "@/utils/intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Empty, List, Popover, Space, Typography } from "antd";
import { useState } from "react";
import { BiBell } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
};

interface NotificationBellProps {
  // Controlo externo opcional — usado pelo DropdownUser para abrir o
  // popover a partir do item "Notificações" do menu do utilizador.
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function NotificationBell({
  open: openProp,
  onOpenChange,
}: NotificationBellProps = {}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications-bell"],
    queryFn: async () => {
      const res = await axiosInstance.get("/notifications?limit=10");
      return res.data as {
        notifications: NotificationItem[];
        unreadCount: number;
      };
    },
    refetchInterval: 30000,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications-bell"] });

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
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const content = (
    <div style={{ width: 340 }}>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text strong>Notificações</Text>
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
      <List
        style={{ maxHeight: 380, overflowY: "auto" }}
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
              cursor: "pointer",
              padding: "8px 10px",
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
                <Text strong={!n.read} style={{ fontSize: 13 }}>
                  {n.title}
                </Text>
              }
              description={
                <>
                  <Text style={{ fontSize: 12 }}>{n.body}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {intl(n.createdAt)}
                  </Text>
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      content={content}
    >
      <Badge count={unreadCount} size="small" offset={[-4, 4]}>
        <Button icon={<BiBell />} />
      </Badge>
    </Popover>
  );
}
