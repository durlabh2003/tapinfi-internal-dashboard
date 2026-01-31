'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Database, Zap, Search, 
  UploadCloud, History, Shield, Terminal, LogOut, User
} from 'lucide-react';

// --- Import All Components ---
import SmartUploader from '../components/SmartUploader';
import DataRequest from '../components/DataRequest';
import SlotManager from '../components/SlotManager';
import AdminPanel from '../components/AdminPanel';
import GlobalSearch from '../components/GlobalSearch';
import LoginGate from '../components/LoginGate'; // <--- The Security Gate

// Define the User type so TypeScript is happy
interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Page() {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // --- Dashboard State ---
  const [activeModule, setActiveModule] = useState('request');
  const [stats, setStats] = useState({ total: 0, used: 0, unused: 0 });

  // Fetch Live Stats (Only runs if user is logged in)
  const fetchStats = useCallback(async () => {
    const { data } = await supabase.from('contact_stats').select('*').single();
    if (data) setStats({ 
        total: data.total_contacts, 
        used: data.used_contacts, 
        unused: data.unused_contacts 
    });
  }, []);

  useEffect(() => { 
    if(currentUser) void fetchStats(); 
  }, [currentUser, fetchStats]);

  // --- LEVEL 1 SECURITY: THE LOGIN GATE ---
  // If no user is logged in, show the Login Screen
  if (!currentUser) {
    return (
      <LoginGate 
        onLoginSuccess={(user) => setCurrentUser(user)} 
      />
    );
  }

  // --- LEVEL 2: THE DASHBOARD (Authorized Access) ---
  const modules = [
    { id: 'request', label: 'Request Data', icon: Zap },
    { id: 'add', label: 'Add Data', icon: UploadCloud },
    { id: 'slots', label: 'Slots Info', icon: History },
    { id: 'admin', label: 'Admin Panel', icon: Shield },
    { id: 'search', label: 'Global Search', icon: Search },
  ];

  return (
    <main className="min-h-screen p-8 bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg text-black shadow-lg shadow-white/10">
                    <Terminal size={24} strokeWidth={3} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Campaign Manager</h1>
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mt-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        SESSION ACTIVE: {currentUser.name.toUpperCase()}
                    </div>
                </div>
            </div>
            
            <button 
                onClick={() => window.location.reload()} // Simple logout by reload
                className="group flex items-center gap-2 text-sm text-slate-500 hover:text-red-400 transition-colors px-4 py-2 hover:bg-red-950/20 rounded-lg"
            >
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform"/> 
                Sign Out
            </button>
        </div>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Database size={64} />
                </div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Database</div>
                <div className="text-4xl font-black">{stats.total.toLocaleString()}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <History size={64} />
                </div>
                <div className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">Used Contacts</div>
                <div className="text-4xl font-black">{stats.used.toLocaleString()}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap size={64} />
                </div>
                <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Fresh Contacts</div>
                <div className="text-4xl font-black">{stats.unused.toLocaleString()}</div>
            </div>
        </div>

        {/* --- Module Navigation --- */}
        <div>
            <div className="flex flex-wrap gap-2 mb-6 bg-slate-900 p-1.5 rounded-xl w-fit border border-slate-800">
                {modules.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setActiveModule(m.id)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all
                            ${activeModule === m.id 
                                ? 'bg-white text-black shadow-lg' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <m.icon size={16} strokeWidth={activeModule === m.id ? 3 : 2} />
                        {m.label}
                    </button>
                ))}
            </div>

            {/* --- Main Workspace Content --- */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 min-h-[500px] shadow-2xl">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeModule === 'request' && <DataRequest onRefresh={fetchStats} />}
                    
                    {activeModule === 'add' && <SmartUploader onRefresh={fetchStats} />}
                    
                    {activeModule === 'slots' && <SlotManager onRefresh={fetchStats} />}
                    
                    {activeModule === 'admin' && <AdminPanel />}
                    
                    {activeModule === 'search' && <GlobalSearch />}
                </div>
            </div>
        </div>

      </div>
    </main>
  );
}