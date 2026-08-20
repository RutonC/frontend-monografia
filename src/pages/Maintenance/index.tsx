// pages/Maintenance/index.tsx — página dedicada mostrada quando o
// backend devolve 503 (modo de manutenção activo) para um utilizador que
// não é ADMIN/SUPERADMIN. A mensagem vem do axios interceptor, que a
// guarda em sessionStorage antes de redireccionar para aqui.
import { Button, Result } from "antd";

const DEFAULT_MESSAGE = "Plataforma em manutenção. Tente novamente mais tarde.";

export default function Maintenance() {
  const message = sessionStorage.getItem("maintenanceMessage") || DEFAULT_MESSAGE;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Result
        status="warning"
        title="Plataforma em manutenção"
        subTitle={message}
        extra={
          <Button type="primary" onClick={() => window.location.assign("/login")}>
            Tentar novamente
          </Button>
        }
      />
    </div>
  );
}
