import { Flex, Typography } from "antd";

const {Paragraph, Title} = Typography;
function CardEvent() {
  return (
    <div style={{backgroundColor:'#f4f8fdff', height:120, padding:10, borderRadius:4, border:"0.5px solid #eee"}}>
      <Flex justify="flex-start" align="flex-start">
      <Flex vertical>
        <Flex justify="space-between" align="center">
          <Title level={5} style={{width:'60%'}} ellipsis>Reunião de Pais e Encarregados de Educação</Title>
          <Paragraph >10 Ago, 2024</Paragraph>
        </Flex>
        <Paragraph>Uma reunião para discutir assuntos associados ao desempenho dos alunos</Paragraph>
      </Flex> 
      </Flex>
    </div>
  )
}

export default CardEvent