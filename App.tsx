import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Scan, ScrollText, Hexagon, Wallet, Menu, X, BrainCircuit, Wrench, Zap, Ticket as TicketIcon, Book, Settings, Lock, Sun, Moon, LogOut } from 'lucide-react';
import { LiveScanner } from './components/LiveScanner';
import { Dashboard } from './components/Dashboard';
import { AuditLog } from './components/AuditLog';
import { LogIntelligence } from './components/LogIntelligence';
import { MaintenancePredictor } from './components/MaintenancePredictor';
import { OutageForecaster } from './components/OutageForecaster';
import { TicketingSystem } from './components/TicketingSystem';
import { OrchestratorSidebar } from './components/OrchestratorSidebar';
import { DocumentationLibrary } from './components/DocumentationLibrary';
import { SettingsPanel } from './components/SettingsPanel';
import { HeroLogin } from './components/HeroLogin'; // Import the new HeroLogin
import { StorageService } from './services/storageService';
import { AuditRecord, NavItem, UserRole, InteractionEvent, ParsedEquipmentData, ParsedSubstationData } from './types';

function App() {
  // --- Auth State ---
  // We initialize userRole based on storage, but we check specific login status too.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => StorageService.load('isAuthenticated', false));
  const [userRole, setUserRole] = useState<UserRole>(() => StorageService.load('userRole', 'OPERATOR'));

  // --- App Data State ---
  const [activeTab, setActiveTab] = useState<string>(() => StorageService.load('activeTab', 'dashboard'));
  const [theme, setTheme] = useState<'dark' | 'light'>(() => StorageService.load('theme', 'dark'));
  const [records, setRecords] = useState<AuditRecord[]>(() => StorageService.load('records', []));
  const [interactionHistory, setInteractionHistory] = useState<InteractionEvent[]>(() => StorageService.load('history', []));
  
  // External Data State
  const [substationData, setSubstationData] = useState<ParsedSubstationData[]>(() => StorageService.load('substationData', []));
  const [equipmentData, setEquipmentData] = useState<ParsedEquipmentData[]>(() => StorageService.load('equipmentData', []));

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOrchestratorOpen, setIsOrchestratorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Effects ---
  useEffect(() => StorageService.save('isAuthenticated', isAuthenticated), [isAuthenticated]);
  useEffect(() => StorageService.save('activeTab', activeTab), [activeTab]);
  useEffect(() => StorageService.save('userRole', userRole), [userRole]);
  useEffect(() => StorageService.save('records', records), [records]);
  useEffect(() => StorageService.save('history', interactionHistory), [interactionHistory]);
  useEffect(() => StorageService.save('substationData', substationData), [substationData]);
  useEffect(() => StorageService.save('equipmentData', equipmentData), [equipmentData]);

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    StorageService.save('theme', theme);
  }, [theme]);

  // Interaction Logger
  const logInteraction = (action: string, detail: string) => {
    const event: InteractionEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      appContext: navItems.find(n => n.id === activeTab)?.label || 'Unknown',
      action,
      details: detail
    };
    setInteractionHistory(prev => {
      const updated = [...prev, event].slice(-100); 
      return updated;
    });
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    logInteraction('Security', `User Authenticated with Role: ${role}`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsSidebarOpen(false);
    setIsOrchestratorOpen(false);
    logInteraction('Security', 'User Logged Out');
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    logInteraction('Navigation', `Switched to ${navItems.find(n => n.id === tabId)?.label}`);
    setIsSidebarOpen(false); // Auto-close on mobile
  };

  const handleNewRecord = (record: AuditRecord) => {
    setRecords(prev => [record, ...prev]);
  };

  const handleDataInject = (type: 'substation' | 'equipment', data: any[]) => {
    if (type === 'substation') {
      setSubstationData(data);
      logInteraction('System', `Injected ${data.length} external substation records`);
    } else {
      setEquipmentData(data);
      logInteraction('System', `Injected ${data.length} external equipment records`);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    logInteraction('Settings', `Switched to ${newTheme} mode`);
  };

  const handleSettingsOpen = () => {
    if (userRole !== 'ADMIN') {
      alert("ACCESS DENIED: Operator role insufficient for System Configuration.");
      logInteraction('Security', 'Failed Access Attempt: Settings Panel (Insufficient Privileges)');
      return;
    }
    setIsSettingsOpen(true);
  };

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard size={18} />, category: 'core' },
    { id: 'scanner', label: 'Vision Agent', icon: <Scan size={18} />, category: 'core' },
    { id: 'maintenance', label: 'Maintenance Predictor', icon: <Wrench size={18} />, category: 'modules' },
    { id: 'outage', label: 'Outage Forecaster', icon: <Zap size={18} />, category: 'modules' },
    { id: 'ticketing', label: 'Auto-Ticketing', icon: <TicketIcon size={18} />, category: 'modules' },
    { id: 'nlp', label: 'Log Intelligence', icon: <BrainCircuit size={18} />, category: 'core' },
    { id: 'audit', label: 'Ledger Audit', icon: <ScrollText size={18} />, category: 'core' },
    { id: 'docs', label: 'Doc Library', icon: <Book size={18} />, category: 'system' },
  ];

  const currentAppName = navItems.find(n => n.id === activeTab)?.label || 'System';

  // --- Render Login Screen if not Authenticated ---
  if (!isAuthenticated) {
    return <HeroLogin onLogin={handleLogin} />;
  }

  // --- Render Main App ---
  return (
    <div className="flex h-screen bg-light-bg dark:bg-ogu-950 text-light-text dark:text-slate-200 overflow-hidden font-sans transition-colors duration-300">
      
      {/* Sidebar - OGU Identity */}
      <aside className={`hidden md:flex flex-col w-64 border-r border-light-border dark:border-white/5 bg-light-panel dark:bg-ogu-950/80 backdrop-blur-xl z-20`}>
        <div className="p-8 flex items-center gap-3 border-b border-light-border dark:border-white/5">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-ogu-cyan to-ogu-purple opacity-20 blur-lg rounded-full"></div>
            <Hexagon size={24} className="text-ogu-cyan relative z-10" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-light-text dark:text-white font-sans">OGU <span className="text-ogu-cyan">OS</span></h1>
            <p className="text-[9px] text-light-subtext dark:text-slate-500 uppercase tracking-[0.2em] font-mono">Ver 2.0.4</p>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-slate-100 dark:bg-white/5 text-ogu-cyan dark:text-white border border-slate-200 dark:border-white/5 font-semibold' 
                  : 'text-light-subtext dark:text-slate-500 hover:text-light-text dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {activeTab === item.id && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-ogu-cyan shadow-[0_0_10px_#00E5FF]"></div>}
              
              <span className={`relative z-10 transition-colors ${activeTab === item.id ? 'text-ogu-cyan' : 'group-hover:text-ogu-cyan'}`}>
                {item.icon}
              </span>
              <span className="font-medium tracking-wide text-xs relative z-10 uppercase">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-light-border dark:border-white/5">
           <div className="bg-slate-50 dark:bg-ogu-900/50 rounded p-4 border border-light-border dark:border-white/5 relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-ogu-green animate-pulse shadow-[0_0_8px_#00FF9C]"></div>
                 <span className="text-[10px] font-mono text-ogu-green uppercase tracking-widest">Mainnet Synced</span>
              </div>
              <p className="text-[10px] text-light-subtext dark:text-slate-500 font-mono">
                 Role: <span className="text-white">{userRole}</span>
              </p>
           </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-light-panel dark:bg-ogu-950 border-r border-light-border dark:border-white/10 z-50 transform transition-transform duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-6 flex justify-between items-center border-b border-light-border dark:border-white/10">
            <h1 className="text-lg font-bold text-light-text dark:text-white">OGU OS</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="text-light-subtext dark:text-slate-400"><X size={20} /></button>
         </div>
         <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                  activeTab === item.id 
                    ? 'bg-slate-100 dark:bg-white/10 text-light-text dark:text-white font-bold' 
                    : 'text-light-subtext dark:text-slate-400'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
         </nav>
      </div>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-w-0 bg-light-bg dark:bg-ogu-950 relative selection:bg-ogu-cyan selection:text-black transition-all duration-300 ${isOrchestratorOpen ? 'mr-0 md:mr-96' : ''}`}>
        
        {/* Subtle Background Glow (Dark Mode Only) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-ogu-cyan/5 blur-[100px] pointer-events-none opacity-0 dark:opacity-100"></div>

        {/* Header */}
        <header className="h-16 border-b border-light-border dark:border-white/5 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 backdrop-blur-sm bg-light-bg/80 dark:bg-ogu-950/50">
           <div className="flex items-center gap-4">
              <button className="md:hidden text-light-subtext dark:text-slate-400" onClick={() => setIsSidebarOpen(true)}>
                 <Menu size={24} />
              </button>
              <h2 className="text-sm font-bold text-light-text dark:text-white hidden sm:block tracking-widest uppercase">
                 {currentAppName}
              </h2>
           </div>

           <div className="flex items-center gap-3 md:gap-6">
              {/* Role Display Pill (Non-Clickable now as Auth handles it) */}
              <div className="hidden md:flex bg-slate-200 dark:bg-black/40 border border-light-border dark:border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-ogu-green"></div>
                 <span className="text-[10px] font-bold tracking-widest text-light-text dark:text-white">{userRole}</span>
              </div>

              <div className="h-6 w-[1px] bg-light-border dark:bg-white/10 mx-2 hidden sm:block"></div>
              
              <button
                onClick={toggleTheme}
                className="p-2 text-light-subtext hover:text-light-text dark:text-slate-500 dark:hover:text-white transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button 
                onClick={handleSettingsOpen}
                className={`p-2 transition-colors ${userRole === 'ADMIN' ? 'text-light-subtext hover:text-light-text dark:text-slate-500 dark:hover:text-white' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
                title={userRole === 'ADMIN' ? "System Configuration" : "Access Restricted"}
              >
                 {userRole === 'ADMIN' ? <Settings size={18} /> : <Lock size={18} />}
              </button>

              <button 
                onClick={handleLogout}
                className="p-2 text-ogu-red hover:bg-ogu-red/10 rounded-lg transition-colors"
                title="Disconnect from Grid"
              >
                 <LogOut size={18} />
              </button>
           </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar bg-light-bg dark:bg-ogu-950">
           <div className="max-w-8xl mx-auto space-y-8 relative z-0 h-full flex flex-col">
              
              {activeTab === 'dashboard' && (
                <div className="animate-fadeIn space-y-6">
                  <div className="flex flex-col gap-1 mb-2">
                     <h2 className="text-2xl font-bold text-light-text dark:text-white">System Status</h2>
                     <p className="text-sm text-light-subtext dark:text-slate-400">Multi-agent orchestration metrics.</p>
                  </div>
                  <Dashboard records={records} onInteraction={logInteraction} />
                  <div className="h-[400px]">
                     <AuditLog records={records} onInteraction={logInteraction} />
                  </div>
                </div>
              )}

              {activeTab === 'scanner' && (
                 <div className="h-full animate-fadeIn flex flex-col">
                     <div className="flex flex-col gap-1 mb-6 flex-shrink-0">
                        <div className="flex items-center gap-3">
                           <h2 className="text-2xl font-bold text-light-text dark:text-white">Vision Agent</h2>
                           <span className="px-2 py-0.5 rounded text-[10px] bg-green-100 dark:bg-ogu-green/10 text-green-700 dark:text-ogu-green border border-green-200 dark:border-ogu-green/20 font-mono tracking-widest">V2.0 ONLINE</span>
                        </div>
                        <p className="text-sm text-light-subtext dark:text-slate-400">Object detection, zone monitoring, and compliance verification.</p>
                     </div>
                     <div className="flex-grow min-h-0">
                        <LiveScanner onNewRecord={handleNewRecord} onInteraction={logInteraction} />
                     </div>
                 </div>
              )}

              {activeTab === 'maintenance' && (
                 <div className="h-full animate-fadeIn flex flex-col">
                     <div className="flex flex-col gap-1 mb-6 flex-shrink-0">
                        <div className="flex items-center gap-3">
                           <h2 className="text-2xl font-bold text-light-text dark:text-white">Maintenance Predictor</h2>
                           <span className="px-2 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-ogu-purple/10 text-purple-700 dark:text-ogu-purple border border-purple-200 dark:border-ogu-purple/20 font-mono tracking-widest">AI ACTIVE</span>
                        </div>
                        <p className="text-sm text-light-subtext dark:text-slate-400">Predictive failure modeling and asset health monitoring.</p>
                     </div>
                     <div className="flex-grow min-h-0">
                        <MaintenancePredictor onInteraction={logInteraction} externalData={equipmentData} />
                     </div>
                 </div>
              )}

              {activeTab === 'outage' && (
                 <div className="h-full animate-fadeIn flex flex-col">
                     <div className="flex flex-col gap-1 mb-6 flex-shrink-0">
                        <div className="flex items-center gap-3">
                           <h2 className="text-2xl font-bold text-light-text dark:text-white">Outage Forecaster</h2>
                           <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-100 dark:bg-ogu-cyan/10 text-cyan-700 dark:text-ogu-cyan border border-cyan-200 dark:border-ogu-cyan/20 font-mono tracking-widest">GRID LINKED</span>
                        </div>
                        <p className="text-sm text-light-subtext dark:text-slate-400">Geospatial risk mapping and load forecasting.</p>
                     </div>
                     <div className="flex-grow min-h-0">
                        <OutageForecaster onInteraction={logInteraction} externalData={substationData} />
                     </div>
                 </div>
              )}

              {activeTab === 'ticketing' && (
                 <div className="h-full animate-fadeIn flex flex-col">
                     <div className="flex flex-col gap-1 mb-6 flex-shrink-0">
                        <div className="flex items-center gap-3">
                           <h2 className="text-2xl font-bold text-light-text dark:text-white">Auto-Ticketing</h2>
                           <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 font-mono tracking-widest">WORKFLOW AGENT</span>
                        </div>
                        <p className="text-sm text-light-subtext dark:text-slate-400">Autonomous issue tracking and AI resolution planning.</p>
                     </div>
                     <div className="flex-grow min-h-0">
                        <TicketingSystem onInteraction={logInteraction} />
                     </div>
                 </div>
              )}

              {activeTab === 'nlp' && (
                 <div className="h-full animate-fadeIn flex flex-col">
                     <div className="flex flex-col gap-1 mb-6 flex-shrink-0">
                        <div className="flex items-center gap-3">
                           <h2 className="text-2xl font-bold text-light-text dark:text-white">Log Intelligence</h2>
                           <span className="px-2 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-ogu-purple/10 text-purple-700 dark:text-ogu-purple border border-purple-200 dark:border-ogu-purple/20 font-mono tracking-widest">NLP ACTIVE</span>
                        </div>
                        <p className="text-sm text-light-subtext dark:text-slate-400">Natural language processing of system events and feedback.</p>
                     </div>
                     <div className="flex-grow min-h-0">
                        <LogIntelligence onInteraction={logInteraction} />
                     </div>
                 </div>
              )}

              {activeTab === 'audit' && (
                 <div className="h-full animate-fadeIn flex flex-col">
                     <div className="flex flex-col gap-1 mb-6 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-light-text dark:text-white">Audit Trail</h2>
                        <p className="text-sm text-light-subtext dark:text-slate-400">Immutable on-chain history of all agent actions.</p>
                     </div>
                     <div className="flex-grow min-h-0">
                        <AuditLog records={records} onInteraction={logInteraction} />
                     </div>
                 </div>
              )}

              {activeTab === 'docs' && (
                 <div className="h-full animate-fadeIn flex flex-col">
                     <div className="flex flex-col gap-1 mb-6 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-light-text dark:text-white">System Documentation</h2>
                        <p className="text-sm text-light-subtext dark:text-slate-400">Interactive platform specifications and architecture.</p>
                     </div>
                     <div className="flex-grow min-h-0">
                        <DocumentationLibrary />
                     </div>
                 </div>
              )}
           </div>
        </div>
      </main>

      {/* Orchestrator AI Sidebar */}
      <OrchestratorSidebar 
        isOpen={isOrchestratorOpen} 
        onToggle={() => setIsOrchestratorOpen(!isOrchestratorOpen)} 
        currentApp={currentAppName}
        interactionHistory={interactionHistory}
      />

      {/* Admin Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onDataInject={handleDataInject}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(155, 155, 155, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(155, 155, 155, 0.4);
        }
      `}</style>
    </div>
  );
}

export default App;