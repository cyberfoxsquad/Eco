import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { WasteScanResult } from '../types';

export const ScannerScreen: React.FC = () => {
  const { setDraftDetails, setCurrentRoute } = useEco();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<WasteScanResult | null>(null);
  const [sourceType, setSourceType] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access unavailable or declined. You can upload a photo or use a preset item below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
      classifyImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      classifyImage(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  const classifyImage = async (imageBase64?: string, hint?: string) => {
    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/classify-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          sampleLabel: hint,
        }),
      });

      const data = await res.json();
      if (data && data.result) {
        setScanResult(data.result);
        setSourceType(data.source || 'gemini');
      }
    } catch (err) {
      console.error('Classification request failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const runPresetClassification = (label: string, sampleImage: string) => {
    stopCamera();
    setCapturedImage(sampleImage);
    classifyImage(sampleImage, label);
  };

  const handleProceedToDisposal = () => {
    if (!scanResult) return;
    setDraftDetails(
      scanResult.category,
      scanResult.subCategory,
      scanResult.estimatedWeightKg.toString()
    );
    setCurrentRoute('disposal');
  };

  const resetScanner = () => {
    setScanResult(null);
    setCapturedImage(null);
    setCameraError(null);
    startCamera();
  };

  const PRESETS = [
    {
      label: 'Plastic Bottle',
      icon: '🧴',
      sub: 'PET #1',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: 'Banana Peel / Scraps',
      icon: '🍌',
      sub: 'Wet Compost',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: 'Lithium Battery',
      icon: '🔋',
      sub: 'E-Waste',
      image: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: 'Cardboard Box',
      icon: '📦',
      sub: 'OCC Paper',
      image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: 'Aluminum Soda Can',
      icon: '🥫',
      sub: 'Metal',
      image: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
            <Sparkles size={16} />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            AI Waste Identification
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading mt-1">
          Scan & Segregate Waste
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Uses Google Search Grounding to verify live municipal bin guidelines and material codes.
        </p>
      </div>

      {/* Hidden canvas for snapshotting */}
      <canvas ref={canvasRef} className="hidden" />

      {/* CAMERA / IMAGE VIEWFINDER */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-4/3 flex items-center justify-center border border-slate-800 shadow-xl">
        {isCameraActive ? (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Target Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-52 h-52 border-2 border-dashed border-emerald-400/80 rounded-2xl animate-pulse flex items-center justify-center">
                <div className="text-center bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-xl">
                  <p className="text-[11px] text-emerald-200 font-semibold">Center waste item</p>
                </div>
              </div>
            </div>

            {/* Shutter Button */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-20">
              <button
                id="scanner_shutter_button"
                onClick={takeSnapshot}
                className="w-16 h-16 rounded-full bg-white text-emerald-700 flex items-center justify-center p-1.5 shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                title="Capture & Classify"
              >
                <div className="w-full h-full rounded-full border-2 border-emerald-600 flex items-center justify-center bg-emerald-50">
                  <Camera size={24} />
                </div>
              </button>
            </div>
          </>
        ) : capturedImage ? (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured Waste"
              className="w-full h-full object-cover"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-12 h-12 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin mb-4" />
                <h3 className="text-base font-bold font-heading">Analyzing Waste Composition...</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xs">
                  Validating resin codes and searching municipal segregation database
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-white space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Camera size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading">Camera Viewfinder Ready</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Open your device camera or upload a photo of the item to get segregation guidelines.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                id="scanner_start_camera_btn"
                onClick={startCamera}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                <Camera size={16} />
                <span>Launch Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
              >
                <Upload size={16} />
                <span>Upload Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {cameraError && (
              <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/50 max-w-md mx-auto">
                {cameraError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QUICK PRESET SAMPLES */}
      {!scanResult && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Try Instant Sample Items:</span>
            <span className="text-[11px] text-slate-500">1-click test</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                id={`preset_btn_${p.sub.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                onClick={() => runPresetClassification(p.label, p.image)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left"
              >
                <span className="text-xl">{p.icon}</span>
                <div className="overflow-hidden">
                  <span className="block text-xs font-bold text-slate-900 truncate">{p.label}</span>
                  <span className="block text-[10px] text-slate-500">{p.sub}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SCAN RESULTS DISPLAY */}
      {scanResult && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-5 animate-in fade-in zoom-in-95">
          {/* Header & Confidence */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: scanResult.binColorHex || '#16A34A' }}
                />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Verified Waste Identification
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 font-heading mt-1">
                {scanResult.itemName}
              </h2>
              <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                {scanResult.subCategory}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle size={13} />
                <span>{Math.round(scanResult.confidenceScore * 100)}% Confidence</span>
              </span>
            </div>
          </div>

          {/* Designated Bin Banner */}
          <div
            className="p-4 rounded-2xl flex items-center justify-between border"
            style={{
              backgroundColor: `${scanResult.binColorHex}12`,
              borderColor: `${scanResult.binColorHex}30`,
            }}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Designated Municipal Collection
              </span>
              <h3
                className="text-base font-extrabold mt-0.5 font-heading"
                style={{ color: scanResult.binColorHex }}
              >
                {scanResult.binColorName}
              </h3>
            </div>

            <span
              className="text-xs font-extrabold px-3 py-1.5 rounded-xl text-white shadow-xs"
              style={{ backgroundColor: scanResult.binColorHex }}
            >
              {scanResult.category}
            </span>
          </div>

          {/* Reward Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 font-medium block">Est. Weight</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {scanResult.estimatedWeightKg} kg
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] text-emerald-800 font-medium block">Points Reward</span>
              <span className="text-base font-extrabold text-emerald-700 mt-0.5 block">
                +{scanResult.estimatedPoints} pts
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100">
              <span className="text-[10px] text-teal-800 font-medium block">CO₂ Saved</span>
              <span className="text-base font-bold text-teal-700 mt-0.5 block">
                {scanResult.co2SavedKg} kg
              </span>
            </div>
          </div>

          {/* Instructions and Prep Tips */}
          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="font-bold text-slate-900 block mb-1">
                📍 Municipal Disposal Instructions:
              </span>
              <p className="text-slate-600 leading-relaxed">
                {scanResult.disposalInstructions}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-xs">
              <span className="font-bold text-amber-900 block mb-1">
                💡 Preparation & Safety Advice:
              </span>
              <p className="text-amber-800 leading-relaxed">
                {scanResult.preparationTip}
              </p>
            </div>
          </div>

          {/* Google Search Grounding Citations */}
          {scanResult.searchSources && scanResult.searchSources.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-sky-900 font-bold">
                <Search size={14} className="text-sky-600" />
                <span>Google Search Grounded Standards:</span>
              </div>
              <p className="text-[11px] text-sky-800/90 leading-relaxed">
                {scanResult.reasoning}
              </p>
              <div className="space-y-1 pt-1">
                {scanResult.searchSources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-sky-100 hover:border-sky-300 text-sky-700 text-[11px] font-semibold transition-colors"
                  >
                    <span className="truncate pr-2">{source.title}</span>
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row gap-3">
            <button
              id="proceed_to_disposal_btn"
              onClick={handleProceedToDisposal}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <span>Proceed to Bin Drop-Off</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={resetScanner}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={14} />
              <span>Scan Next Item</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
