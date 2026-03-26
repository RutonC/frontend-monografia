import type { PieConfig } from '@ant-design/plots'
import { Pie } from '@ant-design/plots'
import { statsStudents } from '../utils/dada'


function ChartPieStudents() {
  const config:PieConfig = {
      data: statsStudents.map(item => ({
      ...item,
      valor: Number(item.valor), // garantir que é número
    })),
    angleField: 'valor',
    colorField: 'label',
    innerRadius: 0.6,
    height:400,
    // label: {
    //   type: 'inner',
    //   offset: '-30%',
    //   content: ({ percent }:any) => `${(percent * 100).toFixed(1)}%`,
    //   style: {
    //     fontSize: 14,
    //     fontWeight: 'bold',
    //     textAlign: 'center',
    //   },
    // },
    legend: {
      text:false,
      position: 'right',
    },
    annotations: [
      {
        type: 'text',
        style: {
          text: `Total\n${statsStudents.reduce((sum, s) => sum + Number(s.valor), 0)}`,
          x: '50%',
          y: '50%',
          textAlign: 'center',
          fontSize: 40,
          fontWeight: 'bold',
        },
      },
    ],
  }


  return (
    <Pie {...config}/>
  )
}

export default ChartPieStudents