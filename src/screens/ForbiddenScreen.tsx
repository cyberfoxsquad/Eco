import React from 'react';
import { ShieldAlert, ShieldCheck, Lock, KeyRound } from 'lucide-react';
import { useEco } from '../context/EcoContext';

export const ForbiddenScreen: React.FC = () => {
  const { setCurrentRoute, login } = useEco();

  const handleAdminSignIn = () => {
    const res = login('admin', 'admin');
    if (res.success) {
      setCurrentRoute('admin');
    } else {
      setCurrentRoute('auth');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-xl max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert size={36} />
        </div>

        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-3">
            Municipal Authority Required
          </h1>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            This verification console is restricted to certified municipal sanitation officers and treasury
            controllers. Standard citizen accounts cannot audit disposal streams or disburse public funds.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-purple-900 font-bold">
            <div className="flex items-center gap-1.5">
              <Lock size={14} className="text-purple-700" />
              <span>Administrator Credentials</span>
            </div>
            <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-bold">
              Official
            </span>
          </div>
          <p className="text-[11px] text-purple-800 leading-normal">
            Admin ID: <strong className="font-mono bg-white/80 px-1 py-0.5 rounded">admin</strong> • Password:{' '}
            <strong className="font-mono bg-white/80 px-1 py-0.5 rounded">admin</strong>
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            id="switch_to_admin_btn"
            onClick={handleAdminSignIn}
            className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <ShieldCheck size={16} />
            <span>Sign In as Municipal Admin (admin / admin)</span>
          </button>

          <button
            onClick={() => setCurrentRoute('auth')}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <KeyRound size={14} />
            <span>Go to Sign In / Sign Up Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
