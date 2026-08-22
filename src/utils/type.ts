interface Base {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClass extends Base {
  cycle: string;
  quantity: number;
  monthlyFee: number;
}

export interface ISemester extends Base {
  name: string;
  startDate: Date;
  endDate: Date;
}

// utils/type.ts — adicionar/actualizar estas interfaces
// (manter as que já existem e adicionar as novas)

export interface IAcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITerm {
  id: string;
  name: string;
  academicYearId: string;
  startDate?: string;
  endDate?: string;
  monthlyFee?: number;
  gracePeriodDays?: number;
  lateFeeWeek1Percent?: number;
  lateFeeWeek2Percent?: number;
  lateFeeWeek3PlusPercent?: number;
  academicYear?: IAcademicYear;
  createdAt?: string;
  updatedAt?: string;
}

export interface ILevel {
  id: string;
  name: string;
  description?: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISection {
  id: string;
  name: string;
  levelId: string;
  academicYearId: string;
  capacity: number;
  status: boolean;
  level?: ILevel;
  academicYear?: IAcademicYear;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISubject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IDepartment {
  id: string;
  name: string;
  description?: string;
  employeeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IEmployee {
  id: string;
  position?: string;
  academicLevel?: string;
  wage?: number;
  departmentId: string;
  department?: IDepartment;
  teacher?: ITeacher;
  user?: IUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITeacher {
  id: string;
  specialization?: string;
}

export interface IUser {
  id: string;
  identifier: string;
  slug?: string;
  cardIdentifyNumber: string;
  firstName?: string;
  nuitNumber: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  birthday?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  avatar?: string;
  type: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt?: string;
  updatedAt?: string;
}

export interface IStudent {
  id: string;
  naturalness?: string;
  districtOfBirth?: string;
  provinceOfBirth?: string;
  personWithDisability?: string;

  whoDoYouLiveWith: string;
  previousSchoolYear: string;
  previousSchool: string;
  studentResidence: string;
  registrationStatus: string;
  previousClass: string;
  placeOfIssue: string;
  validateDate: Date;
  registrationCompleted: boolean;
  financialStatus: string;
  guardianId?: string;
  user?: IUser;
  guardian?: IGuardian;
  createdAt?: string;
  updatedAt?: string;
}

export interface IGuardian {
  id: string;
  relation?: string;
  user?: IUser;
}

export interface IEnrollment {
  id: string;
  studentId: string;
  academicYearId: string;
  sectionId: string;
  levelId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  student?: IStudent;
  section?: ISection;
  level?: ILevel;
  academicYear?: IAcademicYear;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPermission {
  id: string;
  key: string;
  label?: string;
  action: string;
  subject: string;
  createdAt?: string;
}

export interface IRole {
  id: string;
  name: string;
  createdAt?: string;
  permissionCount?: number;
  userCount?: number;
  permissions?: IPermission[];
}

// Manter interfaces antigas para compatibilidade
export interface IClassroom {
  key?: string;
  name: string;
  cycle?: { cycle: string; monthlyFee: number; quantity: number };
  createdAt?: Date;
  updatedAt?: Date;
}
