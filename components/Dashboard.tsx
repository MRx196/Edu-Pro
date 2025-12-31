
import React, { useState } from 'react';
import { ClassLevel, AppState, ClassSubjectData } from '../types';
import { CLASS_LEVELS } from '../constants';

interface DashboardProps {
  onClassSelect: (cls: ClassLevel) => void;
  onAction: (action: string) => void;
  appState: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ onClassSelect, onAction, appState }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Helper to count students per class
  const getStudentCount = (cls: ClassLevel) => {
    const classData = (Object.values(appState.scores) as ClassSubjectData[]).filter(d => d.classLevel === cls);
    if (classData.length === 0) return 0;
    const studentSet = new Set<string>();
    classData.forEach(cd => cd.students.forEach(s => s.studentName && studentSet.add(s.studentName)));
    return studentSet.size;
  };

  const totalStudents = CLASS_LEVELS.reduce((acc, cls) => acc + getStudentCount(cls), 0);

  const classCards = [
    { name: 'Basic 7' as ClassLevel, color: 'from-emerald-400 to-teal-500', icon: '7', students: getStudentCount('Basic 7') },
    { name: 'Basic 8' as ClassLevel, color: 'from-blue-500 to-indigo-600', icon: '8', students: getStudentCount('Basic 8') },
    { name: 'Basic 9' as ClassLevel, color: 'from-purple-500 to-pink-600', icon: '9', students: getStudentCount('Basic 9') },
  ];

  const quickActions = [
    { id: 'bulk-pdf', title: 'Bulk PDF Export', desc: 'Export all report cards', icon: 'fa-file-pdf', color: 'text-blue-500', bg: 'bg-blue-50', admin: true },
    { id: 'clear-data', title: 'Clear Data', desc: 'Remove scores by class/subject', icon: 'fa-trash-can', color: 'text-red-500', bg: 'bg-red-50', admin: true },
    { id: 'settings', title: 'School Settings', desc: 'Update school info & logo', icon: 'fa-gear', color: 'text-purple-500', bg: 'bg-purple-50', admin: true },
    { id: 'share-link', title: 'Share Teacher Link', desc: 'Generate teacher login URL', icon: 'fa-share-nodes', color: 'text-indigo-500', bg: 'bg-indigo-50', admin: true },
    { id: 'manage-students', title: 'Manage Students', desc: 'Add students to classes', icon: 'fa-user-plus', color: 'text-teal-500', bg: 'bg-teal-50', admin: true },
    { id: 'teacher-report', title: 'Class Teacher Report', desc: 'Add attendance & conduct', icon: 'fa-user-tie', color: 'text-amber-500', bg: 'bg-amber-50', admin: false },
    { id: 'reset-scores', title: 'Reset Class Scores', desc: 'Clear all scores for a class', icon: 'fa-rotate-left', color: 'text-orange-500', bg: 'bg-orange-50', admin: true },
  ];

  const getTeacherLink = () => {
    return `${window.location.origin}${window.location.pathname}?schoolId=${appState.currentSchoolId}&role=TEACHER`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getTeacherLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActionClick = (id: string) => {
    if (id === 'share-link') {
      setShowShareModal(true);
    } else {
      onAction(id);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-12">
      {/* Class Selection Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-graduation-cap text-xl"></i>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Select a Class</h2>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <i className="fas fa-users text-indigo-500"></i>
            <span className="text-sm font-bold text-slate-600">Total Students: <span className="text-indigo-600">{totalStudents}</span></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {classCards.map((card) => (
            <button
              key={card.name}
              onClick={() => onClassSelect(card.name)}
              className={`group relative h-44 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br ${card.color}`}
            >
              <div className="absolute top-4 right-6 text-white/30 text-6xl font-black italic select-none">
                <i className="fas fa-arrow-right text-2xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
              
              <div className="p-8 h-full flex flex-col justify-between text-white text-left">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-black">
                  {card.icon}
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold uppercase tracking-tight">{card.name}</h3>
                  </div>
                  <div className="bg-black/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                    {card.students} students
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left group"
            >
              <div className={`w-14 h-14 ${action.bg} ${action.color} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm`}>
                <i className={`fas ${action.icon}`}></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{action.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Share Link Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase italic">Teacher Access Link</h3>
                <p className="text-xs text-indigo-100 font-bold uppercase mt-1">Share this with school staff</p>
              </div>
              <button onClick={() => setShowShareModal(false)} className="text-white/60 hover:text-white transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shareable Login URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={getTeacherLink()} 
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none" 
                  />
                  <button 
                    onClick={copyLink}
                    className={`px-4 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${copied ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-black'}`}
                  >
                    <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                  </button>
                </div>
                {copied && <p className="text-[10px] font-bold text-emerald-600 uppercase text-center mt-2">Copied to clipboard!</p>}
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3">
                <i className="fas fa-info-circle text-indigo-600 mt-0.5"></i>
                <p className="text-[10px] font-medium text-indigo-800 leading-relaxed uppercase">
                  Teachers opening this link will be automatically directed to enter their access token for this school.
                </p>
              </div>

              <button 
                onClick={() => setShowShareModal(false)}
                className="w-full py-4 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
