import { Avatar, Button, Flex, Input, Space } from "antd";
import { useState } from "react";
import { BiMessage, BiSearch } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { messagesPathForUser } from "../app/guards";
import { useAuthStore } from "../store/authStore";
import { resolveAssetUrl } from "../utils/constants";
import DropdownUser from "./DropdownUser";
import ModalSearch from "./ModalSearch";
import NotificationBell from "./NotificationBell";

// interface NavProps {
//   collapse?: boolean;
//   setIsCollapse?: (r: boolean) => void;
// }

export default function NavBar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const messagesPath = messagesPathForUser(user?.type);

  const openSearch = () => {
    setSearchOpen(true);
  };
  return (
    <Flex align="center" justify="space-between" style={{ width: "100%" }}>
      <Space style={{ width: "100%" }}>
        <Input
          prefix={<BiSearch />}
          placeholder="Search..."
          style={{ width: "120%" }}
          onClick={openSearch}
        />
      </Space>
      <Space>
        {messagesPath && (
          <Button icon={<BiMessage />} onClick={() => navigate(messagesPath)} />
        )}
        <NotificationBell open={notifOpen} onOpenChange={setNotifOpen} />
        <DropdownUser onOpenNotifications={() => setNotifOpen(true)}>
          <Avatar
            size={40}
            shape="square"
            src={resolveAssetUrl(user?.avatar)}
          />
        </DropdownUser>
      </Space>
      <ModalSearch open={searchOpen} setOpen={setSearchOpen} />
    </Flex>
  );
}
