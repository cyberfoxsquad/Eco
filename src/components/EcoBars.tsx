import React, { useState } from 'react';
import {
  Home,
  Camera,
  Recycle,
  Wallet,
  Trophy,
  ShieldCheck,
  MapPin,
  Leaf,
  Info,
  Menu,
  X,
  LucideIcon,
  LogIn,
  UserPlus,
  LogOut,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { EcoAvatar, RoleBadge, AccountSwitcherModal } from './CommonComponents';
import { EcoCollectLogo } from './EcoCollectLogo';
import { ScreenRoute } from '../types';

export const EcoTopBar: React.FC = () => {
  const { currentUser, currentRoute, setCurrentRoute, login, logout } = useEco();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: Array<{ route: ScreenRoute; label: string; icon: LucideIcon; badge?: string }> = [
    { route: 'home', label: 'Home', icon: Home },
    { route: 'assistant', label: 'AI Assistant', icon: MessageSquare, badge: 'Bot' },
    { route: 'scanner', label: 'AI Scanner', icon: Camera, badge: 'AI' },
    { route: 'disposal', label: 'Smart Bins', icon: Recycle },
    { route: 'wallet', label: 'Rewards & UPI', icon: Wallet },
    { route: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { route: 'about', label: 'About & Impact', icon: Info },
  ];

  if (currentUser?.role === 'admin') {
    navLinks.push({ route: 'admin', label: 'Admin HQ', icon: ShieldCheck, badge: 'Staff' });
  }

  const navigateTo = (route: ScreenRoute) => {
    setCurrentRoute(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cashValue = currentUser ? (currentUser.pointsBalance * 0.1).toFixed(0) : '0';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo & Ward */}
          <div className="flex items-center gap-6">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigateTo('home')}
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/90 p-1.5 flex items-center justify-center shadow-xs group-hover:bg-emerald-100 group-hover:scale-105 transition-all">
                <EcoCollectLogo className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 tracking-tight font-heading text-lg sm:text-xl">
                    EcoCollect
                  </span>
                  <span className="hidden sm:inline-block text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Civic Portal
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin size={11} className="text-emerald-600" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {currentUser ? currentUser.ward : 'Municipal Eco Network'}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = currentRoute === item.route;
                const Icon = item.icon;
                return (
                  <button
                    key={item.route}
                    onClick={() => navigateTo(item.route)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon size={15} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                          item.badge === 'AI'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Utilities & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {currentUser ? (
              <>
                {/* Quick Balance / Reward Pill for Resident */}
                {currentUser.role === 'user' && (
                  <button
                    onClick={() => navigateTo('wallet')}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-900 hover:bg-amber-100 transition-colors"
                    title="View wallet & redeem cash"
                  >
                    <Wallet size={15} className="text-amber-600" />
                    <div className="text-left text-xs">
                      <span className="font-extrabold text-amber-950 font-heading">
                        {currentUser.pointsBalance} pts
                      </span>
                      <span className="text-[10px] text-amber-700 ml-1">(₹{cashValue})</span>
                    </div>
                  </button>
                )}

                {/* Quick Action CTA: AI Assistant */}
                <button
                  onClick={() => navigateTo('assistant')}
                  className="hidden xl:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                  title="Open AI Doubt Clearing Waste Assistant"
                >
                  <MessageSquare size={14} className="text-emerald-600" />
                  <span>AI Assistant</span>
                </button>

                {/* Quick Action CTA: AI Scan */}
                <button
                  onClick={() => navigateTo('scanner')}
                  className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Camera size={15} />
                  <span>Scan Item</span>
                </button>

                {/* Role Badge */}
                <RoleBadge
                  role={currentUser.role}
                  onClick={() => setIsSwitcherOpen(true)}
                />

                {/* User Profile Avatar with Menu Opener */}
                <button
                  id="header_profile_avatar"
                  onClick={() => setIsSwitcherOpen(true)}
                  className="relative p-0.5 rounded-full hover:ring-2 hover:ring-emerald-400 transition-all shrink-0"
                  title="Account & Credentials Menu"
                >
                  <EcoAvatar avatarId={currentUser.avatarId} size={36} />
                </button>
              </>
            ) : (
              /* Visitor / Guest CTA Buttons */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('auth')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <LogIn size={14} />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => navigateTo('auth')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  <UserPlus size={14} />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Website Navigation
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {navLinks.map((item) => {
                const isActive = currentRoute === item.route;
                const Icon = item.icon;
                return (
                  <button
                    key={item.route}
                    onClick={() => navigateTo(item.route)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {currentUser ? (
              /* Quick Wallet Bar in Mobile Drawer */
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-2">
                <div className="text-xs">
                  <span className="text-slate-500">Citizen: </span>
                  <span className="font-extrabold text-emerald-700 font-heading">
                    {currentUser.name} ({currentUser.pointsBalance} pts)
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => navigateTo('auth')}
                  className="flex-1 py-2 text-center text-xs font-bold bg-emerald-600 text-white rounded-xl"
                >
                  Sign In / Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <AccountSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        currentUser={currentUser}
        onNavigateToProfile={() => navigateTo('profile')}
        onNavigateToAuth={() => navigateTo('auth')}
        onAdminFastLogin={() => {
          login('admin', 'admin');
          navigateTo('admin');
        }}
        onLogout={() => {
          logout();
          navigateTo('auth');
        }}
      />
    </>
  );
};

export const EcoBottomBar: React.FC = () => {
  const { currentRoute, setCurrentRoute, currentUser } = useEco();

  // Mobile-only bottom bar for convenient one-thumb mobile navigation
  const navItems: Array<{ route: ScreenRoute; label: string; icon: LucideIcon }> = [
    { route: 'home', label: 'Home', icon: Home },
    { route: 'assistant', label: 'AI Bot', icon: MessageSquare },
    { route: 'scanner', label: 'AI Scan', icon: Camera },
    { route: 'disposal', label: 'Dispose', icon: Recycle },
    { route: 'wallet', label: 'Rewards', icon: Wallet },
    { route: currentUser ? 'profile' : 'auth', label: currentUser ? 'Account' : 'Sign In', icon: currentUser?.role === 'admin' ? ShieldCheck : Info },
  ];

  if (currentUser?.role === 'admin') {
    navItems[5] = { route: 'admin', label: 'Admin', icon: ShieldCheck };
  }

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          const Icon = item.icon;

          return (
            <button
              key={item.route}
              id={`nav_item_${item.route}`}
              onClick={() => {
                setCurrentRoute(item.route);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all relative ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-5 h-1 bg-emerald-600 rounded-full" />
              )}
              <div
                className={`p-1 rounded-lg transition-all ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : ''
                }`}
              >
                <Icon size={18} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
