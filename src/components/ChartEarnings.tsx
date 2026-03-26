import type { ColumnConfig } from '@ant-design/plots'
import { Column } from '@ant-design/plots'
import { graficoDeGanhosAnual, graficoDeGanhosMensal, graficoDeGanhosSemanal } from '../utils/dada'

function ChartEarnings({status}:{status:string}) {
  
  const getStatus = (status:string) => {
    if(status === 'anual'){
      return graficoDeGanhosAnual
    }else if(status === 'mensal'){
      return graficoDeGanhosMensal
    }else if(status === 'semanal'){
      return graficoDeGanhosSemanal
    }else{
      return graficoDeGanhosAnual
    }
  }


  const config:ColumnConfig = {
    data:getStatus(status),
    xField:'label',
    yField:'valor',
    height:400,
    style:{
      radiusTopLeft:10,
      radiusTopRight:10,
    }
  }
  
  return (
    <Column {...config} />
  )
}

export default ChartEarnings