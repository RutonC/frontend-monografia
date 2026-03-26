import { Avatar, Button, Flex, Space } from "antd";
import { useState } from "react";
import {
  BiChevronLeft,
  BiChevronRight,
  BiMessage,
  BiNotification,
  BiSearch,
} from "react-icons/bi";
import { useAuthStore } from "../store/authStore";
import { baseURL } from "../utils/constants";
import DropdownUser from "./DropdownUser";
import Search from "./ModalSearch";

interface NavProps {
  collapse?: boolean;
  setIsCollapse?: (r: boolean) => void;
}

export default function NavBar({ setIsCollapse, collapse }: NavProps) {
  const { user } = useAuthStore();
  const [open, setOpen] = useState<boolean>(false);

  const openSearch = () => {
    setOpen(true);
  };
  return (
    <Flex align="center" justify="space-between" style={{ width: "100%" }}>
      <Space>
        <Button
          icon={
            collapse ? (
              <BiChevronRight size={18} />
            ) : (
              <BiChevronLeft size={18} />
            )
          }
          onClick={() => setIsCollapse?.(!collapse)}
        />
      </Space>
      <Space>
        <Button icon={<BiSearch />} onClick={openSearch} />
        <Button icon={<BiMessage />} />
        <Button icon={<BiNotification />} />
        <DropdownUser>
          <Avatar
            size={40}
            shape="square"
            src={`${baseURL.API_URL}/${user?.avatar}`}
          />
        </DropdownUser>
      </Space>
      <Search open={open} setOpen={setOpen} />
    </Flex>
  );
}
