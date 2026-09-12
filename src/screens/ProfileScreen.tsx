import React, { useState } from 'react';
import {
  User,
  Phone,
  CreditCard,
  MapPin,
  Save,
  CheckCircle2,
  ShieldCheck,
  Leaf,
  Lock,
  LogOut,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { EcoAvatar, RoleBadge } from '../components/CommonComponents';

export const ProfileScreen: React.FC = () => {
  const { currentUser, updateUserProfile, changePassword, logout, setCurrentRoute } = useEco();

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <User size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">Authentication Required</h2>
          <p className="text-xs text-slate-600">
            Please sign in or create a citizen account to access and manage your profile credentials.
          </p>
          <button
            onClick={() => setCurrentRoute('auth')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Go to Sign In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [upiId, setUpiId] = useState(currentUser.upiId);
  const [ward, setWard] = useState(currentUser.ward);
  const [avatarId, setAvatarId] = useState(currentUser.avatarId);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const WARDS = [
    'Green Valley Ward 4',
    'Downtown Central Ward 7',
    'Riverside Colony Ward 12',
    'Silicon Heights Ward 15',
    'Municipal Control HQ',
  ];

  const AVATARS = [
    { id: 'avatar_1', label: 'Emerald' },
    { id: 'avatar_2', label: 'Sky' },
    { id: 'avatar_3', label: 'Amber' },
    { id: 'avatar_4', label: 'Violet' },
    { id: 'avatar_admin', label: 'Admin Shield' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      upiId,
      ward,
      avatarId,
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPass.length < 4) {
      setPassError('New password must be at least 4 characters long.');
      return;
    }

    if (newPass !== confirmNewPass) {
      setPassError('New passwords do not match.');
      return;
    }

    const res = changePassword(currentPass, newPass);
    if (res.success) {
      setPassSuccess(res.message);
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
      setTimeout(() => setPassSuccess(null), 4000);
    } else {
      setPassError(res.message);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentRoute('auth');
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
            <User size={16} />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Credentials & Identity
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading mt-1">
          Profile & Account Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your credentials, default UPI payout handle, and security password.
        </p>
      </div>

      {/* HERO BADGE CARD */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative">
            <EcoAvatar avatarId={avatarId} size={64} />
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white shadow-xs">
              {currentUser.role === 'admin' ? (
                <ShieldCheck size={18} className="text-purple-600" />
              ) : (
                <Leaf size={18} className="text-emerald-600" />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-black text-slate-900 font-heading">{currentUser.name}</h2>
              <RoleBadge role={currentUser.role} />
            </div>
            <p className="text-xs text-slate-500">
              Username: <strong className="text-slate-800">{currentUser.username || currentUser.id}</strong> • {currentUser.email}
            </p>
            <p className="text-xs font-semibold text-emerald-700">
              {currentUser.totalKgDisposed.toFixed(1)} kg Lifetime Diverted • {currentUser.pointsBalance} EcoPoints
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-rose-200 transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* EDIT PROFILE FORM */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900 font-heading">
          Personal Information
        </h3>

        {profileSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Profile successfully updated and synchronized!</span>
          </div>
        )}

        {/* Avatar Selector */}
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-2">
            Select Account Avatar:
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setAvatarId(av.id)}
                className={`p-1 rounded-full transition-all ${
                  avatarId === av.id
                    ? 'ring-3 ring-emerald-500 scale-105'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <EcoAvatar avatarId={av.id} size={42} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-500"
                required
              />
              <User size={15} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">
              Contact Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-500"
                required
              />
              <Phone size={15} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">
              Default UPI ID (for instant cash redemptions)
            </label>
            <div className="relative">
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="name@upi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-500"
                required
              />
              <CreditCard size={15} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">
              Residential Ward
            </label>
            <div className="relative">
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-500 bg-white"
              >
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <MapPin size={15} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <Save size={15} />
          <span>Save Profile Changes</span>
        </button>
      </form>

      {/* CREDENTIALS MANAGEMENT: PASSWORD CHANGE */}
      <form onSubmit={handlePasswordChange} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound size={16} className="text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900 font-heading">
            Credentials & Password Security
          </h3>
        </div>

        {passError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        {passSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                New Password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min 4 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Confirm New Password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-500 bg-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <Lock size={15} />
          <span>Update Security Password</span>
        </button>
      </form>
    </div>
  );
};
