import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Typography, type TableColumnsType } from "antd";
import { intl } from "../../../utils/intl";
import type { IClass } from "../../../utils/type";

type Handlers = {
  onEdit:(r:IClass) => void;
  onDelete:(r:IClass) => void;
}

export const columns = ({onEdit, onDelete}:Handlers):TableColumnsType<IClass> => [
  {
    title: 'Ciclo',
    dataIndex: 'cycle',
    key: 'cycle',
  },
  {
    title: 'Mensalidade',
    dataIndex: 'monthlyFee',
    key: 'monthlyFee',
  },
  {
    title: 'Data de crição',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render:(createdAt:Date) => intl(createdAt)
  },
  {
    title: 'Número de turmas',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: 'Acções',
    key:'action',
    fixed:'right',
    width:'6rem',
    render:(_,{cycle}) => (
      <Space size='small'>
        <Button icon={<EditOutlined/>} onClick={(e)=>{onEdit(_); e.stopPropagation()}}/>
        <Popconfirm title={`Remover o departemento ${name}`} okText="Sim" cancelText="Não" description={<Typography.Text>Tem certeza que pretende remover o <strong>{cycle}?</strong></Typography.Text>}>
        <Button danger icon={<DeleteOutlined/>} onClick={(e)=>{onDelete(_); e.stopPropagation()}}/>
        </Popconfirm>
      </Space>
    )
  },
];


export const dados = [
  {
    key:'1',
    cycle:"10ª classes",
    monthlyFee:3000,
    createdAt:new Date('2025-08-28'),
    updatedAt:new Date('2025-08-28'),
    quantity:2
  },
  {
    key:'2',
    cycle:"9ª classes",
    monthlyFee:3000,
    updatedAt:new Date('2025-08-28'),
    createdAt:new Date('2025-08-28'),
    quantity:2
  },
  {
    key:'3',
    cycle:"8ª classes",
    monthlyFee:3000,
    createdAt:new Date('2025-08-28'),
    updatedAt:new Date('2025-08-28'),
    quantity:3
  },
]