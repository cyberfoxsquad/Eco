import React, { useState } from 'react';
import {
  Lock,
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Leaf,
  KeyRound,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { EcoAvatar } from '../components/CommonComponents';
import { EcoCollectLogo } from '../components/EcoCollectLogo';

export const AuthScreen: React.FC = () => {
  const { login, signup, setCurrentRoute, currentUser } = useEco();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);

  // Sign In form state
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpWard, setSignUpWard] = useState('Green Valley Ward 4');
  const [signUpUpiId, setSignUpUpiId] = useState('');
  const [signUpAvatarId, setSignUpAvatarId] = useState('avatar_1');

  // Feedback state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const WARDS = [
    'Green Valley Ward 4',
    'Downtown Central Ward 7',
    'Riverside Colony Ward 12',
    'Silicon Heights Ward 15',
  ];

  const AVATARS = [
    { id: 'avatar_1', label: 'Emerald' },
    { id: 'avatar_2', label: 'Sky' },
    { id: 'avatar_3', label: 'Amber' },
    { id: 'avatar_4', label: 'Violet' },
  ];

  // Quick fill admin credentials (admin - password: admin)
  const handleAdminQuickFill = () => {
    setSignInIdentifier('admin');
    setSignInPassword('admin');
    setErrorMessage(null);
  };

  const handleAdminDirectLogin = () => {
    setErrorMessage(null);
    const res = login('admin', 'admin');
    if (res.success) {
      setSuccessMessage('Logged in as Municipal Administrator!');
      setTimeout(() => {
        setCurrentRoute('admin');
      }, 500);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signInIdentifier.trim() || !signInPassword) {
      setErrorMessage('Please enter both your Username/Email and Password.');
      return;
    }

    setIsSubmitting(true);
    const result = login(signInIdentifier, signInPassword);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        if (result.user?.role === 'admin') {
          setCurrentRoute('admin');
        } else {
          setCurrentRoute('home');
        }
      }, 600);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signUpName.trim() || !signUpUsername.trim() || !signUpPassword) {
      setErrorMessage('Full name, username, and password are required.');
      return;
    }

    if (signUpPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    const result = signup({
      name: signUpName,
      username: signUpUsername,
      email: signUpEmail || `${signUpUsername.toLowerCase()}@ecocollect.user`,
      password: signUpPassword,
      phone: signUpPhone || '+91 98000 00000',
      ward: signUpWard,
      upiId: signUpUpiId || `${signUpUsername.toLowerCase()}@upi`,
      avatarId: signUpAvatarId,
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        setCurrentRoute('home');
      }, 800);
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 max-w-lg mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden w-full">
        {/* Top Municipal Branding Header */}
        <div className="bg-slate-900 text-white p-6 text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/15 p-2 shadow-lg mb-3">
            <EcoCollectLogo className="w-full h-full" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-heading">
            EcoCollect Portal
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Secure Citizen & Municipal Officer Credentials Management
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up (New Citizen)
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          {/* Notification Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Mandatory Admin Credentials Box */}
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-purple-950">
                    <ShieldCheck size={16} className="text-purple-700" />
                    <span>Municipal Administrator Account</span>
                  </div>
                  <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-bold">
                    Official
                  </span>
                </div>
                <p className="text-[11px] text-purple-800 leading-normal">
                  Login ID: <strong className="font-mono bg-white/80 px-1 py-0.5 rounded">admin</strong> • Password:{' '}
                  <strong className="font-mono bg-white/80 px-1 py-0.5 rounded">admin</strong>
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAdminQuickFill}
                    className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-300 text-[11px] transition-colors"
                  >
                    Auto-Fill
                  </button>
                  <button
                    type="button"
                    onClick={handleAdminDirectLogin}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[11px] transition-colors"
                  >
                    Instant Admin Sign-In →
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin or your citizen username"
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <User size={15} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter account password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pl-9 pr-10 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <Lock size={15} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <KeyRound size={15} />
                <span>{isSubmitting ? 'Verifying...' : 'Sign In to Portal'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-xs text-slate-500 hover:text-emerald-700 font-medium"
                >
                  New citizen? <span className="font-bold underline">Create an account here</span>
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-600 shrink-0" />
                <span>Sign up now to get <strong>100 Welcome Points (₹10.00)</strong> instantly!</span>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Choose Citizen Avatar
                </label>
                <div className="flex items-center gap-3">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSignUpAvatarId(av.id)}
                      className={`p-0.5 rounded-full transition-all ${
                        signUpAvatarId === av.id ? 'ring-3 ring-emerald-500 scale-105' : 'opacity-60'
                      }`}
                    >
                      <EcoAvatar avatarId={av.id} size={36} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Kumar"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. anand_k"
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="anand@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 4 characters"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Ward Area</label>
                  <select
                    value={signUpWard}
                    onChange={(e) => setSignUpWard(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-700"
                  >
                    {WARDS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  UPI ID (for instant cash payouts)
                </label>
                <input
                  type="text"
                  placeholder="yourname@okhdfcbank or yourname@upi"
                  value={signUpUpiId}
                  onChange={(e) => setSignUpUpiId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <CheckCircle2 size={15} />
                <span>{isSubmitting ? 'Registering Account...' : 'Complete Sign Up & Claim Points'}</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="text-xs text-slate-500 hover:text-emerald-700 font-medium"
                >
                  Already have an account? <span className="font-bold underline">Sign In</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
