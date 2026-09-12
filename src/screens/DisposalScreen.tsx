import React, { useState } from 'react';
import {
  Recycle,
  CheckCircle2,
  AlertTriangle,
  Camera,
  MapPin,
  QrCode,
  Sparkles,
  ArrowRight,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEco } from '../context/EcoContext';
import { DisposalLogEntity } from '../types';

export const DisposalScreen: React.FC = () => {
  const {
    currentUser,
    binStations,
    draftCategory,
    draftSubCategory,
    draftWeightKg,
    submitDisposal,
    setCurrentRoute,
  } = useEco();

  const [selectedBinId, setSelectedBinId] = useState<string>(binStations[0]?.id || 'bin_402');
  const [isQrVerified, setIsQrVerified] = useState<boolean>(true);
  const [category, setCategory] = useState<string>(draftCategory || 'Non-Biodegradable');
  const [subCategory, setSubCategory] = useState<string>(draftSubCategory || 'PET Plastic (#1)');
  const [weightKgStr, setWeightKgStr] = useState<string>(draftWeightKg || '1.5');
  const [photoProof, setPhotoProof] = useState<string>(
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<{
    log: DisposalLogEntity;
    pointsAwarded: number;
  } | null>(null);

  const parsedWeight = parseFloat(weightKgStr) || 0;
  const pointsToEarn = Math.max(1, Math.round(parsedWeight * 100));
  const cashValueToEarn = (pointsToEarn * 0.1).toFixed(2);
  const isHighVolume = parsedWeight > 15.0;

  const SUB_CATEGORIES_NON_BIO = [
    'PET Plastic (#1)',
    'HDPE Plastic (#2)',
    'Corrugated Cardboard',
    'Aluminum / Metal Cans',
    'Glass Bottles',
    'Hazardous E-Waste',
  ];

  const SUB_CATEGORIES_BIO = [
    'Wet Organic Compost',
    'Kitchen Food Scraps',
    'Garden Leaves & Trimmings',
    'Biodegradable Paper Packaging',
  ];

  const currentSubList =
    category === 'Biodegradable' ? SUB_CATEGORIES_BIO : SUB_CATEGORIES_NON_BIO;

  const handleWeightPreset = (kg: number) => {
    setWeightKgStr(kg.toString());
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedWeight <= 0) return;

    setIsSubmitting(true);
    const selectedBin = binStations.find((b) => b.id === selectedBinId);
    const binName = selectedBin?.name || 'Authorized Smart Bin';

    const result = submitDisposal({
      weightKg: parsedWeight,
      binLocation: binName,
      imageProofUri: photoProof,
      category,
      subCategory,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setIsSubmitting(false);
    setSuccessResult(result);
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
            <Recycle size={16} />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Bin Verification & Weighing
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading mt-1">
          Log Waste Disposal Drop-Off
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify your physical drop-off at municipal smart bins to claim your instant cash reward.
        </p>
      </div>

      {successResult ? (
        /* SUCCESS CONFIRMATION MODAL CARD */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Drop-Off Confirmed
            </span>
            <h2 className="text-2xl font-black text-slate-900 font-heading mt-1">
              +{successResult.pointsAwarded} EcoPoints Credited!
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
              Your {successResult.log.weightKg}kg drop-off at {successResult.log.binLocation} has been
              logged and verified.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-around">
            <div>
              <span className="text-[11px] text-emerald-800 block font-semibold">Points Earned</span>
              <span className="text-xl font-black text-emerald-700 font-heading">
                +{successResult.pointsAwarded}
              </span>
            </div>
            <div className="h-8 w-px bg-emerald-200" />
            <div>
              <span className="text-[11px] text-emerald-800 block font-semibold">Cash Value</span>
              <span className="text-xl font-black text-amber-700 font-heading">
                ₹{(successResult.pointsAwarded * 0.1).toFixed(2)}
              </span>
            </div>
            <div className="h-8 w-px bg-emerald-200" />
            <div>
              <span className="text-[11px] text-emerald-800 block font-semibold">Status</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                {successResult.log.status}
              </span>
            </div>
          </div>

          {successResult.log.status === 'Flagged' && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2 text-left">
              <AlertTriangle size={16} className="shrink-0 text-amber-600" />
              <span>
                Note: Disposals over 15kg are held for routine municipal admin review before payout unlock.
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setCurrentRoute('wallet')}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              View Rewards in Wallet
            </button>
            <button
              onClick={() => {
                setSuccessResult(null);
                setWeightKgStr('1.5');
              }}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Log Another Drop-Off
            </button>
          </div>
        </div>
      ) : (
        /* DISPOSAL SUBMISSION FORM */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. BIN LOCATION */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin size={15} className="text-emerald-600" />
                <span>1. Select Municipal Bin Station</span>
              </label>

              <button
                type="button"
                onClick={() => setIsQrVerified(!isQrVerified)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border transition-all ${
                  isQrVerified
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <QrCode size={12} />
                <span>{isQrVerified ? 'QR Sensor Verified' : 'Tap to Verify QR'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {binStations.map((bin) => {
                const isSelected = selectedBinId === bin.id;
                return (
                  <div
                    key={bin.id}
                    id={`bin_select_${bin.id}`}
                    onClick={() => setSelectedBinId(bin.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-xs text-slate-900 line-clamp-1">{bin.name}</span>
                      <span className="text-[10px] text-slate-500">{bin.capacityPercent}% Full</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{bin.address}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. CATEGORY & SUB-CATEGORY */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Recycle size={15} className="text-emerald-600" />
              <span>2. Waste Segregation Category</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="cat_btn_non_bio"
                onClick={() => {
                  setCategory('Non-Biodegradable');
                  setSubCategory('PET Plastic (#1)');
                }}
                className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                  category === 'Non-Biodegradable'
                    ? 'border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-400'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-1.5">
                  <Recycle size={16} />
                </div>
                <span>Non-Biodegradable</span>
                <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                  Blue Bin (Dry Recyclables)
                </span>
              </button>

              <button
                type="button"
                id="cat_btn_bio"
                onClick={() => {
                  setCategory('Biodegradable');
                  setSubCategory('Wet Organic Compost');
                }}
                className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                  category === 'Biodegradable'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-400'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1.5">
                  <Sparkles size={16} />
                </div>
                <span>Biodegradable</span>
                <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                  Green Bin (Wet Waste)
                </span>
              </button>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                Select Material Sub-type:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentSubList.map((sub) => {
                  const isSelected = subCategory === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubCategory(sub)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. WEIGHT & REWARD CALCULATOR */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900">
                3. Enter Net Weight (kg)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">1.0 kg = 100 pts (₹10.00)</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  id="disposal_weight_input"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={weightKgStr}
                  onChange={(e) => setWeightKgStr(e.target.value)}
                  className="w-full text-xl font-bold px-4 py-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="0.0"
                  required
                />
                <span className="absolute right-4 top-3.5 text-sm font-bold text-slate-400">
                  kg
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Presets:</span>
              {[0.5, 1.0, 2.5, 5.0, 10.0].map((kg) => (
                <button
                  key={kg}
                  type="button"
                  onClick={() => handleWeightPreset(kg)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                    parsedWeight === kg
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {kg}kg
                </button>
              ))}
            </div>

            {/* LIVE REWARD PREVIEW CARD */}
            <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-900 block">
                  Calculated Citizen Reward
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-emerald-800 font-heading">
                    +{pointsToEarn} pts
                  </span>
                  <span className="text-sm font-bold text-amber-700">
                    ≈ ₹{cashValueToEarn} INR
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Est. CO₂ Offset</span>
                <span className="text-xs font-extrabold text-teal-800">
                  {(parsedWeight * 2.5).toFixed(1)} kg
                </span>
              </div>
            </div>

            {isHighVolume && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0 text-amber-600" />
                <span>Submissions &gt; 15kg trigger automated municipal anti-fraud review.</span>
              </div>
            )}
          </div>

          {/* 4. PHOTO PROOF */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Camera size={15} className="text-emerald-600" />
                <span>4. Photo Proof at Bin Point</span>
              </label>

              <label className="cursor-pointer text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                <Upload size={13} />
                <span>Upload New</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {photoProof && (
              <div className="relative h-32 rounded-2xl overflow-hidden border border-slate-200">
                <img
                  src={photoProof}
                  alt="Proof of Disposal"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white text-[10px] font-semibold">
                  Sensor Stamped • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            id="submit_disposal_button"
            type="submit"
            disabled={isSubmitting || parsedWeight <= 0}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            {isSubmitting ? (
              <span>Recording Disposal...</span>
            ) : (
              <>
                <span>Confirm Drop-Off & Earn +{pointsToEarn} pts</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
