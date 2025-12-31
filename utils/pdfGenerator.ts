
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SchoolSettings, ClassLevel, StudentScore, ClassSubjectData } from '../types';
import { calculateClassScore50, calculateExamScore50, calculateOverallTotal, getGradeAndRemark, calculateClassRankings, calculateAggregate, calculateGrandTotal } from './calculations';
import { SUBJECTS } from '../constants';

export const drawStudentReportOnDoc = (
  doc: jsPDF,
  student: StudentScore,
  classLevel: ClassLevel,
  allClassData: Record<string, ClassSubjectData>,
  settings: SchoolSettings,
  ranking: number,
  totalStudents: number
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // 1. Photo Box
  doc.setDrawColor(37, 99, 235);
  doc.rect(15, 10, 35, 40);
  
  if (student.photo) {
    try {
      doc.addImage(student.photo, 'JPEG', 15.5, 10.5, 34, 39);
    } catch (e) {
      console.error("Error drawing student photo", e);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("PHOTO ERR", 22, 30);
    }
  } else {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("PHOTO", 25, 30);
  }

  // 2. Header
  if (settings.schoolLogo) {
    try {
      doc.addImage(settings.schoolLogo, 'PNG', pageWidth / 2 - 10, 10, 20, 20);
    } catch (e) {}
  }
  
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.schoolName, pageWidth / 2, 40, { align: 'center' });
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text("Academic Report Card", pageWidth / 2, 48, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${settings.term} - ${settings.academicYear}`, pageWidth / 2, 56, { align: 'center' });

  // 3. Info Bar Grid
  const infoY = 70;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, infoY, pageWidth - 30, 28, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Student Name:", 20, infoY + 7);
  doc.text("Position:", 20, infoY + 16);
  doc.text("Interest:", 20, infoY + 25);
  
  doc.text("Class:", 75, infoY + 7);
  doc.text("Aggregate:", 75, infoY + 16);
  doc.text("Conduct:", 75, infoY + 25);
  
  doc.text("Serial No:", 140, infoY + 7);
  doc.text("Attendance:", 140, infoY + 16);
  doc.text("Next Term Begins:", 140, infoY + 25);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  const aggregateValue = calculateAggregate(student.id, classLevel, allClassData);
  doc.text(student.studentName.toUpperCase(), 45, infoY + 7);
  doc.text(`${ranking} out of ${totalStudents}`, 35, infoY + 16);
  doc.text(student.interest || "N/A", 35, infoY + 25);
  
  doc.text(classLevel, 85, infoY + 7);
  doc.text(aggregateValue.toString(), 95, infoY + 16);
  doc.text(student.conduct || "N/A", 95, infoY + 25);
  
  doc.text(student.serialNumber, 158, infoY + 7);
  doc.text(student.attendance || "N/A", 162, infoY + 16);
  doc.text(settings.nextTermBegins, 172, infoY + 25);

  // 4. Scores Table
  const tableData = SUBJECTS.map(sub => {
    const key = `${classLevel}-${sub}`;
    const score = allClassData[key]?.students.find(s => s.id === student.id);
    if (!score) return [sub, '', '', '', '', 'No scores recorded'];
    
    const cs50 = calculateClassScore50(score);
    const es50 = calculateExamScore50(score);
    const overall = calculateOverallTotal(score);
    const { grade, remark } = getGradeAndRemark(overall);
    
    return [sub, cs50.toFixed(1), es50.toFixed(1), overall.toFixed(1), grade.toString(), remark];
  });

  autoTable(doc, {
    startY: infoY + 35,
    head: [['Subject', 'Class Score (50%)', 'Exam Score (50%)', 'Overall', 'Grade', 'Remark']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10, fontStyle: 'bold' },
    styles: { fontSize: 9, halign: 'center' },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      5: { halign: 'center' }
    },
    didParseCell: (data: any) => {
      if (data.row.index >= 0 && data.cell.text[0] === 'No scores recorded') {
        data.cell.styles.textColor = [200, 200, 200];
        data.cell.styles.fontStyle = 'italic';
      }
    }
  });

  const tableEndY = (doc as any).lastAutoTable.finalY + 10;
  const grandTotal = calculateGrandTotal(student.id, classLevel, allClassData);

  // 5. Summary Row
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(15, tableEndY, 60, 12, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text(`Grand Total: ${grandTotal.toFixed(1)} / 1000`, 20, tableEndY + 8);

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(pageWidth - 85, tableEndY, 70, 12, 3, 3, 'F');
  doc.setTextColor(22, 101, 52);
  doc.text(`Aggregate: ${aggregateValue}`, pageWidth - 80, tableEndY + 8);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("(Best 6 subjects)", pageWidth - 45, tableEndY + 8);

  // 6. Remarks Section
  const remarkY = tableEndY + 20;
  // Left Box: Teacher
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, remarkY, 80, 45, 3, 3, 'S');
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("Class Teacher's Remark:", 20, remarkY + 8);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(doc.splitTextToSize(student.teacherRemark || "Average performance, more room for improvement.", 70), 20, remarkY + 15);
  
  doc.setDrawColor(0, 0, 0);
  doc.line(20, remarkY + 38, 75, remarkY + 38);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text("Signature & Date", 20, remarkY + 42);

  // Right Box: Headteacher
  doc.roundedRect(pageWidth - 95, remarkY, 80, 45, 3, 3, 'S');
  doc.setTextColor(37, 99, 235);
  doc.text("Headteacher's Remark:", pageWidth - 90, remarkY + 8);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(doc.splitTextToSize(student.headTeacherRemark || "There is the need for extra motivation to sit up.", 70), pageWidth - 90, remarkY + 15);

  doc.setDrawColor(0, 0, 0);
  doc.line(pageWidth - 90, remarkY + 38, pageWidth - 35, remarkY + 38);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text("Signature & Date", pageWidth - 90, remarkY + 42);
};

export const generateStudentReportCard = (
  student: StudentScore,
  classLevel: ClassLevel,
  allClassData: Record<string, ClassSubjectData>,
  settings: SchoolSettings,
  ranking: number,
  totalStudents: number
) => {
  const doc = new jsPDF();
  drawStudentReportOnDoc(doc, student, classLevel, allClassData, settings, ranking, totalStudents);
  return doc;
};

export const generateBulkReportCards = (
  classLevel: ClassLevel,
  allClassData: Record<string, ClassSubjectData>,
  settings: SchoolSettings
) => {
  const { rankings, totalStudents } = calculateClassRankings(classLevel, allClassData);
  if (totalStudents === 0) return alert("No student data found.");

  const doc = new jsPDF();
  rankings.forEach((sRank, index) => {
    if (index > 0) doc.addPage();
    const fullStudentData = (allClassData[`${classLevel}-${SUBJECTS[0]}`]?.students || []).find(st => st.id === sRank.id);
    
    const fallbackStudent: StudentScore = {
      id: sRank.id,
      studentName: sRank.name,
      serialNumber: sRank.serial,
      test1: null,
      groupWork: null,
      test2: null,
      project: null,
      exam: null
    };

    drawStudentReportOnDoc(
      doc,
      fullStudentData || fallbackStudent,
      classLevel,
      allClassData,
      settings,
      sRank.rank,
      totalStudents
    );
  });
  doc.save(`${classLevel.replace(' ', '_')}_Report_Cards.pdf`);
};
