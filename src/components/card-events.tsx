import { Flex, Typography } from "antd";

const {Paragraph, Title} = Typography;

interface CardEventProps {
  title: string;
  date: string;
  description?: string;
}

function CardEvent({ title, date, description }: CardEventProps) {
  return (
    <div style={{backgroundColor:'#f4f8fdff', height:120, padding:10, borderRadius:4, border:"0.5px solid #eee"}}>
      <Flex justify="flex-start" align="flex-start">
      <Flex vertical style={{ width: "100%" }}>
        <Flex justify="space-between" align="center">
          <Title level={5} style={{width:'60%'}} ellipsis>{title}</Title>
          <Paragraph>{date}</Paragraph>
        </Flex>
        <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
      </Flex>
      </Flex>
    </div>
  )
}

export default CardEvent