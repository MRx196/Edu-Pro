
import React, { useState } from 'react';
import { ClassLevel, Subject } from '../types';
import { CLASS_LEVELS, SUBJECTS } from '../constants';

interface ClearDataModalProps {
  onClose: () => void;
  onClear: (classLevel: ClassLevel, subject?: Subject) => void;
}

const ClearDataModal: React.FC<ClearDataModalProps> = ({ onClose, onClear }) => {
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(CLASS_LEVELS[0]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');

  const handleClear = () => {
    const msg = selectedSubject === 'All' 
      ? `Are you sure you want to clear ALL data for ${selectedClass}?`
      : `Are you sure you want to clear ${selectedSubject} data for ${selectedClass}?`;
    
    if (confirm(msg)) {
      onClear(selectedClass, selectedSubject === 'All' ? undefined : selectedSubject);
      onClose();
      alert('Data cleared successfully.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in slide-in-from-top-4 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Clear Data</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">1. Select Class</label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value as ClassLevel)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
            >
              {CLASS_LEVELS.map(cls => <option key={cls} value={cls}>{cls}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">2. Select Subject to Clear</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
            >
              <option value="All">Clear All Subjects</option>
              {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>

          <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex gap-3 text-red-600">
            <i className="fas fa-exclamation-triangle mt-1"></i>
            <p className="text-xs leading-relaxed font-medium">Warning: This action is permanent and cannot be undone. All scores for the selected criteria will be deleted from local storage.</p>
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100">Cancel</button>
          <button onClick={handleClear} className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-100">Clear Now</button>
        </div>
      </div>
    </div>
  );
};

export default ClearDataModal;
