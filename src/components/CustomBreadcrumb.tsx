import { Breadcrumb, Flex, Typography } from "antd";
import type { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";

interface CrumbProps {
  items: Partial<BreadcrumbItemType>[];
  title?: string;
}
export default function CustomBreadcrumb({ items, title }: CrumbProps) {
  return (
    <>
      <Typography.Title level={3}>{title}</Typography.Title>
      <Flex
        vertical={false}
        align="center"
        justify="space-between"
        style={{ marginBottom: 24 }}
      >
        <Breadcrumb items={items} />
      </Flex>
    </>
  );
}
