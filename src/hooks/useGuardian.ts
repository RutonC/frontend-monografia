// hooks/useGuardian.ts
import { useFetch } from "@/utils/fetch";

export type GuardianStudent = {
  id: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    identifier: string;
    avatar?: string;
    birthday?: string;
    gender?: string;
    status: string;
  };
  enrollment?: Array<{
    level?: { name: string };
    section?: { name: string; academicYear?: { year: string } };
  }>;
};

export type GuardianDashboard = {
  success: boolean;
  guardian: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    email?: string;
    phoneNumber?: string;
    relation?: string;
  };
  summary: Array<{
    student: {
      id: string;
      firstName?: string;
      lastName?: string;
      identifier: string;
      avatar?: string;
      status: string;
    };
    enrollment: { level: string; section: string; academicYear: string } | null;
    financial: { overdueCount: number; overdueTotal: number };
  }>;
  totalStudents: number;
  totalOverdue: number;
  gradesTrend: Array<{
    studentId: string;
    studentName: string;
    terms: Array<{ termName: string; average: number | null }>;
  }>;
  paymentMethodBreakdown: Array<{ method: string; total: number }>;
};

export const useGuardianDashboard = () =>
  useFetch<GuardianDashboard>(["guardian", "dashboard"], "guardian/dashboard");

export const useGuardianStudents = () =>
  useFetch<{ success: boolean; students: GuardianStudent[] }>(
    ["guardian", "students"],
    "guardian/students",
  );

function buildQuery(params: Record<string, string | undefined>) {
  const entries = Object.entries(params).filter(([, v]) => !!v) as [
    string,
    string,
  ][];
  if (entries.length === 0) return "";
  return `?${entries.map(([k, v]) => `${k}=${v}`).join("&")}`;
}

export const useStudentGrades = (
  studentId: string,
  termId?: string,
  academicYearId?: string,
) =>
  useFetch(
    ["guardian", "grades", studentId, termId ?? "all", academicYearId ?? "current"],
    `guardian/students/${studentId}/grades${buildQuery({ termId, academicYearId })}`,
    { enabled: !!studentId },
  );

export const useStudentAttendance = (
  studentId: string,
  termId?: string,
  academicYearId?: string,
) =>
  useFetch(
    ["guardian", "attendance", studentId, termId ?? "all", academicYearId ?? "current"],
    `guardian/students/${studentId}/attendance${buildQuery({ termId, academicYearId })}`,
    { enabled: !!studentId },
  );

export const useStudentSchedule = (studentId: string, academicYearId?: string) =>
  useFetch(
    ["guardian", "schedule", studentId, academicYearId ?? "current"],
    `guardian/students/${studentId}/schedule${buildQuery({ academicYearId })}`,
    { enabled: !!studentId },
  );

export const useStudentInvoices = (studentId: string, academicYearId?: string) =>
  useFetch(
    ["guardian", "invoices", studentId, academicYearId ?? "all"],
    `guardian/students/${studentId}/invoices${buildQuery({ academicYearId })}`,
    { enabled: !!studentId },
  );
