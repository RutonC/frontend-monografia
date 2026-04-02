import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#4f3fc5",
    colorLink: "#4f3fc5",
    colorBgBase: "#FAFAFA",
    fontFamily: "roboto",
    fontSize: 15,
    borderRadius: 4,
  },
  components: {
    Layout: {
      headerBg: "#fff",
    },
    Button: {
      controlHeight: 40,
      borderRadius: 4,
    },
    Input: {
      controlHeight: 40,
      hoverBorderColor: "#123499",
      activeBorderColor: "#123499",
    },
    Select: {
      controlHeight: 40,
      hoverBorderColor: "#123499",
      activeBorderColor: "#123499",
    },
    DatePicker: {
      controlHeight: 40,
    },
    Menu: {
      itemColor: "#FAFAFA",
      itemSelectedColor: "#4f3fc5",
      itemSelectedBg: "#ffffff",

      collapsedIconSize: 20,

      itemHoverBg: "#FAFAFA",
      itemHoverColor: "#4f3fc5",

      subMenuItemBg: "#3e37bc",
      groupTitleColor: "#f4f5f5",
      subMenuItemSelectedColor: "#cfc7ef",
      popupBg: "#3e37bc",
    },
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0,
    },
  },
};

export default theme;
