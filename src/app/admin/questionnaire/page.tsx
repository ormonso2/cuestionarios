'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Link2, Copy, Check, ArrowLeft, Utensils, HardHat, Heart,
  Building2, Settings, Factory, ShoppingBag, Truck, Leaf,
  GraduationCap, TrendingUp, Trophy, Calendar, ExternalLink
} from 'lucide-react';

const QUESTIONNAIRES = [
  {
    key: 'generic', label: 'Cuestionario General', desc: 'Aplica para cualquier empresa. Incluye nómina, asistencia, reportes y más.',
    icon: <Building2 size={22} />, color: '#00f2fe', param: null,
  },
  {
    key: 'restaurantes', label: 'Restaurantes & Gastronomía', desc: 'Optimizado para restaurantes, cadenas, cafeterías y negocios de alimentos.',
    icon: <Utensils size={22} />, color: '#f97316', param: 'restaurantes',
  },
  {
    key: 'construccion', label: 'Construcción & Obra', desc: 'Para constructoras, contratistas y empresas con personal en campo u obras.',
    icon: <HardHat size={22} />, color: '#eab308', param: 'construccion',
  },
  {
    key: 'salud', label: 'Área de la Salud', desc: 'Para clínicas, hospitales, consultorios y establecimientos médicos.',
    icon: <Heart size={22} />, color: '#ec4899', param: 'salud',
  },
  {
    key: 'it', label: 'Tecnología (IT)', desc: 'Para empresas de software, startups y empresas de tecnología.',
    icon: <Settings size={22} />, color: '#8b5cf6', param: 'it',
  },
  {
    key: 'manufactura', label: 'Manufactura & Industria', desc: 'Para plantas industriales, manufactura y producción.',
    icon: <Factory size={22} />, color: '#64748b', param: 'manufactura',
  },
  {
    key: 'comercio', label: 'Comercio Minorista', desc: 'Para tiendas, boutiques, cadenas de retail y comercios.',
    icon: <ShoppingBag size={22} />, color: '#06b6d4', param: 'comercio',
  },
  {
    key: 'logistica', label: 'Transporte & Logística', desc: 'Para empresas de transporte, flota y distribución.',
    icon: <Truck size={22} />, color: '#10b981', param: 'logistica',
  },
  {
    key: 'agricultura', label: 'Agricultura & Agro', desc: 'Para agronegocios, ranchos y empresas del campo.',
    icon: <Leaf size={22} />, color: '#22c55e', param: 'agricultura',
  },
  {
    key: 'educacion', label: 'Educación', desc: 'Para escuelas, colegios, universidades e instituciones educativas.',
    icon: <GraduationCap size={22} />, color: '#f59e0b', param: 'educacion',
  },
  {
    key: 'finanzas', label: 'Finanzas & Contabilidad', desc: 'Para despachos contables, financieras y empresas del sector.',
    icon: <TrendingUp size={22} />, color: '#3b82f6', param: 'finanzas',
  },
  {
    key: 'deportes', label: 'Deportes & Fitness', desc: 'Para gimnasios, clubes deportivos y centros de salud física.',
    icon: <Trophy size={22} />, color: '#ef4444', param: 'deportes',
  },
  {
    key: 'eventos', label: 'Eventos & Entretenimiento', desc: 'Para empresas de eventos, producción y entretenimiento.',
    icon: <Calendar size={22} />, color: '#a855f7', param: 'eventos',
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
    <div className="min-h-screen bg-[#060a10] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/8 bg-black/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <span className="text-white/20">/</span>
          <span className="text-sm font-medium text-white flex items-center gap-1.5">
            <Link2 size={14} className="text-[#00f2fe]" /> Selector de Cuestionarios
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Cuestionarios por Industria</h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-[540px]">
            Selecciona el cuestionario más adecuado para tu cliente, copia el enlace y envíaselo. 
            Cada formulario está optimizado para las necesidades específicas de cada sector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUESTIONNAIRES.map(q => {
            const link = getLink(q);
            const isCopied = copied === q.key;
            return (
              <div key={q.key} className={`relative bg-white/[0.03] border rounded-2xl p-5 transition-all ${q.comingSoon ? 'border-white/5 opacity-50' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.05]'}`}>
                {q.comingSoon && (
                  <div className="absolute top-3 right-3 bg-slate-800 border border-white/10 rounded-full px-2.5 py-0.5 text-[10px] text-slate-400 font-medium">
                    Próximamente
                  </div>
                )}
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 flex-shrink-0" style={{ backgroundColor: q.color + '18', border: `1px solid ${q.color}30`, color: q.color }}>
                  {q.icon}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1.5 leading-tight pr-8">{q.label}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">{q.desc}</p>

                {!q.comingSoon && (
                  <div className="flex flex-col gap-2">
                    {/* Link preview */}
                    <div className="bg-black/40 border border-white/8 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <Link2 size={11} className="text-slate-500 flex-shrink-0" />
                      <span className="text-xs text-slate-400 truncate flex-1 font-mono">{link.replace('http://localhost:3000', 'hutec.app')}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyLink(q)}
                        className="flex-1 py-2.5 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={{ backgroundColor: isCopied ? '#22c55e20' : q.color + '18', border: `1px solid ${isCopied ? '#22c55e40' : q.color + '40'}`, color: isCopied ? '#22c55e' : q.color }}
                      >
                        {isCopied ? <><Check size={13} /> Copiado!</> : <><Copy size={13} /> Copiar enlace</>}
                      </button>
                      <a href={link} target="_blank" rel="noopener noreferrer"
                        className="w-10 flex items-center justify-center border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-[#00f2fe]/5 border border-[#00f2fe]/15 rounded-2xl p-5">
          <h3 className="font-semibold text-[#00f2fe] text-sm mb-1.5">¿Cómo funciona?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            {[
              { n: '1', t: 'Elige el sector', d: 'Selecciona el cuestionario que mejor describe la industria de tu cliente.' },
              { n: '2', t: 'Copia el enlace', d: 'Usa el botón "Copiar enlace" para obtener la URL personalizada.' },
              { n: '3', t: 'Envía al cliente', d: 'Comparte el enlace por WhatsApp, email o cualquier canal. El formulario se adapta automáticamente.' },
            ].map(step => (
              <div key={step.n} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00f2fe]/20 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe] text-xs font-bold flex-shrink-0 mt-0.5">{step.n}</div>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">{step.t}</p>
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
