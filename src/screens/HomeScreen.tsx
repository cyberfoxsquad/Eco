import React, { useState } from 'react';
import {
  Camera,
  Recycle,
  Wallet,
  Trophy,
  Leaf,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Award,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  BarChart3,
  Users,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { EcoAvatar, StatusBadge } from '../components/CommonComponents';
import { EcoCollectLogo } from '../components/EcoCollectLogo';

export const HomeScreen: React.FC = () => {
  const { currentUser, disposals, binStations, setCurrentRoute, setDraftDetails } = useEco();
  const [selectedBinTab, setSelectedBinTab] = useState<'green' | 'blue' | 'red' | 'yellow'>('green');

  const cashValueInr = currentUser ? (currentUser.pointsBalance * 0.1).toFixed(2) : '0.00';
  const userRecentDisposals = currentUser
    ? disposals.filter((d) => d.userId === currentUser.id).slice(0, 3)
    : [];

  // Total municipal calculations
  const totalSystemKg = disposals.reduce((sum, d) => sum + d.weightKg, 0);
  const totalSystemPoints = disposals.reduce((sum, d) => sum + d.pointsAwarded, 0);

  const binGuides = {
    green: {
      name: 'Wet Organic Waste (Green Bin)',
      color: 'bg-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800',
      border: 'border-emerald-200',
      reward: '100 pts/kg (₹10.00)',
      examples: ['Fruit & vegetable peels', 'Cooked leftovers', 'Tea leaves / coffee grounds', 'Eggshells', 'Garden trimmings'],
      forbidden: ['Plastic wrappers', 'Glass bottles', 'Batteries', 'Sanitary napkins'],
      tip: 'Drain excess gravy or liquid before placing in the smart bin to ensure clean bio-composting.',
      category: 'Biodegradable',
      subCategory: 'Wet Organic Compost',
    },
    blue: {
      name: 'Dry Recyclables (Blue Bin)',
      color: 'bg-blue-600',
      badge: 'bg-blue-100 text-blue-800',
      border: 'border-blue-200',
      reward: '120 pts/kg (₹12.00)',
      examples: ['PET water bottles', 'Delivery cardboard boxes', 'Newspapers & books', 'Aluminum beverage cans', 'Rinsed milk pouches'],
      forbidden: ['Food contaminated paper', 'Broken porcelain', 'Wet organic kitchen waste', 'Medical blister packs'],
      tip: 'Rinse bottles and flatten cardboard cartons to conserve smart bin volume.',
      category: 'Non-Biodegradable',
      subCategory: 'PET Plastic (#1)',
    },
    red: {
      name: 'Domestic Hazardous (Red Bin)',
      color: 'bg-rose-600',
      badge: 'bg-rose-100 text-rose-800',
      border: 'border-rose-200',
      reward: '150-200 pts/kg (₹15-20.00)',
      examples: ['AA/AAA alkaline batteries', 'Expired medicines & strips', 'Insecticide & paint cans', 'Fluorescent tube lights', 'Thermomters'],
      forbidden: ['Regular domestic food waste', 'Plastic bags', 'Cardboard packaging'],
      tip: 'Cover battery terminals with electrical tape and seal expired pills in transparent pouches.',
      category: 'Hazardous',
      subCategory: 'Household Batteries',
    },
    yellow: {
      name: 'E-Waste & Electronics (Yellow Bin)',
      color: 'bg-amber-600',
      badge: 'bg-amber-100 text-amber-800',
      border: 'border-amber-200',
      reward: '250 pts/kg (₹25.00)',
      examples: ['Old mobile phones', 'Damaged chargers & cables', 'PC peripherals & mouse', 'Earphones & power banks', 'Remote controls'],
      forbidden: ['Wet batteries with acid leakage', 'Household lightbulbs', 'Non-electronic plastic items'],
      tip: 'Remove external memory cards or SIM cards; devices undergo certified municipal urban mining.',
      category: 'E-Waste',
      subCategory: 'Cables & Electronics',
    },
  };

  const currentGuide = binGuides[selectedBinTab];

  const handlePreFillCategory = (category: string, subCategory: string) => {
    setDraftDetails(category, subCategory, '2.0');
    setCurrentRoute('disposal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. MUNICIPAL HERO WEBSITE SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-8 sm:p-12 border border-emerald-900/40 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Sparkles size={14} />
            <span>Official Smart City Waste Segregation & Direct Cash Reward Rail</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading leading-tight">
              Smart Waste Segregation for Greener Municipalities
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              EcoCollect links conscious citizens, solar-powered IoT smart bins, and municipal
              recycling centers. Scan items with Gemini AI vision, drop them off at neighborhood
              stations, and receive instant cash rewards directly via UPI.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setCurrentRoute('assistant')}
              className="px-5 py-3 bg-linear-to-r from-emerald-400 via-teal-400 to-emerald-300 hover:brightness-110 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <MessageSquare size={18} />
              <span>Ask AI Assistant</span>
            </button>

            <button
              onClick={() => setCurrentRoute('scanner')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold text-sm rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Camera size={18} className="text-emerald-400" />
              <span>Camera Scanner</span>
            </button>

            <button
              onClick={() => setCurrentRoute('disposal')}
              className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Recycle size={18} />
              <span>Find Smart Bins</span>
            </button>

            <button
              onClick={() => setCurrentRoute('about')}
              className="px-4 py-3 text-emerald-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Learn How It Works</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Live System Indicator Badge & Brand Logo in Corner */}
        <div className="hidden md:flex absolute top-8 right-8 flex-col items-end gap-2.5">
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-white/15 p-1 flex items-center justify-center">
              <EcoCollectLogo className="w-full h-full" />
            </div>
            <div className="text-left">
              <span className="text-xs font-black text-white font-heading block leading-none">EcoCollect</span>
              <span className="text-[10px] text-emerald-300 font-semibold block mt-0.5">Circular Network</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Municipal Grid Active</span>
            </div>
            <span className="text-[11px] text-slate-300 mt-0.5">
              {currentUser ? currentUser.ward : 'Green Valley Ward 4'}
            </span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. LIVE CITY-WIDE CIVIC METRIC TICKER */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Waste Diverted</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Leaf size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 font-heading">
              {(42.8 + totalSystemKg * 0.001).toFixed(1)}
            </span>
            <span className="text-xs font-bold text-emerald-600">Tons</span>
          </div>
          <p className="text-[11px] text-slate-500">Prevented from city landfills</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">CO2e Emissions Saved</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 font-heading">
              {(89.2 + totalSystemKg * 0.002).toFixed(1)}
            </span>
            <span className="text-xs font-bold text-teal-600">Tons CO2</span>
          </div>
          <p className="text-[11px] text-slate-500">Equivalent to 4,200 tree-years</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Disbursed to Citizens</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 font-heading">
              ₹{(148200 + totalSystemPoints * 0.1).toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-amber-600">INR</span>
          </div>
          <p className="text-[11px] text-slate-500">100% direct UPI transfers</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Segregation Purity</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 font-heading">96.8%</span>
            <span className="text-xs font-bold text-blue-600">Fidelity</span>
          </div>
          <p className="text-[11px] text-slate-500">Audited across 4 urban wards</p>
        </div>
      </section>

      {/* 3. RESIDENT PERSONAL PORTAL CARD (Interactive Citizen Dashboard or Guest Gateway) */}
      {currentUser ? (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <EcoAvatar avatarId={currentUser.avatarId} size={48} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">
                    {currentUser.name}
                  </h2>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                    {currentUser.role === 'admin' ? 'Municipal Admin' : 'Verified Resident'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-emerald-600" />
                  <span>{currentUser.ward}</span>
                  <span className="text-slate-300">•</span>
                  <span>UPI: {currentUser.upiId}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentRoute('profile')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors w-fit"
            >
              Manage Profile & Security
            </button>
          </div>

          {/* Resident Stats & Balances */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
              <span className="text-xs text-slate-500 font-medium block">Active Reward Points</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                  {currentUser.pointsBalance.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-600">points</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Earned through verified drop-offs</p>
            </div>

            <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/60">
              <span className="text-xs text-amber-800 font-medium block">Redeemable Cash Balance</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-900 font-heading">
                  ₹{cashValueInr}
                </span>
                <span className="text-[11px] font-bold text-amber-700 uppercase">INR</span>
              </div>
              <button
                onClick={() => setCurrentRoute('wallet')}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 mt-1 inline-flex items-center gap-1"
              >
                <span>Redeem to UPI</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/60">
              <span className="text-xs text-emerald-800 font-medium block">Total Diverted by You</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-900 font-heading">
                  {currentUser.totalKgDisposed.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-emerald-700">kg waste</span>
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-1">
                Prevented ~{(currentUser.totalKgDisposed * 1.5).toFixed(1)} kg CO2e
              </p>
            </div>
          </div>

          {/* Fast Action Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <button
              onClick={() => setCurrentRoute('scanner')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Camera size={18} />
              </div>
              <div className="mt-2.5 font-bold text-xs sm:text-sm text-slate-900">AI Camera Scan</div>
              <div className="text-[11px] text-slate-500">Scan packaging & bin tips</div>
            </button>

            <button
              onClick={() => setCurrentRoute('disposal')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Recycle size={18} />
              </div>
              <div className="mt-2.5 font-bold text-xs sm:text-sm text-slate-900">Log Smart Drop-Off</div>
              <div className="text-[11px] text-slate-500">Record weight at smart bin</div>
            </button>

            <button
              onClick={() => setCurrentRoute('wallet')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-sm transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Wallet size={18} />
              </div>
              <div className="mt-2.5 font-bold text-xs sm:text-sm text-slate-900">Redeem Points</div>
              <div className="text-[11px] text-slate-500">Instant UPI payout</div>
            </button>

            <button
              onClick={() => setCurrentRoute('leaderboard')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-sm transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Trophy size={18} />
              </div>
              <div className="mt-2.5 font-bold text-xs sm:text-sm text-slate-900">Ward Leaderboard</div>
              <div className="text-[11px] text-slate-500">Track neighborhood rank</div>
            </button>
          </div>
        </section>
      ) : (
        /* GUEST VISITOR WELCOME & AUTHENTICATION GATEWAY */
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <Sparkles size={14} />
                <span>Get 100 Welcome Points (₹10.00) Instantly</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                Sign In or Register Your Citizen Account
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                Create your municipal waste profile to log smart bin drop-offs, track your ward
                ranking, and redeem accumulated points for direct UPI cash payouts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setCurrentRoute('auth')}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
              >
                Sign In / Sign Up
              </button>
              <button
                onClick={() => setCurrentRoute('auth')}
                className="w-full sm:w-auto px-5 py-3 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs rounded-xl border border-purple-200 transition-colors"
              >
                Admin (admin/admin)
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. INTERACTIVE 4-BIN SEGREGATION GUIDE & VISUALIZER */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <Recycle size={15} />
              <span>Civic Sorting Standards</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading mt-1">
              Municipal Waste Segregation Guide
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Click a bin category to inspect accepted materials, preparation guidelines, and rewards.
            </p>
          </div>

          <button
            onClick={() => setCurrentRoute('about')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 w-fit"
          >
            <span>Open Complete Directory (40+ items)</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Bin Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setSelectedBinTab('green')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedBinTab === 'green'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
              W
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-900 mt-2">Green Bin</div>
            <div className="text-[11px] text-slate-500">Wet Organic Waste</div>
          </button>

          <button
            onClick={() => setSelectedBinTab('blue')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedBinTab === 'blue'
                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
              D
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-900 mt-2">Blue Bin</div>
            <div className="text-[11px] text-slate-500">Dry Recyclables</div>
          </button>

          <button
            onClick={() => setSelectedBinTab('red')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedBinTab === 'red'
                ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-black">
              H
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-900 mt-2">Red Bin</div>
            <div className="text-[11px] text-slate-500">Domestic Hazardous</div>
          </button>

          <button
            onClick={() => setSelectedBinTab('yellow')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedBinTab === 'yellow'
                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-black">
              E
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-900 mt-2">Yellow Bin</div>
            <div className="text-[11px] text-slate-500">E-Waste & Devices</div>
          </button>
        </div>

        {/* Selected Bin Details Box */}
        <div className={`rounded-2xl p-5 sm:p-6 border ${currentGuide.border} bg-slate-50/60 space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${currentGuide.color}`} />
              <h3 className="font-bold text-base text-slate-900 font-heading">{currentGuide.name}</h3>
            </div>
            <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full w-fit">
              Reward: {currentGuide.reward}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider block">
                Accepted Items:
              </span>
              <ul className="space-y-1.5">
                {currentGuide.examples.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider block">
                Do Not Put In This Bin:
              </span>
              <ul className="space-y-1.5">
                {currentGuide.forbidden.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-rose-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-600">
              <strong className="text-slate-900">Preparation Tip: </strong>
              {currentGuide.tip}
            </div>
            <button
              onClick={() => handlePreFillCategory(currentGuide.category, currentGuide.subCategory)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shrink-0 shadow-2xs"
            >
              Deposit This Category →
            </button>
          </div>
        </div>
      </section>

      {/* 5. MUNICIPAL SMART BIN NETWORK (Live IoT fill levels) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Ward Smart Bin Network
              </h2>
              <p className="text-xs text-slate-500">Live IoT fill-levels & collection schedules</p>
            </div>
          </div>

          <button
            onClick={() => setCurrentRoute('disposal')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Log Drop-Off at Station</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {binStations.map((bin) => {
            const isNearFull = bin.capacityPercent >= 75;
            return (
              <div
                key={bin.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{bin.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{bin.address}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isNearFull ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {bin.capacityPercent}% Full
                  </span>
                </div>

                <div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isNearFull ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${bin.capacityPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>Sensors: Ultrasonic & Load Cell</span>
                    <span>{bin.capacityPercent < 80 ? 'Ready for drop-off' : 'Clearing scheduled'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. RECENT DISPOSAL ACTIVITY */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Your Recent Environmental Drop-Offs
            </h2>
            <p className="text-xs text-slate-500">Verified environmental credits and timestamps</p>
          </div>
          <button
            onClick={() => setCurrentRoute('disposal')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            + New Drop-Off
          </button>
        </div>

        {userRecentDisposals.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Recycle size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-800">No disposal logs yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Scan your recyclables or deposit sorted waste to earn your first 100 points!
            </p>
            <button
              onClick={() => setCurrentRoute('scanner')}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Scan First Waste Item
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {userRecentDisposals.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.category === 'Biodegradable'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <Recycle size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{item.subCategory}</span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.weightKg} kg • {item.binLocation.split(' - ')[0]}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-extrabold text-sm text-emerald-700">
                    +{item.pointsAwarded} pts
                  </span>
                  <span className="text-[10px] text-amber-600 block font-semibold">
                    ₹{(item.pointsAwarded * 0.1).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. HOUSING SOCIETY (RWA) ONBOARDING CALLOUT */}
      <section className="bg-linear-to-r from-emerald-800 to-teal-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
            <Building2 size={15} />
            <span>Community Action</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-heading">
            Register Your Apartment Complex or RWA
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Housing societies with over 80% segregation fidelity receive dedicated bulk smart bins,
            free organic composting kits, and collective community amenity grants.
          </p>
        </div>

        <button
          onClick={() => setCurrentRoute('about')}
          className="px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-sm rounded-xl transition-all shrink-0 shadow-sm flex items-center gap-2"
        >
          <span>Explore Society Program</span>
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};
