import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Typography, type TableColumnsType } from "antd";
import { intl } from "../../../utils/intl";
import type { IClassroom } from "../../../utils/type";

type Handlers = {
  onEdit:(r:IClassroom) => void;
  onDelete:(r:IClassroom) => void;
}

export const columns = ({onEdit, onDelete}:Handlers):TableColumnsType<IClassroom> => [
  {
    title: 'Nome da turma',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Classe',
    key:'cycle',
    render:(_)=> _.cycle.cycle
  },
  {
    title: 'Data de crição',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render:(createdAt:Date) => intl(createdAt)
  },
  {
    title: 'Professor responsável',
    dataIndex: 'assignTeacher',
    key: 'assignTeacher',
  },
  {
    title: 'Acções',
    key:'action',
    fixed:'right',
    width:'6rem',
    render:(_,{name}) => (
      <Space size='small'>
        <Button icon={<EditOutlined/>} onClick={(e)=>{onEdit(_); e.stopPropagation()}}/>
        <Popconfirm title={`Remover o departemento ${name}`} okText="Sim" cancelText="Não" description={<Typography.Text>Tem certeza que pretende remover o <strong>{name}?</strong></Typography.Text>}>
        <Button danger icon={<DeleteOutlined/>} onClick={(e)=>{onDelete(_); e.stopPropagation()}}/>
        </Popconfirm>
      </Space>
    )
  },
];


export const dados = [
  {
    key:'1',
    name:"A01",
    cycle:{
      cycle:'10ª classes',
      monthlyFee:3000,
      quantity:2
    },
    createdAt:new Date('2025-08-28'),
    updatedAt:new Date('2025-08-28'),
  },
  {
    key:'2',
    name:"A02",
    cycle:{
      cycle:'10ª classes',
      monthlyFee:3000,
      quantity:2
    },
    updatedAt:new Date('2025-08-28'),
    createdAt:new Date('2025-08-28'),
  },
  {
    key:'3',
    name:"B01",
    cycle:{
      cycle:'8ª classes',
      monthlyFee:3000,
      quantity:3
    },
    createdAt:new Date('2025-08-28'),
    updatedAt:new Date('2025-08-28'),
  },
]