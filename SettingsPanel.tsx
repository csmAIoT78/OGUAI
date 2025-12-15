import React, { useState } from 'react';
import { Settings, Users, Database, Shield, Upload, Save, X, Lock } from 'lucide-react';
import { DataService } from '../services/dataService';
import { ParsedSubstationData, ParsedEquipmentData } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDataInject: (type: 'substation' | 'equipment', data: any[]) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, onDataInject }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [uploadStatus, setUploadStatus] = useState<string>('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'AdminOGU' && password === 'OS_@2025') {
      setIsAuthenticated(true);
    } else {
      alert('Access Denied: Invalid Credentials');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'substation' | 'equipment') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (type === 'substation') {
          const data = DataService.parseSubstationCSV(text);
          onDataInject('substation', data);
          setUploadStatus(`Success: ${data.length} Substation records loaded.`);
        } else {
          const data = DataService.parseEquipmentCSV(text);
          onDataInject('equipment', data);
          setUploadStatus(`Success: ${data.length} Equipment records loaded.`);
        }
      } catch (err) {
        setUploadStatus('Error: Invalid CSV Format');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
        <div className="bg-ogu-900 border border-ogu-red/30 p-8 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(255,23,68,0.1)] relative overflow-hidden">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-ogu-red/10 rounded-full flex items-center justify-center mb-4 border border-ogu-red/30">
              <Lock size={32} className="text-ogu-red" />
            </div>
            <h2 className="text-xl font-bold text-white">Restricted Access</h2>
            <p className="text-xs text-slate-500 mt-1">Admin Credentials Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Admin ID</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white text-sm focus:border-ogu-red/50 focus:outline-none"
                placeholder="Enter ID..."
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Security Key</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white text-sm focus:border-ogu-red/50 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="w-full bg-ogu-red hover:bg-red-600 text-black font-bold uppercase tracking-widest py-3 rounded mt-2 transition-colors">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-ogu-950 border border-white/10 w-full max-w-4xl h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40">
           <div className="flex items-center gap-3">
              <Settings size={20} className="text-ogu-cyan" />
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Platform Configuration</h2>
           </div>
           <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
           {/* Sidebar */}
           <div className="w-64 bg-ogu-900/50 border-r border-white/10 p-4 space-y-2">
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-ogu-cyan/10 text-ogu-cyan border border-ogu-cyan/20' : 'text-slate-500 hover:text-white'}`}
              >
                <Users size={16} /> User Roles
              </button>
              <button 
                onClick={() => setActiveTab('data')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'data' ? 'bg-ogu-purple/10 text-ogu-purple border border-ogu-purple/20' : 'text-slate-500 hover:text-white'}`}
              >
                <Database size={16} /> Data Ingestion
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-ogu-green/10 text-ogu-green border border-ogu-green/20' : 'text-slate-500 hover:text-white'}`}
              >
                <Shield size={16} /> Security Rules
              </button>
           </div>

           {/* Content */}
           <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-ogu-950 to-black">
              {activeTab === 'users' && (
                 <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white mb-4">Identity & Access Management</h3>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                       <table className="w-full text-left text-xs text-slate-300">
                          <thead className="text-[10px] text-slate-500 uppercase border-b border-white/10">
                             <tr>
                                <th className="pb-2">User Principal</th>
                                <th className="pb-2">Role</th>
                                <th className="pb-2">Status</th>
                                <th className="pb-2 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                             <tr className="h-10">
                                <td>admin_core@ogu.os</td>
                                <td className="text-ogu-red font-bold">SYS_ADMIN</td>
                                <td><span className="bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded text-[10px]">ACTIVE</span></td>
                                <td className="text-right"><button className="text-slate-400 hover:text-white">Edit</button></td>
                             </tr>
                             <tr className="h-10">
                                <td>op_field_01@ogu.os</td>
                                <td className="text-ogu-cyan font-bold">OPERATOR</td>
                                <td><span className="bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded text-[10px]">ACTIVE</span></td>
                                <td className="text-right"><button className="text-slate-400 hover:text-white">Edit</button></td>
                             </tr>
                          </tbody>
                       </table>
                       <button className="mt-4 w-full py-2 border border-dashed border-white/20 text-slate-500 text-xs hover:border-white/40 hover:text-white rounded transition-all">
                          + Add New Principal
                       </button>
                    </div>
                 </div>
              )}

              {activeTab === 'data' && (
                 <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white mb-4">External Data Streams</h3>
                    <p className="text-xs text-slate-400 mb-6">Upload raw telemetry logs to inject into DApp simulation layers. Supports standard CSV formats for Substations and Equipment.</p>

                    <div className="grid grid-cols-1 gap-6">
                       {/* Substation Upload */}
                       <div className="bg-ogu-cyan/5 border border-ogu-cyan/20 p-6 rounded-xl">
                          <h4 className="text-sm font-bold text-ogu-cyan mb-2 flex items-center gap-2">
                             <Upload size={16} /> Substation Telemetry
                          </h4>
                          <p className="text-[10px] text-slate-500 mb-4">Target: Outage Forecaster DApp</p>
                          <input 
                             type="file" 
                             accept=".csv"
                             onChange={(e) => handleFileUpload(e, 'substation')}
                             className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-ogu-cyan file:text-black hover:file:bg-cyan-400 cursor-pointer"
                          />
                       </div>

                       {/* Equipment Upload */}
                       <div className="bg-ogu-purple/5 border border-ogu-purple/20 p-6 rounded-xl">
                          <h4 className="text-sm font-bold text-ogu-purple mb-2 flex items-center gap-2">
                             <Upload size={16} /> Equipment Sensor Logs
                          </h4>
                          <p className="text-[10px] text-slate-500 mb-4">Target: Maintenance Predictor DApp</p>
                          <input 
                             type="file" 
                             accept=".csv"
                             onChange={(e) => handleFileUpload(e, 'equipment')}
                             className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-ogu-purple file:text-white hover:file:bg-purple-600 cursor-pointer"
                          />
                       </div>
                    </div>

                    {uploadStatus && (
                       <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded text-xs font-mono text-white flex items-center gap-2 animate-fadeIn">
                          <div className="w-2 h-2 bg-ogu-green rounded-full"></div>
                          {uploadStatus}
                       </div>
                    )}
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
