import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RefreshCw, Shield, AlertTriangle, CheckCircle, Scan, Target, Volume2, VolumeX, Eye, Lock } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { BlockchainService } from '../services/blockchainService';
import { PPEScanResult, AgentStatus, AuditRecord, TrackedObject, Zone } from '../types';

interface LiveScannerProps {
  onNewRecord: (record: AuditRecord) => void;
  onInteraction: (action: string, detail: string) => void;
}

// Define a danger zone (e.g., restricted machinery area)
const DANGER_ZONE: Zone = {
  id: 'z-alpha',
  name: 'RESTRICTED_ACCESS_ALPHA',
  type: 'RESTRICTED',
  bounds: { x: 0.2, y: 0.2, w: 0.6, h: 0.6 } // Centered 60% of screen
};

export const LiveScanner: React.FC<LiveScannerProps> = ({ onNewRecord, onInteraction }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [lastResult, setLastResult] = useState<PPEScanResult | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [trackedObjects, setTrackedObjects] = useState<TrackedObject[]>([]);

  useEffect(() => {
    onInteraction('Navigated', 'Entered Vision Agent Interface');
  }, []);

  // Camera Init
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
          onInteraction('System', 'Camera feed initialized successfully');
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        onInteraction('Error', 'Failed to access camera feed');
      }
    };
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Tracking Simulation (Simple IOU/Distance logic)
  useEffect(() => {
    if (!lastResult) return;

    // Simulate "DeepSORT" by mapping new boxes to existing IDs based on distance
    const newTracks: TrackedObject[] = lastResult.bounding_boxes.map(box => {
      const simulatedId = Math.floor(Math.random() * 9000) + 1000;
      return {
        ...box,
        trackingId: simulatedId,
        lastSeen: Date.now()
      };
    });
    setTrackedObjects(newTracks);

  }, [lastResult]);

  // HUD Renderer
  useEffect(() => {
    if (!overlayRef.current || !videoRef.current) return;

    const canvas = overlayRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Zones
    const zx = DANGER_ZONE.bounds.x * width;
    const zy = DANGER_ZONE.bounds.y * height;
    const zw = DANGER_ZONE.bounds.w * width;
    const zh = DANGER_ZONE.bounds.h * height;

    // Zone Fill (Hatched pattern)
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 23, 68, 0.4)'; // Infrared Red
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(zx, zy, zw, zh);
    
    // Zone Label
    ctx.fillStyle = 'rgba(255, 23, 68, 0.1)';
    ctx.fillRect(zx, zy, zw, zh);
    ctx.fillStyle = '#FF1744';
    ctx.font = "10px 'JetBrains Mono'";
    ctx.fillText(`${DANGER_ZONE.name} [MONITORED]`, zx + 5, zy + 15);
    ctx.restore();

    // 2. Draw Tracked Objects
    trackedObjects.forEach(track => {
      const x = track.xmin * width;
      const y = track.ymin * height;
      const w = (track.xmax - track.xmin) * width;
      const h = (track.ymax - track.ymin) * height;

      // Determine color
      const isPerson = track.label.toLowerCase().includes('person');
      const isSafeGear = ['hard_hat', 'safety_vest', 'helmet', 'vest'].some(s => track.label.toLowerCase().includes(s));
      
      let color = '#00E5FF'; // Default Cyan
      if (isPerson) color = '#FFFFFF';
      if (isSafeGear) color = '#00FF9C'; // Green
      
      // Check Zone Violation for People
      if (isPerson) {
        // Simple intersection check
        const inZone = (x < zx + zw && x + w > zx && y < zy + zh && y + h > zy);
        if (inZone && !lastResult?.compliant) {
          color = '#FF1744'; // Red (Violation)
        }
      }

      // Draw Box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Draw Tracking ID Tag
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 16, 60, 16);
      ctx.fillStyle = '#000';
      ctx.font = "bold 10px 'JetBrains Mono'";
      ctx.fillText(`ID:${track.trackingId}`, x + 4, y - 4);

      // Label below
      ctx.fillStyle = color;
      ctx.fillText(track.label.toUpperCase(), x, y + h + 12);
    });

  }, [trackedObjects, lastResult]);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setStatus(AgentStatus.ANALYZING);
    onInteraction('Process Triggered', 'Initiated Manual PPE Compliance Scan');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    try {
      const result = await GeminiService.analyzeFrame(base64Image);
      setLastResult(result);
      
      onInteraction('Result', result.compliant ? 'Scan Passed: Compliance Verified' : 'Scan Failed: Violation Detected');

      // Audio Alert Logic
      if (audioEnabled) {
        if (!result.compliant) {
          await GeminiService.speakText(`Alert. Violation detected in sector Alpha. ${result.recommendation.split('.')[0]}.`);
          onInteraction('System', 'Triggered Audio Alert for Violation');
        }
      }

      setStatus(AgentStatus.ATTESTING);
      const record = await BlockchainService.attestScan(result, base64Image);
      onNewRecord(record);
      
      setStatus(AgentStatus.IDLE);
    } catch (error) {
      console.error("Scan pipeline failed:", error);
      setStatus(AgentStatus.ERROR);
      onInteraction('Error', 'Scan Pipeline Failed');
    }
  }, [onNewRecord, audioEnabled, onInteraction]);

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    onInteraction('Settings', `Audio Alerts turned ${newState ? 'ON' : 'OFF'}`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full font-mono">
      {/* HUD / Camera Feed Section */}
      <div className="xl:col-span-2 bg-ogu-950 rounded-lg overflow-hidden border border-ogu-800 relative flex flex-col group shadow-2xl shadow-ogu-cyan/5">
        
        {/* Cinematic Header Overlay */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/90 to-transparent z-20 flex justify-between items-start p-4 pointer-events-none">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-ogu-cyan animate-pulse rounded-full box-shadow-[0_0_10px_#00E5FF]"></div>
             <div className="flex flex-col">
                <span className="text-ogu-cyan text-xs tracking-[0.2em] font-bold">CAM_FEED_04</span>
                <span className="text-[10px] text-slate-500">ISO 45001 COMPLIANCE MODE</span>
             </div>
           </div>
           <div className="flex flex-col items-end gap-1">
             <span className="text-ogu-red text-[10px] font-bold bg-ogu-red/10 px-2 py-0.5 border border-ogu-red/20">REC ●</span>
             <span className="text-slate-500 text-[9px]">{new Date().toLocaleTimeString()}</span>
           </div>
        </div>

        {/* Video Area */}
        <div className="relative flex-grow bg-black flex items-center justify-center overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover opacity-80 ${!isStreaming ? 'hidden' : ''}`} 
          />
          <canvas ref={canvasRef} className="hidden" />
          <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

          {/* Static HUD Elements */}
          <div className="absolute inset-0 pointer-events-none hud-grid opacity-30"></div>
          
          {/* Corner Brackets */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-ogu-cyan/30"></div>
          <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-ogu-cyan/30"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-ogu-cyan/30"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-ogu-cyan/30"></div>

          {status === AgentStatus.ANALYZING && (
            <div className="absolute inset-0 bg-ogu-cyan/5 animate-pulse z-0"></div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="p-4 bg-ogu-900 border-t border-ogu-800 flex justify-between items-center z-20">
          <div className="flex items-center gap-4">
             <button onClick={toggleAudio} className={`p-2 rounded border ${audioEnabled ? 'border-ogu-cyan text-ogu-cyan bg-ogu-cyan/10' : 'border-ogu-red text-ogu-red bg-ogu-red/10'}`}>
               {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
             </button>
             <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Neural Status</span>
                <span className={`text-xs font-bold ${status === AgentStatus.ANALYZING ? 'text-ogu-pink' : 'text-ogu-green'}`}>
                  {status === AgentStatus.IDLE ? 'STANDBY' : 'INFERENCE_RUNNING'}
                </span>
             </div>
          </div>
          <button
            onClick={captureAndAnalyze}
            disabled={status !== AgentStatus.IDLE || !isStreaming}
            className="group relative px-6 py-2 bg-ogu-cyan/10 hover:bg-ogu-cyan/20 border border-ogu-cyan/50 text-ogu-cyan font-bold text-xs tracking-widest uppercase transition-all flex items-center gap-3"
          >
            {status === AgentStatus.ANALYZING ? <RefreshCw className="animate-spin" size={16} /> : <Target size={16} />}
            <span>{status === AgentStatus.IDLE ? "Initiate Scan" : "Processing"}</span>
          </button>
        </div>
      </div>

      {/* Analysis Side Panel (Glassmorphism) */}
      <div className="glass-panel rounded-lg p-6 flex flex-col h-full relative overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
          <Shield className="text-ogu-cyan" size={18} />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Protocol Check</h2>
        </div>

        {!lastResult ? (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-600 space-y-4">
            <div className="w-20 h-20 rounded-full border border-dashed border-slate-700 flex items-center justify-center animate-spin-slow">
              <Scan size={32} className="opacity-50" />
            </div>
            <p className="text-xs tracking-widest opacity-50">AWAITING TELEMETRY</p>
          </div>
        ) : (
          <div className="animate-fadeIn space-y-6 overflow-y-auto">
            
            {/* Compliance Status Card */}
            <div className={`relative p-6 border-l-4 ${lastResult.compliant ? 'border-l-ogu-green bg-ogu-green/5' : 'border-l-ogu-red bg-ogu-red/5'}`}>
               <span className={`text-[10px] uppercase tracking-widest font-bold ${lastResult.compliant ? 'text-ogu-green' : 'text-ogu-red'}`}>
                  Result
               </span>
               <h3 className="text-2xl font-black text-white mt-1">
                 {lastResult.compliant ? "AUTHORIZED" : "VIOLATION"}
               </h3>
               <div className="mt-2 text-xs text-slate-400">
                  Risk Level: <span className="text-white">{lastResult.risk_assessment}</span>
               </div>
            </div>

            {/* Zone Activity */}
            <div>
              <h4 className="text-[10px] text-slate-500 font-bold uppercase mb-2">Zone Activity</h4>
              <div className="bg-black/40 p-3 rounded border border-white/5">
                <div className="flex justify-between items-center text-xs text-slate-300">
                   <span>{DANGER_ZONE.name}</span>
                   <span className="text-ogu-red animate-pulse">MONITORED</span>
                </div>
              </div>
            </div>

            {/* Detected Assets List */}
            <div>
               <h4 className="text-[10px] text-slate-500 font-bold uppercase mb-2">Identified Objects</h4>
               <div className="flex flex-col gap-2">
                  {lastResult.bounding_boxes.map((box, idx) => {
                     const isSafe = ['hard_hat','safety_vest'].some(s => box.label.toLowerCase().includes(s));
                     return (
                      <div key={idx} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded border border-white/5 text-xs">
                        <span className="text-slate-300">{box.label.toUpperCase()}</span>
                        <div className={`w-2 h-2 rounded-full ${isSafe ? 'bg-ogu-green' : 'bg-ogu-amber'}`}></div>
                      </div>
                     );
                  })}
               </div>
            </div>

            {/* Recommendation */}
            <div className="bg-ogu-purple/10 p-4 border border-ogu-purple/30 rounded">
               <h4 className="text-[10px] text-ogu-purple font-bold uppercase mb-2">Agent Directive</h4>
               <p className="text-xs text-slate-300 leading-relaxed">
                 {lastResult.recommendation}
               </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};