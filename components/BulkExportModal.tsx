
import React, { useState } from 'react';
import { AppState, ClassLevel, ClassSubjectData } from '../types';
import { CLASS_LEVELS } from '../constants';
import * as XLSX from 'xlsx';
import { generateBulkReportCards } from '../utils/pdfGenerator';

interface BulkExportModalProps {
  onClose: () => void;
  appState: AppState;
}

const BulkExportModal: React.FC<BulkExportModalProps> = ({ onClose, appState }) => {
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(CLASS_LEVELS[0]);
  const [format, setFormat] = useState<'excel' | 'pdf'>('pdf');

  const handleExport = () => {
    if (format === 'excel') {
      exportToExcel();
    } else {
      generateBulkReportCards(selectedClass, appState.scores, appState.settings);
    }
    onClose();
  };

  const exportToExcel = () => {
    // Cast Object.entries to ensure type safety for data which fixes the "Property 'students' does not exist on type 'unknown'" error.
    const classScores = (Object.entries(appState.scores) as [string, ClassSubjectData][])
      .filter(([key]) => key.startsWith(`${selectedClass}-`))
      .map(([key, data]) => ({ subject: key.split('-')[1], data }));

    if (classScores.length === 0) {
      alert("No data found for this class.");
      return;
    }

    const wb = XLSX.utils.book_new();
    
    classScores.forEach(({ subject, data }) => {
      const sheetData = data.students.map(s => ({
        "Serial No": s.serialNumber,
        "Student Name": s.studentName,
        "Test 1": s.test1,
        "Group Work": s.groupWork,
        "Test 2": s.test2,
        "Project": s.project,
        "Exam": s.exam
      }));
      const ws = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, subject.substring(0, 31));
    });

    XLSX.writeFile(wb, `${selectedClass}_Scores.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-none md:rounded-2xl shadow-2xl w-full max-w-md md:max-w-md animate-in zoom-in-95 duration-200 overflow-hidden h-full md:h-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Bulk Export</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors md:hidden"><i className="fas fa-times"></i></button>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Select Class</label>
            <div className="grid grid-cols-3 gap-2">
              {CLASS_LEVELS.map(cls => (
                <button 
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`py-2 px-3 rounded-lg text-sm font-bold transition-all border ${
                    selectedClass === cls ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Choose Format</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setFormat('excel')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  format === 'excel' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${format === 'excel' ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-500 shadow-sm'}`}>
                  <i className="fas fa-file-excel text-xl"></i>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800 text-sm">Download Excel</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Raw Data Sheet</p>
                </div>
              </button>

              <button 
                onClick={() => setFormat('pdf')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  format === 'pdf' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${format === 'pdf' ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-500 shadow-sm'}`}>
                  <i className="fas fa-file-pdf text-xl"></i>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800 text-sm">Report Cards</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Ready for Print</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={handleExport} className="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-colors shadow-lg">Generate</button>
        </div>
      </div>
    </div>
  );
};

export default BulkExportModal;
