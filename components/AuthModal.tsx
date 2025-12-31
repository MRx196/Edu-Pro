
import React, { useState } from 'react';
import { School, UserRole } from '../types';

interface AuthModalProps {
  mode: 'SUPER' | 'SCHOOL';
  school?: School;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
  superPass: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode, school, onClose, onSuccess, superPass }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'TEACHER'>(mode === 'SUPER' ? 'ADMIN' : 'ADMIN');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'SUPER') {
      if (password === superPass) onSuccess('SUPER_ADMIN');
      else setError('Invalid Controller Key');
    } else if (school) {
      if (activeTab === 'ADMIN') {
        if (username === school.adminUsername && password === school.adminPassword) onSuccess('SCHOOL_ADMIN');
        else setError('Invalid Admin Credentials');
      } else {
        if (school.settings.teacherTokens.includes(token)) onSuccess('TEACHER');
        else setError('Invalid Access Token');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
           <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${mode === 'SUPER' ? 'bg-black text-white' : 'bg-indigo-100 text-indigo-600'}`}>
             <i className={`fas ${mode === 'SUPER' ? 'fa-user-shield' : 'fa-lock'} text-2xl`}></i>
           </div>
           <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">
             {mode === 'SUPER' ? 'Controller Login' : school?.name}
           </h3>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Identity Verification Required</p>
        </div>

        {mode === 'SCHOOL' && (
          <div className="flex bg-slate-100 p-1 mx-8 mt-6 rounded-xl">
             <button onClick={() => setActiveTab('ADMIN')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'ADMIN' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Admin</button>
             <button onClick={() => setActiveTab('TEACHER')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'TEACHER' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Teacher</button>
          </div>
        )}

        <form onSubmit={handleLogin} className="p-8 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-[10px] font-black rounded-xl border border-red-100 text-center uppercase">{error}</div>}
          
          {mode === 'SUPER' ? (
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Key</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-4 rounded-2xl border border-slate-200 text-center text-xl tracking-[0.5em] font-black" placeholder="••••••••" required />
             </div>
          ) : activeTab === 'ADMIN' ? (
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold" required />
                </div>
             </div>
          ) : (
             <div className="space-y-2 text-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Access Token</label>
                <input type="text" value={token} onChange={e => setToken(e.target.value.toUpperCase())} className="w-full px-4 py-4 rounded-2xl border border-slate-200 text-center text-xl font-black tracking-widest" placeholder="TOKEN" required />
             </div>
          )}

          <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 mt-4">
            Verify & Continue
          </button>
          <button type="button" onClick={onClose} className="w-full py-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest">Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
