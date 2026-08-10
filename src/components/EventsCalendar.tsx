import { Calendar, Empty, Flex } from "antd"
import { useFetch } from "../utils/fetch"
import { intlDate } from "../utils/intl"
import CardEvent from "./card-events"

function EventsCalendar() {
  const { data } = useFetch(["events-upcoming"], "events?limit=20")
  const events = data?.events ?? []
  const upcoming = events
    .filter((e: any) => new Date(e.startDate) >= new Date())
    .slice(0, 2)

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
        fullscreen={false}
      />
    </div>
  )
}

export default EventsCalendar