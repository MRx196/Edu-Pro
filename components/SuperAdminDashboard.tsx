
import React, { useState, useRef } from 'react';
import { School, SchoolStatus } from '../types';
import { DEFAULT_SCHOOL_SETTINGS } from '../constants';

interface SuperAdminDashboardProps {
  schools: School[];
  onUpdateSchools: (newList: School[]) => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ schools, onUpdateSchools }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newSchool, setNewSchool] = useState({ name: '', adminUsername: '', adminPassword: '', months: 12, logo: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSchool(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSchool = () => {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + newSchool.months);

    const school: School = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSchool.name,
      logo: newSchool.logo,
      status: 'ACTIVE',
      expiryDate: expiry.toISOString(),
      adminUsername: newSchool.adminUsername,
      adminPassword: newSchool.adminPassword,
      settings: { ...DEFAULT_SCHOOL_SETTINGS, schoolName: newSchool.name, schoolLogo: newSchool.logo },
      masterStudents: { 'Basic 7': [], 'Basic 8': [], 'Basic 9': [] },
      scores: {}
    };

    onUpdateSchools([...schools, school]);
    setIsAdding(false);
    setNewSchool({ name: '', adminUsername: '', adminPassword: '', months: 12, logo: '' });
  };

  const toggleStatus = (id: string, current: SchoolStatus) => {
    onUpdateSchools(schools.map(s => s.id === id ? { ...s, status: current === 'LOCKED' ? 'ACTIVE' : 'LOCKED' } : s));
  };

  const extendSub = (id: string) => {
    onUpdateSchools(schools.map(s => {
      if (s.id === id) {
        const d = new Date(s.expiryDate);
        d.setMonth(d.getMonth() + 12);
        return { ...s, expiryDate: d.toISOString(), status: 'ACTIVE' as SchoolStatus };
      }
      return s;
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic">SaaS Controller</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Manage provisioned school systems</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> New School
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="bg-slate-50">
            <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <th className="px-8 py-5 border-b">School Identity</th>
              <th className="px-8 py-5 border-b">Admin Credentials</th>
              <th className="px-8 py-5 border-b">Subscription Status</th>
              <th className="px-8 py-5 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {schools.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden">
                      {s.logo ? <img src={s.logo} className="w-full h-full object-cover" /> : <i className="fas fa-school"></i>}
                    </div>
                    <div>
                      <div className="font-black text-slate-800 uppercase text-sm">{s.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {s.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <div className="text-xs font-bold text-slate-600 uppercase tracking-tighter">U: {s.adminUsername}</div>
                   <div className="text-xs font-bold text-slate-400 tracking-tighter mt-1">P: {s.adminPassword}</div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex flex-col gap-1">
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded-full w-fit ${s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {s.status}
                      </span>
                      <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Ends: {new Date(s.expiryDate).toLocaleDateString()}</div>
                   </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => extendSub(s.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Extend 1 Year"><i className="fas fa-calendar-plus"></i></button>
                    <button onClick={() => toggleStatus(s.id, s.status)} className={`p-2 rounded-lg transition-colors ${s.status === 'LOCKED' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-600 hover:bg-red-50'}`} title={s.status === 'LOCKED' ? 'Unlock' : 'Lock'}>
                       <i className={`fas ${s.status === 'LOCKED' ? 'fa-unlock' : 'fa-lock'}`}></i>
                    </button>
                    <button onClick={() => onUpdateSchools(schools.filter(item => item.id !== s.id))} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors" title="Delete Permanent"><i className="fas fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-8 bg-slate-900 text-white">
              <h3 className="text-2xl font-black uppercase italic">Provision School</h3>
              <p className="text-xs text-indigo-400 font-bold uppercase mt-1">Initialize new tenant environment</p>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 overflow-hidden cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                >
                  {newSchool.logo ? <img src={newSchool.logo} className="w-full h-full object-cover" /> : <i className="fas fa-camera text-2xl"></i>}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload School Image</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <input type="text" placeholder="SCHOOL NAME" value={newSchool.name} onChange={e => setNewSchool({...newSchool, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-sm focus:ring-2 ring-indigo-500 outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="ADMIN USERNAME" value={newSchool.adminUsername} onChange={e => setNewSchool({...newSchool, adminUsername: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 ring-indigo-500 outline-none" />
                <input type="text" placeholder="ADMIN PASSWORD" value={newSchool.adminPassword} onChange={e => setNewSchool({...newSchool, adminPassword: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription Duration (Months)</label>
                <input type="number" value={newSchool.months} onChange={e => setNewSchool({...newSchool, months: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200">Cancel</button>
                <button onClick={addSchool} className="flex-2 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100">Initialize</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
