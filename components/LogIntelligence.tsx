import React, { useState, useEffect, useRef } from 'react';
import { Terminal, BrainCircuit, Activity, AlertCircle, MessageSquare, Mic, Network } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { LogAnalysisResult, LogEntry } from '../types';

interface LogIntelligenceProps {
  onInteraction: (action: string, detail: string) => void;
}

// Mock Logs
const generateMockLogs = (count: number): LogEntry[] => {
  const sources = ['Orchestrator_Node', 'PPE_Vision_Gateway', 'Chain_Attestor', 'Feedback_Ingest'];
  const messages = [
    'Handshake initialized with peer 0x8a...3f',
    'Latency spike in Vision Module [140ms]',
    'Block 14022 confirmed. Hash: 0x992...aa',
    'Model confidence degraded in Zone Alpha',
    'Storage quota warning: IPFS Pinning Service',
    'Feedback: "Tracking overlay is slightly offset"',
    'Manual override: Compliance forced by Supervisor',
    'Timeout: Agent did not sign within 500ms',
    'Feedback: "Mobile dark mode contrast is low"',
    'Re-calibration request for Sensor Array 4'
  ];
  
  return Array.from({ length: count }).map(() => ({
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    level: Math.random() > 0.8 ? 'ERROR' : (Math.random() > 0.6 ? 'WARN' : 'INFO'),
    source: sources[Math.floor(Math.random() * sources.length)],
    message: messages[Math.floor(Math.random() * messages.length)]
  }));
};

export const LogIntelligence: React.FC<LogIntelligenceProps> = ({ onInteraction }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [analysis, setAnalysis] = useState<LogAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onInteraction('Navigated', 'Entered Log Intelligence Interface');
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = generateMockLogs(1)[0];
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    onInteraction('Process Triggered', 'Running Neural Log Diagnostics');
    const logText = logs.slice(0, 20).map(l => `[${l.level}] ${l.source}: ${l.message}`).join('\n');
    const result = await GeminiService.analyzeLogs(logText);
    setAnalysis(result);
    setIsAnalyzing(false);
    onInteraction('Result', `Diagnostics complete. Sentiment: ${result.sentiment.label}. Anomalies: ${result.anomalies.length}`);
  };

  const playSummary = () => {
    if (analysis?.summary) {
      onInteraction('Action', 'Played Audio Summary');
      GeminiService.speakText(analysis.summary);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full font-mono text-sm">
      
      {/* Terminal View */}
      <div className="bg-ogu-950 rounded-lg border border-ogu-800 flex flex-col overflow-hidden relative shadow-xl">
        <div className="bg-black p-3 border-b border-ogu-800 flex justify-between items-center">
           <div className="flex items-center gap-2 text-ogu-cyan/70">
              <Terminal size={14} />
              <span className="text-[10px] uppercase tracking-widest">System_Log_Stream</span>
           </div>
           <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-ogu-red/50 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-ogu-amber/50"></div>
              <div className="w-2 h-2 rounded-full bg-ogu-green/50"></div>
           </div>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto space-y-3 font-mono text-xs bg-ogu-950" ref={scrollRef}>
           {logs.map((log) => (
             <div key={log.id} className="flex gap-3 animate-fadeIn opacity-70 hover:opacity-100 transition-opacity">
                <span className="text-slate-600 shrink-0">{log.timestamp.split('T')[1].split('.')[0]}</span>
                <span className={`shrink-0 px-1.5 py-0.5 text-[9px] font-bold border ${
                  log.level === 'ERROR' ? 'text-ogu-red border-ogu-red/30' :
                  log.level === 'WARN' ? 'text-ogu-amber border-ogu-amber/30' :
                  'text-ogu-green border-ogu-green/30'
                }`}>{log.level}</span>
                <span className="text-slate-400 break-all">
                  <span className="text-ogu-purple/70 mr-2">[{log.source}]</span>
                  {log.message}
                </span>
             </div>
           ))}
        </div>
      </div>

      {/* Neural Console */}
      <div className="glass-panel rounded-lg p-0 flex flex-col h-full relative overflow-hidden group border-ogu-purple/30">
         
         {/* Background Animation */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-ogu-purple/5 rounded-full blur-[80px] group-hover:bg-ogu-purple/10 transition-all duration-1000"></div>

         <div className="p-6 border-b border-white/5 flex justify-between items-center z-10 bg-white/5 backdrop-blur-md">
            <div>
               <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-wide">
                  <BrainCircuit className="text-ogu-purple" size={20} />
                  Neural Console
               </h2>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Pattern Recognition Node</p>
            </div>
            <button 
               onClick={runAnalysis}
               disabled={isAnalyzing}
               className="px-4 py-2 bg-ogu-purple/10 hover:bg-ogu-purple/20 text-ogu-purple border border-ogu-purple/40 text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(155,77,255,0.1)] hover:shadow-[0_0_20px_rgba(155,77,255,0.3)]"
            >
               {isAnalyzing ? "Processing..." : "Run Diagnostics"}
            </button>
         </div>

         {!analysis ? (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-500 z-10 space-y-4">
               <div className="relative">
                  <div className="absolute inset-0 bg-ogu-purple/20 blur-xl rounded-full"></div>
                  <Network size={48} className="relative z-10 text-ogu-purple opacity-50" />
               </div>
               <p className="text-xs font-mono tracking-widest">AWAITING INPUT STREAM</p>
            </div>
         ) : (
            <div className="p-6 space-y-6 z-10 animate-fadeIn overflow-y-auto custom-scrollbar">
               
               {/* Sentiment Visualizer */}
               <div className="flex items-center justify-between p-4 bg-black/30 rounded border border-white/5">
                  <div className="flex items-center gap-4">
                     <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                           <circle cx="32" cy="32" r="28" stroke="#333" strokeWidth="4" fill="transparent" />
                           <circle cx="32" cy="32" r="28" 
                             stroke={analysis.sentiment.score > 0 ? '#00FF9C' : '#FF1744'} 
                             strokeWidth="4" fill="transparent" 
                             strokeDasharray="175" 
                             strokeDashoffset={175 - (175 * ((analysis.sentiment.score + 1) / 2))} 
                             className="transition-all duration-1000 ease-out" 
                           />
                        </svg>
                        <span className="absolute text-xs font-bold text-white">{Math.round(analysis.sentiment.score * 100)}</span>
                     </div>
                     <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Sentiment</div>
                        <div className={`text-xl font-bold ${analysis.sentiment.label === 'POSITIVE' ? 'text-ogu-green' : 'text-ogu-red'}`}>
                           {analysis.sentiment.label}
                        </div>
                     </div>
                  </div>
               </div>

               {/* Executive Brief */}
               <div className="bg-ogu-900/50 p-4 border-l-2 border-ogu-purple relative group">
                  <button onClick={playSummary} className="absolute top-3 right-3 text-ogu-purple hover:text-white transition-colors opacity-50 group-hover:opacity-100">
                    <Mic size={16} />
                  </button>
                  <h3 className="text-[10px] text-ogu-purple font-bold uppercase mb-2">Executive Brief</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                     {analysis.summary}
                  </p>
               </div>

               {/* Anomalies */}
               <div>
                  <h3 className="text-[10px] text-ogu-red font-bold uppercase mb-3 flex items-center gap-2">
                     <AlertCircle size={12} /> Detected Anomalies
                  </h3>
                  <div className="grid gap-2">
                     {analysis.anomalies.map((anomaly, idx) => (
                        <div key={idx} className="text-xs bg-ogu-red/5 border border-ogu-red/20 text-slate-300 p-3 flex items-start gap-3">
                           <span className="mt-1 w-1.5 h-1.5 bg-ogu-red shadow-[0_0_8px_#FF1744] rounded-full shrink-0"></span>
                           {anomaly}
                        </div>
                     ))}
                  </div>
               </div>

            </div>
         )}
      </div>
    </div>
  );
};