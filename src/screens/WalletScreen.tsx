import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Send,
  Building,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { StatusBadge } from '../components/CommonComponents';

export const WalletScreen: React.FC = () => {
  const { currentUser, transactions, requestWithdrawal, setCurrentRoute } = useEco();

  const [filterType, setFilterType] = useState<'ALL' | 'CREDITS' | 'CASHOUTS'>('ALL');
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  const [pointsInput, setPointsInput] = useState<string>('250');
  const [upiAddress, setUpiAddress] = useState<string>(currentUser?.upiId || '');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [bankIfsc, setBankIfsc] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Wallet size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 font-heading">Sign In to Access Your Wallet</h2>
        <p className="text-xs text-slate-600">
          Citizen rewards and direct UPI cash redemptions are tied to your verified citizen account.
        </p>
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={() => setCurrentRoute('auth')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Sign In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  const cashEquivalentInr = (currentUser.pointsBalance * 0.1).toFixed(2);
  const parsedPoints = parseInt(pointsInput, 10) || 0;
  const cashToRedeemInr = (parsedPoints * 0.1).toFixed(2);

  const userTransactions = transactions.filter((t) => t.userId === currentUser.id);

  const filteredTransactions = userTransactions.filter((tx) => {
    if (filterType === 'CREDITS') return tx.type === 'REWARD_CREDIT';
    if (filterType === 'CASHOUTS') return tx.type !== 'REWARD_CREDIT';
    return true;
  });

  // Calculate Next Milestone
  const MILESTONES = [
    { points: 250, cash: 25, label: 'Starter Payout' },
    { points: 500, cash: 50, label: 'Community Tier' },
    { points: 1000, cash: 100, label: 'Silver Citizen' },
    { points: 2500, cash: 250, label: 'Gold Champion' },
  ];

  const nextMilestone =
    MILESTONES.find((m) => currentUser.pointsBalance < m.points) || MILESTONES[MILESTONES.length - 1];
  const progressPercent = Math.min(
    100,
    Math.round((currentUser.pointsBalance / nextMilestone.points) * 100)
  );

  const handlePresetSelect = (pts: number) => {
    setPointsInput(pts.toString());
  };

  const handleMaxSelect = () => {
    // Round down to closest multiple of 50 or full amount if > 250
    if (currentUser.pointsBalance >= 250) {
      setPointsInput(currentUser.pointsBalance.toString());
    } else {
      setPointsInput('250');
    }
  };

  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const destination =
      payoutMethod === 'UPI'
        ? upiAddress.trim()
        : `${bankAccount.trim()} (IFSC: ${bankIfsc.trim()})`;

    if (payoutMethod === 'UPI' && !upiAddress.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a valid UPI ID (e.g. username@upi)' });
      return;
    }

    if (payoutMethod === 'Bank Transfer' && (!bankAccount.trim() || !bankIfsc.trim())) {
      setFeedback({ type: 'error', message: 'Please provide both Bank Account number and IFSC code.' });
      return;
    }

    const result = requestWithdrawal(parsedPoints, payoutMethod, destination);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setPointsInput('250');
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-amber-100 text-amber-800">
            <Wallet size={16} />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Citizen Treasury & Payouts
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading mt-1">
          EcoPoints Wallet & Redemptions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fixed statutory rate: 1 EcoPoint = ₹0.10 INR. Instant UPI or direct bank payouts.
        </p>
      </div>

      {/* 1. HERO BALANCE CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 shadow-xl border border-slate-700">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Treasury Balance
            </span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
              1 Pt = ₹0.10
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white font-heading">
                  {currentUser.pointsBalance.toLocaleString()}
                </span>
                <span className="text-sm text-emerald-400 font-bold">PTS</span>
              </div>
              <span className="text-xs text-slate-400 mt-0.5 block">
                Accumulated from verified segregation drop-offs
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-right sm:text-left">
              <span className="text-[10px] text-slate-300 block font-medium">Cash Valuation</span>
              <span className="text-2xl font-black text-amber-400 font-heading">
                ₹{cashEquivalentInr}
              </span>
              <span className="text-[10px] text-slate-300 uppercase font-semibold block">
                Indian Rupees (INR)
              </span>
            </div>
          </div>
        </div>

        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. CASH REDEMPTION MILESTONES */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 font-heading">
              Next Cashout Milestone: {nextMilestone.label}
            </h3>
            <p className="text-[11px] text-slate-500">
              {currentUser.pointsBalance} / {nextMilestone.points} pts (₹{nextMilestone.cash}.00 unlock)
            </p>
          </div>
          <span className="text-xs font-extrabold text-emerald-700">{progressPercent}%</span>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-2 pt-1">
          {MILESTONES.map((m) => {
            const isUnlocked = currentUser.pointsBalance >= m.points;
            return (
              <div
                key={m.points}
                className={`p-2 rounded-xl text-center border transition-all ${
                  isUnlocked
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}
              >
                <span className="text-[10px] font-bold block">{m.points} pts</span>
                <span className="text-xs font-black block mt-0.5">₹{m.cash}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CASH REDEMPTION PORTAL */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-heading">
            Instant Cash Withdrawal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Disburse eco-credits directly to your UPI virtual payment address or bank account.
          </p>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleRedeemSubmit} className="space-y-4">
          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1.5">
              Select Withdrawal Tier:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[250, 500, 1000].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => handlePresetSelect(pts)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    parsedPoints === pts
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  ₹{pts * 0.1} ({pts} pts)
                </button>
              ))}
              <button
                type="button"
                onClick={handleMaxSelect}
                className="py-2 px-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors"
              >
                MAX (ALL)
              </button>
            </div>
          </div>

          {/* Points Input & Equivalent Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Points to Redeem
              </label>
              <input
                id="wallet_points_input"
                type="number"
                min="250"
                max={currentUser.pointsBalance}
                step="10"
                value={pointsInput}
                onChange={(e) => setPointsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-hidden focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Cash Payout Value
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-black text-amber-700">
                ₹{cashToRedeemInr} INR
              </div>
            </div>
          </div>

          {/* Payout Channel Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1.5">
              Payout Destination Channel:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayoutMethod('UPI')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  payoutMethod === 'UPI'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-1 ring-emerald-500'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <Smartphone size={15} />
                <span>UPI Instant</span>
              </button>

              <button
                type="button"
                onClick={() => setPayoutMethod('Bank Transfer')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  payoutMethod === 'Bank Transfer'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-1 ring-emerald-500'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <Building size={15} />
                <span>Bank Account (IMPS)</span>
              </button>
            </div>
          </div>

          {payoutMethod === 'UPI' ? (
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                UPI ID (Virtual Payment Address)
              </label>
              <input
                id="wallet_upi_input"
                type="text"
                value={upiAddress}
                onChange={(e) => setUpiAddress(e.target.value)}
                placeholder="aria.sharma@upi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-500"
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="50100491028472"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Bank IFSC Code
                </label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  placeholder="HDFC0001234"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium uppercase focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          <button
            id="wallet_withdraw_submit_btn"
            type="submit"
            disabled={currentUser.pointsBalance < 250 || parsedPoints < 250}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Send size={14} />
            <span>Disburse ₹{cashToRedeemInr} Cash Transfer</span>
          </button>
        </form>
      </div>

      {/* 4. TRANSACTION HISTORY & LEDGER */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-heading">
              Transaction History
            </h2>
            <p className="text-[11px] text-slate-500">Official municipal ledger records</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
            {(['ALL', 'CREDITS', 'CASHOUTS'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterType(tab)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterType === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No transaction records found for this filter.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTransactions.map((tx) => {
              const isCredit = tx.pointsDelta > 0;

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {isCredit ? 'Disposal Reward Credit' : 'Cashout Withdrawal'}
                        </span>
                        <StatusBadge status={tx.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px] sm:max-w-xs">
                        {tx.payoutDestination} • Ref: {tx.referenceNumber}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-sm block ${
                        isCredit ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? `+${tx.pointsDelta}` : tx.pointsDelta} pts
                    </span>
                    <span className="text-[11px] text-amber-600 font-bold block">
                      ₹{tx.cashAmountInr.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
