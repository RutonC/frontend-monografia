import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Modal, Table, type TableProps } from "antd";
import { useState } from "react";
import { Input } from "../../../components/Input";
import type { IClass } from "../../../utils/type";
import { columns, dados } from "./columns";

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

function Classes() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string>('')
  const [btnTitle, setBtnTitle] = useState<string>('')
  const [form] = Form.useForm();


  const onShowModal = () =>{
    setTitle("Adicionar nova Classe");
    setBtnTitle("Adicionar")
    setOpen(true);    
  }

  const onEdit = (values:any) => {
    console.log(values)
    form.setFieldsValue({id:values?.key})
    form.setFieldsValue({name:values?.cycle})
    form.setFieldsValue({monthlyFee:values?.monthlyFee})
    setOpen(true);

     setTitle(`Editar a Classe: ${values.cycle}`);
    setBtnTitle("Actualizar")
  }

  const onDelete = (values:any)=>{
    console.log(values)
  }

   const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<IClass> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  
  return (
    <>
    <Card
      title="Classes"
      extra={
        <Button onClick={onShowModal}>
          <PlusOutlined />
        </Button>
      }>
      <Table<IClass> rowSelection={rowSelection} columns={columns({onEdit,onDelete})} onRow={(record,rowIndex)=>{
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
          <Input.Text label="Nome da classe" name="name" placeholder="Digite o nome do classe" required message="Campo obrigatório"/>
          <Input.Text label="Mensalidade" name="monthlyFee" pattern={/^\d+(?:[.,]\d{1,2})?$/}  patternMessage="Apenas números (ex.: 1500, 1500.50 ou 1500,50)" placeholder="Qual é a mensalidade para essa classe" required message="Campo obrigatório"/>
      </Form>
    </Modal>
    </>
  );
}

export default Classes;
