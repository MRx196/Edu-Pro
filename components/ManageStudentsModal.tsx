
import React, { useState, useRef } from 'react';
import { ClassLevel } from '../types';
import { CLASS_LEVELS } from '../constants';
import * as XLSX from 'xlsx';

interface ManageStudentsModalProps {
  onClose: () => void;
  onAdd: (classLevel: ClassLevel, students: { name: string }[]) => void;
}

const ManageStudentsModal: React.FC<ManageStudentsModalProps> = ({ onClose, onAdd }) => {
  const [tab, setTab] = useState<'single' | 'bulk'>('single');
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(CLASS_LEVELS[0]);
  const [studentName, setStudentName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSingleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    onAdd(selectedClass, [{ name: studentName.trim() }]);
    setStudentName('');
    alert('Student added successfully!');
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const names = jsonData
          .map(row => row.Name || row.name || row['Student Name'] || row['STUDENT NAME'])
          .filter(name => !!name && typeof name === 'string')
          .map(name => ({ name: name.trim() }));

        if (names.length === 0) {
          alert('No names found. Please ensure your Excel has a "Name" column.');
        } else {
          onAdd(selectedClass, names);
          alert(`Successfully uploaded ${names.length} students to ${selectedClass}`);
          onClose();
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse Excel file.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-none md:rounded-3xl shadow-2xl w-full max-w-lg md:max-w-lg overflow-hidden h-full md:h-auto animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Manage Students</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Add students to class rolls</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors md:hidden"> 
            <i className="fas fa-times"></i>
          </button>

          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setTab('single')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'single' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Single Entry
            </button>
            <button 
              onClick={() => setTab('bulk')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'bulk' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Bulk Upload
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Target Class</label>
              <div className="grid grid-cols-3 gap-3">
                {CLASS_LEVELS.map(cls => (
                  <button 
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                      selectedClass === cls ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'single' ? (
              <form onSubmit={handleSingleAdd} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</label>
                  {/* FIXED: White bg, black text */}
                  <input 
                    type="text" 
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-bold text-black bg-white"
                    placeholder="E.G. JOHN DOE"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-plus-circle"></i>
                  Add Student to {selectedClass.toUpperCase()}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group bg-white"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <i className="fas fa-file-excel text-2xl"></i>
                  </div>
                  <h4 className="font-bold text-slate-800">Click to upload Excel</h4>
                  <p className="text-xs text-slate-400 mt-2">File must have a "Name" or "Student Name" column</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept=".xlsx, .xls, .csv" 
                    onChange={handleBulkUpload}
                    disabled={isUploading}
                  />
                </div>
                {isUploading && (
                  <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm">
                    <i className="fas fa-circle-notch fa-spin"></i>
                    Processing file...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-medium text-center uppercase tracking-widest">
          Synchronizes across all subjects automatically
        </div>
      </div>
    </div>
  );
};

export default ManageStudentsModal;
