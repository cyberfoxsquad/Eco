import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Recycle,
  Users,
  Building,
  Filter,
  ArrowDownRight,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { ForbiddenScreen } from './ForbiddenScreen';
import { StatusBadge, EcoAvatar } from '../components/CommonComponents';

export const AdminScreen: React.FC = () => {
  const {
    currentUser,
    users,
    disposals,
    transactions,
    binStations,
    adminApprovePayout,
    adminRejectPayout,
    adminUpdateDisposalStatus,
  } = useEco();

  const [activeTab, setActiveTab] = useState<'PAYOUTS' | 'DISPOSALS' | 'WARD_AUDIT'>('PAYOUTS');
  const [disposalFilter, setDisposalFilter] = useState<'ALL' | 'FLAGGED'>('ALL');

  // Role Gate Enforcement
  if (!currentUser || currentUser.role !== 'admin') {
    return <ForbiddenScreen />;
  }

  // Analytics Math
  const citizenCount = users.filter((u) => u.role === 'user').length;
  const totalKg = disposals.reduce((sum, d) => sum + d.weightKg, 0);
  const totalBioKg = disposals
    .filter((d) => d.category === 'Biodegradable')
    .reduce((sum, d) => sum + d.weightKg, 0);
  const totalDryKg = disposals
    .filter((d) => d.category !== 'Biodegradable')
    .reduce((sum, d) => sum + d.weightKg, 0);

  const totalPointsIssued = disposals.reduce((sum, d) => sum + d.pointsAwarded, 0);
  const pendingCashouts = transactions
    .filter((t) => t.type !== 'REWARD_CREDIT' && t.status === 'Pending')
    .reduce((sum, t) => sum + t.cashAmountInr, 0);
  const settledCashouts = transactions
    .filter((t) => t.type !== 'REWARD_CREDIT' && t.status === 'Transferred')
    .reduce((sum, t) => sum + t.cashAmountInr, 0);

  const withdrawalRequests = transactions.filter((t) => t.type !== 'REWARD_CREDIT');

  const filteredDisposals = disposals.filter((d) => {
    if (disposalFilter === 'FLAGGED') return d.status === 'Flagged';
    return true;
  });

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-purple-100 text-purple-800">
              <ShieldCheck size={16} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
              Municipal Sanitation & Treasury Console
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Municipal Oversight Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as {currentUser.name} ({currentUser.ward}) • Full Admin Authority
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-bold self-start sm:self-auto">
          <Building size={14} />
          <span>Control Unit #4</span>
        </div>
      </div>

      {/* 1. MUNICIPAL KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Diverted</span>
            <Recycle size={16} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 font-heading">
              {totalKg.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-emerald-700">kg</span>
          </div>
          <p className="text-[10px] text-slate-500">
            {totalBioKg.toFixed(1)}kg Wet • {totalDryKg.toFixed(1)}kg Dry
          </p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Enrolled Citizens</span>
            <Users size={16} className="text-sky-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 font-heading">{citizenCount}</span>
            <span className="text-xs text-slate-400">active</span>
          </div>
          <p className="text-[10px] text-slate-500">Across 4 municipal wards</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Points Minted</span>
            <DollarSign size={16} className="text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-600 font-heading">
              {totalPointsIssued.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">pts</span>
          </div>
          <p className="text-[10px] text-slate-500">
            ₹{(totalPointsIssued * 0.1).toFixed(2)} total liability
          </p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Payouts</span>
            <Clock size={16} className="text-rose-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-rose-600 font-heading">
              ₹{pendingCashouts.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">₹{settledCashouts.toFixed(2)} settled</p>
        </div>
      </div>

      {/* 2. ADMIN TABS */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl max-w-md">
        <button
          type="button"
          id="admin_tab_payouts"
          onClick={() => setActiveTab('PAYOUTS')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PAYOUTS'
              ? 'bg-white text-purple-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Payouts ({withdrawalRequests.filter((w) => w.status === 'Pending').length})
        </button>

        <button
          type="button"
          id="admin_tab_disposals"
          onClick={() => setActiveTab('DISPOSALS')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'DISPOSALS'
              ? 'bg-white text-purple-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Disposal Stream ({disposals.filter((d) => d.status === 'Flagged').length} flagged)
        </button>

        <button
          type="button"
          id="admin_tab_ward_audit"
          onClick={() => setActiveTab('WARD_AUDIT')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'WARD_AUDIT'
              ? 'bg-white text-purple-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Smart Bins
        </button>
      </div>

      {/* TAB 0: PAYOUT APPROVALS */}
      {activeTab === 'PAYOUTS' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Treasury Withdrawal Queue
              </h2>
              <p className="text-xs text-slate-500">
                Authorize citizen redemptions via connected banking & UPI rails
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full">
              {withdrawalRequests.length} Total Requests
            </span>
          </div>

          {withdrawalRequests.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No withdrawal requests in queue.
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawalRequests.map((tx) => {
                const isPending = tx.status === 'Pending';

                return (
                  <div
                    key={tx.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isPending
                        ? 'border-amber-300 bg-amber-50/40'
                        : 'border-slate-100 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">
                            {tx.userName}
                          </span>
                          <StatusBadge status={tx.status} size="sm" />
                          <span className="text-[10px] text-slate-500">Ref: {tx.referenceNumber}</span>
                        </div>

                        <p className="text-xs text-slate-600 mt-1">
                          Destination:{' '}
                          <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-800">
                            {tx.payoutDestination}
                          </code>
                        </p>

                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Requested: {new Date(tx.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 sm:self-center">
                        <div className="text-right">
                          <span className="text-lg font-black text-amber-700 block">
                            ₹{tx.cashAmountInr.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-semibold">
                            {Math.abs(tx.pointsDelta)} points
                          </span>
                        </div>

                        {isPending && (
                          <div className="flex items-center gap-1.5">
                            <button
                              id={`admin_approve_${tx.id}`}
                              onClick={() => adminApprovePayout(tx.id)}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                              title="Settle & Disburse Funds"
                            >
                              <CheckCircle2 size={14} />
                              <span>Settle</span>
                            </button>

                            <button
                              id={`admin_reject_${tx.id}`}
                              onClick={() => adminRejectPayout(tx.id)}
                              className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Reject & Refund Points"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: DISPOSAL AUDIT STREAM */}
      {activeTab === 'DISPOSALS' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Disposal Submissions & Anti-Fraud
              </h2>
              <p className="text-xs text-slate-500">
                Examine weight sensor logs, photo proofs, and flag suspicious drops
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDisposalFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  disposalFilter === 'ALL'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                All Submissions
              </button>
              <button
                type="button"
                onClick={() => setDisposalFilter('FLAGGED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  disposalFilter === 'FLAGGED'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                Flagged Spikes Only
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredDisposals.map((log) => {
              const isFlagged = log.status === 'Flagged';

              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                    isFlagged
                      ? 'border-rose-300 bg-rose-50/30'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {log.imageProofUri && (
                      <img
                        src={log.imageProofUri}
                        alt="Disposal Proof"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{log.userName}</span>
                        <StatusBadge status={log.status} size="sm" />
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                          {log.category}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-emerald-800 mt-0.5">{log.subCategory}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {log.weightKg} kg • {log.binLocation}
                      </p>
                      {log.weightKg > 15 && (
                        <p className="text-[10px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                          <AlertTriangle size={11} />
                          <span>Large volume spike (&gt;15kg single drop)</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-700 block">
                        +{log.pointsAwarded} pts
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {log.status !== 'Verified' && (
                        <button
                          onClick={() => adminUpdateDisposalStatus(log.id, 'Verified')}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                          title="Verify Drop-off"
                        >
                          Verify
                        </button>
                      )}
                      {log.status !== 'Flagged' && (
                        <button
                          onClick={() => adminUpdateDisposalStatus(log.id, 'Flagged')}
                          className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition-colors"
                          title="Flag for Investigation"
                        >
                          Flag
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SMART BIN AUDIT */}
      {activeTab === 'WARD_AUDIT' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Smart Bin Station Telemetry
            </h2>
            <p className="text-xs text-slate-500">
              Real-time ultrasonic sensor fill levels and automated municipal dispatch triggers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {binStations.map((bin) => {
              const isHigh = bin.capacityPercent >= 70;
              return (
                <div
                  key={bin.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900">{bin.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{bin.address}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {bin.capacityPercent}%
                    </span>
                  </div>

                  <div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isHigh ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${bin.capacityPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Status: Active Sensor</span>
                      <span>{isHigh ? '⚠️ Dispatch Compactor' : 'Optimal Capacity'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
