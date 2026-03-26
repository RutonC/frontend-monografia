import { CalendarOutlined, ContactsOutlined, MoneyCollectOutlined, TeamOutlined } from "@ant-design/icons"
import { Card, Col, Divider, Flex, Layout, Row, Select, Typography } from "antd"
import { useState } from "react"
import ChartEarnings from "../../../components/ChartEarnings"
import ChartPieStudents from "../../../components/ChartPieStudents"
import EventsCalendar from "../../../components/EventsCalendar"
import NoticeBoard from "../../../components/NoticeBoard"

const cardItemsInfo = [
  {
    id:'1',
    title:"Estudantes",
    numero:12333,
    icon:<TeamOutlined style={{padding:10, backgroundColor:"#2294f565", borderRadius:100, color:"#2294f5"}}/>
  },
  {
    id:'2',
    title:"Professores",
    numero:133,
    icon:<ContactsOutlined style={{padding:10, backgroundColor:"#7415c865", borderRadius:100, color:"#7415c8"}}/>
  },
  {
    id:'3',
    title:"Funcionários",
    numero:433,
    icon:<TeamOutlined style={{padding:10, backgroundColor:"#2294f565", borderRadius:100, color:"#2294f5"}}/>
  },
  {
    id:'4',
    title:"Ganhos",
    numero:12333,
    icon:<MoneyCollectOutlined style={{padding:10, backgroundColor:"#14d74f65", borderRadius:100, color:"#14d74f"}}/>
  },
]


function Dashboard() {
  const [earning, setEarning] = useState<string>('anual');

  const onChangeEarning = (values:string) => {
    console.log("Valor",values)
    setEarning(values)
  }
  return (
    <Layout.Content>
      <Row gutter={[16,16]}>
        {
          cardItemsInfo?.map((card,index)=>
            <Col span={6} key={index}>
              <Card  
              title={card.title}
              extra={card.icon}
              >
                <Flex>
                  <Typography.Title level={3}>{card.numero}</Typography.Title> 
                </Flex>
              </Card>
            </Col>
          )
        }
      </Row>

      <Row gutter={[16,16]} style={{marginTop:30}}>
        <Col span={16}>
        <Card
          title="Ganhos"
          extra={
            <Select
              prefix={<CalendarOutlined/>}
              defaultValue={"anual"}
              options={[
                {label:"Semanal",value:"semanal"},
                {label:"Mensal",value:"mensal"},
                {label:"Anual",value:"anual"},
              ]}

              onChange={onChangeEarning}
            />
          }
        >
          <ChartEarnings status={earning} />
        </Card>
        </Col>
        <Col span={8}>
        <Card>
          <ChartPieStudents/>
          <Flex justify="space-between">
          <Flex>
             <Divider type="vertical" size="large" style={{height:54, borderWidth:4, borderColor:"#1252b1", borderRadius:2}}/>
             <Flex vertical>
              <span>Estudantes Masculinos</span>
              <Typography.Title level={5}>35%</Typography.Title>
             </Flex>
          </Flex>
          <Flex>
             <Divider type="vertical" size="large" style={{height:54, borderWidth:4,borderColor:"#fe784a", borderRadius:2}}/>
             <Flex vertical>
              <span>Estudantes Femininas</span>
              <Typography.Title level={5}>65%</Typography.Title>
             </Flex>
          </Flex>
          </Flex>
        </Card>
        </Col>
      </Row>

      <Row gutter={[16,16]} style={{marginTop:30}}>
        <Col span={16}>
          <Card title="Quadro de Avisos">  
            <NoticeBoard/>  
          </Card>
        </Col>
        <Col span={8}>
        <Card title="Calendário de Eventos">
          <EventsCalendar/>
        </Card>
        </Col>
      </Row>
      
    </Layout.Content>
  )
}

export default Dashboard