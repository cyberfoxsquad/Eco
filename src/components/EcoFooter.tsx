import React from 'react';
import {
  Leaf,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Globe,
  ArrowUpRight,
  Heart,
  Wifi,
  Sparkles,
  Recycle,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { EcoCollectLogo } from './EcoCollectLogo';
import { ScreenRoute } from '../types';

export const EcoFooter: React.FC = () => {
  const { setCurrentRoute } = useEco();

  const handleNav = (route: ScreenRoute) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-20">
      {/* 1. Live IoT Network Status Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 font-bold">IoT Grid Live:</span>
            <span>All 4 Ward Smart Bin Stations Operational • 99.8% Fleet Uptime</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Swachh Smart City Framework Compliant</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-400">Powered by Gemini Vision 2.5</span>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Mission Col */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className="flex items-center gap-3 cursor-pointer group w-fit"
              onClick={() => handleNav('home')}
            >
              <div className="w-11 h-11 rounded-2xl bg-slate-800/90 border border-slate-700 p-1.5 flex items-center justify-center shadow-md group-hover:border-emerald-500 group-hover:scale-105 transition-all">
                <EcoCollectLogo className="w-full h-full" />
              </div>
              <div>
                <span className="font-extrabold text-white tracking-tight font-heading text-xl">
                  EcoCollect
                </span>
                <span className="block text-[11px] text-emerald-400 font-semibold tracking-wider uppercase">
                  Communal Smart Waste Network
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Empowering responsible urban citizens with AI-assisted segregation, real-time smart
              bin drop-off tracking, and instant point-to-cash UPI disbursements for zero-waste
              neighborhoods.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 text-xs border border-slate-700">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Gov Certified Civic Rail</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 text-xs border border-slate-700">
                <Globe size={14} className="text-blue-400" />
                <span>UN SDG 11 & 12</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  City Overview & Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('scanner')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>AI Waste Scanner</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                    AI
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('disposal')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Smart Bins & Drop-Off
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('wallet')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Rewards & UPI Cashout
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('leaderboard')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Ward Leaderboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  About & Carbon Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Segregation Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Civic Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Waste Segregation Manual
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Household Carbon Estimator
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Housing Society (RWA) Signup
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('admin')}
                  className="hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <span>Municipal Officer Portal</span>
                  <ArrowUpRight size={12} />
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Civic Helpline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Emergency & Support
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <Phone size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-200 font-semibold">Mobile Number</div>
                  <a href="tel:+919994722259" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    +91 99947 22259
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-200 font-semibold">Email</div>
                  <a href="mailto:cyberfox8266@gmail.com" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    cyberfox8266@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-200 font-semibold">HQ Coordination</div>
                  <div className="text-slate-400">kumbakonam , tamilnadu</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} EcoCollect Municipal Corporation. Built for Swachh Urban Mission. • Designed by NITHIN VARSHAN TK, HARISH, SARVESHWAR, RAJAGURU, KANISHKAN
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNav('about')}
              className="hover:text-slate-400 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleNav('about')}
              className="hover:text-slate-400 transition-colors"
            >
              Citizen Charter
            </button>
            <button
              onClick={() => handleNav('about')}
              className="hover:text-slate-400 transition-colors"
            >
              E-Waste Guidelines
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
