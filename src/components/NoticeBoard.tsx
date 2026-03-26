import { Table } from "antd"
import { notice } from "../utils/dada"

function NoticeBoard() {

  const columns = [
    {
      title:"No",
      dataIndex:'index',
      key:'index'    
    },
    {
      title:"Sobre",
      dataIndex:'about',
      key:'about',
    },
    {
      title:"Data",
      dataIndex:'createdAt',
      key:'createdAt'    
    },
    {
      title:"Visualizações",
      dataIndex:'views',
      key:'views'    
    },
  ]

  return (
    <div>
      <Table columns={columns} dataSource={notice}/>
    </div>
  )
}

export default NoticeBoard