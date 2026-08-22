// components/PageLoader.tsx — indicador de carregamento padrão da
// plataforma (Fase 6). Substitui os <Spin size="large" /> crus antes
// duplicados em 13 ficheiros — mesmo ícone em todo o lado. Não usado no
// Aluno/Encarregado, que já seguem o padrão <Skeleton> (diferente, não é
// uma regressão trocar).
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import type { CSSProperties } from "react";

interface PageLoaderProps {
  size?: "small" | "default" | "large";
  padding?: number | string;
  style?: CSSProperties;
}

export default function PageLoader({
  size = "large",
  padding = 80,
  style,
}: PageLoaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding,
        ...style,
      }}
    >
      <Spin indicator={<LoadingOutlined spin />} size={size} />
    </div>
  );
}
