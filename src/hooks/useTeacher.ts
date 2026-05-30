import { useFetch } from "@/utils/fetch";

// ─────────────────────────────────────────────────────────────
//  Estrutura real devolvida pelo backend:
//  teacher (User) → employee → teacher → sections (TeacherSection[])
//
//  TeacherSection { teacherId, sectionId, subjectId,
//    section: { id, name, level, academicYear },
//    subject: { id, name, code }
//  }
// ─────────────────────────────────────────────────────────────

export type TeacherSubject = {
  // Vem de TeacherSection — uma entrada por (turma × disciplina)
  teacherId: string;
  sectionId: string;
  subjectId: string;
  subject: {
    id: string;
    name: string;
    code?: string;
    description?: string;
  };
  section: {
    id: string;
    name: string;
    level: { id: string; name: string };
    academicYear: { id: string; year: string };
  };
};

// Alias — a "turma" do professor é o mesmo registo TeacherSection
// agrupado por section, não por subject
export type TeacherSectionEntry = {
  teacherId: string;
  sectionId: string;
  subjectId: string;
  section: {
    id: string;
    name: string;
    level: { id: string; name: string };
    academicYear: { id: string; year: string };
  };
  subject: {
    id: string;
    name: string;
    code?: string;
    description?: string;
  };
};

// Calendário — ainda não existe no backend (sem modelo Schedule)
// Deixamos o tipo para quando for implementado
export type TeacherSchedule = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: { id: string; name: string };
  section: { id: string; name: string };
};

export type TeacherProfile = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  birthday?: string;
  gender?: string;
  identifier: string;
  slug?: string;
  status: string;
  avatar?: string;
  employee?: {
    id: string;
    position?: string;
    academicLevel?: string;
    wage?: number;
    department?: { id: string; name: string };
    teacher?: {
      id: string;
      specialization?: string;
      // Array de TeacherSection — cada entrada é turma+disciplina
      sections: TeacherSectionEntry[];
    };
  };
};

type TeacherResponse = {
  success: boolean;
  teacher: TeacherProfile;
};

export const useTeacherProfile = (slug: string) => {
  return useFetch<TeacherResponse>(
    ["teacher", "profile", slug],
    `teachers/profile/${slug}`,
    { enabled: !!slug },
  );
};
