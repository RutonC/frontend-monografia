import { HomeOutlined } from "@ant-design/icons";
import { Tabs } from "antd";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import Level from "./level";
import Section from "./section";

export default function Classes() {
  return (
    <>
      <CustomBreadcrumb
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Classes & Turmas" },
        ]}
      />
      <Tabs
        items={[
          {
            key: "1",
            label: "Classes",
            children: <Level />,
          },
          {
            key: "2",
            label: "Turmas",
            children: <Section />,
          },
        ]}
      />
    </>
  );
}
