import { Typography } from 'antd'
import { Link } from 'react-router-dom'
import error404 from '../../assets/404.svg'

function NotFound() {
  return (
    <div style={{
      display:'flex',
      height:'100vh',
      justifyContent:'center',
      alignItems:'center',
      gap:24
    }}>
      <img src={error404} alt='404error' height={200}/>
      <div>
        <Typography.Title level={1} style={{fontSize:86, padding:0, margin:0}}>Oops!</Typography.Title>
        <Typography.Paragraph style={{fontSize:23}}>Não conseguimos encontrar a página <br/> que você estava procurando.</Typography.Paragraph>
        <Link to='/' style={{
          height:40,
          backgroundColor:'#1252b1',
          textDecoration:'none',
          paddingBlock:10,
          paddingInline:10,
          borderRadius:4,
          color:'#FFF'
        }}>Voltar para Início</Link>
      </div>
    </div>
  )
}

export default NotFound