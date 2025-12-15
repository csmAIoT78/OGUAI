import React, { useState, useEffect } from 'react';
import { AuditRecord } from '../types';
import { FileText, Check, X, ExternalLink, Box, Search, Filter, ShieldCheck, Download, Activity, Eye, Database, Link as LinkIcon, Server, Lock, Clock } from 'lucide-react';

interface AuditLogProps {
  records: AuditRecord[];
  onInteraction?: (action: string, detail: string) => void;
}

export const AuditLog: React.FC<AuditLogProps> = ({ records, onInteraction }) => {
  const [filter, setFilter] = useState<'ALL' | 'COMPLIANT' | 'VIOLATION'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);

  useEffect(() => {
    onInteraction?.('Navigated', 'Entered Ledger Audit Interface');
  }, []);

  const filteredRecords = records.filter(r => {
    // Filter Logic
    const matchesFilter = 
      filter === 'ALL' ? true : 
      filter === 'COMPLIANT' ? r.result.compliant : 
      !r.result.compliant;
    
    // Search Logic (Robust ID/Hash matching)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      searchTerm === '' ||
      r.id.toLowerCase().includes(searchLower) || 
      r.imageHash.toLowerCase().includes(searchLower) ||
      r.ipfsCid.toLowerCase().includes(searchLower) ||
      r.result.detected_items.some(i => i.toLowerCase().includes(searchLower));

    return matchesFilter && matchesSearch;
  });

  const handleVerify = (id: string, hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onInteraction?.('Action', `Verified Chain Record ${id.substring(0,6)}`);
    window.open(`https://etherscan.io/tx/${hash}`, '_blank');
  };

  const handleExport = () => {
    onInteraction?.('Process', 'Exported Regulatory Compliance Report (CSV)');
    
    // Generate simple CSV
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Timestamp,Block,Compliance,Hash\n"
      + records.map(r => `${r.id},${new Date(r.timestamp).toISOString()},${r.blockNumber},${r.result.compliant ? 'PASS' : 'FAIL'},${r.imageHash}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ogu_compliance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDetail = (record: AuditRecord) => {
    setSelectedRecord(record);
    onInteraction?.('Action', `Opened Certificate of Analysis for ${record.id}`);
  };

  const closeDetail = () => {
    setSelectedRecord(null);
  };

  return (
    <div className="bg-ogu-950 rounded-xl border border-ogu-800 shadow-2xl overflow-hidden flex flex-col h-full relative font-sans">
      
      {/* Header Toolbar */}
      <div className="p-6 border-b border-ogu-800 bg-ogu-900/50 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <Box className="text-ogu-cyan" />
             Immutable Audit Ledger
           </h2>
           <div className="flex items-center gap-2 mt-1">
             <span className="w-1.5 h-1.5 bg-ogu-green rounded-full animate-pulse shadow-[0_0_5px_#00FF9C]"></span>
             <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
               Consensus Layer: OGU_Mainnet_Alpha
             </p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           {/* Search */}
           <div className="relative">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
             <input 
               type="text" 
               placeholder="Search Hash / ID..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-black/40 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-ogu-cyan/50 w-48 transition-all"
             />
           </div>

           {/* Filters */}
           <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
              {(['ALL', 'COMPLIANT', 'VIOLATION'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); onInteraction?.('Filter', `Changed View to ${f}`); }}
                  className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                    filter === f 
                    ? 'bg-ogu-cyan/20 text-ogu-cyan shadow-[0_0_10px_rgba(0,229,255,0.2)]' 
                    : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
           </div>

           <button 
             onClick={handleExport}
             className="p-2 text-slate-400 hover:text-ogu-cyan border border-white/10 rounded-lg hover:bg-white/5 transition-colors" 
             title="Export Regulatory Report"
           >
              <Download size={16} />
           </button>
        </div>
      </div>
      
      {/* Table Area */}
      <div className="overflow-y-auto flex-grow bg-ogu-950 custom-scrollbar">
        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
               <ShieldCheck size={32} className="opacity-20" />
             </div>
             <p className="text-sm font-mono tracking-widest uppercase">No immutable records found</p>
             <p className="text-xs opacity-50 mt-2">Try adjusting filters or initiate scans in Vision Agent.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-ogu-900/80 text-[10px] text-slate-400 uppercase font-semibold sticky top-0 backdrop-blur-md z-10 tracking-widest border-b border-ogu-800">
              <tr>
                <th className="p-4">Timestamp / Block</th>
                <th className="p-4">Compliance Status</th>
                <th className="p-4">Detected Entities</th>
                <th className="p-4">Proof (IPFS CID)</th>
                <th className="p-4">Content Hash</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ogu-800/50">
              {filteredRecords.slice().reverse().map((record) => (
                <tr 
                  key={record.id} 
                  onClick={() => openDetail(record)}
                  className="hover:bg-ogu-cyan/5 transition-colors font-mono text-xs cursor-pointer group"
                >
                  <td className="p-4 text-slate-300">
                    <div className="flex flex-col">
                      <span className="text-white font-bold">{new Date(record.timestamp).toLocaleTimeString()}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Box size={10} className="text-ogu-cyan" /> #{record.blockNumber}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wide ${
                      record.result.compliant 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {record.result.compliant ? <Check size={10} /> : <X size={10} />}
                      {record.result.compliant ? 'PASSED' : 'VIOLATION'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    <div className="flex flex-wrap gap-1">
                      {record.result.detected_items.length > 0 
                        ? record.result.detected_items.map((item, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] border border-white/5">
                              {item}
                            </span>
                          ))
                        : <span className="opacity-50">-</span>
                      }
                    </div>
                  </td>
                  <td className="p-4 text-ogu-purple/70 truncate max-w-[150px]">
                    <div className="flex items-center gap-1">
                       <Database size={10} /> 
                       {record.ipfsCid.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 group/hash">
                      <span className="text-slate-500 group-hover/hash:text-ogu-cyan transition-colors truncate max-w-[120px] font-mono">
                        {record.imageHash}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={(e) => handleVerify(record.id, record.imageHash, e)}
                      className="text-[10px] bg-black/40 hover:bg-ogu-cyan/20 hover:text-ogu-cyan text-slate-400 border border-white/10 px-3 py-1.5 rounded transition-all flex items-center gap-2 ml-auto"
                    >
                      <ExternalLink size={10} />
                      Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Certificate Detail Modal */}
      {selectedRecord && (
        <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-fadeIn">
           <div className="bg-ogu-900 border border-ogu-cyan/30 w-full max-w-3xl max-h-full overflow-y-auto rounded-xl shadow-2xl relative flex flex-col font-sans">
              
              {/* Certificate Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-start bg-ogu-950 relative overflow-hidden">
                 {/* Watermark */}
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <ShieldCheck size={120} />
                 </div>

                 <div className="flex items-center gap-4 relative z-10">
                    <div className={`p-4 rounded-full border-2 ${selectedRecord.result.compliant ? 'bg-ogu-green/10 border-ogu-green text-ogu-green' : 'bg-ogu-red/10 border-ogu-red text-ogu-red'}`}>
                       <ShieldCheck size={32} />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-white uppercase tracking-widest">Certificate of Analysis</h3>
                       <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                          <span>REF: {selectedRecord.id.substring(0,8).toUpperCase()}</span>
                          <span className="text-ogu-cyan">•</span>
                          <span>ISO 45001 COMPLIANT</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={closeDetail} className="text-slate-500 hover:text-white p-2 z-10">
                    <X size={24} />
                 </button>
              </div>

              {/* Certificate Body */}
              <div className="p-8 space-y-8 bg-gradient-to-br from-ogu-900 to-black">
                 
                 {/* Chain of Custody Timeline */}
                 <div>
                    <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
                      <LinkIcon size={12} /> Chain of Custody
                    </h4>
                    <div className="relative flex justify-between items-center text-center">
                       {/* Line */}
                       <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0"></div>
                       
                       {/* Step 1: Capture */}
                       <div className="relative z-10 bg-ogu-900 p-2">
                          <div className="w-8 h-8 rounded-full bg-ogu-cyan/20 border border-ogu-cyan text-ogu-cyan flex items-center justify-center mx-auto mb-2">
                             <Eye size={14} />
                          </div>
                          <span className="text-[10px] text-slate-300 block font-bold">Data Capture</span>
                          <span className="text-[9px] text-slate-500 block">{new Date(selectedRecord.timestamp).toLocaleTimeString()}</span>
                       </div>

                       {/* Step 2: Inference */}
                       <div className="relative z-10 bg-ogu-900 p-2">
                          <div className="w-8 h-8 rounded-full bg-ogu-purple/20 border border-ogu-purple text-ogu-purple flex items-center justify-center mx-auto mb-2">
                             <BrainCircuitIcon />
                          </div>
                          <span className="text-[10px] text-slate-300 block font-bold">AI Inference</span>
                          <span className="text-[9px] text-slate-500 block">YOLOv8 + DeepSORT</span>
                       </div>

                       {/* Step 3: Storage */}
                       <div className="relative z-10 bg-ogu-900 p-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 text-blue-500 flex items-center justify-center mx-auto mb-2">
                             <Server size={14} />
                          </div>
                          <span className="text-[10px] text-slate-300 block font-bold">IPFS Storage</span>
                          <span className="text-[9px] text-slate-500 block">CID Generated</span>
                       </div>

                       {/* Step 4: Consensus */}
                       <div className="relative z-10 bg-ogu-900 p-2">
                          <div className="w-8 h-8 rounded-full bg-ogu-green/20 border border-ogu-green text-ogu-green flex items-center justify-center mx-auto mb-2">
                             <Lock size={14} />
                          </div>
                          <span className="text-[10px] text-slate-300 block font-bold">Finality</span>
                          <span className="text-[9px] text-slate-500 block">Block #{selectedRecord.blockNumber}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Risk Assessment */}
                    <div className="bg-white/5 border border-white/5 p-5 rounded-lg">
                        <h4 className="text-xs text-ogu-cyan font-bold uppercase mb-3 flex items-center gap-2">
                          <Activity size={12} /> Risk Assessment
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed font-sans mb-4">
                           "{selectedRecord.result.risk_assessment}"
                        </p>
                        <div className="p-3 bg-black/40 rounded border border-white/5">
                           <h5 className="text-[10px] text-slate-500 uppercase mb-1">Recommendation</h5>
                           <p className="text-xs text-white">{selectedRecord.result.recommendation}</p>
                        </div>
                    </div>

                    {/* Cryptographic Evidence */}
                    <div className="bg-white/5 border border-white/5 p-5 rounded-lg font-mono text-xs space-y-3">
                        <h4 className="text-xs text-ogu-purple font-bold uppercase mb-3 flex items-center gap-2 font-sans">
                          <Lock size={12} /> Cryptographic Proof
                        </h4>
                        <div>
                           <span className="text-slate-500 block mb-1">Smart Contract</span>
                           <span className="text-white bg-black/40 px-2 py-1 rounded block truncate">{selectedRecord.contractAddress}</span>
                        </div>
                        <div>
                           <span className="text-slate-500 block mb-1">Image Hash (SHA-256)</span>
                           <span className="text-ogu-cyan bg-black/40 px-2 py-1 rounded block truncate">{selectedRecord.imageHash}</span>
                        </div>
                        <div>
                           <span className="text-slate-500 block mb-1">Agent Signature</span>
                           <span className="text-ogu-purple bg-black/40 px-2 py-1 rounded block truncate">{selectedRecord.agentSignature}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                           <span className="text-slate-500">Gas Used: {selectedRecord.gasUsed}</span>
                           <span className="text-slate-500">Network: OGU_Mainnet</span>
                        </div>
                    </div>
                 </div>

              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-white/10 bg-ogu-950 flex justify-between items-center">
                 <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <Clock size={12} />
                    <span>Retained for 7 years (Reg. 1910.1020)</span>
                 </div>
                 <div className="flex gap-3">
                    <button onClick={handleExport} className="px-4 py-2 rounded text-xs font-bold text-slate-300 border border-white/10 hover:bg-white/5 flex items-center gap-2">
                        <Download size={14} /> Download PDF
                    </button>
                    <button onClick={(e) => handleVerify(selectedRecord.id, selectedRecord.imageHash, e)} className="px-4 py-2 rounded text-xs font-bold text-black bg-ogu-cyan hover:bg-cyan-400 flex items-center gap-2">
                        <ExternalLink size={14} /> View On Explorer
                    </button>
                 </div>
              </div>

           </div>
        </div>
      )}
    </div>
  );
};

const BrainCircuitIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 3 2.5 2.5 0 0 0 .38 3.04A2.5 2.5 0 0 0 4.5 19.5h15a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0 .38-3.04 2.5 2.5 0 0 0-1.32-3 2.5 2.5 0 0 0-1.98-3 2.5 2.5 0 0 0-4.96.46" />
    <path d="M12 10v4" />
    <path d="M12 14c-1.7 0-3 1.3-3 3" />
    <path d="M12 14c1.7 0 3 1.3 3 3" />
    <circle cx="9" cy="17" r="1" />
    <circle cx="15" cy="17" r="1" />
  </svg>
);