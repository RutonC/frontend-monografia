import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Modal, Table, type TableProps } from "antd";
import { useState } from "react";
import { Input } from "../../../components/Input";
import type { IClassroom } from "../../../utils/type";
import { columns, dados } from "./columns";

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

function Turmas() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string>('')
  const [btnTitle, setBtnTitle] = useState<string>('')
  const [form] = Form.useForm();


  const onShowModal = () =>{
    setTitle("Adicionar nova Turma");
    setBtnTitle("Adicionar")
    setOpen(true);    
  }

  const onEdit = (values:any) => {
    console.log(values)
    form.setFieldsValue({id:values?.key})
    form.setFieldsValue({name:values?.name})
    setOpen(true);

     setTitle(`Editar a turma: ${values.name}`);
    setBtnTitle("Actualizar")
  }

  const onDelete = (values:any)=>{
    console.log(values)
  }

   const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<IClassroom> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  
  return (
    <>
    <Card
      title="Turmas"
      extra={
        <Button onClick={onShowModal}>
          <PlusOutlined />
        </Button>
      }>
      <Table<IClassroom> rowSelection={rowSelection} columns={columns({onEdit,onDelete})} onRow={(record,rowIndex)=>{
        return{
          onClick:()=>onEdit(record)
        }
      }} dataSource={dados} pagination={{pageSize:7}}/>
    </Card>
    
    <Modal open={open} title={title}  onCancel={()=>{setOpen(false);form.resetFields()}} okText={btnTitle} cancelText="Cancelar">
      <Form
        name="form_class"
        layout="vertical"
        form={form}>
          <Input.Id label="ID" name="id"/>
          <Input.Text label="Nome da turma" name="name" placeholder="Digite o nome da turma" required message="Campo obrigatório"/>
          <Input.Select label="Selecione a classe" options={[]} placeholder="Selecione a classe para essa turma"/>
          <Input.Select label="Professor responsável" options={[]} placeholder="Selecione o professor/a por essa turma"/>
      </Form>
    </Modal>
    </>
  );
}

export default Turmas;
