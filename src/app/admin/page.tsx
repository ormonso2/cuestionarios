'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, Loader2 } from 'lucide-react';

const ADMIN_USER = 'hutecadmon';
const ADMIN_PASS = 'Hum4n22!';

export default function AdminLogin() {
  const router = useRouter();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (user === ADMIN_USER && pass === ADMIN_PASS) {
        sessionStorage.setItem('hutec_admin', '1');
        router.push('/admin/dashboard');
      } else {
        setError('Credenciales incorrectas. Verifica usuario y contraseña.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#060a10] text-white flex items-center justify-center px-4 font-sans">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-[#00f2fe]/5 rounded-full blur-[120px] -top-40 -left-40"></div>
        <div className="absolute w-[400px] h-[400px] bg-teal-800/10 rounded-full blur-[100px] -bottom-32 -right-32"></div>
      </div>

      <div className="relative w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#00f2fe] rounded-2xl inline-flex items-center justify-center text-2xl font-black text-black mb-4 shadow-[0_0_30px_rgba(0,242,254,0.4)]">H</div>
          <h1 className="text-2xl font-bold tracking-tight">Panel Administrativo</h1>
          <p className="text-slate-400 text-sm mt-1">HUTEC Digital — Acceso Restringido</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-7 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Usuario</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={user}
                  onChange={e => setUser(e.target.value)}
                  placeholder="hutecadmon"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-[14px] text-white focus:outline-none focus:border-[#00f2fe]/50 focus:shadow-[0_0_10px_rgba(0,242,254,0.1)] placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-[14px] text-white focus:outline-none focus:border-[#00f2fe]/50 focus:shadow-[0_0_10px_rgba(0,242,254,0.1)] placeholder:text-slate-600 transition-all"
                />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !user || !pass}
              className="w-full py-3.5 bg-[#00f2fe] text-black font-semibold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 text-sm uppercase tracking-wide"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Verificando...</> : 'Ingresar al Panel'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-5">Acceso exclusivo para administradores HUTEC</p>
      </div>
    </div>
  );
}
