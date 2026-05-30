import { LeftOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Flex, Typography } from "antd";
import type { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useNavigate } from "react-router-dom";

interface CrumbProps {
  items: Partial<BreadcrumbItemType>[];
  title?: string;
  onPrev?: boolean;
}
export default function CustomBreadcrumb({ items, title, onPrev }: CrumbProps) {
  const navigateBack = useNavigate();
  return (
    <Flex justify="space-between" align="center">
      <div>
        <Typography.Title level={3}>{title}</Typography.Title>
        <Flex
          vertical={false}
          align="center"
          justify="space-between"
          style={{ marginBottom: 24 }}
        >
          <Breadcrumb items={items} />
        </Flex>
      </div>
      {onPrev && (
        <Button icon={<LeftOutlined />} onClick={() => navigateBack(-1)}>
          Voltar
        </Button>
      )}
    </Flex>
  );
}
