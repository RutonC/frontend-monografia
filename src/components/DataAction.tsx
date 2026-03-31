import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Button, Popconfirm, Space, Typography } from "antd";

type DataActionProps = {
  status?: boolean;
  onEdit?: React.MouseEventHandler<HTMLElement>;
  onDelete?: React.MouseEventHandler<HTMLElement>;
  onEnable?: React.MouseEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
  record?: any;
  removeMessage?: string;
  titleRemove?: string;
  enableLoading?: boolean;
};

export default function DataActions({
  onDelete,
  onEdit,
  onEnable,
  enableLoading,
  status,
  removeMessage,
  titleRemove,
}: DataActionProps) {
  return (
    <Space size="small">
      {onEdit && <Button icon={<EditOutlined />} onClick={onEdit} />}
      {onDelete && (
        <Popconfirm
          title={titleRemove}
          okText="Sim"
          cancelText="Não"
          description={
            <Typography.Text>
              Tem certeza que pretende remover <strong>{removeMessage}?</strong>
            </Typography.Text>
          }
        >
          <Button danger icon={<DeleteOutlined />} onClick={onDelete} />
        </Popconfirm>
      )}
      {onEnable && (
        <Button
          variant="outlined"
          color={!status ? "primary" : "red"}
          icon={status ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          loading={enableLoading}
          onClick={onEnable}
        >
          {status ? <>Disactivar</> : <>Activar</>}
        </Button>
      )}
    </Space>
  );
}
