
export type ClassLevel = 'Basic 7' | 'Basic 8' | 'Basic 9';

export type Subject = 
  | 'Mathematics' | 'Science' | 'RME' | 'Social Studies' 
  | 'Career Technology' | 'French' | 'Dangme' | 'ICT' 
  | 'Creative Art' | 'English Language';

export type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER';
export type SchoolStatus = 'ACTIVE' | 'EXPIRED' | 'LOCKED';

export interface StudentScore {
  id: string;
  serialNumber: string;
  studentName: string;
  photo?: string;
  test1: number | null;
  groupWork: number | null;
  test2: number | null;
  project: number | null;
  exam: number | null;
  attendance?: string; 
  interest?: string;
  conduct?: string;
  teacherRemark?: string;
  headTeacherRemark?: string;
}

export interface ClassSubjectData {
  classLevel: ClassLevel;
  subject: Subject;
  students: StudentScore[];
}

export interface TeacherInfo {
  id: string;
  name: string;
  assignedClass: ClassLevel;
  token: string;
}

export interface SecondaryAdminInfo {
  id: string;
  username: string;
  password: string;
}

export interface School {
  id: string;
  name: string;
  logo: string;
  status: SchoolStatus;
  expiryDate: string; // ISO string
  adminUsername: string;
  adminPassword: string;
  settings: SchoolSettings;
  masterStudents: Record<ClassLevel, { id: string, name: string, serial: string }[]>;
  scores: Record<string, ClassSubjectData>;
}

export interface SchoolSettings {
  schoolName: string;
  schoolLogo: string;
  academicYear: string;
  term: string;
  nextTermBegins: string;
  maxAttendance: number;
  interests: string[];
  conducts: string[];
  teacherTokens: string[]; // Legacy - kept for compatibility
  teachers: TeacherInfo[];
  secondaryAdmins: SecondaryAdminInfo[];
}

export interface AppState {
  schools: School[];
  superAdminPassword: string;
  currentSchoolId: string | null;
  currentUserRole: UserRole | null;
  isLoggedIn: boolean;
}
