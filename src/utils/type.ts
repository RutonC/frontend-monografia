interface Base {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IUser extends Base {
  cardIdentifyNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  nuitNumber: string;
  address: string;
  phoneNumber: string;
  birthday: Date;
  avatar: string;
  status: string;
  type: string;
  gender: string;
  identifier: string;
}

interface Person extends Base {
  name: string;
  address: string;
  email: string;
  phoneOne: string;
  alternativeContact: string;
}

export interface IDepartment extends Base {
  name: string;
  description: string;
  employeeCount: number;
}

export interface IEmployee extends Base {
  academicLevel: string;
  position: string;
  department: IDepartment;
  user: IUser;
}

export interface ITeacher extends Base {
  name: string;
  birthDate: Date;
  function: string;
  department: IDepartment;
  email: string;
  gender: string;
  mobile: string;
  degree: string;
  address: string;
  hireDate: string;
  salary: string;
}

export interface IStudent extends IUser {
  gender: string;
  birthday: Date;
  birthdayDistrict: string;
  nature: string;
  province: string;
  personalID: string;
  placeOfIssue: string;
  expirationDate: Date;
  disabledPerson: boolean;
  disabledPersonName: string;
  previousClass: string;
  previousTeacher: string;
  previousRoomClass: string;

  fatherName: string;
  fatherAddress: string;
  fatherProfession: string;
  fatherWorkplace: string;
  fatherContact: string;
  fatherEmail: string;

  motherName: string;
  motherAddress: string;
  motherWorkplace: string;
  motherContact: string;
  motherEmail: string;

  whoDoYouLiveWith: string;
  previousSchoolYear: string;
  previousSchoolName: string;
  studentResidence: string;
  user: IUser;
  registrationStatus: string;
  registrationCompleted: boolean;
  financialStatus: string;
}

export interface ILevel extends Base {
  name: string;
  description: string;
  status: boolean;
  sections: ISection;
  subjectsOnLevel: any;
  enrollments: any;
}

export interface ISection extends Base {
  name: string;
  levelId: string;
  capacity: number;
  status: boolean;
  enrollments: any; // IEnrollements
  attendace: any; // IAttendance
}

export interface IClass extends Base {
  cycle: string;
  quantity: number;
  monthlyFee: number;
}

export interface IClassroom extends Base {
  name: string;
  cycle: IClass;
  assignTeacher?: ITeacher[];
}

export interface IGuardian extends Person {
  workplaceAddress: string;
  profession: string;
  students: IStudent[];
}

export interface ISemester extends Base {
  name: string;
  startDate: Date;
  endDate: Date;
}
