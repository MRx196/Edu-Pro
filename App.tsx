
import React, { useState, useEffect } from 'react';
import { AppState, School, UserRole, ClassLevel, Subject, StudentScore } from './types';
import { DEFAULT_SCHOOL_SETTINGS, SUBJECTS } from './constants';
import { loadFromDB, saveToDB } from './utils/db';

// Components
import LandingPage from './components/LandingPage';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import Dashboard from './components/Dashboard';
import ClassPortal from './components/ClassPortal';
import ScoreEntry from './components/ScoreEntry';
import Settings from './components/Settings';
import TeacherReportView from './components/TeacherReportView';
import AuthModal from './components/AuthModal';
import TokenAuthModal from './components/TokenAuthModal';
import ManageStudentsModal from './components/ManageStudentsModal';
import BulkExportModal from './components/BulkExportModal';
import ClearDataModal from './components/ClearDataModal';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [view, setView] = useState<'landing' | 'super' | 'school' | 'classPortal' | 'scoreEntry' | 'settings' | 'teacherReport'>('landing');
  const [activeClass, setActiveClass] = useState<ClassLevel | null>(null);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTokenAuthOpen, setIsTokenAuthOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);

  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const saved = await loadFromDB();
        let currentState: AppState;
        
        if (saved) {
          currentState = { ...saved, currentUserRole: null, currentSchoolId: null, isLoggedIn: false };
        } else {
          currentState = {
            schools: [],
            superAdminPassword: '2547852',
            currentSchoolId: null,
            currentUserRole: null,
            isLoggedIn: false
          };
        }

        // Ensure a master super admin password exists (idempotent)
        if (!currentState.superAdminPassword) {
          currentState.superAdminPassword = '2547852';
          // The appState effect will persist this change via saveToDB
          console.info('Set default superAdminPassword');
        }

        // Check for shared teacher link in URL
        const params = new URLSearchParams(window.location.search);
        const schoolId = params.get('schoolId');
        const role = params.get('role');

        if (schoolId && role === 'TEACHER') {
          const targetSchool = currentState.schools.find(s => s.id === schoolId);
          if (targetSchool) {
            currentState.currentSchoolId = schoolId;
            currentState.currentUserRole = 'TEACHER';
            setIsTokenAuthOpen(true);
          }
        }

        setAppState(currentState);
      } catch (err: any) {
        console.error('Initialization failed', err);
        setBootError(err?.message || String(err));
        // Also show via global overlay for visibility
        try { window.__showDebug && window.__showDebug('Initialization failed: ' + (err?.message || String(err))); } catch (e) {}
      }
    };
    init();
  }, []);


  useEffect(() => {
    if (appState) saveToDB(appState);
  }, [appState]);

  if (bootError) return <div className="h-screen flex items-center justify-center font-bold text-red-600">Initialization error: {bootError}</div>;
  if (!appState) return <div className="h-screen flex items-center justify-center font-bold">Initializing System...</div>;

  const currentSchool = appState.schools.find(s => s.id === appState.currentSchoolId);

  // Business Logic Methods
  const handleSchoolAction = (actionId: string) => {
    if (!currentSchool) return;
    const adminOnly = ['bulk-pdf', 'clear-data', 'settings', 'manage-students', 'reset-scores'];
    if (adminOnly.includes(actionId) && appState.currentUserRole !== 'SCHOOL_ADMIN') {
      alert("Access Denied: School Admin credentials required.");
      return;
    }
    if (actionId === 'teacher-report') setView('teacherReport');
    else if (actionId === 'settings') setView('settings');
    else if (actionId === 'bulk-pdf') setIsBulkOpen(true);
    else if (actionId === 'manage-students') setIsManageOpen(true);
    else if (actionId === 'clear-data' || actionId === 'reset-scores') setIsClearOpen(true);
  };

  const updateCurrentSchool = (updated: School) => {
    setAppState(prev => ({
      ...prev!,
      schools: prev!.schools.map(s => s.id === updated.id ? updated : s)
    }));
  };

  const logout = () => {
    // Clear URL params on logout
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setAppState(prev => ({ ...prev!, currentSchoolId: null, currentUserRole: null, isLoggedIn: false }));
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">
      {/* Dynamic Header */}
      {view !== 'landing' && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => view === 'super' ? setView('super') : setView('school')}>
             {view === 'super' ? (
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white"><i className="fas fa-user-shield"></i></div>
             ) : (
                currentSchool?.logo ? <img src={currentSchool.logo} className="w-10 h-10 object-contain" /> : <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">{currentSchool?.name[0]}</div>
             )}
             <div>
               <h1 className="text-sm font-black uppercase tracking-tight">{view === 'super' ? 'SaaS Controller' : currentSchool?.name}</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{appState.currentUserRole?.replace('_', ' ')}</p>
             </div>
          </div>
          <button onClick={logout} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-600 border border-slate-200 rounded-xl transition-all">
            <i className="fas fa-sign-out-alt mr-2"></i>Exit {view === 'super' ? 'Admin' : 'School'}
          </button>
        </header>
      )}

      <main className="p-6 md:p-10">
        {view === 'landing' && (
          <LandingPage 
            schools={appState.schools} 
            onSelectSchool={(s) => {
              setAppState(prev => ({ ...prev!, currentSchoolId: s.id }));
              setIsAuthOpen(true);
            }}
            onSuperAdmin={() => {
              setAppState(prev => ({ ...prev!, currentUserRole: 'SUPER_ADMIN' }));
              setIsAuthOpen(true);
            }}
          />
        )}

        {view === 'super' && (
          <SuperAdminDashboard 
            schools={appState.schools}
            onUpdateSchools={(newList) => setAppState(prev => ({ ...prev!, schools: newList }))}
          />
        )}

        {view === 'school' && currentSchool && (
          <Dashboard 
            onClassSelect={(cls) => { setActiveClass(cls); setView('classPortal'); }}
            onAction={handleSchoolAction}
            appState={{ ...appState, scores: currentSchool.scores, settings: currentSchool.settings, isAdmin: appState.currentUserRole === 'SCHOOL_ADMIN' } as any}
          />
        )}

        {view === 'classPortal' && activeClass && (
          <ClassPortal 
            classLevel={activeClass} 
            onSubjectSelect={(sub) => { setActiveSubject(sub); setView('scoreEntry'); }} 
            onBack={() => setView('school')} 
          />
        )}

        {view === 'scoreEntry' && currentSchool && activeClass && activeSubject && (
          <ScoreEntry 
            classLevel={activeClass} subject={activeSubject}
            data={currentSchool.scores[`${activeClass}-${activeSubject}`]}
            onSave={(data) => {
              const newScores = { ...currentSchool.scores, [`${activeClass}-${activeSubject}`]: data };
              // Sync student changes across subjects
              SUBJECTS.forEach(sub => {
                const key = `${activeClass}-${sub}`;
                if (sub !== activeSubject && newScores[key]) {
                  newScores[key].students = newScores[key].students.map(s => {
                    const match = data.students.find(u => u.id === s.id);
                    return match ? { ...s, studentName: match.studentName, photo: match.photo } : s;
                  });
                }
              });
              updateCurrentSchool({ ...currentSchool, scores: newScores });
            }}
            onBack={() => setView('classPortal')}
            allClassData={currentSchool.scores}
            settings={currentSchool.settings}
            isAdmin={appState.currentUserRole === 'SCHOOL_ADMIN'}
          />
        )}

        {view === 'settings' && currentSchool && (
          <Settings 
            settings={currentSchool.settings} 
            onSave={(set) => updateCurrentSchool({ ...currentSchool, settings: set })}
            onBack={() => setView('school')}
          />
        )}

        {view === 'teacherReport' && currentSchool && (
          <TeacherReportView 
            appState={{ scores: currentSchool.scores, settings: currentSchool.settings, isAdmin: appState.currentUserRole === 'SCHOOL_ADMIN' } as any}
            onSave={(cls, students) => {
              const newScores = { ...currentSchool.scores };
              SUBJECTS.forEach(sub => {
                const key = `${cls}-${sub}`;
                if (newScores[key]) {
                  newScores[key].students = newScores[key].students.map(s => {
                    const upd = students.find(u => u.id === s.id);
                    return upd ? { ...s, ...upd } : s;
                  });
                }
              });
              updateCurrentSchool({ ...currentSchool, scores: newScores });
            }}
            onBack={() => setView('school')}
          />
        )}
      </main>

      {/* Modals */}
      {isAuthOpen && (
        <AuthModal 
          mode={appState.currentUserRole === 'SUPER_ADMIN' ? 'SUPER' : 'SCHOOL'}
          school={currentSchool}
          onClose={() => { setIsAuthOpen(false); if (view === 'landing') setAppState(prev => ({ ...prev!, currentUserRole: null, currentSchoolId: null })); }}
          onSuccess={(role) => {
            setAppState(prev => ({ ...prev!, currentUserRole: role, isLoggedIn: true }));
            setIsAuthOpen(false);
            setView(role === 'SUPER_ADMIN' ? 'super' : 'school');
          }}
          superPass={appState.superAdminPassword}
        />
      )}

      {isTokenAuthOpen && currentSchool && (
        <TokenAuthModal 
          onClose={() => { setIsTokenAuthOpen(false); logout(); }}
          onSuccess={() => { setIsTokenAuthOpen(false); setView('school'); }}
          settings={currentSchool.settings} 
        />
      )}
      
      {isManageOpen && currentSchool && (
        <ManageStudentsModal 
          onClose={() => setIsManageOpen(false)}
          onAdd={(cls, students) => {
             const newStudents: StudentScore[] = students.map(s => ({
                id: Math.random().toString(36).substr(2, 9),
                serialNumber: `${cls.replace('Basic ', 'B')}-${Math.floor(100+Math.random()*899)}`,
                studentName: s.name, photo: '',
                test1: null, groupWork: null, test2: null, project: null, exam: null
             }));
             const newScores = { ...currentSchool.scores };
             SUBJECTS.forEach(sub => {
                const key = `${cls}-${sub}`;
                const existing = newScores[key]?.students || [];
                newScores[key] = { classLevel: cls, subject: sub, students: [...existing, ...newStudents] };
             });
             updateCurrentSchool({ ...currentSchool, scores: newScores });
          }}
        />
      )}

      {isBulkOpen && currentSchool && (
        <BulkExportModal 
          onClose={() => setIsBulkOpen(false)} 
          appState={{ ...appState, scores: currentSchool.scores, settings: currentSchool.settings } as any} 
        />
      )}

      {isClearOpen && (
        <ClearDataModal 
          onClose={() => setIsClearOpen(false)} 
          onClear={(cls, sub) => {
            if (!currentSchool) return;
            const newScores = { ...currentSchool.scores };
            const keysToClear = sub 
              ? [`${cls}-${sub}`] 
              : Object.keys(newScores).filter(k => k.startsWith(`${cls}-`));

            keysToClear.forEach(key => {
              if (newScores[key]) {
                newScores[key].students = newScores[key].students.map(s => ({
                  ...s, test1: null, groupWork: null, test2: null, project: null, exam: null
                }));
              }
            });
            updateCurrentSchool({ ...currentSchool, scores: newScores });
          }} 
        />
      )}
    </div>
  );
};

export default App;
