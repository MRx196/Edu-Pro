
import React, { useState, useRef } from 'react';
import { ClassLevel, StudentScore, SchoolSettings, AppState } from '../types';
import { CLASS_LEVELS, SUBJECTS } from '../constants';

interface TeacherReportViewProps {
  appState: AppState;
  onSave: (classLevel: ClassLevel, students: StudentScore[]) => void;
  onBack: () => void;
}

const TeacherReportView: React.FC<TeacherReportViewProps> = ({ appState, onSave, onBack }) => {
  const [selectedClass, setSelectedClass] = useState<ClassLevel | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentScore | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStudentsForClass = (cls: ClassLevel): StudentScore[] => {
    // We aggregate data from the first subject found for that class to get the student list
    const firstSubjectKey = `${cls}-${SUBJECTS[0]}`;
    return appState.scores[firstSubjectKey]?.students || [];
  };

  const handleUpdate = (field: keyof StudentScore, value: any) => {
    if (!selectedStudent) return;
    setSelectedStudent({ ...selectedStudent, [field]: value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdate('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStudent = () => {
    if (!selectedClass || !selectedStudent) return;
    
    // Find students list
    const currentStudents = getStudentsForClass(selectedClass);
    const updatedStudents = currentStudents.map(s => s.id === selectedStudent.id ? selectedStudent : s);
    
    onSave(selectedClass, updatedStudents);
    setSelectedStudent(null);
    alert('Student report details updated and synced across all subjects.');
  };

  return (
    <div className="animate-in slide-in-from-right duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"><i className="fas fa-arrow-left"></i></button>
        <h2 className="text-3xl font-bold text-slate-800">Class Teacher Report</h2>
      </div>

      {!selectedClass ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CLASS_LEVELS.map(cls => (
            <button 
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-chalkboard-user text-xl"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-800">{cls}</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Manage attendance & conduct</p>
            </button>
          ))}
        </div>
      ) : !selectedStudent ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm">{selectedClass}</span> Students
            </h3>
            <button onClick={() => setSelectedClass(null)} className="text-sm font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest">Change Class</button>
          </div>
          
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50">
                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="px-6 py-4 border-b">S/N</th>
                  <th className="px-6 py-4 border-b">Photo</th>
                  <th className="px-6 py-4 border-b">Student Name</th>
                  <th className="px-6 py-4 border-b">Attendance</th>
                  <th className="px-6 py-4 border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getStudentsForClass(selectedClass).map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-bold text-sm">{idx + 1}</td>
                    <td className="px-6 py-4">
                      {s.photo ? (
                        <img src={s.photo} className="w-8 h-8 rounded object-cover border border-slate-200" alt="S" />
                      ) : (
                        <div className="w-8 h-8 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[8px] text-slate-300 font-bold uppercase">No Photo</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-800 uppercase text-sm">{s.studentName}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium text-sm">{s.attendance || '-'} / {appState.settings.maxAttendance}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedStudent(s)}
                        className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors"
                      >
                        Edit Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto">
          <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="relative group">
                {selectedStudent.photo ? (
                  <img src={selectedStudent.photo} className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-400 shadow-lg" alt="S" />
                ) : (
                  <div className="w-16 h-16 bg-white/10 rounded-xl border-2 border-white/20 flex items-center justify-center text-white/40">
                    <i className="fas fa-user text-2xl"></i>
                  </div>
                )}
                {appState.isAdmin && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center border-4 border-slate-900 shadow-md hover:bg-indigo-400 transition-colors"
                  >
                    <i className="fas fa-camera text-xs"></i>
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Editing Student Report</p>
                <h3 className="text-2xl font-bold uppercase">{selectedStudent.studentName}</h3>
              </div>
            </div>
            <button onClick={() => setSelectedStudent(null)} className="text-white/60 hover:text-white"><i className="fas fa-times text-xl"></i></button>
          </div>
          
          <div className="p-8 space-y-6">
            {appState.isAdmin && (
               <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Student Name (Admin Only)</label>
                <input 
                  type="text" 
                  value={selectedStudent.studentName}
                  onChange={(e) => handleUpdate('studentName', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Attendance</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    max={appState.settings.maxAttendance} 
                    value={selectedStudent.attendance?.split(' / ')[0] || ''} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > appState.settings.maxAttendance) return;
                      handleUpdate('attendance', `${e.target.value} / ${appState.settings.maxAttendance}`);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Score"
                  />
                  <span className="text-slate-400 font-bold">/ {appState.settings.maxAttendance}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Conduct</label>
                <select 
                  value={selectedStudent.conduct || ''} 
                  onChange={(e) => handleUpdate('conduct', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select Conduct...</option>
                  {appState.settings.conducts.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Interest</label>
              <select 
                value={selectedStudent.interest || ''} 
                onChange={(e) => handleUpdate('interest', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select Interest...</option>
                {appState.settings.interests.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Teacher's Remark</label>
              <textarea 
                rows={3}
                value={selectedStudent.teacherRemark || ''}
                onChange={(e) => handleUpdate('teacherRemark', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="How has the student performed this term?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Headteacher's Remark</label>
              <textarea 
                rows={2}
                value={selectedStudent.headTeacherRemark || ''}
                onChange={(e) => handleUpdate('headTeacherRemark', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="Final headteacher's comment..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setSelectedStudent(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleSaveStudent} className="flex-2 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherReportView;
