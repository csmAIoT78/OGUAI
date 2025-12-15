import React, { useState, useEffect } from 'react';
import { Book, Code, Layers, ShieldCheck, GitBranch, Terminal, FileText, ChevronRight, Eye, Wrench, Zap, Ticket as TicketIcon, BrainCircuit } from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const DocumentationLibrary: React.FC = () => {
  const [activeSection, setActiveSection] = useState('roadmap');
  const [mermaidHtml, setMermaidHtml] = useState('');

  // Generate Mermaid Diagram
  useEffect(() => {
    const chart = `
      graph TD
        subgraph "OGU Platform Layer"
          Orchestrator[Orchestrator AI] -->|Directs| Vision[Vision Agent]
          Orchestrator -->|Directs| NLP[Log Intelligence]
          Orchestrator -->|Directs| Predictor[Maintenance AI]
        end

        subgraph "DApp Ecosystem"
          Vision -->|Events| Ticketing[Auto-Ticketing]
          Predictor -->|Alerts| Ticketing
          Outage[Outage Forecaster] -->|Risk Data| Orchestrator
        end

        subgraph "Web3 / Security Layer"
          Vision -->|Hashes| IPFS[IPFS Storage]
          Vision -->|Proof| Contract[Smart Contract Registry]
          Log[Audit Log] -->|Reads| Contract
        end
    `;
    setMermaidHtml(chart);
  }, []);

  const sections: DocSection[] = [
    {
      id: 'roadmap',
      title: 'Global Roadmap',
      icon: <Layers size={16} />,
      content: (
        <div className="space-y-8 animate-fadeIn">
          <div>
            <h2 className="text-3xl font-bold text-light-text dark:text-white mb-4">OGU Platform Roadmap</h2>
            <p className="text-light-subtext dark:text-slate-300 leading-relaxed text-sm">
              AI-Augmented Use Cases & Features (Phases 1–5). A polished, investor-ready, engineering-ready breakdown of the autonomous operations system.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
             <div className="bg-light-panel dark:bg-white/5 p-6 rounded-xl border border-light-border dark:border-white/10">
                <h3 className="text-xl font-bold text-light-text dark:text-white mb-4">🌐 The OGU Intelligence Loop</h3>
                <p className="text-sm text-light-subtext dark:text-slate-400 mb-4">
                   Each phase feeds intelligence into the next, creating a closed-loop autonomous operations system:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm font-mono text-ogu-cyan dark:text-ogu-cyan">
                   <li><span className="text-light-text dark:text-slate-300">PPE Vision detects unsafe behavior</span></li>
                   <li><span className="text-light-text dark:text-slate-300">Maintenance Predictor identifies failing equipment</span></li>
                   <li><span className="text-light-text dark:text-slate-300">Outage Forecaster predicts system-wide failures</span></li>
                   <li><span className="text-light-text dark:text-slate-300">Log Analyzer explains root causes</span></li>
                   <li><span className="text-light-text dark:text-slate-300">Real-Time Ticketing assigns tasks automatically</span></li>
                </ol>
             </div>
          </div>
        </div>
      )
    },
    {
      id: 'phase1',
      title: 'Phase 1: PPE Vision',
      icon: <Eye size={16} />,
      content: (
        <div className="space-y-6 animate-fadeIn">
           <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800">CURRENT STATUS: ACTIVE</span>
              <h2 className="text-2xl font-bold text-light-text dark:text-white">PPE Vision DApp</h2>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <h3 className="font-bold text-ogu-cyan text-sm uppercase tracking-wider">Primary Use Case</h3>
                 <p className="text-sm text-light-subtext dark:text-slate-300">Real-time detection of PPE compliance across industrial, construction, and utility environments.</p>
                 
                 <h3 className="font-bold text-ogu-cyan text-sm uppercase tracking-wider mt-6">AI-Augmented Features</h3>
                 <ul className="space-y-2 text-sm text-light-subtext dark:text-slate-400">
                    <li>• <strong>Object Detection:</strong> Helmets, vests, gloves, goggles, boots</li>
                    <li>• <strong>Real-Time Tracking:</strong> Worker IDs, movement paths, zone entry/exit</li>
                    <li>• <strong>Compliance Logic:</strong> Rule-based + AI-predicted violations</li>
                    <li>• <strong>On-Chain Logging:</strong> Immutable safety events</li>
                 </ul>
              </div>

              <div className="bg-light-panel dark:bg-black/30 p-6 rounded-xl border border-light-border dark:border-white/10 h-fit">
                 <h3 className="font-bold text-light-text dark:text-white mb-4 flex items-center gap-2"><Code size={16}/> Tech Stack</h3>
                 <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between border-b border-light-border dark:border-white/10 pb-2">
                       <span className="text-light-subtext dark:text-slate-500">Model</span>
                       <span className="text-light-text dark:text-white">YOLOv8 / Gemini 1.5 Flash</span>
                    </div>
                    <div className="flex justify-between border-b border-light-border dark:border-white/10 pb-2">
                       <span className="text-light-subtext dark:text-slate-500">Processing</span>
                       <span className="text-light-text dark:text-white">TensorFlow.js (Client-Edge)</span>
                    </div>
                    <div className="flex justify-between border-b border-light-border dark:border-white/10 pb-2">
                       <span className="text-light-subtext dark:text-slate-500">Tracking</span>
                       <span className="text-light-text dark:text-white">DeepSORT Algorithm</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-light-subtext dark:text-slate-500">Ledger</span>
                       <span className="text-light-text dark:text-white">Solidity / IPFS</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'phase2',
      title: 'Phase 2: Maintenance',
      icon: <Wrench size={16} />,
      content: (
        <div className="space-y-6 animate-fadeIn">
           <h2 className="text-2xl font-bold text-light-text dark:text-white">Maintenance Predictor</h2>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <h3 className="font-bold text-ogu-purple text-sm uppercase tracking-wider">Primary Use Case</h3>
                 <p className="text-sm text-light-subtext dark:text-slate-300">Prevent equipment failures by predicting breakdowns before they occur using predictive AI.</p>
                 
                 <h3 className="font-bold text-ogu-purple text-sm uppercase tracking-wider mt-6">AI-Augmented Features</h3>
                 <ul className="space-y-2 text-sm text-light-subtext dark:text-slate-400">
                    <li>• <strong>Failure Prediction:</strong> Based on vibration, temperature, usage</li>
                    <li>• <strong>RUL (Remaining Useful Life):</strong> AI estimates asset lifespan</li>
                    <li>• <strong>Digital Twin:</strong> Real-time visualization of asset state</li>
                    <li>• <strong>Cost Forecasting:</strong> Predicts downtime impact</li>
                 </ul>
              </div>

              <div className="bg-light-panel dark:bg-black/30 p-6 rounded-xl border border-light-border dark:border-white/10 h-fit">
                 <h3 className="font-bold text-light-text dark:text-white mb-4 flex items-center gap-2"><Code size={16}/> Tech Stack</h3>
                 <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between border-b border-light-border dark:border-white/10 pb-2">
                       <span className="text-light-subtext dark:text-slate-500">Analysis</span>
                       <span className="text-light-text dark:text-white">Random Forest / XGBoost</span>
                    </div>
                    <div className="flex justify-between border-b border-light-border dark:border-white/10 pb-2">
                       <span className="text-light-subtext dark:text-slate-500">LLM</span>
                       <span className="text-light-text dark:text-white">Gemini 2.5 (Diagnostics)</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-light-subtext dark:text-slate-500">Inputs</span>
                       <span className="text-light-text dark:text-white">IoT Sensor CSV / Stream</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'phase3',
      title: 'Phase 3: Outage Forecast',
      icon: <Zap size={16} />,
      content: (
        <div className="space-y-6 animate-fadeIn">
           <h2 className="text-2xl font-bold text-light-text dark:text-white">Utility Outage Forecaster</h2>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <h3 className="font-bold text-ogu-cyan text-sm uppercase tracking-wider">Primary Use Case</h3>
                 <p className="text-sm text-light-subtext dark:text-slate-300">Predict outages before they occur using environmental, operational, and historical data.</p>
                 
                 <h3 className="font-bold text-ogu-cyan text-sm uppercase tracking-wider mt-6">AI-Augmented Features</h3>
                 <ul className="space-y-2 text-sm text-light-subtext dark:text-slate-400">
                    <li>• <strong>Probability Scoring:</strong> Per zone, per asset risk calc</li>
                    <li>• <strong>Weather-Linked Risk:</strong> Storms, heat, humidity integration</li>
                    <li>• <strong>Cascading Failure:</strong> Simulation of grid dependency</li>
                    <li>• <strong>Mitigation:</strong> AI suggests preventive load shedding</li>
                 </ul>
              </div>

              <div className="bg-light-panel dark:bg-black/30 p-6 rounded-xl border border-light-border dark:border-white/10 h-fit">
                 <h3 className="font-bold text-light-text dark:text-white mb-4 flex items-center gap-2"><Code size={16}/> Tech Stack</h3>
                 <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between border-b border-light-border dark:border-white/10 pb-2">
                       <span className="text-light-subtext dark:text-slate-500">Modeling</span>
                       <span className="text-light-text dark:text-white">Graph Neural Networks (GNN)</span>
                    </div>
                    <div className="flex justify-between border-b border-light-border dark:border-white/10 pb-2">
                       <span className="text-light-subtext dark:text-slate-500">Geospatial</span>
                       <span className="text-light-text dark:text-white">GIS / Mapbox / Leaflet</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-light-subtext dark:text-slate-500">Simulation</span>
                       <span className="text-light-text dark:text-white">Monte Carlo Methods</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'phase4',
      title: 'Phase 4: Log Analyzer',
      icon: <BrainCircuit size={16} />,
      content: (
        <div className="space-y-6 animate-fadeIn">
           <h2 className="text-2xl font-bold text-light-text dark:text-white">Log Analyzer Agent</h2>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <h3 className="font-bold text-ogu-purple text-sm uppercase tracking-wider">Primary Use Case</h3>
                 <p className="text-sm text-light-subtext dark:text-slate-300">Transform raw logs and user feedback into actionable insights using natural language processing.</p>
                 
                 <h3 className="font-bold text-ogu-purple text-sm uppercase tracking-wider mt-6">AI-Augmented Features</h3>
                 <ul className="space-y-2 text-sm text-light-subtext dark:text-slate-400">
                    <li>• <strong>Log Clustering:</strong> Groups similar error patterns</li>
                    <li>• <strong>Sentiment Analysis:</strong> Understands feedback scale</li>
                    <li>• <strong>Root-Cause Insights:</strong> AI explains "Why"</li>
                    <li>• <strong>Correlation:</strong> Links logs to PPE/Outage events</li>
                 </ul>
              </div>

              <div className="bg-light-panel dark:bg-black/30 p-6 rounded-xl border border-light-border dark:border-white/10 h-fit">
                 <h3 className="font-bold text-light-text dark:text-white mb-4 flex items-center gap-2"><Code size={16}/> Tech Stack</h3>
                 <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between border-b border-light-border dark:border-white/10 pb-2">
                       <span className="text-light-subtext dark:text-slate-500">NLP Engine</span>
                       <span className="text-light-text dark:text-white">Gemini 2.5 Flash / BERT</span>
                    </div>
                    <div className="flex justify-between border-b border-light-border dark:border-white/10 pb-2">
                       <span className="text-light-subtext dark:text-slate-500">Clustering</span>
                       <span className="text-light-text dark:text-white">K-Means / DBSCAN</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-light-subtext dark:text-slate-500">Pipeline</span>
                       <span className="text-light-text dark:text-white">FastAPI / Python</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'phase5',
      title: 'Phase 5: Ticketing',
      icon: <TicketIcon size={16} />,
      content: (
        <div className="space-y-6 animate-fadeIn">
           <h2 className="text-2xl font-bold text-light-text dark:text-white">Real-Time Ticketing</h2>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <h3 className="font-bold text-ogu-cyan text-sm uppercase tracking-wider">Primary Use Case</h3>
                 <p className="text-sm text-light-subtext dark:text-slate-300">Autonomous ticket creation, routing, and resolution tracking across the ecosystem.</p>
                 
                 <h3 className="font-bold text-ogu-cyan text-sm uppercase tracking-wider mt-6">AI-Augmented Features</h3>
                 <ul className="space-y-2 text-sm text-light-subtext dark:text-slate-400">
                    <li>• <strong>Auto-Creation:</strong> From Visions/Maintenance/Logs</li>
                    <li>• <strong>Smart Routing:</strong> Based on technician skill & location</li>
                    <li>• <strong>SLA Prediction:</strong> "Breach likely in 2 hours"</li>
                    <li>• <strong>AI SOPs:</strong> Generates step-by-step fix guides</li>
                 </ul>
              </div>

              <div className="bg-light-panel dark:bg-black/30 p-6 rounded-xl border border-light-border dark:border-white/10 h-fit">
                 <h3 className="font-bold text-light-text dark:text-white mb-4 flex items-center gap-2"><Code size={16}/> Tech Stack</h3>
                 <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between border-b border-light-border dark:border-white/10 pb-2">
                       <span className="text-light-subtext dark:text-slate-500">Workflow</span>
                       <span className="text-light-text dark:text-white">Orchestrator Logic / State Machine</span>
                    </div>
                    <div className="flex justify-between border-b border-light-border dark:border-white/10 pb-2">
                       <span className="text-light-subtext dark:text-slate-500">Generation</span>
                       <span className="text-light-text dark:text-white">LLM (SOP Creation)</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-light-subtext dark:text-slate-500">Integration</span>
                       <span className="text-light-text dark:text-white">Webhooks / API</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full font-sans animate-fadeIn">
      {/* Sidebar Navigation */}
      <div className="glass-panel p-4 rounded-xl flex flex-col gap-2 h-fit md:h-full">
        <h3 className="text-xs font-bold text-light-subtext dark:text-slate-500 uppercase tracking-widest mb-2 px-2">Documentation</h3>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all ${
              activeSection === section.id 
                ? 'bg-slate-100 dark:bg-ogu-cyan/10 text-ogu-cyan border border-slate-200 dark:border-ogu-cyan/30 font-bold' 
                : 'text-light-subtext dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              {section.icon}
              <span className="font-medium">{section.title}</span>
            </div>
            {activeSection === section.id && <ChevronRight size={14} />}
          </button>
        ))}
        
        <div className="mt-auto pt-4 border-t border-light-border dark:border-white/10 px-2 hidden md:block">
           <div className="text-[10px] text-light-subtext dark:text-slate-500 font-mono">
              Last Updated: <span className="text-light-text dark:text-white">2025-10-27</span>
              <br/>
              Docs Version: <span className="text-ogu-purple">2.1.0</span>
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="md:col-span-3 glass-panel p-6 md:p-8 rounded-xl bg-slate-50 dark:bg-gradient-to-br dark:from-ogu-900 dark:to-black overflow-y-auto custom-scrollbar relative">
         <div className="relative z-10 max-w-4xl mx-auto">
            {sections.find(s => s.id === activeSection)?.content}
         </div>
      </div>
    </div>
  );
};