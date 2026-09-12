import React from 'react';
import {
  Shield,
  Leaf,
  CheckCircle2,
  Clock,
  XCircle,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Settings,
  KeyRound,
} from 'lucide-react';
import { UserEntity, DisposalStatus, TransactionStatus } from '../types';

interface EcoAvatarProps {
  avatarId?: string;
  size?: number;
  className?: string;
}

export const EcoAvatar: React.FC<EcoAvatarProps> = ({ avatarId = 'avatar_1', size = 36, className = '' }) => {
  let bgColor = 'bg-emerald-600';
  let Icon = UserIcon;

  if (avatarId === 'avatar_admin') {
    bgColor = 'bg-purple-600';
    Icon = ShieldCheck;
  } else if (avatarId === 'avatar_2') {
    bgColor = 'bg-sky-600';
    Icon = UserIcon;
  } else if (avatarId === 'avatar_3') {
    bgColor = 'bg-amber-600';
    Icon = UserIcon;
  } else if (avatarId === 'avatar_4') {
    bgColor = 'bg-violet-600';
    Icon = UserIcon;
  }

  return (
    <div
      id={`avatar_${avatarId}`}
      style={{ width: size, height: size }}
      className={`rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${bgColor} ${className}`}
    >
      <Icon size={Math.round(size * 0.58)} />
    </div>
  );
};

interface RoleBadgeProps {
  role: 'user' | 'admin';
  onClick?: () => void;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, onClick, className = '' }) => {
  const isAdmin = role === 'admin';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
        isAdmin
          ? 'bg-purple-100 text-purple-800 border border-purple-300'
          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
      } ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
    >
      {isAdmin ? <Shield size={12} className="text-purple-700" /> : <Leaf size={12} className="text-emerald-700" />}
      <span>{isAdmin ? 'Municipal Admin' : 'Citizen'}</span>
    </span>
  );
};

interface StatusBadgeProps {
  status: DisposalStatus | TransactionStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSmall = size === 'sm';
  let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = CheckCircle2;

  if (status === 'Verified' || status === 'Approved' || status === 'Transferred') {
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    Icon = CheckCircle2;
  } else if (status === 'Flagged' || status === 'Rejected') {
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = XCircle;
  } else if (status === 'Pending') {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = Clock;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${badgeStyle}`}
    >
      <Icon size={isSmall ? 11 : 13} />
      <span>{status}</span>
    </span>
  );
};

interface AccountMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserEntity | null;
  onNavigateToProfile: () => void;
  onNavigateToAuth: () => void;
  onAdminFastLogin: () => void;
  onLogout: () => void;
}

export const AccountSwitcherModal: React.FC<AccountMenuModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigateToProfile,
  onNavigateToAuth,
  onAdminFastLogin,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">Account & Credentials</h3>
            <p className="text-xs text-slate-500 mt-0.5">EcoCollect User Session</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {currentUser ? (
          <div className="space-y-4">
            {/* Active User Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <EcoAvatar avatarId={currentUser.avatarId} size={42} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs truncate">{currentUser.name}</span>
                  <RoleBadge role={currentUser.role} />
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  ID: {currentUser.username || currentUser.id} • {currentUser.ward}
                </p>
                <p className="text-[11px] font-semibold text-emerald-700">
                  {currentUser.pointsBalance} EcoPoints (₹{(currentUser.pointsBalance * 0.1).toFixed(2)})
                </p>
              </div>
            </div>

            {/* Menu Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  onNavigateToProfile();
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center gap-2 transition-colors"
              >
                <Settings size={15} className="text-slate-500" />
                <span>Profile & Password Settings</span>
              </button>

              {currentUser.role !== 'admin' && (
                <button
                  onClick={() => {
                    onAdminFastLogin();
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-xs font-bold text-purple-900 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-purple-700" />
                    <span>Switch to Municipal Admin (admin/admin)</span>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  onNavigateToAuth();
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center gap-2 transition-colors"
              >
                <KeyRound size={15} className="text-slate-500" />
                <span>Switch Account / Sign In as Other</span>
              </button>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2 transition-colors"
              >
                <LogOut size={15} className="text-rose-600" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2 text-center">
            <p className="text-xs text-slate-600">
              You are currently browsing as a guest visitor. Sign in or create an account to start earning points.
            </p>
            <button
              onClick={() => {
                onNavigateToAuth();
                onClose();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              Sign In / Sign Up
            </button>
            <button
              onClick={() => {
                onAdminFastLogin();
                onClose();
              }}
              className="w-full py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs rounded-xl transition-colors"
            >
              Municipal Admin Sign-In (admin/admin)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
