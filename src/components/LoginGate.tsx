'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Smartphone, ShieldCheck, RefreshCw } from 'lucide-react';

interface LoginGateProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginGate({ onLoginSuccess }: LoginGateProps) {
  const [step, setStep] = useState<'credentials' | 'otp' | 'forgot'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // --- LOGIC (Unchanged) ---
  const handleLoginCheck = async () => {
    if (!email || !password) return alert("Please enter email and password");
    setLoading(true);

    const { data: userProfile, error: dbError } = await supabase
      .from('app_users').select('*').eq('email', email).single();

    if (dbError || !userProfile) {
      setLoading(false);
      return alert("User not found in staff database.");
    }
    if (userProfile.password !== password) {
      setLoading(false);
      return alert("Incorrect Password.");
    }

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email,
      options: { shouldCreateUser: true } 
    });

    setLoading(false);
    if (authError) alert('Error sending OTP: ' + authError.message);
    else setStep('otp');
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    setLoading(false);

    if (error) alert('Invalid Code. Please try again.');
    else if (data.user) {
      const { data: finalProfile } = await supabase
        .from('app_users').select('*').eq('email', email).single();
      if (finalProfile) onLoginSuccess(finalProfile);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return alert("Please enter your email first.");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    setLoading(false);
    if (error) alert(error.message);
    else alert(`Password reset link sent to ${email}`);
    setStep('credentials');
  };

  // --- UI: INCREASED SPACING VERSION ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white font-sans py-10">
      
      {/* OUTER CONTAINER 
         - Increased max-width to 400px for breathing room
         - gap-10 forces a big space between the Login Box and the Footer Box 
      */}
      <div className="w-full max-w-[400px] flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* OTP Graphic */}
        {step === 'otp' && (
           <div className="mx-auto mb-8 p-8 bg-slate-900 rounded-full border border-slate-800 animate-bounce">
              <Smartphone size={48} className="text-blue-500" />
           </div>
        )}

        {/* --- MAIN LOGIN CARD --- */}
        <div className="bg-black border border-slate-800 rounded-xl sm:bg-slate-950/50 sm:border-slate-800 px-12 py-14 shadow-2xl flex flex-col items-center">
            
            {/* Logo - Added huge bottom margin */}
            <h1 className="text-5xl font-bold font-serif italic mb-12 tracking-tighter">
                Nexus<span className="text-blue-500 not-italic font-sans">Campaign</span>
            </h1>

            {/* --- STEP 1: CREDENTIALS --- */}
            {step === 'credentials' && (
                <div className="w-full flex flex-col gap-5"> {/* Gap-5 puts space between inputs */}
                    
                    <div className="space-y-4"> {/* Extra Wrapper for inputs */}
                        <input 
                            type="email" 
                            placeholder="Phone number, username, or email"
                            className="w-full bg-slate-900 border border-slate-700 rounded-[6px] text-sm p-4 focus:border-slate-500 outline-none transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input 
                            type="password" 
                            placeholder="Password"
                            className="w-full bg-slate-900 border border-slate-700 rounded-[6px] text-sm p-4 focus:border-slate-500 outline-none transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={handleLoginCheck}
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base font-bold py-3 rounded-lg mt-6 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? <RefreshCw className="animate-spin w-5 h-5"/> : 'Log in'}
                    </button>

                    {/* Divider - Huge Vertical Margins */}
                    <div className="w-full flex items-center gap-4 my-10">
                        <div className="h-px bg-slate-800 flex-1"></div>
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">OR</span>
                        <div className="h-px bg-slate-800 flex-1"></div>
                    </div>

                    <button onClick={() => setStep('forgot')} className="text-sm text-slate-400 w-full text-center hover:text-white">
                        Forgot password?
                    </button>
                </div>
            )}

            {/* --- STEP 2: OTP --- */}
            {step === 'otp' && (
                <div className="w-full flex flex-col gap-8 text-center">
                    <div>
                         <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                         <p className="text-lg font-bold">Enter Security Code</p>
                         <p className="text-sm text-slate-400 mt-2">Sent to {email}</p>
                    </div>

                    <input 
                        type="text" 
                        placeholder="00000000"
                        maxLength={8}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg text-center text-3xl tracking-[0.5em] p-5 focus:border-blue-500 outline-none font-mono"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />

                    <button 
                        onClick={handleVerifyOtp}
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base font-bold py-4 rounded-lg transition-all"
                    >
                        {loading ? 'Verifying...' : 'Confirm Identity'}
                    </button>

                    <button onClick={() => setStep('credentials')} className="text-sm text-blue-400 hover:text-white mt-4">
                        Back to Login
                    </button>
                </div>
            )}

             {/* --- STEP 3: FORGOT PASSWORD --- */}
             {step === 'forgot' && (
                <div className="w-full flex flex-col gap-6 text-center">
                    <div className="mb-6">
                        <Lock className="w-24 h-24 border-4 border-slate-800 rounded-full p-6 mx-auto mb-6 text-white" />
                        <h3 className="text-lg font-bold text-white">Trouble logging in?</h3>
                        <p className="text-sm text-slate-400 mt-4 px-2 leading-relaxed">Enter your email and we will send you a link to get back into your account.</p>
                    </div>

                    <input 
                        type="email" 
                        placeholder="Email"
                        className="w-full bg-slate-900 border border-slate-700 rounded-[6px] text-sm p-4 focus:border-slate-500 outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <button onClick={handleForgotPassword} className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-3 rounded-lg">
                        {loading ? 'Sending...' : 'Send Login Link'}
                    </button>

                    <div className="w-full flex items-center gap-4 my-8">
                        <div className="h-px bg-slate-800 flex-1"></div>
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">OR</span>
                        <div className="h-px bg-slate-800 flex-1"></div>
                    </div>

                    <button onClick={() => setStep('credentials')} className="text-sm text-white font-bold hover:text-slate-300">
                        Create New Account
                    </button>
                    
                    <button onClick={() => setStep('credentials')} className="block w-full text-sm text-white border border-slate-700 py-4 rounded mt-10 hover:bg-slate-900 transition-colors">
                        Back to Login
                    </button>
                </div>
            )}
        </div>

        {/* --- FOOTER AREA --- */}
        <div className="bg-black border border-slate-800 rounded-xl sm:bg-slate-950/50 sm:border-slate-800 p-8 text-center">
            <p className="text-sm text-slate-400">
                Authorized Personnel Only. <span className="text-blue-500 cursor-pointer font-bold hover:underline">Contact Admin</span> for access.
            </p>
        </div>



      </div>
    </div>
  );
}