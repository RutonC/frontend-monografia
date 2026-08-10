// components/NewsFeed.tsx
// Widget partilhado, montado nos vários dashboards — mostra as notícias
// visíveis ao utilizador actual (filtradas por público-alvo no backend).
import { PushpinFilled } from "@ant-design/icons";
import { Empty, List, Space, Tag, Typography } from "antd";
import { useFetch } from "../utils/fetch";
import { intlDate } from "../utils/intl";

const { Text } = Typography;

const SCOPE_COLOR: Record<string, string> = {
  ALL: "blue",
  STUDENTS: "green",
  GUARDIANS: "orange",
  TEACHERS: "purple",
  EMPLOYEES: "cyan",
};

const SCOPE_LABEL: Record<string, string> = {
  ALL: "Toda a escola",
  STUDENTS: "Alunos",
  GUARDIANS: "Encarregados",
  TEACHERS: "Professores",
  EMPLOYEES: "Funcionários",
};

interface NewsFeedProps {
  limit?: number;
}

export default function NewsFeed({ limit = 5 }: NewsFeedProps) {
  const { data, isPending } = useFetch(
    ["news-feed", String(limit)],
    `news?limit=${limit}`,
  );

  const news = data?.news ?? [];

  return (
    <List
      loading={isPending}
      dataSource={news}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Sem notícias por agora"
          />
        ),
      }}
      renderItem={(item: any) => (
        <List.Item style={{ padding: "10px 0" }}>
          <List.Item.Meta
            title={
              <Space size={6}>
                {item.pinned && (
                  <PushpinFilled style={{ color: "#4f3fc5", fontSize: 12 }} />
                )}
                <Text strong style={{ fontSize: 13 }}>
                  {item.title}
                </Text>
                <Tag color={SCOPE_COLOR[item.scope]} style={{ fontSize: 10 }}>
                  {SCOPE_LABEL[item.scope] ?? item.scope}
                </Tag>
              </Space>
            }
            description={
              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                <Text
                  type="secondary"
                  style={{ fontSize: 12 }}
                  ellipsis={{ tooltip: item.body }}
                >
                  {item.body}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {item.author?.firstName} {item.author?.lastName} ·{" "}
                  {intlDate(item.publishedAt)}
                </Text>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
}
