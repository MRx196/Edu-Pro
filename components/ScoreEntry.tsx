
import React, { useState, useEffect, useRef } from 'react';
import { ClassLevel, Subject, ClassSubjectData, StudentScore, SchoolSettings } from '../types';
import { MAX_MARKS } from '../constants';
import { calculateSubtotal, calculateClassScore50, calculateExamScore50, calculateOverallTotal, getGradeAndRemark, validateScore, calculateClassRankings } from '../utils/calculations';
import { generateStudentReportCard } from '../utils/pdfGenerator';

interface ScoreEntryProps {
  classLevel: ClassLevel;
  subject: Subject;
  data: ClassSubjectData | undefined;
  onSave: (data: ClassSubjectData) => void;
  onBack: () => void;
  allClassData: Record<string, ClassSubjectData>;
  settings: SchoolSettings;
  isAdmin: boolean;
}

const ScoreEntry: React.FC<ScoreEntryProps> = ({ 
  classLevel, subject, data, onSave, onBack, allClassData, settings, isAdmin
}) => {
  const [students, setStudents] = useState<StudentScore[]>(data?.students || []);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (data?.students) {
      setStudents(data.students);
    } else {
      setStudents([]);
    }
  }, [data]);

  const handleUpdate = (id: string, field: keyof StudentScore, value: any) => {
    const updated = students.map(s => {
      if (s.id === id) {
        if (field === 'studentName' || field === 'serialNumber' || typeof value === 'string') {
          return { ...s, [field]: value };
        } else {
          const numVal = value === '' ? null : parseFloat(value);
          return { ...s, [field]: numVal };
        }
      }
      return s;
    });
    setStudents(updated);
  };

  const handlePhotoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdate(id, 'photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAll = () => {
    onSave({ classLevel, subject, students });
    alert("All changes saved successfully!");
  };

  const handleDownloadReport = () => {
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) {
      alert("Please select a student first.");
      return;
    }

    try {
      const { rankings, totalStudents } = calculateClassRankings(classLevel, allClassData);
      const studentRank = rankings.find(r => r.id === student.id)?.rank || 0;
      const doc = generateStudentReportCard(student, classLevel, allClassData, settings, studentRank, totalStudents);
      doc.save(`${student.studentName.replace(/\s+/g, '_')}_Report.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF.");
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom duration-500 flex flex-col h-[calc(100vh-120px)]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0 px-2">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors">
            <i className="fas fa-arrow-left"></i>
            <span className="text-sm">Back</span>
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">{classLevel}</h2>
            <p className="text-slate-500 text-sm font-semibold capitalize mt-1">{subject}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-black min-w-[200px] shadow-sm"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">Choose student to print...</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.studentName.toUpperCase()}</option>
            ))}
          </select>

          <button 
            onClick={handleDownloadReport}
            disabled={!selectedStudentId}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
              selectedStudentId ? 'bg-slate-800 text-white hover:bg-black' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <i className="fas fa-file-pdf"></i>
            Print Report
          </button>
        </div>
      </div>

      <div className="mb-4 flex-shrink-0 px-2 flex justify-between items-center">
        <button 
          onClick={saveAll}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
        >
          <i className="fas fa-save"></i>
          Save Subject Data
        </button>
        {isAdmin && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">Admin Mode: Editing Enabled</span>}
      </div>

      <div className="flex-1 overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col mx-2 mb-4">
        <div ref={scrollRef} className="flex-1 overflow-auto custom-scrollbar relative">
          <table className="w-full text-left border-separate border-spacing-0 min-w-[1500px]">
            <thead className="sticky top-0 z-30 bg-slate-50">
              <tr className="text-slate-500 text-[10px] uppercase tracking-wider font-extrabold">
                <th className="p-4 border-b border-r border-slate-100 text-center w-14">S/N</th>
                <th className="p-4 border-b border-r border-slate-100 text-center w-16">Photo</th>
                <th className="p-4 border-b border-r border-slate-100 sticky left-0 bg-slate-50 z-40 w-56">Student Name</th>
                <th className="p-4 border-b border-r border-slate-100 text-center w-24">Test 1</th>
                <th className="p-4 border-b border-r border-slate-100 text-center w-24">Group</th>
                <th className="p-4 border-b border-r border-slate-100 text-center w-24">Test 2</th>
                <th className="p-4 border-b border-r border-slate-100 text-center w-24">Project</th>
                <th className="p-4 border-b border-r border-slate-100 text-center w-24 text-blue-600">Subtotal</th>
                <th className="p-4 border-b border-r border-slate-100 text-center w-24 text-purple-600">Class 50%</th>
                <th className="p-4 border-b border-r border-slate-100 text-center w-24">Exam</th>
                <th className="p-4 border-b border-r border-slate-100 text-center w-24 text-purple-600">Exam 50%</th>
                <th className="p-4 border-b border-r border-slate-100 text-center w-24 text-emerald-600">Overall</th>
                <th className="p-4 border-b border-slate-100 text-center w-20 text-amber-600">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {students.map((student, idx) => {
                const subtotal = calculateSubtotal(student);
                const cs50 = calculateClassScore50(student);
                const es50 = calculateExamScore50(student);
                const overall = calculateOverallTotal(student);
                const { grade } = getGradeAndRemark(overall);
                const isError = (val: number | null, limit: number) => val !== null && !validateScore(val, limit);

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-3 border-r border-slate-50 text-center text-slate-400 font-medium text-xs">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-50 text-center">
                      <div className="relative w-10 h-10 mx-auto">
                        {student.photo ? (
                          <img src={student.photo} className="w-10 h-10 rounded shadow-sm object-cover border border-slate-200" alt="S" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-50 rounded border border-slate-100 flex items-center justify-center text-slate-300 text-[8px]">NO IMG</div>
                        )}
                        {isAdmin && (
                          <button 
                            onClick={() => fileInputRefs.current[student.id]?.click()}
                            className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[8px] border-2 border-white shadow-sm"
                          >
                            <i className="fas fa-camera"></i>
                          </button>
                        )}
                        <input 
                          type="file" 
                          ref={el => fileInputRefs.current[student.id] = el}
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(student.id, e)}
                        />
                      </div>
                    </td>
                    <td className="p-3 border-r border-slate-50 sticky left-0 bg-white group-hover:bg-slate-50 z-20 w-56">
                      <input 
                        type="text" value={student.studentName} 
                        readOnly={!isAdmin}
                        onChange={(e) => handleUpdate(student.id, 'studentName', e.target.value)}
                        className={`w-full px-2 py-1 rounded border border-transparent outline-none font-bold uppercase tracking-tight text-xs ${
                          isAdmin ? 'bg-white hover:border-slate-100 focus:border-indigo-300 text-black' : 'bg-transparent text-slate-600 cursor-default'
                        }`}
                      />
                    </td>
                    {[
                      { f: 'test1', l: MAX_MARKS.test1 },
                      { f: 'groupWork', l: MAX_MARKS.groupWork },
                      { f: 'test2', l: MAX_MARKS.test2 },
                      { f: 'project', l: MAX_MARKS.project }
                    ].map(cell => (
                      <td key={cell.f} className="p-2 border-r border-slate-50 text-center">
                        <input 
                          type="number" 
                          value={student[cell.f as keyof StudentScore] ?? ''} 
                          onChange={(e) => handleUpdate(student.id, cell.f as keyof StudentScore, e.target.value)}
                          className={`w-14 h-9 border rounded-lg text-center text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white text-black ${
                            isError(student[cell.f as keyof StudentScore] as number, cell.l) ? 'border-red-300 text-red-600 bg-red-50' : 'border-slate-200'
                          }`}
                        />
                      </td>
                    ))}
                    <td className="p-3 border-r border-slate-50 text-center font-black text-blue-600 text-xs">{subtotal}</td>
                    <td className="p-3 border-r border-slate-50 text-center font-bold text-purple-600 text-xs">{cs50.toFixed(1)}</td>
                    <td className="p-2 border-r border-slate-50 text-center">
                      <input 
                        type="number" 
                        value={student.exam ?? ''} 
                        onChange={(e) => handleUpdate(student.id, 'exam', e.target.value)}
                        className={`w-14 h-9 border rounded-lg text-center text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white text-black ${
                          isError(student.exam, MAX_MARKS.exam) ? 'border-red-300 text-red-600 bg-red-50' : 'border-slate-200'
                        }`}
                      />
                    </td>
                    <td className="p-3 border-r border-slate-50 text-center font-bold text-purple-600 text-xs">{es50.toFixed(1)}</td>
                    <td className="p-3 border-r border-slate-50 text-center font-black text-emerald-600 text-xs">{overall.toFixed(1)}</td>
                    <td className="p-3 text-center font-black text-amber-600 text-base">{grade}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScoreEntry;
