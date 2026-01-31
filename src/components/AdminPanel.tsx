'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, UserPlus, Shield, AlertTriangle, Lock, CheckCircle2 } from 'lucide-react';

// --- 1. Strict Type Definitions ---
interface AppUser {
  id: string;
  name: string;
  email: string;
  contact_number: string;
  role: string;
  created_at: string;
}

// Union type for safe action handling
type PendingAction = 
  | { type: 'add'; payload: { name: string; email: string; role: string; contact_number: string; password: string } }
  | { type: 'remove'; payload: string };

export default function AdminPanel() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // --- Security State ---
  const [securityMode, setSecurityMode] = useState<'idle' | 'admin_pass' | 'tapinfi_otp'>('idle');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  
  // --- Form State ---
  const [newUser, setNewUser] = useState({ name: '', email: '', contact_number: '', role: 'Staff', password: '' });

  // Load Users
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setUsers(data as AppUser[]);
    };
    fetchUsers();
  }, [refreshKey]);

  // --- Step 1: Initiate Action ---
  const initiateAdd = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
        alert('All fields (Name, Email, Password) are required');
        return;
    }
    setPendingAction({ type: 'add', payload: newUser });
    setSecurityMode('admin_pass');
  };

  const initiateRemove = (id: string) => {
    setPendingAction({ type: 'remove', payload: id });
    setSecurityMode('admin_pass');
  };

  // --- Step 2: Verify Master Password -> Trigger Email OTP ---
  const handlePasswordSubmit = () => {
    if (!adminPassword) return alert("Please enter the Master Admin Password");

    // Generate 6-digit Code
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    // SIMULATION: In production, this would call your Email API
    alert(`🚨 SECURITY VAULT\n\nTo: tapinfi@gmail.com\nAction: Authorization Request\n\nSECURE OTP: ${newOtp}`);
    
    setSecurityMode('tapinfi_otp');
  };

  // --- Step 3: Verify OTP -> Execute Database Change ---
  const handleOtpSubmit = async () => {
    if (otp !== generatedOtp) return alert("Invalid Security OTP");
    if (!pendingAction) return;

    if (pendingAction.type === 'add') {
        const { error } = await supabase.from('app_users').insert(pendingAction.payload);
        if (error) {
            alert('Error adding user: ' + error.message);
        } else {
            setNewUser({ name: '', email: '', contact_number: '', role: 'Staff', password: '' });
        }
    } else if (pendingAction.type === 'remove') {
        const { error } = await supabase.from('app_users').delete().eq('id', pendingAction.payload);
        if (error) {
             alert('Error removing user: ' + error.message);
        }
    }

    // Reset All Security States
    setSecurityMode('idle');
    setPendingAction(null);
    setAdminPassword('');
    setOtp('');
    setRefreshKey(prev => prev + 1); // Trigger Refresh
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-200">
      
      {/* --- SECURITY VAULT MODAL (Overlay) --- */}
      {securityMode !== 'idle' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-900 border border-red-500/50 p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                
                {/* Header */}
                <div className="flex items-center gap-3 text-red-500 mb-6 pb-4 border-b border-red-900/30">
                    <Shield className="w-8 h-8" />
                    <div>
                        <h2 className="text-xl font-bold text-white">Security Vault</h2>
                        <p className="text-xs text-red-400">Restricted Admin Action</p>
                    </div>
                </div>
                
                {/* Phase 1: Password */}
                {securityMode === 'admin_pass' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-red-950/30 rounded border border-red-900/50 flex gap-3">
                            <Lock className="text-red-500 shrink-0" size={20} />
                            <p className="text-sm text-slate-300">Enter Master Password to authorize this change.</p>
                        </div>
                        <input 
                            type="password" 
                            placeholder="Master Password" 
                            autoFocus
                            className="w-full p-4 bg-black border border-slate-700 rounded-lg text-white focus:border-red-500 outline-none transition-colors"
                            value={adminPassword} 
                            onChange={e => setAdminPassword(e.target.value)} 
                        />
                        <button 
                            onClick={handlePasswordSubmit} 
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            Verify Identity
                        </button>
                    </div>
                )}

                {/* Phase 2: OTP */}
                {securityMode === 'tapinfi_otp' && (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-500 mb-2">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Verification Required</h3>
                            <p className="text-sm text-slate-400">Code sent to <b className="text-white">tapinfi@gmail.com</b></p>
                        </div>

                        <input 
                            type="text" 
                            placeholder="0 0 0 0 0 0" 
                            maxLength={6}
                            autoFocus
                            className="w-full p-4 bg-black border border-slate-700 rounded-lg text-center text-2xl tracking-[0.5em] font-mono text-white focus:border-red-500 outline-none transition-colors"
                            value={otp} 
                            onChange={e => setOtp(e.target.value)} 
                        />
                        <button 
                            onClick={handleOtpSubmit} 
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={20}/> Confirm & Execute
                        </button>
                    </div>
                )}
                
                <button 
                    onClick={() => {
                        setSecurityMode('idle');
                        setPendingAction(null);
                    }} 
                    className="w-full text-slate-500 mt-6 text-sm hover:text-white transition-colors"
                >
                    Cancel Transaction
                </button>
            </div>
        </div>
      )}

      {/* --- LEFT COLUMN: Add User Form --- */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl h-fit">
        <h3 className="font-bold text-lg mb-6 text-orange-400 flex items-center gap-2">
            <UserPlus size={20}/> Add New User
        </h3>
        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-orange-500/50 outline-none mt-1" 
                   placeholder="John Doe" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-orange-500/50 outline-none mt-1" 
                   placeholder="john@tapinfi.com" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Initial Password</label>
                <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-orange-500/50 outline-none mt-1" 
                   type="password" placeholder="••••••••" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Role Permission</label>
                <select className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-orange-500/50 outline-none mt-1"
                   value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="Staff">Staff (Standard)</option>
                    <option value="Admin">Admin (Full Access)</option>
                </select>
            </div>
            <button onClick={initiateAdd} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-orange-900/20 mt-2">
                Secure Add User
            </button>
        </div>
      </div>

      {/* --- RIGHT COLUMN: User List --- */}
      <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-200">Active Personnel</h3>
            <span className="bg-slate-800 text-slate-400 text-xs px-3 py-1 rounded-full font-mono">{users.length} TOTAL</span>
        </div>
        
        <div className="space-y-3">
            {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                            ${u.role === 'Admin' ? 'bg-orange-900/30 text-orange-500' : 'bg-slate-800 text-slate-400'}`}>
                            {u.name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-slate-200">{u.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <span className={`px-3 py-1 rounded-md text-xs font-bold border
                            ${u.role === 'Admin' 
                                ? 'bg-orange-950/30 text-orange-400 border-orange-900/50' 
                                : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                            {u.role.toUpperCase()}
                        </span>
                        
                        <button 
                            onClick={() => initiateRemove(u.id)} 
                            className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-950/30 rounded transition-all"
                            title="Remove User"
                        >
                            <Trash2 size={18}/>
                        </button>
                    </div>
                </div>
            ))}
            
            {users.length === 0 && (
                <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                    No users found in the system.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}