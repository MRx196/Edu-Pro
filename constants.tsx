
import { ClassLevel, Subject, SchoolSettings } from './types';

export const CLASS_LEVELS: ClassLevel[] = ['Basic 7', 'Basic 8', 'Basic 9'];

export const SUBJECTS: Subject[] = [
  'Mathematics',
  'Science',
  'RME',
  'Social Studies',
  'Career Technology',
  'French',
  'Dangme',
  'ICT',
  'Creative Art',
  'English Language'
];

export const MAX_MARKS = {
  test1: 30,
  groupWork: 20,
  test2: 30,
  project: 20,
  exam: 100
};

export const ADMIN_CREDENTIALS = {
  username: 'mrxmail20@gmail.com',
  password: '2547852'
};

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'NAKOMKOPE D/A J.H.S',
  schoolLogo: '',
  academicYear: '2024/2025',
  term: 'First Term',
  nextTermBegins: 'January 7, 2026',
  maxAttendance: 75,
  interests: ['Football', 'Music', 'Reading', 'Art', 'Computing', 'Gardening'],
  conducts: ['Accommodating', 'Respectful', 'Hardworking', 'Needs Improvement', 'Excellent', 'Disciplined'],
  teacherTokens: ['TEACH2024']
};
