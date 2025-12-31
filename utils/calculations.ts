
import { StudentScore, ClassLevel, ClassSubjectData, Subject } from '../types';
import { SUBJECTS } from '../constants';

export const calculateSubtotal = (score: StudentScore): number => {
  return (score.test1 || 0) + (score.groupWork || 0) + (score.test2 || 0) + (score.project || 0);
};

export const calculateClassScore50 = (score: StudentScore): number => {
  return calculateSubtotal(score) * 0.5;
};

export const calculateExamScore50 = (score: StudentScore): number => {
  return (score.exam || 0) * 0.5;
};

export const calculateOverallTotal = (score: StudentScore): number => {
  return calculateClassScore50(score) + calculateExamScore50(score);
};

export const getGradeAndRemark = (total: number): { grade: number; remark: string } => {
  if (total >= 80) return { grade: 1, remark: 'Excellent' };
  if (total >= 70) return { grade: 2, remark: 'Very Good' };
  if (total >= 65) return { grade: 3, remark: 'Good' };
  if (total >= 60) return { grade: 4, remark: 'High Average' };
  if (total >= 55) return { grade: 5, remark: 'Average' };
  if (total >= 50) return { grade: 6, remark: 'Below Average' };
  if (total >= 40) return { grade: 7, remark: 'Weak' };
  if (total >= 30) return { grade: 8, remark: 'Very Weak' };
  return { grade: 9, remark: 'Fail' };
};

export const validateScore = (value: number, limit: number): boolean => {
  return value >= 0 && value <= limit;
};

/**
 * Aggregate Calculation:
 * Best 6 subjects.
 * 4 Compulsory: Mathematics, Science, English Language, Social Studies.
 * 2 Best from the remaining 6.
 */
export const calculateAggregate = (
  studentId: string,
  classLevel: ClassLevel,
  allClassData: Record<string, ClassSubjectData>
): number => {
  const compulsory: Subject[] = ['Mathematics', 'Science', 'English Language', 'Social Studies'];
  const grades: number[] = [];
  const otherGrades: number[] = [];

  SUBJECTS.forEach(sub => {
    const key = `${classLevel}-${sub}`;
    const subjectData = allClassData[key];
    const score = subjectData?.students.find(s => s.id === studentId);
    const total = score ? calculateOverallTotal(score) : 0;
    const { grade } = getGradeAndRemark(total);

    if (compulsory.includes(sub)) {
      grades.push(grade);
    } else {
      otherGrades.push(grade);
    }
  });

  // Sort others ascending to pick the lowest grades (best performance)
  otherGrades.sort((a, b) => a - b);
  
  // Sum 4 compulsory + top 2 from others
  const bestTwoOthers = otherGrades.slice(0, 2);
  const finalGrades = [...grades, ...bestTwoOthers];
  
  return finalGrades.reduce((sum, g) => sum + g, 0);
};

export const calculateGrandTotal = (
  studentId: string,
  classLevel: ClassLevel,
  allClassData: Record<string, ClassSubjectData>
): number => {
  let grand = 0;
  SUBJECTS.forEach(sub => {
    const key = `${classLevel}-${sub}`;
    const score = allClassData[key]?.students.find(s => s.id === studentId);
    grand += score ? calculateOverallTotal(score) : 0;
  });
  return grand;
};

export const calculateClassRankings = (
  classLevel: ClassLevel,
  allClassData: Record<string, ClassSubjectData>
) => {
  const studentTotals: Record<string, { id: string; name: string; serial: string; grandTotal: number; aggregate: number }> = {};

  Object.values(allClassData).forEach(data => {
    if (data.classLevel === classLevel) {
      data.students.forEach(s => {
        if (!studentTotals[s.id]) {
          studentTotals[s.id] = { 
            id: s.id, 
            name: s.studentName, 
            serial: s.serialNumber, 
            grandTotal: 0,
            aggregate: 0
          };
        }
      });
    }
  });

  Object.keys(studentTotals).forEach(id => {
    studentTotals[id].grandTotal = calculateGrandTotal(id, classLevel, allClassData);
    studentTotals[id].aggregate = calculateAggregate(id, classLevel, allClassData);
  });

  // Rank by Grand Total (descending)
  const sorted = Object.values(studentTotals).sort((a, b) => b.grandTotal - a.grandTotal);
  
  return {
    rankings: sorted.map((s, index) => ({ ...s, rank: index + 1 })),
    totalStudents: sorted.length
  };
};
