import { Flex } from "antd";
import { BiChevronLeft, BiMenu } from "react-icons/bi";
import styles from "./styles/siderbarheader.module.scss";

export default function SiderBarHeader({
  collapsed,
  setCollapsed,
}: {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}) {
  return (
    <Flex
      align="center"
      justify="space-between"
      className={styles.container}
      gap={8}
    >
      {!collapsed && (
        <div className={styles.titleContainer}>
          <span className={styles.title}>ECAMS</span>
        </div>
      )}
      {collapsed && (
        <div
          className={styles.collapsedIconContainer}
          onClick={() => setCollapsed?.(!collapsed)}
        >
          <BiMenu size={24} className={styles.collapsedIcon} />
        </div>
      )}
      {!collapsed && (
        <div
          className={styles.collapsedIconContainer}
          style={{ width: 52 }}
          onClick={() => setCollapsed?.(!collapsed)}
        >
          <BiChevronLeft size={24} className={styles.collapsedIcon} />
        </div>
      )}
    </Flex>
  );
}
