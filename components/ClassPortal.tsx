
import React from 'react';
import { ClassLevel, Subject } from '../types';
import { SUBJECTS } from '../constants';

interface ClassPortalProps {
  classLevel: ClassLevel;
  onSubjectSelect: (subject: Subject) => void;
  onBack: () => void;
}

const ClassPortal: React.FC<ClassPortalProps> = ({ classLevel, onSubjectSelect, onBack }) => {
  // Mapping subjects to specific styles as seen in the reference image
  const subjectConfigs: Record<Subject, { color: string; icon: string; isTextIcon?: boolean }> = {
    'Mathematics': { color: 'from-blue-500 to-blue-600', icon: 'fa-ruler-combined' },
    'Science': { color: 'from-emerald-500 to-emerald-600', icon: 'fa-microscope' },
    'RME': { color: 'from-purple-500 to-purple-600', icon: 'fa-book-open' },
    'Social Studies': { color: 'from-orange-400 to-orange-500', icon: 'fa-globe' },
    'Career Technology': { color: 'from-teal-500 to-teal-600', icon: 'fa-briefcase' },
    'French': { color: 'from-rose-500 to-rose-600', icon: 'FR', isTextIcon: true },
    'Dangme': { color: 'from-orange-600 to-orange-700', icon: 'fa-comment-dots' },
    'ICT': { color: 'from-cyan-500 to-cyan-600', icon: 'fa-laptop' },
    'Creative Art': { color: 'from-pink-500 to-pink-600', icon: 'fa-palette' },
    'English Language': { color: 'from-indigo-500 to-indigo-600', icon: 'fa-file-pen' },
  };

  return (
    <div className="animate-in slide-in-from-right duration-500 max-w-6xl mx-auto">
      {/* Navigation and Title */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-blue-600 text-2xl">
              <i className="fas fa-book-bookmark"></i>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Subjects</h2>
          </div>
        </div>
        <div className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600 border border-slate-200">
          {classLevel}
        </div>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {SUBJECTS.map((subject) => {
          const config = subjectConfigs[subject];
          return (
            <button
              key={subject}
              onClick={() => onSubjectSelect(subject)}
              className={`group relative h-48 rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br ${config.color}`}
            >
              {/* Top Left Icon Area */}
              <div className="absolute top-6 left-6">
                {config.isTextIcon ? (
                  <span className="text-3xl font-black text-white/90 tracking-tighter">
                    {config.icon}
                  </span>
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center text-white/90 text-3xl">
                    <i className={`fas ${config.icon}`}></i>
                  </div>
                )}
              </div>

              {/* Bottom Left Label Area */}
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-white font-bold text-sm tracking-wide block leading-tight">
                  {subject}
                </span>
              </div>

              {/* Decorative Circle in Corner (matching the UI in image) */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ClassPortal;
