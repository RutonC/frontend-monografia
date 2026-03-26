import type { MenuProps } from "antd";
import type { JSX } from "react";

type MenuItem = Required<MenuProps>['items'][number];

export function getItem(label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    element?: JSX.Element | null,
    children?: MenuItem[],
    type?: 'group' | 'divider',
  ): any {

    if (type === 'divider'){
      return {type: 'divider'} as MenuItem;
    }
    return {
      label,
      key,
      icon,
      element,
      children,
      type,
    };
  }