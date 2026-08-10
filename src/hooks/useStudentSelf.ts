// hooks/useStudentSelf.ts
// Auto-serviço do Aluno — mesma forma de dados que o Encarregado vê por
// educando (guardian.controller.ts), mas pelas rotas neutras
// /students/:id/... que aceitam o próprio aluno autenticado.
import { useAuthStore } from "@/store/authStore";
import { useFetch } from "@/utils/fetch";

export const useMyGrades = (termId?: string) => {
  const { user } = useAuthStore();
  const studentId = user?.id ?? "";
  return useFetch(
    ["student-self", "grades", studentId, termId ?? "all"],
    `students/${studentId}/grades${termId ? `?termId=${termId}` : ""}`,
    { enabled: !!studentId },
  );
};

export const useMyAttendance = (termId?: string) => {
  const { user } = useAuthStore();
  const studentId = user?.id ?? "";
  return useFetch(
    ["student-self", "attendance", studentId, termId ?? "all"],
    `students/${studentId}/attendance${termId ? `?termId=${termId}` : ""}`,
    { enabled: !!studentId },
  );
};

export const useMySchedule = () => {
  const { user } = useAuthStore();
  const studentId = user?.id ?? "";
  return useFetch(
    ["student-self", "schedule", studentId],
    `students/${studentId}/schedule`,
    { enabled: !!studentId },
  );
};

export const useMyInvoices = () => {
  const { user } = useAuthStore();
  const studentId = user?.id ?? "";
  return useFetch(
    ["student-self", "invoices", studentId],
    `students/${studentId}/invoices`,
    { enabled: !!studentId },
  );
};
