import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Zap, Wrench, AlertTriangle, CheckCircle, BarChart2, Box, Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Asset, ParsedEquipmentData } from '../types';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';

interface MaintenancePredictorProps {
  onInteraction: (action: string, detail: string) => void;
  externalData?: ParsedEquipmentData[];
}

const INITIAL_ASSETS: Asset[] = [
  { id: 'A-101', name: 'Main Turbine Unit', type: 'GENERATOR', healthScore: 92, temperature: 65, vibration: 2.1, lastService: '2023-11-01', status: 'OPTIMAL' },
  { id: 'A-102', name: 'Cooling Pump Alpha', type: 'HVAC', healthScore: 45, temperature: 88, vibration: 8.5, lastService: '2023-08-15', status: 'WARNING', predictedFailureDate: '2023-10-30' },
  { id: 'A-103', name: 'Assembly Conveyor 4', type: 'CONVEYOR', healthScore: 98, temperature: 42, vibration: 0.5, lastService: '2023-10-01', status: 'OPTIMAL' },
  { id: 'A-104', name: 'Data Center Rack B', type: 'SERVER', healthScore: 76, temperature: 28, vibration: 0.1, lastService: '2023-09-20', status: 'OPTIMAL' },
];

export const MaintenancePredictor: React.FC<MaintenancePredictorProps> = ({ onInteraction, externalData }) => {
  const [assets, setAssets] = useState<Asset[]>(() => StorageService.load('assets', INITIAL_ASSETS));
  const [selectedAsset, setSelectedAsset] = useState<Asset>(assets[0]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [telemetryData, setTelemetryData] = useState<{ time: string, value: number }[]>([]);

  // Persist Assets
  useEffect(() => {
    StorageService.save('assets', assets);
  }, [assets]);

  // Ingest External Data & Auto-Update
  useEffect(() => {
    if (externalData && externalData.length > 0) {
      const uniqueIds = Array.from(new Set(externalData.map(d => d.device_id)));
      const newAssets: Asset[] = uniqueIds.map(id => {
        const latestReading = externalData.filter(d => d.device_id === id).pop();
        if (!latestReading) return null;
        
        return {
          id: latestReading.device_id,
          name: `Imported Asset ${latestReading.device_id}`,
          type: 'GENERATOR',
          healthScore: latestReading.operational_status === 'OPERATIONAL' ? 95 : 40,
          temperature: latestReading.temperature_C,
          vibration: latestReading.vibration_mm_s,
          lastService: 'Unknown',
          status: latestReading.operational_status === 'OPERATIONAL' ? 'OPTIMAL' : 'CRITICAL',
          predictedFailureDate: latestReading.operational_status === 'FAULT_IMMINENT' ? '24 Hours' : undefined
        };
      }).filter(Boolean) as Asset[];

      if (newAssets.length > 0) {
        setAssets(prev => {
          const updated = [...prev];
          newAssets.forEach(na => {
            const idx = updated.findIndex(a => a.id === na.id);
            if (idx >= 0) updated[idx] = na;
            else updated.push(na);
          });
          return updated;
        });
        onInteraction('System', `Ingested ${newAssets.length} assets from external CSV`);
      }
    }
  }, [externalData]);

  // Auto-Run Diagnostics when selecting a new asset
  useEffect(() => {
    if (externalData && externalData.length > 0 && externalData.some(d => d.device_id === selectedAsset.id)) {
      const assetHistory = externalData.filter(d => d.device_id === selectedAsset.id);
      const formattedData = assetHistory.map(d => ({
        time: d.timestamp.split('T')[1]?.substring(0,5) || d.timestamp,
        value: d.vibration_mm_s
      }));
      setTelemetryData(formattedData.slice(-20));
    } else {
      const generateData = () => {
        const data = [];
        for (let i = 0; i < 20; i++) {
          data.push({
            time: `${i}:00`,
            value: selectedAsset.vibration + (Math.random() - 0.5) * 2
          });
        }
        return data;
      };
      setTelemetryData(generateData());
    }
    
    // Automatic Trigger
    runDiagnostics(selectedAsset);
    
  }, [selectedAsset, externalData]);

  const runDiagnostics = async (asset: Asset) => {
    setIsAnalyzing(true);
    // onInteraction('Process', `Auto-Running Diagnostics for ${asset.name}`); // Reduced noise
    
    // Check cache first to avoid API spam? For now, we simulate quick return if optimal
    if (asset.status === 'OPTIMAL') {
      await new Promise(r => setTimeout(r, 500));
      setAiReport("Diagnostics passed. Asset operating within nominal parameters. No anomalies detected.");
    } else {
      const report = await GeminiService.generateMaintenanceReport(asset);
      setAiReport(report);
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full font-sans">
      
      {/* Asset List */}
      <div className="glass-panel p-4 rounded-xl flex flex-col gap-4">
        <h2 className="text-white font-bold flex items-center gap-2 mb-2">
          <Wrench size={18} className="text-ogu-purple" />
          Fleet Assets
        </h2>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {assets.map(asset => (
            <button
              key={asset.id}
              onClick={() => { setSelectedAsset(asset); onInteraction('Select', `Viewed Asset ${asset.id}`); }}
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                selectedAsset.id === asset.id 
                  ? 'bg-ogu-purple/20 border-ogu-purple text-white' 
                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-xs">{asset.name}</span>
                {asset.status === 'WARNING' || asset.status === 'CRITICAL' ? <AlertTriangle size={14} className="text-ogu-red" /> : <CheckCircle size={14} className="text-ogu-green" />}
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-mono opacity-70">{asset.type}</span>
                 <div className="flex items-center gap-1">
                    <span className="text-[10px]">Health:</span>
                    <div className="w-12 h-1.5 bg-black rounded-full overflow-hidden">
                       <div 
                         className={`h-full ${asset.healthScore < 50 ? 'bg-ogu-red' : 'bg-ogu-green'}`} 
                         style={{ width: `${asset.healthScore}%` }}
                       ></div>
                    </div>
                 </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Detail View */}
      <div className="lg:col-span-2 flex flex-col gap-6">
         
         {/* Asset Header */}
         <div className="glass-panel p-6 rounded-xl flex justify-between items-start bg-gradient-to-br from-ogu-900 to-black border-white/10">
            <div>
               <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-2xl font-bold text-white">{selectedAsset.name}</h1>
                 <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                    selectedAsset.status === 'OPTIMAL' ? 'text-ogu-green border-ogu-green/30 bg-ogu-green/10' : 
                    selectedAsset.status === 'WARNING' ? 'text-ogu-amber border-ogu-amber/30 bg-ogu-amber/10' : 'text-ogu-red border-ogu-red/30 bg-ogu-red/10'
                 }`}>{selectedAsset.status}</span>
               </div>
               <p className="text-slate-400 text-xs font-mono">ID: {selectedAsset.id} | Last Service: {selectedAsset.lastService}</p>
            </div>
            <div className="text-right">
               <span className="block text-[10px] text-slate-500 uppercase tracking-widest">RUL Prediction</span>
               <span className="text-xl font-bold text-white">{selectedAsset.predictedFailureDate ? selectedAsset.predictedFailureDate : '> 90 Days'}</span>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
             {/* Digital Twin Visualization */}
             <div className="bg-ogu-950 p-4 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                <div className="absolute top-2 left-2 text-[10px] uppercase tracking-widest text-slate-500 flex items-center gap-2">
                   <Box size={12} /> Digital Twin
                </div>
                {/* SVG Representation */}
                <svg width="150" height="150" viewBox="0 0 100 100" className={`transition-all duration-500 ${selectedAsset.status === 'CRITICAL' ? 'animate-pulse' : ''}`}>
                   {/* Base */}
                   <path d="M20 80 L80 80 L90 90 L10 90 Z" fill="#333" stroke="#555" strokeWidth="1" />
                   {/* Core */}
                   <rect x="30" y="30" width="40" height="50" fill={selectedAsset.status === 'CRITICAL' ? '#330000' : '#1a1a1a'} stroke={selectedAsset.status === 'CRITICAL' ? '#FF1744' : '#00E5FF'} strokeWidth="2" />
                   {/* Moving Part */}
                   <circle cx="50" cy="55" r="15" fill="none" stroke={selectedAsset.status === 'CRITICAL' ? '#FF1744' : '#00E5FF'} strokeWidth="2" strokeDasharray="10 5" className="animate-spin-slow" style={{ animationDuration: selectedAsset.vibration > 5 ? '1s' : '5s' }} />
                   {/* Indicator */}
                   <circle cx="50" cy="30" r="2" fill={selectedAsset.status === 'OPTIMAL' ? '#00FF9C' : '#FF1744'} />
                </svg>
             </div>

             {/* Charts */}
             <div className="bg-ogu-950 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs uppercase tracking-widest">
                   <Activity size={14} /> Vibration Analysis
                </div>
                <div className="h-32">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={telemetryData}>
                         <defs>
                            <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#9B4DFF" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#9B4DFF" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                         <Area type="monotone" dataKey="value" stroke="#9B4DFF" fillOpacity={1} fill="url(#colorVib)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>
         </div>

         {/* AI Diagnostics */}
         <div className="glass-panel p-6 rounded-xl border-ogu-purple/30 flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Zap size={120} />
            </div>
            <div className="relative z-10">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <Cpu size={18} className="text-ogu-purple" />
                     Automated Diagnostics
                  </h3>
                  {isAnalyzing && (
                     <span className="text-[10px] text-ogu-purple animate-pulse uppercase tracking-widest">Processing Telemetry...</span>
                  )}
               </div>
               
               <div className="bg-black/40 p-4 rounded border border-white/10 animate-fadeIn min-h-[100px]">
                  {aiReport ? (
                     <p className="text-sm text-slate-300 leading-relaxed font-mono">
                        {aiReport}
                     </p>
                  ) : (
                     <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                        Initializing model...
                     </div>
                  )}
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};