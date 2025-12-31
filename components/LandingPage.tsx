
import React from 'react';
import { School } from '../types';

interface LandingPageProps {
  schools: School[];
  onSelectSchool: (school: School) => void;
  onSuperAdmin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ schools, onSelectSchool, onSuperAdmin }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-emerald-100/40 rounded-full blur-3xl translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl -translate-y-1/2"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Hero Header Section */}
        <div className="text-center mb-24 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Multitenant Portal Active</span>
          </div>
          
          <h1 className="text-4xl md:text-8xl font-black text-slate-900 tracking-tighter mb-6 uppercase italic leading-tight md:leading-none">
            Edu Pro <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">School</span><br/>Management
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-500 font-bold text-base md:text-lg uppercase tracking-tight">
            Streamlined administration for modern educational institutions.
            <br className="hidden md:block" /> Select your school portal below to begin.
          </p>
        </div>

        {/* School Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-32">
          {schools.map((school, index) => (
            <button 
              key={school.id}
              onClick={() => onSelectSchool(school)}
              style={{ animationDelay: `${index * 100}ms` }}
              className="group relative bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 hover:shadow-indigo-200/50 hover:-translate-y-4 transition-all duration-500 text-left p-6 md:p-10 animate-in fade-in slide-in-from-bottom-10"
            >
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20 opacity-50 group-hover:bg-indigo-50 transition-colors duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] border border-slate-100 p-3 shadow-inner group-hover:border-indigo-100 transition-colors overflow-hidden flex items-center justify-center">
                    {school.logo ? (
                      <img src={school.logo} className="w-full h-full object-contain" alt={school.name} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center text-white text-4xl font-black italic">
                        {school.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Access Portal
                  </div>
                </div>
                
                <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-3 leading-tight">
                  {school.name}
                </h3>
                
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 line-clamp-1">
                  Education Management Ecosystem
                </p>

                <div className="flex items-center gap-3">
                  <div className="h-0.5 w-12 bg-indigo-600 group-hover:w-24 transition-all duration-500"></div>
                  <span className="text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:ml-2 transition-all">Enter Dashboard</span>
                </div>
              </div>

              {/* Bottom Decorative Icon */}
              <div className="absolute bottom-8 right-8 text-slate-50 text-6xl group-hover:text-indigo-50/50 transition-colors">
                <i className="fas fa-school"></i>
              </div>
            </button>
          ))}

          {/* Empty State */}
          {schools.length === 0 && (
            <div className="col-span-full py-32 bg-white/50 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-school-circle-exclamation text-4xl"></i>
              </div>
              <p className="font-black text-2xl text-slate-800 uppercase italic tracking-tighter">No Active Portals</p>
              <p className="text-sm font-bold uppercase tracking-widest mt-2">Provision a school in the Super Admin Portal</p>
            </div>
          )}
        </div>

        {/* Footer / Super Admin Toggle */}
        <div className="flex flex-col items-center border-t border-slate-200 pt-16">
          <div className="mb-12 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Developed By</p>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">Edu Pro Solutions v3.0</h4>
          </div>
          
          <button 
            onClick={onSuperAdmin}
            className="group relative w-full md:w-auto px-6 md:px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] overflow-hidden hover:bg-black transition-all shadow-2xl shadow-slate-400/50"
          >
            <span className="relative z-10 flex items-center gap-3">
              <i className="fas fa-user-shield group-hover:rotate-12 transition-transform"></i> 
              Super Admin Control Center
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>

      {/* Background Micro-elements */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-slate-900 text-6xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            <i className="fas fa-graduation-cap"></i>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
