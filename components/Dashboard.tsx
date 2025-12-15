import React, { useEffect } from 'react';
import { AuditRecord } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { Cpu, BrainCircuit, Globe } from 'lucide-react';

interface DashboardProps {
  records: AuditRecord[];
  onInteraction: (action: string, detail: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ records, onInteraction }) => {
  useEffect(() => {
    onInteraction('Navigated', 'Viewed Command Center Dashboard');
  }, []);

  const totalScans = records.length;
  const compliantScans = records.filter(r => r.result.compliant).length;
  const nonCompliantScans = totalScans - compliantScans;
  const complianceRate = totalScans > 0 ? Math.round((compliantScans / totalScans) * 100) : 100;

  const data = [
    { name: 'Compliant', value: compliantScans },
    { name: 'Non-Compliant', value: nonCompliantScans },
  ];

  const trendData = [
    { name: '10:00', value: 85 },
    { name: '11:00', value: 88 },
    { name: '12:00', value: 92 },
    { name: '13:00', value: 90 },
    { name: '14:00', value: 95 },
  ];

  const COLORS = ['#00FF9C', '#FF1744']; // Cyber Green, Infrared Red

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 auto-rows-[minmax(160px,auto)] font-sans">
      
      {/* Hero Card - Global Compliance */}
      <div className="md:col-span-2 glass-panel p-8 rounded-2xl relative overflow-hidden group border-ogu-green/20 dark:border-ogu-green/20">
        <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700 transform group-hover:scale-110 pointer-events-none">
          <Globe size={180} className="text-slate-900 dark:text-white"/>
        </div>
        <div className="relative z-10">
          <h3 className="text-ogu-green text-xs font-bold uppercase tracking-[0.2em] mb-2">Global Compliance</h3>
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-6xl font-black text-light-text dark:text-white tracking-tighter">{complianceRate}%</span>
            <span className="text-xs text-ogu-green bg-ogu-green/10 px-2 py-1 rounded border border-ogu-green/20 font-mono">▲ 4.2% 24h</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-ogu-950 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-white/5">
             <div className="h-full bg-gradient-to-r from-ogu-green to-emerald-400 shadow-[0_0_15px_#00FF9C]" style={{ width: `${complianceRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Agents Active */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between group hover:border-ogu-cyan/40 transition-all border-light-border dark:border-white/5">
         <div className="flex justify-between items-start">
            <div className="p-3 bg-ogu-cyan/10 rounded-xl text-ogu-cyan group-hover:scale-110 transition-transform">
               <Cpu size={24} />
            </div>
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-ogu-cyan rounded-full animate-pulse"></span>
               <span className="text-[10px] text-ogu-cyan uppercase font-bold tracking-wider">Online</span>
            </div>
         </div>
         <div>
            <span className="text-3xl font-bold text-light-text dark:text-white block">2 Nodes</span>
            <span className="text-xs text-light-subtext dark:text-slate-500 uppercase tracking-widest font-mono">Vision • NLP</span>
         </div>
      </div>

      {/* NLP Sentiment */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between group hover:border-ogu-purple/40 transition-all border-light-border dark:border-white/5">
         <div className="flex justify-between items-start">
            <div className="p-3 bg-ogu-purple/10 rounded-xl text-ogu-purple group-hover:scale-110 transition-transform">
               <BrainCircuit size={24} />
            </div>
         </div>
         <div>
            <span className="text-3xl font-bold text-light-text dark:text-white block">Stable</span>
            <span className="text-xs text-light-subtext dark:text-slate-500 uppercase tracking-widest font-mono">System Sentiment</span>
         </div>
      </div>

      {/* Violations Chart (Area) */}
      <div className="md:col-span-2 glass-panel p-6 rounded-2xl border-light-border dark:border-white/5">
         <h3 className="text-light-subtext dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Compliance Velocity</h3>
         <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trendData}>
                  <defs>
                     <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'rgba(5,5,5,0.9)', borderColor: '#333', borderRadius: '4px', fontSize: '12px' }}
                     itemStyle={{ color: '#fff' }}
                     cursor={{stroke: '#ffffff20'}}
                  />
                  <Area type="monotone" dataKey="value" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Outcomes Chart */}
      <div className="md:col-span-2 glass-panel p-6 rounded-2xl border-light-border dark:border-white/5 flex items-center justify-between">
         <div>
            <h3 className="text-light-subtext dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Inspection Result Distribution</h3>
            <ul className="space-y-3">
               <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-ogu-green shadow-[0_0_8px_#00FF9C]"></div>
                  <span className="text-sm text-light-text dark:text-slate-300 font-mono">Compliant <span className="opacity-50">/</span> {compliantScans}</span>
               </li>
               <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-ogu-red shadow-[0_0_8px_#FF1744]"></div>
                  <span className="text-sm text-light-text dark:text-slate-300 font-mono">Violation <span className="opacity-50">/</span> {nonCompliantScans}</span>
               </li>
            </ul>
         </div>
         <div className="w-32 h-32 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie
                      data={data}
                      innerRadius={35}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                   >
                      {data.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                   </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-light-text dark:text-white">{totalScans}</span>
             </div>
         </div>
      </div>

    </div>
  );
};