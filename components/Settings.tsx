
import React, { useState } from 'react';
import { SchoolSettings, TeacherInfo, SecondaryAdminInfo, ClassLevel } from '../types';
import { CLASS_LEVELS } from '../constants';
import { exportDatabase, importDatabase } from '../utils/db';

interface SettingsProps {
  settings: SchoolSettings;
  onSave: (settings: SchoolSettings) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onBack }) => {
  const [formData, setFormData] = useState<SchoolSettings>({
    ...settings,
    teachers: settings.teachers || [],
    secondaryAdmins: settings.secondaryAdmins || []
  });
  const [activeTab, setActiveTab] = useState<'info' | 'staff' | 'db'>('info');
  
  // Teacher Form State
  const [teacherName, setTeacherName] = useState('');
  const [teacherClass, setTeacherClass] = useState<ClassLevel>(CLASS_LEVELS[0]);
  const [teacherToken, setTeacherToken] = useState('');

  // Admin Form State
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

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
      link.download = `EduPro_Backup_${new Date().toISOString().split('T')[0]}.json`;
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

  const addTeacher = () => {
    if (!teacherName || !teacherToken) return alert("Please enter teacher name and token.");
    const newTeacher: TeacherInfo = {
      id: Math.random().toString(36).substr(2, 9),
      name: teacherName,
      assignedClass: teacherClass,
      token: teacherToken.toUpperCase()
    };
    setFormData(prev => ({ ...prev, teachers: [...prev.teachers, newTeacher] }));
    setTeacherName('');
    setTeacherToken('');
  };

  const addAdmin = () => {
    if (!adminUser || !adminPass) return alert("Please enter username and password.");
    const newAdmin: SecondaryAdminInfo = {
      id: Math.random().toString(36).substr(2, 9),
      username: adminUser,
      password: adminPass
    };
    setFormData(prev => ({ ...prev, secondaryAdmins: [...prev.secondaryAdmins, newAdmin] }));
    setAdminUser('');
    setAdminPass('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Settings saved successfully!');
    onBack();
  };

  return (
    <div className="animate-in slide-in-from-left duration-500 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"><i className="fas fa-arrow-left"></i></button>
        <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">School Management</h2>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 w-fit shadow-inner">
        <button onClick={() => setActiveTab('info')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'info' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>General Info</button>
        <button onClick={() => setActiveTab('staff')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'staff' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>Staff & Admins</button>
        <button onClick={() => setActiveTab('db')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'db' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>System & DB</button>
      </div>

      {activeTab === 'info' && (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 space-y-6">
              <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2 uppercase italic tracking-tighter">
                <i className="fas fa-school text-indigo-500"></i> Basic Information
              </h3>
              
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">School Logo</label>
                <div className="flex items-center gap-6 p-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  {formData.schoolLogo ? (
                    <img src={formData.schoolLogo} alt="Preview" className="w-24 h-24 object-contain rounded-2xl bg-white border border-slate-100" />
                  ) : (
                    <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100"><i className="fas fa-image text-3xl"></i></div>
                  )}
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="logo-upload" />
                    <label htmlFor="logo-upload" className="cursor-pointer px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black inline-block transition-all shadow-lg">Choose Image</label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">School Name</label>
                <input type="text" value={formData.schoolName} onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black font-bold uppercase" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Academic Year</label>
                  <input type="text" value={formData.academicYear} onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Term</label>
                  <input type="text" value={formData.term} onChange={(e) => setFormData(prev => ({ ...prev, term: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black font-bold" required />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 space-y-6">
              <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2 uppercase italic tracking-tighter">
                <i className="fas fa-list-check text-indigo-500"></i> Global Options
              </h3>
              
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Max Attendance</label>
                <input type="number" value={formData.maxAttendance} onChange={(e) => setFormData(prev => ({ ...prev, maxAttendance: parseInt(e.target.value) }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black font-bold" required />
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Student Interests</label>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map(i => (
                    <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                      {i} <button type="button" onClick={() => setFormData(prev => ({ ...prev, interests: prev.interests.filter(item => item !== i) }))} className="text-red-400"><i className="fas fa-times"></i></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Conduct Options</label>
                <div className="flex flex-wrap gap-2">
                  {formData.conducts.map(c => (
                    <span key={c} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                      {c} <button type="button" onClick={() => setFormData(prev => ({ ...prev, conducts: prev.conducts.filter(item => item !== c) }))} className="text-red-400"><i className="fas fa-times"></i></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200">
            Save Current State
          </button>
        </form>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teacher Token Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 space-y-6">
              <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2 uppercase italic tracking-tighter">
                <i className="fas fa-chalkboard-user text-indigo-500"></i> Teacher Directory
              </h3>
              
              <div className="p-6 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign New Teacher</p>
                <div className="space-y-3">
                  <input 
                    type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)}
                    placeholder="TEACHER FULL NAME" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold uppercase text-xs"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select 
                      value={teacherClass} onChange={e => setTeacherClass(e.target.value as ClassLevel)}
                      className="px-4 py-3 rounded-xl border border-slate-200 font-bold text-xs"
                    >
                      {CLASS_LEVELS.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                    <input 
                      type="text" value={teacherToken} onChange={e => setTeacherToken(e.target.value)}
                      placeholder="ACCESS TOKEN" 
                      className="px-4 py-3 rounded-xl border border-slate-200 font-black uppercase text-xs tracking-widest"
                    />
                  </div>
                  <button type="button" onClick={addTeacher} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100">
                    Register Teacher
                  </button>
                </div>
              </div>

              <div className="max-h-60 overflow-auto custom-scrollbar pr-2 space-y-3">
                {formData.teachers.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div>
                      <p className="font-black text-slate-800 text-xs uppercase italic">{t.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.assignedClass} • Token: {t.token}</p>
                    </div>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, teachers: prev.teachers.filter(item => item.id !== t.id) }))} className="text-red-400 hover:text-red-600 p-2"><i className="fas fa-trash-can"></i></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Admin Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 space-y-6">
              <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2 uppercase italic tracking-tighter">
                <i className="fas fa-user-shield text-indigo-500"></i> Administrative Access
              </h3>

              <div className="p-6 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Create Secondary Admin</p>
                <div className="space-y-3">
                  <input 
                    type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)}
                    placeholder="ADMIN USERNAME" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-xs"
                  />
                  <input 
                    type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)}
                    placeholder="ADMIN PASSWORD" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-xs"
                  />
                  <button type="button" onClick={addAdmin} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200">
                    Authorize Admin
                  </button>
                </div>
              </div>

              <div className="max-h-60 overflow-auto custom-scrollbar pr-2 space-y-3">
                {formData.secondaryAdmins.map(a => (
                  <div key={a.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div>
                      <p className="font-black text-slate-800 text-xs uppercase">{a.username}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secondary Administrator</p>
                    </div>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, secondaryAdmins: prev.secondaryAdmins.filter(item => item.id !== a.id) }))} className="text-red-400 hover:text-red-600 p-2"><i className="fas fa-trash-can"></i></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button type="button" onClick={handleSubmit} className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200">
            Save Staff Records
          </button>
        </div>
      )}

      {activeTab === 'db' && (
        <div className="animate-in fade-in duration-300 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-100 space-y-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <i className="fas fa-database text-2xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">System Database</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Managed locally via browser IndexedDB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] space-y-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm mb-2">
                  <i className="fas fa-cloud-arrow-down text-xl"></i>
                </div>
                <h4 className="font-black text-slate-800 uppercase text-sm italic">Cloud Backup</h4>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">Download a comprehensive state snapshot including students, scores, staff, and configurations.</p>
                <button 
                  onClick={handleExportDB}
                  className="w-full py-4 bg-white border border-slate-200 text-slate-800 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                >
                  Export Records (.json)
                </button>
              </div>

              <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] space-y-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm mb-2">
                  <i className="fas fa-cloud-arrow-up text-xl"></i>
                </div>
                <h4 className="font-black text-slate-800 uppercase text-sm italic">System Recovery</h4>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">Restore the system from an existing backup. This will overwrite all data for the current installation.</p>
                <div className="relative">
                  <input type="file" accept=".json" onChange={handleImportDB} className="hidden" id="import-db" />
                  <label 
                    htmlFor="import-db"
                    className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2"
                  >
                    Restore From File
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl text-blue-800 flex gap-4">
              <i className="fas fa-circle-info text-xl mt-1"></i>
              <div className="text-[10px] font-bold uppercase leading-relaxed tracking-widest">
                <p className="mb-1 text-xs font-black italic">Technical Note</p>
                This application operates locally for zero-latency performance. Regularly backup your data using the tools above to prevent loss in case of browser data clearing.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
