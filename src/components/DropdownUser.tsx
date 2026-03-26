import { Dropdown, type MenuProps } from "antd";
import { BiLogOut, BiMessageAlt, BiNotification, BiUser } from "react-icons/bi";

export default function DropdownUser({
  children,
}: {
  children: React.ReactNode;
}) {
  const items: MenuProps["items"] = [
    {
      key: "0",
      label: "Perfil",
      icon: <BiUser />,
    },
    {
      key: "1",
      label: "Messagem",
      icon: <BiMessageAlt />,
    },
    {
      key: "2",
      label: "Notificações",
      icon: <BiNotification />,
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: "Sair",
      icon: <BiLogOut />,
      danger: true,
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      placement="bottomLeft"
      trigger={["click"]}
      popupRender={(menu) => <div>{menu}</div>}
    >
      {children}
    </Dropdown>
  );
}
