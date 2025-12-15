import React, { useState, useEffect } from 'react';
import { CloudLightning, Wind, Sun, AlertOctagon, MapPin, ZapOff, Activity, Play, RefreshCw, Layers } from 'lucide-react';
import { OutageZone, ParsedSubstationData } from '../types';
import { StorageService } from '../services/storageService';

interface OutageForecasterProps {
  onInteraction: (action: string, detail: string) => void;
  externalData?: ParsedSubstationData[];
}

const DEFAULT_ZONES: OutageZone[] = [
  { id: 'Z-01', name: 'North Sector', riskScore: 12, powerLoad: 45, weatherCondition: 'CLEAR', gridStatus: 'STABLE' },
  { id: 'Z-02', name: 'Industrial Park', riskScore: 88, powerLoad: 92, weatherCondition: 'STORM', gridStatus: 'UNSTABLE' },
  { id: 'Z-03', name: 'Logistics Hub', riskScore: 34, powerLoad: 60, weatherCondition: 'WIND', gridStatus: 'STABLE' },
  { id: 'Z-04', name: 'Data Center', riskScore: 5, powerLoad: 80, weatherCondition: 'CLEAR', gridStatus: 'STABLE' },
  { id: 'Z-05', name: 'Residential A', riskScore: 65, powerLoad: 78, weatherCondition: 'HEATWAVE', gridStatus: 'STABLE' },
  { id: 'Z-06', name: 'Residential B', riskScore: 15, powerLoad: 30, weatherCondition: 'CLEAR', gridStatus: 'STABLE' },
];

export const OutageForecaster: React.FC<OutageForecasterProps> = ({ onInteraction, externalData }) => {
  const [zones, setZones] = useState<OutageZone[]>(() => StorageService.load('zones', DEFAULT_ZONES));
  const [selectedZone, setSelectedZone] = useState<OutageZone | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);

  useEffect(() => {
    onInteraction('Navigated', 'Entered Outage Forecaster');
  }, []);

  // Persist Zones
  useEffect(() => {
    StorageService.save('zones', zones);
  }, [zones]);

  // Ingest External Data & Dynamic Updates
  useEffect(() => {
    if (externalData && externalData.length > 0) {
      const latestReadings = externalData.reduce((acc, curr) => {
        acc[curr.substation_id] = curr;
        return acc;
      }, {} as Record<string, ParsedSubstationData>);

      const mappedZones: OutageZone[] = Object.values(latestReadings).map((reading: ParsedSubstationData) => ({
        id: reading.substation_id,
        name: `Substation ${reading.substation_id}`,
        riskScore: reading.status === 'OVERLOAD' ? 95 : Math.round((reading.actual_load_mw / reading.capacity_mw) * 100),
        powerLoad: Math.round((reading.actual_load_mw / reading.capacity_mw) * 100),
        weatherCondition: reading.ambient_temp_f < 32 ? 'STORM' : 'CLEAR',
        gridStatus: reading.status === 'STABLE' ? 'STABLE' : 'UNSTABLE'
      }));

      setZones(prev => {
        // Simple merge strategy: Replace if exists, append if new
        const updated = [...prev];
        mappedZones.forEach(mz => {
          const idx = updated.findIndex(z => z.id === mz.id);
          if (idx >= 0) updated[idx] = mz;
          else updated.push(mz);
        });
        return updated;
      });
      onInteraction('System', `Ingested ${mappedZones.length} substation records`);
    }
  }, [externalData]);

  const handleZoneClick = (zone: OutageZone) => {
    if (simulationMode) {
      // Cascade Failure Logic
      const newZones = zones.map(z => {
        if (z.id === zone.id) return { ...z, gridStatus: 'OUTAGE' as const, riskScore: 100, powerLoad: 0 };
        // Neighbor logic simulation: zones with close IDs get riskier
        if (Math.abs(z.id.localeCompare(zone.id)) === 1) {
           return { ...z, riskScore: Math.min(100, z.riskScore + 30), powerLoad: Math.min(100, z.powerLoad + 20) };
        }
        return z;
      });
      setZones(newZones);
      onInteraction('Simulation', `Simulated Failure Cascade starting at ${zone.name}`);
    } else {
      setSelectedZone(zone);
      onInteraction('Select', `Analyzed Outage Risk for ${zone.name}`);
    }
  };

  const resetSimulation = () => {
    setZones(DEFAULT_ZONES);
    setSimulationMode(false);
    onInteraction('Action', 'Reset Topology Simulation');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full font-sans">
      
      {/* Map / Grid View */}
      <div className={`lg:col-span-2 glass-panel p-6 rounded-xl flex flex-col relative overflow-hidden transition-all duration-500 ${simulationMode ? 'border-ogu-red/50 shadow-[0_0_30px_rgba(255,23,68,0.1)]' : ''}`}>
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <MapPin className="text-ogu-cyan" size={20} />
               Grid Risk Topology
            </h2>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSimulationMode(!simulationMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border transition-all ${simulationMode ? 'bg-ogu-red text-black border-ogu-red' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'}`}
              >
                {simulationMode ? <Activity size={12} className="animate-pulse"/> : <Play size={12} />}
                {simulationMode ? 'Simulating Failure...' : 'Run Scenario'}
              </button>
              {simulationMode && (
                <button onClick={resetSimulation} className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded border border-white/10">
                   <RefreshCw size={12} />
                </button>
              )}
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 overflow-y-auto custom-scrollbar">
            {zones.map(zone => (
               <button
                  key={zone.id}
                  onClick={() => handleZoneClick(zone)}
                  className={`relative p-4 rounded-xl border transition-all group overflow-hidden ${
                     selectedZone?.id === zone.id 
                        ? 'border-white bg-white/10' 
                        : 'border-white/5 bg-ogu-950 hover:bg-white/5'
                  } ${zone.gridStatus === 'OUTAGE' ? 'grayscale opacity-50' : ''}`}
               >
                  {/* Risk Background Fill */}
                  <div 
                     className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${
                        zone.riskScore > 75 ? 'bg-ogu-red w-full' :
                        zone.riskScore > 40 ? 'bg-ogu-amber w-1/2' : 'bg-ogu-green w-1/4'
                     }`} 
                  />
                  
                  <div className="flex justify-between items-start mb-4">
                     <span className="text-xs font-bold text-white uppercase">{zone.id}</span>
                     {zone.weatherCondition === 'STORM' ? <CloudLightning size={16} className="text-ogu-cyan" /> :
                      zone.weatherCondition === 'HEATWAVE' ? <Sun size={16} className="text-ogu-amber" /> :
                      <Wind size={16} className="text-slate-500" />}
                  </div>
                  
                  <div className="text-left">
                     <h3 className="text-sm font-bold text-slate-200 mb-1">{zone.name}</h3>
                     <span className="text-[10px] text-slate-500 font-mono">Load: {zone.powerLoad}%</span>
                  </div>

                  {zone.riskScore > 80 && (
                     <div className="absolute inset-0 border-2 border-ogu-red animate-pulse rounded-xl pointer-events-none"></div>
                  )}
               </button>
            ))}
         </div>
         {simulationMode && (
           <div className="absolute bottom-4 left-4 right-4 bg-ogu-red/20 text-ogu-red text-center text-xs font-bold py-2 rounded border border-ogu-red/30 animate-pulse">
             SIMULATION ACTIVE: SELECT ZONE TO TRIGGER FAILURE
           </div>
         )}
      </div>

      {/* Detail Panel */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-6 bg-gradient-to-b from-ogu-900 to-black">
         {selectedZone ? (
            <div className="animate-fadeIn space-y-6">
               <div>
                  <h3 className="text-lg font-bold text-white mb-1">{selectedZone.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                     <span className={`px-2 py-0.5 rounded font-bold ${
                        selectedZone.gridStatus === 'UNSTABLE' ? 'bg-ogu-red/20 text-ogu-red' : 
                        selectedZone.gridStatus === 'OUTAGE' ? 'bg-slate-700 text-slate-300' : 'bg-ogu-green/20 text-ogu-green'
                     }`}>{selectedZone.gridStatus}</span>
                  </div>
               </div>

               {/* Risk Meter */}
               <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Outage Probability</span>
                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="#333" strokeWidth="8" fill="transparent" />
                        <circle cx="64" cy="64" r="56" 
                           stroke={selectedZone.riskScore > 70 ? '#FF1744' : '#00E5FF'} 
                           strokeWidth="8" fill="transparent" 
                           strokeDasharray="351" 
                           strokeDashoffset={351 - (351 * (selectedZone.riskScore / 100))} 
                           className="transition-all duration-1000 ease-out" 
                        />
                     </svg>
                     <div className="absolute text-3xl font-bold text-white">{selectedZone.riskScore}%</div>
                  </div>
               </div>

               {/* Predictive Insight */}
               <div className="bg-ogu-cyan/5 border border-ogu-cyan/20 p-4 rounded-xl">
                  <h4 className="text-xs text-ogu-cyan font-bold uppercase mb-2 flex items-center gap-2">
                     <Activity size={12} /> Forecast
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                     {selectedZone.riskScore > 80 
                        ? "CRITICAL WARNING: High load stress + weather correlation implies imminent failure. Neighboring zones at risk of cascade." 
                        : "Grid stable. Load within nominal parameters. No anomalies detected."}
                  </p>
               </div>
               
               {selectedZone.riskScore > 80 && (
                  <button className="w-full py-3 bg-ogu-red hover:bg-red-600 text-black font-bold uppercase tracking-widest text-xs rounded shadow-[0_0_15px_#FF1744] transition-all">
                     Initiate Emergency Protocol
                  </button>
               )}
            </div>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
               <ZapOff size={48} className="opacity-20 mb-4" />
               <p className="text-xs uppercase tracking-widest">Select a Zone</p>
            </div>
         )}
      </div>

    </div>
  );
};