import { Calendar, Flex } from "antd"
import CardEvent from "./card-events"

function EventsCalendar() {



  return (
    <div>
      <Flex vertical gap="middle" >
      <CardEvent/>
      <CardEvent/>
      </Flex>
      <Calendar 
        fullscreen={false}
      />
    </div>
  )
}

export default EventsCalendar