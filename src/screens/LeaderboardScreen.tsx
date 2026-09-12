import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Sparkles,
  Calendar,
  Flame,
  ArrowUp,
  MapPin,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { EcoAvatar } from '../components/CommonComponents';

export const LeaderboardScreen: React.FC = () => {
  const { users, currentUser, setCurrentRoute } = useEco();
  const [activeFilter, setActiveFilter] = useState<'WEEKLY' | 'ALL_TIME'>('WEEKLY');

  // Filter out admin accounts from civic citizen competition
  const citizenUsers = users.filter((u) => u.role === 'user');

  // Sorted list based on total kg or points
  const sortedCitizens = [...citizenUsers].sort((a, b) => {
    if (activeFilter === 'WEEKLY') {
      return b.pointsBalance - a.pointsBalance;
    }
    return b.totalKgDisposed - a.totalKgDisposed;
  });

  const top1 = sortedCitizens[0];
  const top2 = sortedCitizens[1];
  const top3 = sortedCitizens[2];
  const remainingCitizens = sortedCitizens.slice(3);

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-sky-100 text-sky-800">
            <Trophy size={16} />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
            Community Segregation Standings
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading mt-1">
          Ward Waste Segregation Champions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Weekly ward leaders receive municipal civic honorarium and bonus redemption multiplier.
        </p>
      </div>

      {/* 1. WEEKLY RACE CYCLE BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-sky-900 to-emerald-950 text-white p-5 shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-400/20 text-amber-300">
                <Flame size={14} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Weekly Sprint Active
              </span>
            </div>
            <h3 className="text-lg font-black font-heading">
              ₹5,000 Ward Green Grant Pool
            </h3>
            <p className="text-xs text-sky-200/80 max-w-sm">
              Top 3 citizens by validated segregation volume unlock extra 15% cashback on weekend payouts.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center sm:text-right shrink-0">
            <span className="text-[10px] text-sky-200 font-medium block">Sprint Reset In</span>
            <span className="text-xl font-black text-amber-300 font-heading block mt-0.5">
              3d 14h 22m
            </span>
            <span className="text-[10px] text-sky-300">Every Monday 00:00 UTC</span>
          </div>
        </div>
      </div>

      {/* 2. FILTER TOGGLE */}
      <div className="flex items-center justify-center p-1 bg-slate-200/80 rounded-2xl max-w-sm mx-auto">
        <button
          type="button"
          id="leaderboard_filter_weekly"
          onClick={() => setActiveFilter('WEEKLY')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'WEEKLY'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          This Week&apos;s Race
        </button>
        <button
          type="button"
          id="leaderboard_filter_all_time"
          onClick={() => setActiveFilter('ALL_TIME')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'ALL_TIME'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All-Time Champions
        </button>
      </div>

      {/* 3. PODIUM (TOP 3) */}
      {sortedCitizens.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Trophy size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            No Registered Citizens Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the very first citizen to register your account, log smart bin drop-offs, and claim the #1 spot on the ward podium!
          </p>
          <button
            onClick={() => setCurrentRoute('auth')}
            className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Create Citizen Account (+100 Pts)
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-end justify-center gap-3 sm:gap-6 pt-4 pb-2">
              {/* Rank 2 (Silver) */}
              {top2 && (
                <div className="flex flex-col items-center flex-1 max-w-[110px] sm:max-w-[130px] text-center">
                  <div className="relative mb-2">
                    <EcoAvatar avatarId={top2.avatarId} size={50} />
                    <span className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-800 text-xs font-black flex items-center justify-center border-2 border-white shadow-xs">
                      2
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate w-full">{top2.name}</h4>
                  <p className="text-[10px] text-slate-500 truncate w-full">{top2.ward.split(' ')[0]}</p>
                  <div className="mt-2 w-full bg-slate-100 rounded-t-2xl pt-4 pb-3 border-t border-slate-200">
                    <span className="text-xs font-extrabold text-slate-800 block">
                      {top2.totalKgDisposed.toFixed(1)} kg
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                      {top2.pointsBalance} pts
                    </span>
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold) */}
              {top1 && (
                <div className="flex flex-col items-center flex-1 max-w-[120px] sm:max-w-[150px] text-center -mt-4">
                  <Crown size={22} className="text-amber-500 mb-1 animate-bounce" />
                  <div className="relative mb-2">
                    <EcoAvatar
                      avatarId={top1.avatarId}
                      size={64}
                      className="ring-4 ring-amber-400 shadow-lg"
                    />
                    <span className="absolute -top-2 -right-1 w-7 h-7 rounded-full bg-amber-400 text-amber-950 text-xs font-black flex items-center justify-center border-2 border-white shadow-xs">
                      1
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 truncate w-full">{top1.name}</h4>
                  <p className="text-[10px] text-slate-500 truncate w-full">{top1.ward.split(' ')[0]}</p>
                  <div className="mt-2 w-full bg-linear-to-b from-amber-100 to-amber-50 rounded-t-2xl pt-6 pb-4 border-t-2 border-amber-400 shadow-xs">
                    <span className="text-sm font-black text-amber-950 block">
                      {top1.totalKgDisposed.toFixed(1)} kg
                    </span>
                    <span className="text-xs text-emerald-800 font-extrabold block mt-0.5">
                      {top1.pointsBalance} pts
                    </span>
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {top3 && (
                <div className="flex flex-col items-center flex-1 max-w-[110px] sm:max-w-[130px] text-center">
                  <div className="relative mb-2">
                    <EcoAvatar avatarId={top3.avatarId} size={48} />
                    <span className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-black flex items-center justify-center border-2 border-white shadow-xs">
                      3
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate w-full">{top3.name}</h4>
                  <p className="text-[10px] text-slate-500 truncate w-full">{top3.ward.split(' ')[0]}</p>
                  <div className="mt-2 w-full bg-amber-50/60 rounded-t-2xl pt-3 pb-2.5 border-t border-amber-200">
                    <span className="text-xs font-extrabold text-slate-800 block">
                      {top3.totalKgDisposed.toFixed(1)} kg
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                      {top3.pointsBalance} pts
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. FULL LEADERBOARD TABLE */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Complete Civic Rankings
            </h3>

            <div className="space-y-2">
              {sortedCitizens.map((citizen, idx) => {
                const rank = idx + 1;
                const isCurrentUser = currentUser?.id === citizen.id;

            return (
              <div
                key={citizen.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  isCurrentUser
                    ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-400'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 text-center text-xs font-black ${
                      rank === 1
                        ? 'text-amber-500'
                        : rank === 2
                        ? 'text-slate-400'
                        : rank === 3
                        ? 'text-amber-700'
                        : 'text-slate-400'
                    }`}
                  >
                    #{rank}
                  </span>

                  <EcoAvatar avatarId={citizen.avatarId} size={38} />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{citizen.name}</span>
                      {isCurrentUser && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{citizen.ward}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-extrabold text-xs text-slate-900 block">
                    {citizen.totalKgDisposed.toFixed(1)} kg diverted
                  </span>
                  <span className="text-[11px] font-black text-emerald-700 block mt-0.5">
                    {citizen.pointsBalance} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  )}
</div>
  );
};
