import React, { useState } from 'react';
import { Hexagon, ShieldCheck, Cpu, Globe, ArrowRight, Lock, Activity, Database, Key } from 'lucide-react';
import { UserRole } from '../types';

interface HeroLoginProps {
  onLogin: (role: UserRole) => void;
}

export const HeroLogin: React.FC<HeroLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate Network Handshake
    setTimeout(() => {
      let role: UserRole | null = null;

      if (username === 'site_admin' && password === 'admin_site_2025') role = 'ADMIN';
      else if (username === 'app_viewer' && password === 'viewer_app_2025') role = 'OPERATOR';
      else if (username === 'reg_auditor' && password === 'auditor_reg_2025') role = 'AUDITOR';

      if (role) {
        onLogin(role);
      } else {
        setError('INVALID_CREDENTIALS: Access Denied by Protocol.');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-ogu-950 text-white font-sans overflow-hidden relative flex flex-col lg:flex-row">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_15%_50%,rgba(0,229,255,0.08),transparent_25%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_85%_50%,rgba(155,77,255,0.08),transparent_25%)]"></div>
        <div className="hud-grid opacity-10 absolute inset-0"></div>
      </div>

      {/* Left Column: Hero Manifesto */}
      <div className="lg:w-3/5 p-12 lg:p-20 relative z-10 flex flex-col justify-between">
        
        {/* Logo Area */}
        <div className="animate-fadeIn">
          <div className="flex items-center gap-4 mb-8">
             <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-ogu-cyan blur-xl opacity-30 animate-pulse"></div>
                <Hexagon size={40} className="text-ogu-cyan relative z-10" strokeWidth={1.5} />
             </div>
             <div>
                <h1 className="text-3xl font-bold tracking-tight text-white font-sans">OGU <span className="text-ogu-cyan">PLATFORM</span></h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-mono">Web3 Industrial OS</p>
             </div>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold leading-tight mb-8">
            The Operating System for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ogu-cyan to-ogu-purple">Critical Infrastructure</span>
          </h2>

          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed mb-12 border-l-2 border-ogu-cyan/30 pl-6">
            Orchestrate autonomous agents for Vision, Maintenance, and Forecasting on a sovereign, immutable ledger. 
            <br/><br/>
            <span className="text-white font-medium">Fully ISO 45001 & NERC CIP Compliant.</span>
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-sm group hover:border-ogu-cyan/50 transition-all">
                <ShieldCheck className="text-ogu-cyan mb-3 group-hover:scale-110 transition-transform" size={24} />
                <h3 className="text-sm font-bold uppercase tracking-wide mb-1">Immutable Audit</h3>
                <p className="text-xs text-slate-400">SHA-256 cryptographic proof of every operational event.</p>
             </div>
             <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-sm group hover:border-ogu-purple/50 transition-all">
                <Cpu className="text-ogu-purple mb-3 group-hover:scale-110 transition-transform" size={24} />
                <h3 className="text-sm font-bold uppercase tracking-wide mb-1">Multi-Agent AI</h3>
                <p className="text-xs text-slate-400">Collaboration between Vision, NLP, and Predictive nodes.</p>
             </div>
             <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-sm group hover:border-ogu-green/50 transition-all">
                <Globe className="text-ogu-green mb-3 group-hover:scale-110 transition-transform" size={24} />
                <h3 className="text-sm font-bold uppercase tracking-wide mb-1">Web3 Secured</h3>
                <p className="text-xs text-slate-400">Payloads pinned to IPFS. Identity via MCP Protocol.</p>
             </div>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-4 text-xs text-slate-500 font-mono">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-ogu-green rounded-full animate-pulse shadow-[0_0_8px_#00FF9C]"></div>
              <span>MAINNET: ONLINE</span>
           </div>
           <span>•</span>
           <span>BLOCK: 14,205,102</span>
           <span>•</span>
           <span>LATENCY: 12ms</span>
        </div>
      </div>

      {/* Right Column: Login Terminal */}
      <div className="lg:w-2/5 bg-black/40 backdrop-blur-xl border-l border-white/10 p-12 lg:p-20 flex flex-col justify-center relative z-20">
         
         <div className="max-w-md mx-auto w-full">
            <div className="mb-10 text-center">
               <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto flex items-center justify-center border border-white/10 mb-6 shadow-[0_0_30px_rgba(0,229,255,0.1)]">
                  <Lock size={28} className="text-white" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Secure Access Terminal</h3>
               <p className="text-sm text-slate-400">Authenticate via Corporate ID or Wallet</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-ogu-cyan uppercase tracking-widest flex items-center gap-2">
                     <Activity size={10} /> Principal ID
                  </label>
                  <div className="relative">
                     <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-ogu-900/80 border border-white/10 rounded-lg py-4 px-4 pl-12 text-sm text-white focus:outline-none focus:border-ogu-cyan focus:bg-ogu-900 transition-all placeholder:text-slate-600"
                        placeholder="e.g. site_admin"
                     />
                     <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-ogu-purple uppercase tracking-widest flex items-center gap-2">
                     <Key size={10} /> Access Key
                  </label>
                  <div className="relative">
                     <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-ogu-900/80 border border-white/10 rounded-lg py-4 px-4 pl-12 text-sm text-white focus:outline-none focus:border-ogu-purple focus:bg-ogu-900 transition-all placeholder:text-slate-600 font-mono"
                        placeholder="••••••••••••"
                     />
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  </div>
               </div>

               {error && (
                  <div className="p-3 bg-ogu-red/10 border border-ogu-red/30 rounded text-xs text-ogu-red font-mono flex items-center gap-2 animate-pulse">
                     <ShieldCheck size={12} /> {error}
                  </div>
               )}

               <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-white text-black font-bold py-4 rounded-lg uppercase tracking-widest text-xs hover:bg-ogu-cyan hover:shadow-[0_0_20px_#00E5FF] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
               >
                  {isLoading ? (
                     <span className="animate-pulse">Handshaking...</span>
                  ) : (
                     <>Connect to Grid <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
               </button>

               <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                     <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                     <span className="bg-black px-2 text-slate-500">Or Connect With</span>
                  </div>
               </div>

               <button type="button" className="w-full py-3 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:bg-white/5 hover:border-white/30 transition-all flex items-center justify-center gap-2">
                  <Globe size={14} /> Web3 Wallet (Ledger/MetaMask)
               </button>

            </form>
         </div>

         {/* Footer */}
         <div className="absolute bottom-8 left-0 w-full text-center">
            <p className="text-[10px] text-slate-600 font-mono">
               Unauthorized access is a violation of NERC CIP-003-8. <br/>
               Events are logged to the immutable audit chain.
            </p>
         </div>

      </div>
    </div>
  );
};