import { Button, Flex, Space } from "antd";

type DrawerFooterPros = {
  onOk?: React.MouseEventHandler<HTMLElement>;
  onClose?: React.MouseEventHandler<HTMLElement>;
  okText?: string;
  loading?: boolean;
  cancelText?: string;
};

export default function DrawerFooter({
  onOk,
  onClose,
  loading,
  okText,
  cancelText,
}: DrawerFooterPros) {
  return (
    <Flex justify="flex-end">
      <Space>
        <Button danger onClick={onClose}>
          {cancelText}
        </Button>
        <Button type="primary" loading={loading} onClick={onOk}>
          {okText}
        </Button>
      </Space>
    </Flex>
  );
}
