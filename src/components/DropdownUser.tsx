import { Dropdown, type MenuProps } from "antd";
import { BiLogOut, BiMessageAlt, BiNotification, BiUser } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { messagesPathForUser, personalSettingsPathForUser } from "../app/guards";

export default function DropdownUser({
  children,
  onOpenNotifications,
}: {
  children: React.ReactNode;
  onOpenNotifications?: () => void;
}) {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const messagesPath = messagesPathForUser(user?.type);
  const personalSettingsPath = personalSettingsPathForUser(user?.type);

  const items: MenuProps["items"] = [
    {
      key: "0",
      label: "Perfil",
      icon: <BiUser />,
    },
    ...(messagesPath
      ? [
          {
            key: "1",
            label: "Mensagem",
            icon: <BiMessageAlt />,
          },
        ]
      : []),
    {
      key: "2",
      label: "Notificações",
      icon: <BiNotification />,
    },
    {
      type: "divider" as const,
    },
    {
      key: "3",
      label: "Sair",
      icon: <BiLogOut />,
      danger: true,
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "0") {
      navigate(personalSettingsPath);
    } else if (key === "1" && messagesPath) {
      navigate(messagesPath);
    } else if (key === "2") {
      onOpenNotifications?.();
    } else if (key === "3") {
      logout();
    }
  };

  return (
    <Dropdown
      menu={{ items, onClick: handleMenuClick }}
      placement="bottomLeft"
      trigger={["click"]}
      popupRender={(menu) => <div>{menu}</div>}
    >
      {children}
    </Dropdown>
  );
}
