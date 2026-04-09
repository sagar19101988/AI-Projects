import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { User, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function AuthScreen() {
  const { login, continueAsGuest } = useAppStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isRegistering && !name) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const body = isRegistering ? { name, email, password } : { email, password };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Optionally, set the token somewhere if the backend needs to be called later
      console.log('JWT Token established:', data.token);
      
      // Inject user to global Zustand state
      login({ email: data.user.email, name: data.user.name });
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0F14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-[#0B0F19] border border-dark-600 rounded-2xl shadow-[0_0_20px_rgba(0,212,255,0.2)] mb-4">
            <ShieldCheck size={36} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-100">Test Orchestrator</h1>
          <p className="text-gray-400 mt-2">Secure Enterprise Access Payload</p>
        </div>

        <div className="bg-[#0B0F19] border border-dark-600 rounded-3xl shadow-2xl p-8 backdrop-blur-sm relative overflow-hidden">
          {/* Active Mode line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>

          <div className="flex bg-[#111726] rounded-xl p-1 mb-6 border border-dark-600">
            <button 
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isRegistering ? 'bg-[#232B3E] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isRegistering ? 'bg-[#232B3E] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold tracking-widest text-[#7B8296] uppercase mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><User size={18} /></div>
                    <input type="text" required={isRegistering} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="w-full bg-[#111726] border border-[#232B3E] hover:border-[#38435E] focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-200 transition-colors" />
                  </div>
                </div>
            )}

            <div>
              <label className="text-xs font-bold tracking-widest text-[#7B8296] uppercase mb-1.5 block">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Mail size={18} /></div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="engineer@company.com" className="w-full bg-[#111726] border border-[#232B3E] hover:border-[#38435E] focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-200 transition-colors" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold tracking-widest text-[#7B8296] uppercase mb-1.5 block">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Lock size={18} /></div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#111726] border border-[#232B3E] hover:border-[#38435E] focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-200 transition-colors" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-900/50 text-red-400 text-xs font-mono font-semibold animate-in slide-in-from-top-1">
                &gt; {error}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-3.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all disabled:opacity-75">
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>{isRegistering ? 'Create Account' : 'Authenticate Session'} <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-dark-600 pt-6">
            <button onClick={continueAsGuest} className="group w-full flex items-center justify-center gap-2 bg-[#111726] border border-[#232B3E] hover:border-dark-500 hover:bg-dark-800 text-gray-300 px-4 py-3 rounded-lg font-bold text-sm transition-all">
              <User size={16} className="text-gray-500 group-hover:text-gray-300" />
              Guest Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
