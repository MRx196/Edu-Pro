
import React, { useState } from 'react';
import { SchoolSettings } from '../types';

interface TokenAuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  settings: SchoolSettings;
}

const TokenAuthModal: React.FC<TokenAuthModalProps> = ({ onClose, onSuccess, settings }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.teacherTokens.includes(token)) {
      onSuccess();
      onClose();
    } else {
      setError('Invalid Access Token');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center border-b border-slate-100 bg-slate-50">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-key text-2xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">Teacher Access</h3>
          <p className="text-slate-500 text-sm mt-1">Enter your assigned access token</p>
        </div>
        
        <form onSubmit={handleVerify} className="p-8 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-100 text-center">{error}</div>}
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Access Token</label>
            <input 
              type="text" 
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-black font-black text-center text-xl tracking-widest"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200">
            Verify Token
          </button>
          
          <button type="button" onClick={onClose} className="w-full py-2 text-slate-400 hover:text-slate-600 font-medium text-sm transition-colors">
            Back to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default TokenAuthModal;
