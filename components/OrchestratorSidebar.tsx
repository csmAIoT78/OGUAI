import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, X, ChevronRight, Activity, Terminal } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { ChatMessage, InteractionEvent } from '../types';

interface OrchestratorSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentApp: string;
  interactionHistory: InteractionEvent[];
}

export const OrchestratorSidebar: React.FC<OrchestratorSidebarProps> = ({ 
  isOpen, 
  onToggle,
  currentApp,
  interactionHistory 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      text: '**ORCHESTRATOR_ONLINE**\nSystem initialized. Monitoring session telemetry across OGU Platform.\n\nAwaiting command input...', 
      timestamp: Date.now() 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: inputValue, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const responseText = await GeminiService.orchestratorChat(inputValue, {
      currentApp,
      history: interactionHistory
    });

    const aiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  // Helper to parse simple bold markdown
  const renderMessageText = (text: string) => {
    return text.split('**').map((part, i) => 
      i % 2 === 1 ? <span key={i} className="font-bold text-ogu-cyan dark:text-white dark:shadow-[0_0_8px_rgba(255,255,255,0.2)]">{part}</span> : part
    );
  };

  return (
    <div className={`fixed right-0 top-16 bottom-0 z-30 transition-all duration-300 ease-in-out border-l border-light-border dark:border-white/5 bg-light-panel/95 dark:bg-ogu-950/95 backdrop-blur-xl flex flex-col shadow-2xl ${isOpen ? 'w-96 translate-x-0' : 'w-0 translate-x-full overflow-hidden'}`}>
      
      {/* Toggle Handle (Visible when closed) */}
      {!isOpen && (
        <button 
          onClick={onToggle}
          className="fixed right-0 top-24 bg-light-panel/90 dark:bg-ogu-900/90 border-l border-t border-b border-light-border dark:border-white/10 rounded-l-lg p-3 text-ogu-cyan hover:text-black dark:hover:text-white transition-all hover:pr-4 group shadow-lg dark:shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
          <Bot size={20} className="group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Main Content */}
      <div className="flex flex-col h-full w-full">
        
        {/* Header */}
        <div className="h-16 border-b border-light-border dark:border-white/10 flex items-center justify-between px-6 bg-slate-100/50 dark:bg-black/40">
          <div className="flex items-center gap-3">
            <div className="relative">
               <Sparkles size={18} className="text-ogu-cyan" />
               <div className="absolute inset-0 bg-ogu-cyan blur-md opacity-40 animate-pulse"></div>
            </div>
            <div>
               <span className="font-bold text-sm tracking-[0.15em] text-light-text dark:text-white uppercase block">Orchestrator</span>
               <span className="text-[9px] text-light-subtext dark:text-slate-500 font-mono">v4.1.0 • NEURAL LINK ACTIVE</span>
            </div>
          </div>
          <button onClick={onToggle} className="text-light-subtext dark:text-slate-500 hover:text-light-text dark:hover:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Context Status Bar */}
        <div className="bg-slate-200/50 dark:bg-black/60 px-4 py-2 border-b border-light-border dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-light-subtext dark:text-slate-400">
           <div className="flex items-center gap-2">
             <Activity size={10} className="text-ogu-green animate-pulse" />
             <span>CONTEXT: <span className="text-ogu-cyan uppercase">{currentApp}</span></span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-ogu-green"></div>
              <span>ONLINE</span>
           </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-light-bg dark:bg-gradient-to-b dark:from-ogu-950 dark:to-black">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Message Bubble */}
              <div className={`max-w-[95%] relative group ${
                msg.role === 'user' 
                  ? 'bg-ogu-cyan/10 dark:bg-ogu-cyan/5 text-slate-800 dark:text-slate-200 border border-ogu-cyan/20 rounded-xl rounded-tr-none ml-8' 
                  : 'bg-white dark:bg-white/5 text-ogu-green dark:text-ogu-green border-l-2 border-ogu-green rounded-r-xl mr-4 font-mono shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
              }`}>
                {msg.role === 'model' && (
                   <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 rounded-tr-xl">
                      <Terminal size={10} />
                      <span className="text-[9px] uppercase tracking-widest text-ogu-green/50">System_Response</span>
                   </div>
                )}
                
                <div className={`p-4 text-xs leading-relaxed ${msg.role === 'model' ? 'whitespace-pre-wrap' : ''}`}>
                  {renderMessageText(msg.text)}
                </div>
              </div>

              {/* Timestamp */}
              <span className="text-[9px] text-slate-500 dark:text-slate-700 mt-2 px-1 font-mono">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
          
          {isTyping && (
             <div className="flex items-start gap-3 animate-fadeIn">
                <div className="bg-white dark:bg-white/5 border-l-2 border-ogu-purple p-4 rounded-r-xl flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-ogu-purple rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-ogu-purple rounded-full animate-bounce delay-75"></div>
                   <div className="w-1.5 h-1.5 bg-ogu-purple rounded-full animate-bounce delay-150"></div>
                   <span className="text-[10px] text-ogu-purple font-mono ml-2 uppercase tracking-widest">Computing...</span>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-light-border dark:border-white/10 bg-slate-100 dark:bg-black/40 backdrop-blur-md">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Input system command..."
              className="w-full bg-white dark:bg-ogu-900/50 border border-slate-300 dark:border-white/10 rounded-lg pl-4 pr-12 py-4 text-xs font-mono text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-ogu-cyan/50 focus:bg-white dark:focus:bg-black/80 transition-all shadow-inner"
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-ogu-cyan hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors hover:bg-ogu-cyan/10 rounded-md"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="text-center mt-2">
             <p className="text-[9px] text-slate-500 dark:text-slate-700 font-mono">SECURE CHANNEL // ENCRYPTED // LOGGED</p>
          </div>
        </div>
      </div>
    </div>
  );
};