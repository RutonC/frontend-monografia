// hooks/useStudentSelf.ts
// Auto-serviço do Aluno — mesma forma de dados que o Encarregado vê por
// educando (guardian.controller.ts), mas pelas rotas neutras
// /students/:id/... que aceitam o próprio aluno autenticado.
import { useAuthStore } from "@/store/authStore";
import { useFetch } from "@/utils/fetch";

function buildQuery(params: Record<string, string | undefined>) {
  const entries = Object.entries(params).filter(([, v]) => !!v) as [
    string,
    string,
  ][];
  if (entries.length === 0) return "";
  return `?${entries.map(([k, v]) => `${k}=${v}`).join("&")}`;
}

export const useMyGrades = (termId?: string, academicYearId?: string) => {
  const { user } = useAuthStore();
  const studentId = user?.id ?? "";
  return useFetch(
    ["student-self", "grades", studentId, termId ?? "all", academicYearId ?? "current"],
    `students/${studentId}/grades${buildQuery({ termId, academicYearId })}`,
    { enabled: !!studentId },
  );
};

export const useMyAttendance = (termId?: string, academicYearId?: string) => {
  const { user } = useAuthStore();
  const studentId = user?.id ?? "";
  return useFetch(
    ["student-self", "attendance", studentId, termId ?? "all", academicYearId ?? "current"],
    `students/${studentId}/attendance${buildQuery({ termId, academicYearId })}`,
    { enabled: !!studentId },
  );
};

export const useMySchedule = (academicYearId?: string) => {
  const { user } = useAuthStore();
  const studentId = user?.id ?? "";
  return useFetch(
    ["student-self", "schedule", studentId, academicYearId ?? "current"],
    `students/${studentId}/schedule${buildQuery({ academicYearId })}`,
    { enabled: !!studentId },
  );
};

export const useMyInvoices = (academicYearId?: string) => {
  const { user } = useAuthStore();
  const studentId = user?.id ?? "";
  return useFetch(
    ["student-self", "invoices", studentId, academicYearId ?? "all"],
    `students/${studentId}/invoices${buildQuery({ academicYearId })}`,
    { enabled: !!studentId },
  );
};
