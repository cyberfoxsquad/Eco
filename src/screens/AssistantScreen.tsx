import React from 'react';
import {
  MessageSquare,
  Sparkles,
  Camera,
  Award,
  Recycle,
  Coins,
  ArrowRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { EcoChatBot } from '../components/EcoChatBot';
import { useEco } from '../context/EcoContext';

export const AssistantScreen: React.FC = () => {
  const { setCurrentRoute } = useEco();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Hero / Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-700">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
              <Sparkles size={14} />
              <span>Civic AI Waste Doubt-Clearing Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
              Ask Any Waste & Recycling Question
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Clear all your doubts about municipal waste segregation, recycling rules, home composting, and UPI reward payouts with EcoBot AI.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setCurrentRoute('scanner')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
              >
                <Camera size={14} />
                <span>Open Dedicated Camera Scanner</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Quick Stat Pill Cards */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
                Intelligence Engine
              </span>
              <span className="text-sm font-extrabold text-white">Gemini Multi-Turn AI</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                Cash Conversion
              </span>
              <span className="text-sm font-extrabold text-white">1 Pt = ₹0.25 UPI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Standalone Chat Interface */}
      <div className="h-[680px] w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
        <EcoChatBot standalone={true} />
      </div>

      {/* Frequently Asked Quick Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen size={18} />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Instant Doubt Clearing</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unsure if milk pouches, egg cartons, or CFL bulbs are recyclable? EcoBot explains the exact municipal category, preparation steps, and designated bin.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award size={18} />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Material Scores & Circularity</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Get recyclability scores, carbon reduction estimates, and purity standards for various polymers, paper grades, glass, and compostable organic matter.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Coins size={18} />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Direct UPI Cash Transfer</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Points earned from segregating and binning items can be redeemed directly to your UPI ID without fees from the Wallet screen.
          </p>
        </div>
      </div>
    </div>
  );
};
