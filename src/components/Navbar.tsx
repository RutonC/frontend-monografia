import { Avatar, Button, Flex, Input, Space } from "antd";
import { useState } from "react";
import { BiMenu, BiMessage, BiSearch } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { messagesPathForUser } from "../app/guards";
import { useAuthStore } from "../store/authStore";
import { resolveAssetUrl } from "../utils/constants";
import DropdownUser from "./DropdownUser";
import ModalSearch from "./ModalSearch";
import styles from "./Navbar.module.scss";
import NotificationBell from "./NotificationBell";

export default function NavBar({
  onToggleSidebar,
}: {
  /** Abre/fecha o menu deslizante em ecrãs estreitos (< 1024px). */
  onToggleSidebar?: () => void;
}) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const messagesPath = messagesPathForUser(user?.type);

  const openSearch = () => {
    setSearchOpen(true);
  };
  return (
    <Flex
      align="center"
      justify="space-between"
      style={{ width: "100%" }}
      gap={8}
    >
      <Flex align="center" gap={8} style={{ width: "100%" }}>
        <Button
          className={styles.hamburger}
          icon={<BiMenu size={20} />}
          onClick={onToggleSidebar}
          aria-label="Abrir menu"
        />
        <Space style={{ width: "100%" }}>
          <Input
            className={styles.search}
            prefix={<BiSearch />}
            placeholder="Search..."
            onClick={openSearch}
          />
        </Space>
      </Flex>
      <Space>
        {messagesPath && (
          <Button icon={<BiMessage />} onClick={() => navigate(messagesPath)} />
        )}
        <NotificationBell open={notifOpen} onOpenChange={setNotifOpen} />
        <DropdownUser onOpenNotifications={() => setNotifOpen(true)}>
          <Avatar
            size={40}
            shape="square"
            className={styles.avatar}
            src={resolveAssetUrl(user?.avatar)}
          />
        </DropdownUser>
      </Space>
      <ModalSearch open={searchOpen} setOpen={setSearchOpen} />
    </Flex>
  );
}
