
import React, { useState } from 'react';
import { SchoolSettings } from '../types';
import { exportDatabase, importDatabase } from '../utils/db';

interface SettingsProps {
  settings: SchoolSettings;
  onSave: (settings: SchoolSettings) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onBack }) => {
  const [formData, setFormData] = useState<SchoolSettings>(settings);
  const [activeTab, setActiveTab] = useState<'info' | 'db'>('info');
  const [newToken, setNewToken] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newConduct, setNewConduct] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, schoolLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportDB = async () => {
    try {
      const data = await exportDatabase();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Nakomkope_Backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to export database.");
    }
  };

  const handleImportDB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Warning: Importing a database will overwrite ALL current school records. Proceed?")) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        await importDatabase(json);
        alert("Database restored successfully! The application will now reload.");
        window.location.reload();
      } catch (err) {
        alert("Error: Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const addToken = () => {
    if (newToken && !formData.teacherTokens.includes(newToken)) {
      setFormData(prev => ({ ...prev, teacherTokens: [...prev.teacherTokens, newToken] }));
      setNewToken('');
    }
  };

  const removeToken = (t: string) => {
    setFormData(prev => ({ ...prev, teacherTokens: prev.teacherTokens.filter(item => item !== t) }));
  };

  const addInterest = () => {
    if (newInterest && !formData.interests.includes(newInterest)) {
      setFormData(prev => ({ ...prev, interests: [...prev.interests, newInterest] }));
      setNewInterest('');
    }
  };

  const addConduct = () => {
    if (newConduct && !formData.conducts.includes(newConduct)) {
      setFormData(prev => ({ ...prev, conducts: [...prev.conducts, newConduct] }));
      setNewConduct('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Settings saved successfully!');
    onBack();
  };

  return (
    <div className="animate-in slide-in-from-left duration-500 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"><i className="fas fa-arrow-left"></i></button>
        <h2 className="text-3xl font-bold text-slate-800">School Management</h2>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 w-fit">
        <button onClick={() => setActiveTab('info')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'info' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>General Settings</button>
        <button onClick={() => setActiveTab('db')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'db' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>Database & Backup</button>
      </div>

      {activeTab === 'info' ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                <i className="fas fa-school text-indigo-500"></i> Basic Information
              </h3>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">School Logo</label>
                <div className="flex items-center gap-6 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                  {formData.schoolLogo ? (
                    <img src={formData.schoolLogo} alt="Preview" className="w-24 h-24 object-contain rounded-lg border border-slate-100" />
                  ) : (
                    <div className="w-24 h-24 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><i className="fas fa-image text-3xl"></i></div>
                  )}
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="logo-upload" />
                    <label htmlFor="logo-upload" className="cursor-pointer px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 inline-block transition-colors">Choose Image</label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">School Name</label>
                <input type="text" value={formData.schoolName} onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black font-semibold" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Academic Year</label>
                  <input type="text" value={formData.academicYear} onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black font-semibold" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Term</label>
                  <input type="text" value={formData.term} onChange={(e) => setFormData(prev => ({ ...prev, term: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black font-semibold" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Next Term Begins</label>
                <input type="text" value={formData.nextTermBegins} onChange={(e) => setFormData(prev => ({ ...prev, nextTermBegins: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black font-semibold" required />
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                <i className="fas fa-user-shield text-indigo-500"></i> Report Controls
              </h3>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Max Attendance Value (Denominator)</label>
                <input type="number" value={formData.maxAttendance} onChange={(e) => setFormData(prev => ({ ...prev, maxAttendance: parseInt(e.target.value) }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black font-bold" required />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Teacher Access Tokens</label>
                <div className="flex gap-2">
                  <input type="text" value={newToken} onChange={(e) => setNewToken(e.target.value.toUpperCase())} placeholder="NEW TOKEN" className="flex-1 px-4 py-2 border border-slate-200 rounded-lg bg-white uppercase font-bold" />
                  <button type="button" onClick={addToken} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.teacherTokens.map(t => (
                    <span key={t} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold flex items-center gap-2">
                      {t} <button onClick={() => removeToken(t)} className="text-red-400 hover:text-red-600"><i className="fas fa-times"></i></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Interest Dropdown Options</label>
                <div className="flex gap-2">
                  <input type="text" value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="ADD INTEREST" className="flex-1 px-4 py-2 border border-slate-200 rounded-lg bg-white font-bold" />
                  <button type="button" onClick={addInterest} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map(i => (
                    <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold flex items-center gap-2">
                      {i} <button onClick={() => setFormData(prev => ({ ...prev, interests: prev.interests.filter(item => item !== i) }))} className="text-red-400"><i className="fas fa-times"></i></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Conduct Dropdown Options</label>
                <div className="flex gap-2">
                  <input type="text" value={newConduct} onChange={(e) => setNewConduct(e.target.value)} placeholder="ADD CONDUCT" className="flex-1 px-4 py-2 border border-slate-200 rounded-lg bg-white font-bold" />
                  <button type="button" onClick={addConduct} className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.conducts.map(c => (
                    <span key={c} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-bold flex items-center gap-2">
                      {c} <button onClick={() => setFormData(prev => ({ ...prev, conducts: prev.conducts.filter(item => item !== c) }))} className="text-red-400"><i className="fas fa-times"></i></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Save All Settings
          </button>
        </form>
      ) : (
        <div className="animate-in fade-in duration-300 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-database text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Local Database Management</h3>
                <p className="text-sm text-slate-500 font-medium">Data is stored securely on this browser using IndexedDB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2"><i className="fas fa-cloud-arrow-down text-indigo-500"></i> Backup Records</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Download a complete copy of all school data, including student names, scores, photos, and settings. Store this file safely on your computer.</p>
                <button 
                  onClick={handleExportDB}
                  className="w-full py-3 bg-white border border-slate-200 text-slate-800 font-bold rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <i className="fas fa-download"></i>
                  Export Database (.json)
                </button>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2"><i className="fas fa-cloud-arrow-up text-amber-500"></i> Restore Records</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Restore data from a previously exported backup file. <strong>Warning:</strong> This will delete all current records on this browser and replace them with the backup.</p>
                <div className="relative">
                  <input type="file" accept=".json" onChange={handleImportDB} className="hidden" id="import-db" />
                  <label 
                    htmlFor="import-db"
                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fas fa-upload"></i>
                    Import Database File
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 flex gap-4">
              <i className="fas fa-info-circle mt-1"></i>
              <div className="text-xs leading-relaxed">
                <p className="font-bold mb-1">Advanced Storage (IndexedDB)</p>
                The school management system now uses a structured local database. This allows for virtually unlimited student records and full-resolution photo storage without hitting common browser limits.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
