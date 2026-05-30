import type { TeacherProfile, TeacherSectionEntry } from "@/hooks/useTeacher";
import { Tabs } from "antd";
import Personal from "./Personal";
import Schedule from "./Schedule";
import Sections from "./Sections";
import Subjects from "./Subjects";

interface TeacherTabsProps {
  teacher?: TeacherProfile;
  isPending: boolean;
}

export default function TeacherTabs({ teacher, isPending }: TeacherTabsProps) {
  const teacherSections: TeacherSectionEntry[] =
    teacher?.employee?.teacher?.sections ?? [];

  // Disciplinas únicas — deduplica por subjectId
  const uniqueSubjects = Array.from(
    new Map(teacherSections.map((ts) => [ts.subjectId, ts])).values(),
  );

  // Turmas únicas — deduplica por sectionId
  const uniqueSections = Array.from(
    new Map(teacherSections.map((ts) => [ts.sectionId, ts])).values(),
  );

  const items = [
    {
      key: "personal",
      label: "Dados Pessoais",
      children: <Personal teacher={teacher} isPending={isPending} />,
    },
    {
      key: "subjects",
      label: `Disciplinas${uniqueSubjects.length ? ` (${uniqueSubjects.length})` : ""}`,
      children: (
        <Subjects
          // Passa o array de TeacherSection — Subjects deduplica internamente
          teacherSections={teacherSections}
          isPending={isPending}
        />
      ),
    },
    {
      key: "sections",
      label: `Turmas${uniqueSections.length ? ` (${uniqueSections.length})` : ""}`,
      children: (
        <Sections teacherSections={teacherSections} isPending={isPending} />
      ),
    },
    {
      key: "schedule",
      label: "Calendário de Aulas",
      children: (
        <Schedule
          // Calendário ainda não implementado no backend
          teacherSections={teacherSections}
          isPending={isPending}
        />
      ),
    },
  ];

  return <Tabs items={items} />;
}
