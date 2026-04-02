import { Tabs } from "antd";
import Personal from "./Personal";

export default function TeacherTabs() {
  const items = [
    {
      key: "1",
      label: "Dados Pessoais",
      children: <Personal />,
    },
    {
      key: "2",
      label: "Disciplina(s) Associada(s)",
      children: <div>Conteúdo das Disciplinas Associadas</div>,
    },
    {
      key: "3",
      label: "Turma(s) Associada(s)",
      children: <div>Conteúdo das Turmas Associadas</div>,
    },
    {
      key: "4",
      label: "Calendário de Aulas",
      children: <div>Conteúdo do Calendário de Aulas</div>,
    },
  ];
  return <Tabs items={items} />;
}
