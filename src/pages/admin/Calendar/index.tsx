// pages/admin/Calendar/index.tsx — página dedicada de calendário (Fase
// 8), reaproveitando o EventsCalendar já usado como widget do Painel.
// Partilhada entre Aluno e Encarregado (mesmo padrão de Mensagens/
// Eventos/Notícias — detecta o papel para o link "início" da migalha).
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import EventsCalendar from "@/components/EventsCalendar";
import { useAuthStore } from "@/store/authStore";
import { HomeOutlined } from "@ant-design/icons";
import { Card } from "antd";

export default function CalendarPage() {
  const { user } = useAuthStore();
  const homeHref = user?.type === "STUDENT" ? "/student" : "/guardian";

  return (
    <>
      <CustomBreadcrumb
        title="Calendário"
        items={[
          { href: homeHref, title: <HomeOutlined /> },
          { title: "Calendário" },
        ]}
      />
      <Card style={{ borderRadius: 12 }}>
        <EventsCalendar fullscreen limit={100} />
      </Card>
    </>
  );
}
