import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, User, UserPlus, Phone, KeyRound, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [accountRole, setAccountRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (password !== confirmPassword) return setError('Passwords do not match');
      if (password.length < 6) return setError('Password must be at least 6 characters');
      if (accountRole === 'admin' && !phone.trim()) return setError('Phone number is required for an administrator account');
      if (accountRole === 'admin' && !adminCode.trim()) return setError('Administrator authorization code is required');
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await register({ name, email, password, role: accountRole, phone, adminCode, registrationNumber });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to continue');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/30 text-blue-200 shadow-xl mb-4 backdrop-blur-md">
            <GraduationCap className="w-9 h-9 text-blue-300" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SAMS</h1>
          <p className="text-sm text-blue-200/80 font-medium mt-1">Student Academic Management System</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5">
            <button type="button" onClick={() => switchMode('login')} className={`py-2 rounded-lg text-xs font-bold transition-all ${mode === 'login' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-500'}`}>Sign In</button>
            <button type="button" onClick={() => switchMode('register')} className={`py-2 rounded-lg text-xs font-bold transition-all ${mode === 'register' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-500'}`}>Create Account</button>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800">{mode === 'login' ? 'Welcome Back' : 'Create Your Account'}</h2>
            <p className="text-xs text-slate-500 mt-1">{mode === 'login' ? 'Sign in with your institution credentials.' : `Register a ${accountRole} account.`}</p>
          </div>

          {error && <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setAccountRole('student')} className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${accountRole === 'student' ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-500'}`}><UserCheck className="w-4 h-4" />Student</button>
                  <button type="button" onClick={() => setAccountRole('admin')} className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${accountRole === 'admin' ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-500'}`}><ShieldCheck className="w-4 h-4" />Admin</button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div><label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Full Name</label><div className="relative"><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><User className="w-4 h-4 text-slate-400 absolute left-3 top-3" /></div></div>
            )}

            <div><label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label><div className="relative"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" /></div></div>

            {mode === 'register' && accountRole === 'admin' && (
              <>
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Phone Number</label><div className="relative"><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" /></div></div>
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Admin Authorization Code</label><div className="relative"><input type="password" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="Enter admin code" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" /></div></div>
              </>
            )}

            {mode === 'register' && accountRole === 'student' && (
              <div><label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Registration Number <span className="normal-case text-slate-400">(optional)</span></label><input type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())} placeholder="REG2025001" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /></div>
            )}

            <div><label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label><div className="relative"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" /></div></div>

            {mode === 'register' && <div><label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Confirm Password</label><div className="relative"><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required minLength={6} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" /></div></div>}

            <button type="submit" disabled={loading} className="w-full mt-2 py-3 px-4 bg-[#1E3A8A] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{mode === 'login' ? 'Sign In to Dashboard' : accountRole === 'admin' ? 'Create Admin Account' : 'Create Student Account'}<ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {mode === 'login' && <div className="mt-6 pt-6 border-t border-slate-100"><p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">One-Click Quick Demonstration Access</p><div className="grid grid-cols-2 gap-2.5"><button type="button" onClick={() => handleDemoLogin('admin@sams.edu', 'Admin@123')} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold"><ShieldCheck className="w-4 h-4 text-blue-700" />Admin Demo</button><button type="button" onClick={() => handleDemoLogin('student1@sams.edu', 'Student@123')} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold"><UserCheck className="w-4 h-4 text-emerald-600" />Student Demo</button></div></div>}
        </div>
        <p className="text-center text-xs text-blue-200/60 mt-6">Enterprise Student Academic Management Portal &bull; MongoDB Secured</p>
      </div>
    </div>
  );
};

export default Login;
