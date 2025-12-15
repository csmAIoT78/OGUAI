import React, { useState, useEffect } from 'react';
import { Ticket, UserRole } from '../types';
import { ClipboardList, Plus, Bot, Clock, AlertCircle, CheckCircle, ArrowRight, FileText } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';

interface TicketingSystemProps {
  onInteraction: (action: string, detail: string) => void;
}

const INITIAL_TICKETS: Ticket[] = [
  { id: 'T-8821', title: 'PPE Violation - Zone Alpha', description: 'Repeated helmet violation detected by Vision Agent.', source: 'VISION', priority: 'HIGH', status: 'OPEN', timestamp: Date.now() - 1000000 },
  { id: 'T-8822', title: 'Vibration Spike - Pump B', description: 'Maintenance Predictor flagged harmonic distortion > 8Hz.', source: 'MAINTENANCE', priority: 'MEDIUM', status: 'IN_PROGRESS', assignee: 'John Doe', timestamp: Date.now() - 5000000 },
  { id: 'T-8823', title: 'Grid Instability Warning', description: 'Outage Forecaster predicts 88% chance of failure in Industrial Park.', source: 'OUTAGE', priority: 'CRITICAL', status: 'OPEN', timestamp: Date.now() - 200000 },
];

export const TicketingSystem: React.FC<TicketingSystemProps> = ({ onInteraction }) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => StorageService.load('tickets', INITIAL_TICKETS));
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);

  useEffect(() => {
    onInteraction('Navigated', 'Entered Ticketing System');
  }, []);

  useEffect(() => {
    StorageService.save('tickets', tickets);
  }, [tickets]);

  const handleTicketClick = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAiPlan(ticket.aiResolutionPlan || null);
    onInteraction('Select', `Opened Ticket ${ticket.id}`);
  };

  const generatePlan = async () => {
    if (!selectedTicket) return;
    setIsPlanning(true);
    onInteraction('Process', `Generating Resolution SOP for ${selectedTicket.id}`);
    
    // Simulating SOP request to Gemini
    const plan = await GeminiService.generateTicketPlan(selectedTicket.title, selectedTicket.description);
    setAiPlan(plan);
    setIsPlanning(false);
    
    // Update local state and persist
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, aiResolutionPlan: plan } : t));
  };

  const statusColors = {
    OPEN: 'bg-ogu-red/20 text-ogu-red border-ogu-red/30',
    IN_PROGRESS: 'bg-ogu-amber/20 text-ogu-amber border-ogu-amber/30',
    RESOLVED: 'bg-ogu-green/20 text-ogu-green border-ogu-green/30',
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    const priorityScore = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return priorityScore[b.priority] - priorityScore[a.priority]; // Prioritization Engine logic
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full font-sans">
      
      {/* Kanban / List Column */}
      <div className="lg:col-span-2 flex flex-col gap-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
               <ClipboardList className="text-ogu-cyan" size={24} />
               Active Workflows
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
               <Plus size={14} /> New Manual Ticket
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar p-1">
            {sortedTickets.map(ticket => (
               <div 
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                     selectedTicket?.id === ticket.id 
                        ? 'bg-ogu-cyan/5 border-ogu-cyan' 
                        : 'bg-ogu-950 border-white/5 hover:border-white/10'
                  }`}
               >
                  <div className="flex justify-between items-start mb-3">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColors[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                     </span>
                     <span className="text-[10px] text-slate-500 font-mono">{new Date(ticket.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{ticket.title}</h3>
                  <div className="flex items-center gap-2 mt-4">
                     <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400 font-mono">
                        SRC: {ticket.source}
                     </span>
                     {ticket.priority === 'CRITICAL' && <AlertCircle size={14} className="text-ogu-red" />}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Detail & AI Planner */}
      <div className="glass-panel p-6 rounded-xl flex flex-col relative overflow-hidden bg-gradient-to-br from-ogu-900 to-black">
         {selectedTicket ? (
            <div className="animate-fadeIn h-full flex flex-col">
               <div className="border-b border-white/10 pb-4 mb-4">
                  <h2 className="text-xl font-bold text-white mb-2">{selectedTicket.title}</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">{selectedTicket.description}</p>
               </div>

               <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
                  <div className="bg-ogu-purple/5 border border-ogu-purple/20 p-4 rounded-xl">
                     <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs text-ogu-purple font-bold uppercase flex items-center gap-2">
                           <Bot size={14} /> AI Resolution SOP
                        </h4>
                        {!aiPlan && (
                           <button 
                              onClick={generatePlan}
                              disabled={isPlanning}
                              className="text-[10px] bg-ogu-purple hover:bg-purple-600 text-white px-3 py-1.5 rounded font-bold transition-colors"
                           >
                              {isPlanning ? 'Generating SOP...' : 'Generate Plan'}
                           </button>
                        )}
                     </div>
                     
                     {aiPlan ? (
                        <div className="text-xs text-slate-300 space-y-2 font-mono whitespace-pre-line animate-fadeIn">
                           {aiPlan}
                        </div>
                     ) : (
                        <div className="text-center py-8 text-slate-600 text-[10px] uppercase tracking-widest">
                           SOP Module Ready
                        </div>
                     )}
                  </div>
               </div>

               <div className="mt-auto">
                  <button className="w-full py-3 bg-ogu-cyan hover:bg-cyan-400 text-black font-bold uppercase tracking-widest text-xs rounded shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2">
                     <FileText size={14} /> Execute Workflow
                  </button>
               </div>
            </div>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
               <ClipboardList size={48} className="opacity-20 mb-4" />
               <p className="text-xs uppercase tracking-widest">Select a Ticket</p>
            </div>
         )}
      </div>

    </div>
  );
};