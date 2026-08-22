import { Calendar, Empty, Flex } from "antd"
import dayjs from "dayjs"
import { useFetch } from "../utils/fetch"
import { intlDate } from "../utils/intl"
import CardEvent from "./card-events"

interface EventsCalendarProps {
  // Widget do Painel (por defeito): mini-calendário compacto, só os 20
  // próximos eventos. Página dedicada (Fase 8): calendário cheio com um
  // limite maior, para o cellRender marcar dias mais distantes também.
  fullscreen?: boolean
  limit?: number
}

function EventsCalendar({ fullscreen = false, limit = 20 }: EventsCalendarProps) {
  const { data } = useFetch(["events-upcoming", String(limit)], `events?limit=${limit}`)
  const events = data?.events ?? []
  const upcoming = events
    .filter((e: any) => new Date(e.startDate) >= new Date())
    .slice(0, 2)

  // Dias com pelo menos um evento — usado pelo cellRender para desenhar
  // um pontinho no dia, sem precisar de nenhum pedido extra ao backend.
  const eventDates = new Set(
    events.map((e: any) => dayjs(e.startDate).format("YYYY-MM-DD")),
  )

  return (
    <div>
      <Flex vertical gap="middle" >
      {upcoming.length ? (
        upcoming.map((e: any) => (
          <CardEvent
            key={e.id}
            title={e.title}
            date={intlDate(e.startDate)}
            description={e.description}
          />
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sem eventos próximos" />
      )}
      </Flex>
      <Calendar
        fullscreen={fullscreen}
        cellRender={(date, info) => {
          if (info.type !== "date") return info.originNode
          const hasEvent = eventDates.has(date.format("YYYY-MM-DD"))
          if (!hasEvent) return info.originNode
          return (
            <div style={{ position: "relative" }}>
              {info.originNode}
              <div
                style={{
                  position: "absolute",
                  bottom: 2,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#4f46e5",
                }}
              />
            </div>
          )
        }}
      />
    </div>
  )
}

export default EventsCalendar