'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy, Check, ArrowLeft, Utensils, HardHat, Heart,
  Building2, Settings, Factory, ShoppingBag, Truck, Leaf,
  GraduationCap, TrendingUp, Trophy, Calendar, ExternalLink,
  LogOut, LayoutGrid, ChevronRight
} from 'lucide-react';

const QUESTIONNAIRES = [
  {
    key: 'generic', label: 'Cuestionario General', desc: 'Aplica para cualquier empresa. Incluye nómina, asistencia, reportes y más.',
    icon: <Building2 size={22} />, color: '#00f2fe', param: null, comingSoon: false,
  },
  {
    key: 'restaurantes', label: 'Restaurantes & Gastronomía', desc: 'Optimizado para restaurantes, cadenas, cafeterías y negocios de alimentos.',
    icon: <Utensils size={22} />, color: '#f97316', param: 'restaurantes', comingSoon: false,
  },
  {
    key: 'construccion', label: 'Construcción & Obra', desc: 'Para constructoras, contratistas y empresas con personal en campo u obras.',
    icon: <HardHat size={22} />, color: '#eab308', param: 'construccion', comingSoon: false,
  },
  {
    key: 'salud', label: 'Área de la Salud', desc: 'Para clínicas, hospitales, consultorios y establecimientos médicos.',
    icon: <Heart size={22} />, color: '#ec4899', param: 'salud', comingSoon: false,
  },
  {
    key: 'it', label: 'Tecnología (IT)', desc: 'Para empresas de software, startups y empresas de tecnología.',
    icon: <Settings size={22} />, color: '#8b5cf6', param: 'it', comingSoon: false,
  },
  {
    key: 'manufactura', label: 'Manufactura & Industria', desc: 'Para plantas industriales, manufactura y producción.',
    icon: <Factory size={22} />, color: '#64748b', param: 'manufactura', comingSoon: false,
  },
  {
    key: 'comercio', label: 'Comercio Minorista', desc: 'Para tiendas, boutiques, cadenas de retail y comercios.',
    icon: <ShoppingBag size={22} />, color: '#06b6d4', param: 'comercio', comingSoon: false,
  },
  {
    key: 'logistica', label: 'Transporte & Logística', desc: 'Para empresas de transporte, flota y distribución.',
    icon: <Truck size={22} />, color: '#10b981', param: 'logistica', comingSoon: false,
  },
  {
    key: 'agricultura', label: 'Agricultura & Agro', desc: 'Para agronegocios, ranchos y empresas del campo.',
    icon: <Leaf size={22} />, color: '#22c55e', param: 'agricultura', comingSoon: false,
  },
  {
    key: 'educacion', label: 'Educación', desc: 'Para escuelas, colegios, universidades e instituciones educativas.',
    icon: <GraduationCap size={22} />, color: '#f59e0b', param: 'educacion', comingSoon: false,
  },
  {
    key: 'finanzas', label: 'Finanzas & Contabilidad', desc: 'Para despachos contables, financieras y empresas del sector.',
    icon: <TrendingUp size={22} />, color: '#3b82f6', param: 'finanzas', comingSoon: false,
  },
  {
    key: 'deportes', label: 'Deportes & Fitness', desc: 'Para gimnasios, clubes deportivos y centros de salud física.',
    icon: <Trophy size={22} />, color: '#ef4444', param: 'deportes', comingSoon: false,
  },
  {
    key: 'eventos', label: 'Eventos & Entretenimiento', desc: 'Para empresas de eventos, producción y entretenimiento.',
    icon: <Calendar size={22} />, color: '#a855f7', param: 'eventos', comingSoon: false,
  },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!sessionStorage.getItem('hutec_admin')) { router.replace('/admin'); return; }
    }
  }, [router]);

  const getLink = (q: typeof QUESTIONNAIRES[0]) => {
    if (!q.param) return baseUrl + '/';
    return `${baseUrl}/?q=${q.param}`;
  };

  const copyLink = async (q: typeof QUESTIONNAIRES[0]) => {
    const link = getLink(q);
    await navigator.clipboard.writeText(link);
    setCopied(q.key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#060a10] text-white font-sans relative overflow-x-hidden">
      {/* HUTEC Blue Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020408] via-[#050a14] to-[#0a0f1a]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2300f2fe%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M0%200h40v40H0V0zm40%2040h40v40H40V40z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-70" />
        <div className="absolute inset-0 opacity-[0.015]" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")'}} />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/5 bg-black/30 backdrop-blur-2xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00f2fe] to-[#0066cc] rounded-xl flex items-center justify-center text-lg font-black text-white shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all">
                H
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight tracking-wide">
                HUTEC Admin
              </h1>
              <p className="text-xs text-slate-500 leading-tight tracking-wider uppercase">Panel CRM</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => router.push('/admin/dashboard')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/25 hover:border-cyan-400/60 transition-all duration-300 shadow-lg shadow-cyan-500/10">
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 text-sm font-medium hover:bg-rose-500/15 transition-all duration-300">
              <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Cuestionarios por Industria
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            Selecciona el cuestionario más adecuado para tu cliente, copia el enlace y envíaselo. 
            Cada formulario está optimizado para las necesidades específicas de cada sector.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {QUESTIONNAIRES.map(q => {
            const link = getLink(q);
            const isCopied = copied === q.key;
            return (
              <div key={q.key} className={`group relative bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/[0.05] ${q.comingSoon ? 'opacity-50' : ''}`}>
                {q.comingSoon && (
                  <div className="absolute top-4 right-4 bg-slate-800/80 border border-white/10 rounded-full px-2.5 py-0.5 text-[10px] text-slate-400 font-medium">
                    Próximamente
                  </div>
                )}
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 flex-shrink-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                  {q.icon}
                </div>
                <h3 className="font-semibold text-white text-sm mb-2 leading-tight pr-8">{q.label}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">{q.desc}</p>

                {!q.comingSoon && (
                  <div className="flex flex-col gap-3">
                    {/* Link preview */}
                    <div className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <span className="text-xs text-slate-400 truncate flex-1 font-mono">{link.replace('http://localhost:3000', 'hutec.app')}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyLink(q)}
                        className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all ${isCopied ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/25'}`}
                      >
                        {isCopied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar enlace</>}
                      </button>
                      <a href={link} target="_blank" rel="noopener noreferrer"
                        className="w-11 flex items-center justify-center border border-white/10 rounded-xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* How it works */}
        <div className="mt-10 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold text-cyan-400 text-sm mb-4 flex items-center gap-2">
            <LayoutGrid size={14} /> ¿Cómo funciona?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: '1', t: 'Elige el sector', d: 'Selecciona el cuestionario que mejor describe la industria de tu cliente.' },
              { n: '2', t: 'Copia el enlace', d: 'Usa el botón "Copiar enlace" para obtener la URL personalizada.' },
              { n: '3', t: 'Envía al cliente', d: 'Comparte el enlace por WhatsApp, email o cualquier canal.' },
            ].map(step => (
              <div key={step.n} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold flex-shrink-0">
                  {step.n}
                </div>
                <div>
                  <p className="text-white text-sm font-medium mb-1">{step.t}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
