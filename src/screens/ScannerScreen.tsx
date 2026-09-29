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
  Grid,
  Eye,
  Maximize2,
  Crosshair,
  AlertCircle,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { WasteScanResult } from '../types';

export const ScannerScreen: React.FC = () => {
  const { setDraftDetails, setCurrentRoute } = useEco();

  // Camera and Stream State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [showGrid, setShowGrid] = useState(true);
  const [streamResolution, setStreamResolution] = useState<{ width: number; height: number } | null>(null);
  const [shutterFlash, setShutterFlash] = useState(false);

  // Capture and Scan State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedTimestamp, setCapturedTimestamp] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<WasteScanResult | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isEnlargedPreviewOpen, setIsEnlargedPreviewOpen] = useState(false);

  // Audio / Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Camera Feed
  const startCamera = async (mode = facingMode) => {
    try {
      setCameraError(null);
      stopCamera();

      // Attempt to access user media with environment preference
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
          },
        });
      } catch {
        // Fallback to basic video constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack?.getSettings?.();
        if (settings && settings.width && settings.height) {
          setStreamResolution({ width: settings.width, height: settings.height });
        } else if (videoRef.current.videoWidth) {
          setStreamResolution({
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          });
        }
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        'Camera access unavailable or permission not yet granted. You can launch camera manually, upload a photo, or drag and drop an image.'
      );
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
      }, composed of ${result.materialType}. How to recycle: ${result.howItCanBeRecycled}`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Automatically attempt camera launch on initial load
    startCamera();

    return () => {
      stopCamera();
      stopSpeaking();
    };
  }, []);

  // Take high resolution snapshot from video
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw exact frame
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      // Trigger shutter flash visual feedback
      setShutterFlash(true);
      setTimeout(() => setShutterFlash(false), 220);

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCapturedImage(dataUrl);
      setCapturedTimestamp(timestamp);
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
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCapturedImage(dataUrl);
      setCapturedTimestamp(timestamp);
      stopCamera();
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
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setCapturedImage(dataUrl);
        setCapturedTimestamp(timestamp);
        stopCamera();
        classifyItem({ imageBase64: dataUrl, hint: file.name.replace(/\.[^/.]+$/, '') });
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform Gemini AI Material Classification
  const classifyItem = async (params: { imageBase64?: string; hint?: string }) => {
    setIsScanning(true);
    setScanResult(null);
    setModelUsed(null);
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
        if (data.modelUsed) {
          setModelUsed(data.modelUsed);
        }
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

  const handleProceedToDisposal = () => {
    if (!scanResult) return;
    const targetSub = scanResult.isBiodegradable
      ? 'Wet Organic Compost'
      : scanResult.materialType?.includes('Cardboard')
      ? 'Corrugated Cardboard'
      : 'PET Plastic (#1)';
    setDraftDetails(scanResult.category, targetSub, scanResult.estimatedWeightKg.toString());
    setCurrentRoute('disposal');
  };

  const resetScanner = () => {
    stopSpeaking();
    setScanResult(null);
    setCapturedImage(null);
    setCapturedTimestamp(null);
    setCameraError(null);
    setSearchQuery('');
    startCamera();
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* HEADER */}
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
          Point your camera at any waste item or upload a picture. The AI scans and shows what it captures, classifies <strong>material composition</strong>, determines <strong>biodegradability</strong>, and provides <strong>exact recycling instructions</strong>.
        </p>
      </div>

      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} className="hidden" />

      {/* VIEWFINDER & CAPTURE DISPLAY */}
      <div className="space-y-2">
        {/* Viewfinder Status Subheader */}
        <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            {isCameraActive ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Camera Feed Active
              </span>
            ) : capturedImage ? (
              <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                <Eye size={12} />
                Showing Captured Frame {capturedTimestamp ? `(${capturedTimestamp})` : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Radio size={12} />
                Camera Inactive
              </span>
            )}
          </div>

          {isCameraActive && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold transition-colors ${
                  showGrid ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title="Toggle framing grid"
              >
                <Grid size={11} />
                <span>Grid</span>
              </button>
              {streamResolution && (
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  {streamResolution.width}×{streamResolution.height}
                </span>
              )}
            </div>
          )}
        </div>

        {/* MAIN CAMERA / CAPTURE CONTAINER */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className={`relative rounded-3xl overflow-hidden bg-slate-950 aspect-4/3 flex items-center justify-center border shadow-xl transition-all select-none ${
            isDraggingOver ? 'border-emerald-400 ring-4 ring-emerald-500/20' : 'border-slate-800'
          }`}
        >
          {/* Shutter Flash Animation */}
          {shutterFlash && (
            <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-200" />
          )}

          {isCameraActive ? (
            <>
              {/* Live Video Stream */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
              />

              {/* Rule of Thirds Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 opacity-30">
                  <div className="border-r border-b border-white/40" />
                  <div className="border-r border-b border-white/40" />
                  <div className="border-b border-white/40" />
                  <div className="border-r border-b border-white/40" />
                  <div className="border-r border-b border-white/40" />
                  <div className="border-b border-white/40" />
                  <div className="border-r border-white/40" />
                  <div className="border-r border-white/40" />
                  <div />
                </div>
              )}

              {/* TARGETING RETICLE & LIVE CAPTURE SCOPE */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                  {/* Outer Targeting Corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-emerald-400 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-emerald-400 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-emerald-400 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-emerald-400 rounded-br-xl" />

                  {/* Pulsing Crosshair Center */}
                  <div className="text-emerald-400/60 animate-pulse">
                    <Crosshair size={32} />
                  </div>

                  {/* Laser Scan Beam */}
                  <div className="absolute left-4 right-4 h-0.5 bg-linear-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_14px_#34d399] animate-[bounce_2.5s_infinite]" />

                  {/* Viewfinder Target Label */}
                  <div className="absolute bottom-3 text-center bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/40">
                    <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Capturing Item in Target Scope
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Controls Bar */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
                <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>LIVE CAPTURE MONITOR</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFacingMode}
                    className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 text-xs flex items-center justify-center transition-all shadow-md active:scale-90"
                    title={`Switch Camera (Currently: ${facingMode === 'environment' ? 'Rear' : 'Front'})`}
                  >
                    <SwitchCamera size={16} />
                  </button>
                </div>
              </div>

              {/* Shutter Button & Capture Bar */}
              <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center justify-center gap-2 z-20">
                <button
                  id="scanner_shutter_button"
                  onClick={takeSnapshot}
                  className="w-18 h-18 rounded-full bg-white text-emerald-700 flex items-center justify-center p-1.5 shadow-2xl hover:scale-105 active:scale-95 transition-all ring-4 ring-emerald-500/30 group"
                  title="Capture & Scan Target"
                >
                  <div className="w-full h-full rounded-full border-2 border-emerald-600 flex items-center justify-center bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                    <Camera size={26} className="text-emerald-700" />
                  </div>
                </button>
                <span className="text-[11px] font-bold text-white bg-black/60 px-3 py-0.5 rounded-full backdrop-blur-xs border border-white/10 shadow-xs">
                  Tap to Capture What's in Frame
                </span>
              </div>
            </>
          ) : capturedImage ? (
            /* WHAT WAS CAPTURED DISPLAY */
            <div className="relative w-full h-full">
              <img
                src={capturedImage}
                alt="Captured Waste Item"
                className="w-full h-full object-cover"
              />

              {/* Framing Reticle on Captured Image */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 border border-emerald-400/40 rounded-2xl relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                </div>
              </div>

              {/* Captured Frame Tag */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-white border border-emerald-500/30 text-[11px] font-bold flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Captured Frame</span>
                  {capturedTimestamp && <span className="text-emerald-300 font-mono">@{capturedTimestamp}</span>}
                </div>
              </div>

              {/* Top Right Quick Actions on Captured Image */}
              <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                <button
                  onClick={() => setIsEnlargedPreviewOpen(true)}
                  className="p-2 rounded-xl bg-black/75 hover:bg-black/90 backdrop-blur-md text-white border border-white/20 text-xs transition-all shadow-md"
                  title="Enlarge captured frame"
                >
                  <Maximize2 size={15} />
                </button>
                <button
                  onClick={resetScanner}
                  className="px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 backdrop-blur-md text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                  title="Retake photo with camera"
                >
                  <RefreshCw size={13} />
                  <span>Retake</span>
                </button>
              </div>

              {/* Scanning Active Overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center z-30 animate-in fade-in duration-150">
                  <div className="relative mb-4">
                    <div className="w-14 h-14 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin" />
                    <Sparkles size={20} className="text-emerald-400 absolute inset-0 m-auto" />
                  </div>
                  <h3 className="text-base font-bold font-heading">Analyzing Captured Frame...</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs">
                    Gemini Vision is inspecting pixel structures, material compositions, and recycling routes.
                  </p>
                  <div className="mt-3 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
                    Detecting: Polymers • Biomass • Metals • Recyclability
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* CAMERA INACTIVE / LAUNCH PROMPT */
            <div className="p-6 text-center text-white space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
                <Camera size={32} />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading">AI Camera Scanner Ready</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                  Launch the live camera to capture any item or drag and drop a photo to analyze.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  id="scanner_start_camera_btn"
                  onClick={() => startCamera()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <Camera size={16} />
                  <span>Launch Live Camera</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
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
                <div className="text-[11px] text-amber-200 bg-amber-950/60 p-3 rounded-xl border border-amber-800/60 max-w-md mx-auto flex items-start gap-2 text-left">
                  <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          )}
        </div>
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
              placeholder="Or type any item name (e.g. Plastic bottle, Banana peel, Battery, Cardboard)..."
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

      {/* SCAN RESULTS DISPLAY */}
      {scanResult && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
          {/* 0. WHAT WAS CAPTURED CARD: Transparent Visual Confirmation */}
          {capturedImage && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              <div
                onClick={() => setIsEnlargedPreviewOpen(true)}
                className="relative w-28 h-24 sm:w-32 sm:h-24 rounded-xl overflow-hidden border border-emerald-500/40 shrink-0 cursor-pointer group shadow-md"
                title="Click to enlarge captured photo"
              >
                <img
                  src={capturedImage}
                  alt="Captured waste frame"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                  <Maximize2 size={16} className="text-white drop-shadow-md" />
                </div>
                <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 px-1.5 py-0.5 rounded-sm font-mono text-emerald-300">
                  CAPTURED
                </span>
              </div>

              <div className="flex-1 w-full space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Item Captured By Scanner
                  </span>
                  {capturedTimestamp && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Timestamp: {capturedTimestamp}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-black text-white font-heading">
                  {scanResult.itemName}
                </h3>
                <p className="text-xs text-slate-300 leading-snug">
                  Identified as <strong>{scanResult.materialType}</strong>. The scanner successfully captured and classified this item with Gemini Vision.
                </p>
                {modelUsed && (
                  <span className="inline-block mt-1 text-[10px] text-emerald-300/80 font-mono">
                    Model: {modelUsed}
                  </span>
                )}
              </div>
            </div>
          )}

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

      {/* ENLARGED CAPTURE PREVIEW MODAL */}
      {isEnlargedPreviewOpen && capturedImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-emerald-400" />
                <span className="text-xs font-bold font-heading">
                  High-Resolution Captured Frame Inspection
                </span>
                {capturedTimestamp && (
                  <span className="text-[10px] text-slate-400 font-mono">({capturedTimestamp})</span>
                )}
              </div>
              <button
                onClick={() => setIsEnlargedPreviewOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3 bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={capturedImage}
                alt="Enlarged captured frame"
                className="max-h-[65vh] object-contain rounded-xl"
              />
            </div>
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span>This image was captured and analyzed by the EcoCollect Gemini AI vision model.</span>
              <button
                onClick={() => setIsEnlargedPreviewOpen(false)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
