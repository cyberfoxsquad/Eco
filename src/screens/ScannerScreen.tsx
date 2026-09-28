import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Search,
  ArrowRight,
  ShieldAlert,
  Leaf,
  Clock,
  Recycle,
  Lightbulb,
  Check,
  X,
  SwitchCamera,
  Layers,
  Volume2,
  VolumeX,
  Radio,
  FileText,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { WasteScanResult } from '../types';

export const ScannerScreen: React.FC = () => {
  const { setDraftDetails, setCurrentRoute } = useEco();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<WasteScanResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Audio / Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async (mode = facingMode) => {
    try {
      setCameraError(null);
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access unavailable or permission declined. You can upload an image or type any item below.');
      setIsCameraActive(false);
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakResult = (result: WasteScanResult) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const speechText =
      result.spokenSummary ||
      `This item is a ${result.itemName}. It is ${
        result.isBiodegradable ? 'biodegradable' : 'non-biodegradable'
      }, made of ${result.materialType}. How to recycle: ${result.howItCanBeRecycled}`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      stopSpeaking();
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
      classifyItem({ imageBase64: dataUrl });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      classifyItem({ imageBase64: dataUrl, hint: file.name.replace(/\.[^/.]+$/, '') });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setCapturedImage(dataUrl);
        classifyItem({ imageBase64: dataUrl, hint: file.name.replace(/\.[^/.]+$/, '') });
      };
      reader.readAsDataURL(file);
    }
  };

  const classifyItem = async (params: { imageBase64?: string; hint?: string }) => {
    setIsScanning(true);
    setScanResult(null);
    stopSpeaking();

    try {
      const res = await fetch('/api/classify-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: params.imageBase64,
          sampleLabel: params.hint,
        }),
      });

      const data = await res.json();
      if (data && data.result) {
        setScanResult(data.result);
        if (autoSpeak) {
          speakResult(data.result);
        }
      }
    } catch (err) {
      console.error('Classification request failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    stopCamera();
    classifyItem({ hint: searchQuery.trim() });
  };

  const runPresetClassification = (label: string, sampleImage: string) => {
    stopCamera();
    setCapturedImage(sampleImage);
    classifyItem({ imageBase64: sampleImage, hint: label });
  };

  const handleProceedToDisposal = () => {
    if (!scanResult) return;
    const targetSub = scanResult.isBiodegradable
      ? 'Wet Organic Compost'
      : (scanResult.materialType?.includes('Cardboard') ? 'Corrugated Cardboard' : 'PET Plastic (#1)');
    setDraftDetails(
      scanResult.category,
      targetSub,
      scanResult.estimatedWeightKg.toString()
    );
    setCurrentRoute('disposal');
  };

  const resetScanner = () => {
    stopSpeaking();
    setScanResult(null);
    setCapturedImage(null);
    setCameraError(null);
    setSearchQuery('');
    startCamera();
  };

  const PRESETS = [
    {
      label: 'Banana Peel / Fruit Scraps',
      type: 'Organic Wet Waste',
      icon: '🍌',
      material: 'Plant Cellulose & Pectin',
      badge: 'Biodegradable',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: 'Plastic Water Bottle',
      type: 'Rigid Beverage Container',
      icon: '🧴',
      material: 'PET #1 Thermoplastic',
      badge: 'Non-Biodegradable',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: 'Lithium Battery Cell',
      type: 'Hazardous Consumer E-Waste',
      icon: '🔋',
      material: 'Lithium Cobalt Oxide & Steel',
      badge: 'Hazardous E-Waste',
      image: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: 'Corrugated Shipping Box',
      type: 'Packaging Paperboard',
      icon: '📦',
      material: 'Kraft Corrugated Pulp',
      badge: 'Dry Recyclable',
      image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: 'Aluminum Soda Can',
      type: 'Metal Beverage Can',
      icon: '🥫',
      material: 'Aluminum Alloy 3104',
      badge: 'Infinitely Recyclable',
      image: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: 'Styrofoam Takeout Box',
      type: 'Cellular Foam Packaging',
      icon: '🥡',
      material: 'Expanded Polystyrene EPS',
      badge: 'Non-Biodegradable Foam',
      image: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
              <Sparkles size={16} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              AI Waste & Recycling Scanner
            </span>
          </div>

          {/* Voice Auto-Speak Toggle */}
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
              autoSpeak
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title="Toggle automatic voice speech when items are identified"
          >
            {autoSpeak ? <Volume2 size={13} className="text-emerald-600" /> : <VolumeX size={13} />}
            <span>{autoSpeak ? 'Voice Feedback: ON' : 'Voice Feedback: OFF'}</span>
          </button>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 font-heading mt-1">
          Smart Waste Material Scanner
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Identifies the <strong>type of item</strong>, whether it is <strong>biodegradable or non-biodegradable</strong>, its exact <strong>physical material composition</strong>, and <strong>how it can be recycled</strong>.
        </p>
      </div>

      {/* Hidden canvas for snapshotting */}
      <canvas ref={canvasRef} className="hidden" />

      {/* CAMERA / IMAGE VIEWFINDER */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-3xl overflow-hidden bg-slate-950 aspect-4/3 flex items-center justify-center border shadow-xl transition-all ${
          isDraggingOver ? 'border-emerald-400 ring-4 ring-emerald-500/20' : 'border-slate-800'
        }`}
      >
        {isCameraActive ? (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Target Reticle & Scan Laser Animation */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-56 h-56 border-2 border-dashed border-emerald-400/80 rounded-2xl flex items-center justify-center overflow-hidden">
                {/* Horizontal laser scan beam */}
                <div className="absolute left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_2s_infinite]" />
                <div className="text-center bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  <p className="text-[11px] text-emerald-300 font-semibold">Center waste material here</p>
                </div>
              </div>
            </div>

            {/* Camera Controls Bar */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button
                onClick={toggleFacingMode}
                className="p-2.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md text-white border border-white/20 text-xs flex items-center justify-center transition-all"
                title="Switch Camera"
              >
                <SwitchCamera size={16} />
              </button>
            </div>

            {/* Shutter Button */}
            <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-4 z-20">
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
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-12 h-12 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin mb-4" />
                <h3 className="text-base font-bold font-heading">Analyzing Material with AI...</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xs">
                  Classifying item type, biodegradability rate, molecular material, and recycling pathway
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
              <h3 className="text-base font-bold font-heading">Scan Any Waste or Material</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Snap with your camera, upload a photo, or choose an instant sample item below to analyze.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                id="scanner_start_camera_btn"
                onClick={() => startCamera()}
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

      {/* QUICK MATERIAL SEARCH LOOKUP */}
      <form onSubmit={handleTextSearch} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Or type any item: e.g. Banana peel, PET water bottle, Pizza box, AA battery..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={!searchQuery.trim() || isScanning}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Sparkles size={14} className="text-emerald-400" />
            <span>Analyze</span>
          </button>
        </div>
      </form>

      {/* QUICK PRESET SAMPLES */}
      {!scanResult && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">1-Click Material Test Samples:</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Click to scan instantly</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                id={`preset_btn_${p.label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                onClick={() => runPresetClassification(p.label, p.image)}
                className="flex flex-col p-3 rounded-2xl border border-slate-100 bg-slate-50/80 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">{p.icon}</span>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      p.badge === 'Biodegradable'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.badge.includes('Hazardous')
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                  {p.label}
                </span>
                <span className="text-[10px] text-slate-500 truncate mt-0.5">
                  {p.material}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SCAN RESULTS DISPLAY */}
      {scanResult && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
          {/* AUDIO SPOKEN VERDICT PLAYER */}
          <div className="bg-linear-to-r from-emerald-900 to-slate-900 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isSpeaking
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : 'bg-white/10 text-emerald-400'
                }`}
              >
                {isSpeaking ? <Radio size={20} /> : <Volume2 size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                    Voice Verdict & Announcement
                  </span>
                  {isSpeaking && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Speaking...
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-200 font-medium line-clamp-2 mt-0.5">
                  "{scanResult.spokenSummary ||
                    `This item is a ${scanResult.itemName}. It is ${
                      scanResult.isBiodegradable ? 'biodegradable' : 'non-biodegradable'
                    }, composed of ${scanResult.materialType}. How to recycle: ${scanResult.howItCanBeRecycled}`}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {isSpeaking ? (
                <button
                  onClick={stopSpeaking}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <VolumeX size={14} />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={() => speakResult(scanResult)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Volume2 size={14} />
                  <span>Listen Voice</span>
                </button>
              )}
            </div>
          </div>

          {/* 1. ITEM TYPE & IDENTITY */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Type of Item
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2.5 py-0.5 bg-slate-900 text-white text-xs font-bold rounded-lg">
                  {scanResult.itemType || (scanResult.isBiodegradable ? 'Organic Biomass' : 'Dry Recyclable Item')}
                </span>
                <span className="text-sm font-black text-slate-800">
                  {scanResult.itemName}
                </span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Confidence
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700">
                <CheckCircle2 size={13} className="text-emerald-600" />
                {Math.round(scanResult.confidenceScore * 100)}% Match
              </span>
            </div>
          </div>

          {/* 2. BIODEGRADABLE OR NON-BIODEGRADABLE STATUS */}
          <div
            className={`p-5 rounded-3xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              scanResult.isBiodegradable
                ? 'bg-emerald-50/90 border-emerald-500/40 text-emerald-950'
                : 'bg-rose-50/90 border-rose-500/40 text-rose-950'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  scanResult.isBiodegradable
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {scanResult.isBiodegradable ? <Leaf size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                      scanResult.isBiodegradable
                        ? 'bg-emerald-200 text-emerald-900 ring-1 ring-emerald-400'
                        : 'bg-rose-200 text-rose-900 ring-1 ring-rose-400'
                    }`}
                  >
                    {scanResult.isBiodegradable ? 'BIODEGRADABLE' : 'NON-BIODEGRADABLE'}
                  </span>
                </div>
                <h2 className="text-lg font-black font-heading mt-1">
                  {scanResult.isBiodegradable
                    ? 'Decomposes Naturally in Soil & Compost'
                    : 'Resists Natural Microbial Decomposition'}
                </h2>
                <div className="flex items-center gap-1.5 text-xs font-semibold mt-0.5 opacity-90">
                  <Clock size={13} />
                  <span>Decomposition Timeline: {scanResult.decompositionTime}</span>
                </div>
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">
                Municipal Bin Stream
              </span>
              <span
                className="inline-block mt-0.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-white shadow-xs"
                style={{ backgroundColor: scanResult.binColorHex }}
              >
                {scanResult.binColorName.split(' ')[0]} Bin
              </span>
            </div>
          </div>

          {/* 3. MATERIAL IDENTIFICATION */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Material Composition
                </span>
                <h3 className="text-base font-black text-slate-900 font-heading mt-0.5 flex items-center gap-1.5">
                  <Layers size={16} className="text-emerald-600" />
                  <span>{scanResult.materialType}</span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-medium block">Recyclability</span>
                <span className="text-xs font-black text-emerald-700 block">
                  {scanResult.recyclabilityPercentage ?? 100}% Recoverable
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong className="text-slate-900">Why it is {scanResult.isBiodegradable ? 'Biodegradable' : 'Non-Biodegradable'}: </strong>
                {scanResult.biodegradableExplanation}
              </p>
            </div>
          </div>

          {/* 4. HOW IT CAN BE RECYCLED */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Recycle size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-900 font-heading">
                How It Can Be Recycled (Recycling Process & Circular Journey)
              </h3>
            </div>

            {/* In-depth Recycling Process Explanation */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 leading-relaxed space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-blue-900">
                <Sparkles size={14} className="text-blue-600" />
                <span>Recycling Transformation:</span>
              </div>
              <p className="text-slate-800">
                {scanResult.howItCanBeRecycled}
              </p>
            </div>

            {/* Directive Banner */}
            <div
              className="p-3.5 rounded-2xl border text-xs font-semibold leading-relaxed"
              style={{
                backgroundColor: `${scanResult.binColorHex}12`,
                borderColor: `${scanResult.binColorHex}30`,
                color: scanResult.binColorHex,
              }}
            >
              📍 <strong>Municipal Drop-off:</strong> {scanResult.disposalInstructions}
            </div>

            {/* Step-by-Step Disposal Guide */}
            {scanResult.disposalSteps && scanResult.disposalSteps.length > 0 && (
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                  Step-by-Step Recycling Procedure:
                </span>
                <div className="space-y-2">
                  {scanResult.disposalSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dos & Don'ts Checklist */}
            {(scanResult.disposalDos || scanResult.disposalDonts) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scanResult.disposalDos && scanResult.disposalDos.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                      <Check size={13} className="text-emerald-700 font-bold" />
                      <span>Best Practice DOs:</span>
                    </span>
                    <ul className="space-y-1">
                      {scanResult.disposalDos.map((d, i) => (
                        <li key={i} className="text-[11px] text-emerald-900 flex items-start gap-1.5 leading-snug">
                          <span className="text-emerald-600 shrink-0">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {scanResult.disposalDonts && scanResult.disposalDonts.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-rose-950 flex items-center gap-1">
                      <X size={13} className="text-rose-700 font-bold" />
                      <span>Mistakes to DON'T:</span>
                    </span>
                    <ul className="space-y-1">
                      {scanResult.disposalDonts.map((d, i) => (
                        <li key={i} className="text-[11px] text-rose-900 flex items-start gap-1.5 leading-snug">
                          <span className="text-rose-600 shrink-0">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Preparation Advice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs flex items-start gap-2.5">
              <Lightbulb size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-950 block mb-0.5">Quick Preparation Tip:</strong>
                <p className="text-amber-900 leading-relaxed">
                  {scanResult.preparationTip}
                </p>
              </div>
            </div>
          </div>

          {/* 5. REWARD & IMPACT METRICS */}
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
              <span className="text-[10px] text-teal-800 font-medium block">CO₂ Prevented</span>
              <span className="text-base font-bold text-teal-700 mt-0.5 block">
                {scanResult.co2SavedKg} kg
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              id="proceed_to_disposal_btn"
              onClick={handleProceedToDisposal}
              className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Proceed to Smart Bin Drop-Off</span>
              <ArrowRight size={15} />
            </button>

            <button
              id="scan_another_item_btn"
              onClick={resetScanner}
              className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
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
