'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, User, Mail, Phone, Calendar, RefreshCw, LogOut,
  ChevronRight, Search, Filter, BarChart2, Users, FileText,
  Clock, X, Briefcase, ArrowLeft
} from 'lucide-react';

type Submission = {
  id: string;
  created_at: string;
  metadata: { submitted_at: string; source: string };
  responses: Record<string, string>;
};

const FIELD_LABELS: Record<string, string> = {
  empresa: 'Empresa', industria: 'Industria', empleados: 'Empleados',
  nombre: 'Nombre', posicion: 'Puesto', email: 'Correo', telefono: 'Teléfono',
  proporcion_empleados: 'Tipo contratación', ubicaciones: 'Sucursales',
  metodo_nomina: 'Método nómina', frecuencia_pago: 'Frecuencia pago',
  metodo_asistencia: 'Método asistencia', timeline: 'Horizonte impl.',
  objetivos: 'Objetivos', comentarios: 'Comentarios',
  software_actual: 'Software actual', cuellos_botella: 'Desafíos',
  problemas_nomina: 'Problemas nómina', problemas_asistencia: 'Problemas asist.',
  reportes_actuales: 'Reportes actuales', reportes_necesarios: 'Reportes necesarios',
  migracion: 'Migración datos', facturacion: 'Volumen anual',
  tipo_restaurante: 'Tipo de restaurante', rotacion: 'Rotación de personal',
  turnos: 'Turnos / horarios', tipo_obra: 'Tipo de obra',
  tipo_contrato: 'Esquema de contratación',
  tipo_establecimiento: 'Tipo de establecimiento', guardias: 'Turnos y guardias',
  tipo_servicio_it: 'Tipo de empresa TI', esquema_trabajo: 'Esquema de trabajo',
  tipo_planta: 'Tipo de planta', tipo_comercio: 'Tipo de comercio',
  temporada_alta: 'Estacionalidad', tipo_logistica: 'Tipo de operación logística',
  tamano_flota: 'Tamaño de flota', empleados_campo: 'Personal en campo / ruta',
  tipo_agro: 'Tipo de operación agro', temporalidad: 'Temporalidad de operación',
  tipo_institucion: 'Tipo de institución', modelo_clases: 'Modelo académico',
  tipo_financiera: 'Tipo de firma financiera', modelo_operacion: 'Modelo operativo',
  tipo_deportivo: 'Tipo de centro deportivo', tipo_membresia: 'Modelo de servicio',
  tipo_evento: 'Tipo de empresa de eventos', frecuencia_eventos: 'Frecuencia de eventos',
  _industry_param: 'Formulario',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// HUTEC Cyan Blue theme
const HUTEC_BLUE = {
  bg: 'from-cyan-500/20 to-blue-600/20',
  border: 'border-cyan-500/40',
  text: 'text-cyan-400',
  glow: 'shadow-cyan-500/20',
  hover: 'hover:shadow-cyan-500/30',
};

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${HUTEC_BLUE.bg} backdrop-blur-md border ${HUTEC_BLUE.border} rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${HUTEC_BLUE.hover} group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-all" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl bg-black/40 border ${HUTEC_BLUE.border} ${HUTEC_BLUE.text}`}>
            {icon}
          </div>
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">{label}</span>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">{value}</div>
        {sub && <div className="text-xs text-slate-500 mt-1.5 font-medium tracking-wide">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [search, setSearch] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('hutec_admin')) {
      router.replace('/admin');
    }
  }, [router]);

  // Fetch directo a Supabase REST API (evita Server Actions que fallan en Netlify)
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      const res = await fetch(
        `${supabaseUrl}/rest/v1/demos_hutec?select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }
      
      const data = await res.json();
      setSubmissions(data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos inmediatamente al montar el componente
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => { sessionStorage.removeItem('hutec_admin'); router.push('/admin'); };

  const industries = Array.from(new Set(submissions.map(s => s.responses?.industria).filter(Boolean)));

  const filtered = submissions.filter(s => {
    const r = s.responses || {};
    const matchSearch = !search ||
      (r.empresa || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.industria || '').toLowerCase().includes(search.toLowerCase());
    const matchIndustry = !filterIndustry || r.industria === filterIndustry;
    return matchSearch && matchIndustry;
  });

  const todayCount = submissions.filter(s => {
    const d = new Date(s.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="min-h-screen bg-[#060a10] text-white font-sans relative overflow-x-hidden">
      {/* HUTEC Blue Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Deep dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020408] via-[#050a14] to-[#0a0f1a]" />
        {/* Blue orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2300f2fe%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M0%200h40v40H0V0zm40%2040h40v40H40V40z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-70" />
        {/* Noise texture */}
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
            <button onClick={() => router.push('/admin/questionnaire')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/25 hover:border-cyan-400/60 transition-all duration-300 shadow-lg shadow-cyan-500/10">
              <span className="hidden sm:inline">Cuestionarios</span>
            </button>
            <button onClick={loadData} disabled={loading}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/5 hover:text-slate-200 transition-all duration-300">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button onClick={handleLogout}
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
            Dashboard de Leads
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">Visualiza y gestiona todos los registros de tus cuestionarios</p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          <StatCard icon={<FileText size={22} />} label="Total Leads" value={submissions.length} sub="registros totales" />
          <StatCard icon={<Calendar size={22} />} label="Hoy" value={todayCount} sub="formularios hoy" />
          <StatCard icon={<Users size={22} />} label="Industrias" value={industries.length} sub="sectores distintos" />
          <StatCard icon={<BarChart2 size={22} />} label="Este Mes" value={submissions.filter(s => {
            const d = new Date(s.created_at);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length} sub="del mes actual" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar empresa, nombre, email..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/15 rounded-2xl text-base text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500 shadow-lg shadow-black/20" />
          </div>
          <div className="relative sm:min-w-[200px]">
            <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}
              className="w-full sm:w-auto pl-12 pr-10 py-4 bg-white/5 backdrop-blur-sm border border-white/15 rounded-2xl text-base text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer shadow-lg shadow-black/20">
              <option value="" className="bg-slate-900 text-slate-300">Todas las industrias</option>
              {industries.map(i => <option key={i} value={i} className="bg-slate-900">{i}</option>)}
            </select>
            <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        {error ? (
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6 text-cyan-400">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <X size={20} />
              </div>
              <span className="font-semibold">Error de conexión</span>
            </div>
            <p className="text-sm opacity-80">{error} — Revisa la política RLS de Supabase (SELECT para anon).</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                <RefreshCw size={28} className="animate-spin text-cyan-400" />
              </div>
            </div>
            <p className="text-base font-medium">Cargando registros...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FileText size={32} className="opacity-40" />
            </div>
            <p className="text-lg font-medium mb-1">No se encontraron registros</p>
            <p className="text-sm opacity-60">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.05]">
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Empresa</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Contacto</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Industria</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Empleados</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Fecha</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((sub, idx) => {
                    const r = sub.responses || {};
                    return (
                      <tr key={sub.id} className="group hover:bg-white/[0.05] transition-all duration-200 cursor-pointer" onClick={() => setSelected(sub)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                              <Building2 size={18} />
                            </div>
                            <div>
                              <div className="font-semibold text-white text-sm sm:text-base leading-tight">{r.empresa || <span className="text-slate-500 italic">Sin nombre</span>}</div>
                              <div className="text-xs text-slate-500 leading-tight mt-0.5">{r.posicion || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="text-slate-300 text-sm font-medium">{r.nombre || '—'}</div>
                          <div className="text-slate-500 text-xs mt-0.5 truncate max-w-[180px]">{r.email || ''}</div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          {r.industria ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/30">
                              {r.industria}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-slate-400 text-sm font-medium">{r.empleados || '—'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-500 text-xs">
                            <Clock size={14} />
                            <span className="font-medium">{formatDate(sub.created_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-all">
                            <ChevronRight size={18} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-sm text-slate-400">
            Mostrando <span className="text-white font-semibold">{filtered.length}</span> de <span className="text-white font-semibold">{submissions.length}</span> registros
          </p>
          {filtered.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-500">Datos actualizados</span>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/70 backdrop-blur-md" onClick={() => setSelected(null)} />
          <div className="w-full max-w-[520px] bg-gradient-to-b from-[#0d1117] to-[#0a0e14] border-l border-white/10 overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-[#0d1117]/98 backdrop-blur-xl border-b border-white/10 px-6 py-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Building2 size={22} className="text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">{selected.responses?.empresa || 'Sin nombre'}</h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Calendar size={12} />
                    {formatDate(selected.created_at)}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-400 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Contact block */}
              <div className="bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                  <User size={14} /> Información de Contacto
                </p>
                <div className="space-y-3">
                  {selected.responses?.nombre && (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03]">
                      <User size={16} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Nombre</p>
                        <p className="text-sm text-white font-medium">{selected.responses.nombre}</p>
                      </div>
                    </div>
                  )}
                  {selected.responses?.posicion && (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03]">
                      <Briefcase size={16} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Puesto</p>
                        <p className="text-sm text-white font-medium">{selected.responses.posicion}</p>
                      </div>
                    </div>
                  )}
                  {selected.responses?.email && (
                    <a href={`mailto:${selected.responses.email}`} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 transition-all group">
                      <Mail size={16} className="text-slate-400 group-hover:text-cyan-400" />
                      <div>
                        <p className="text-xs text-slate-500">Correo electrónico</p>
                        <p className="text-sm text-cyan-400 font-medium">{selected.responses.email}</p>
                      </div>
                    </a>
                  )}
                  {selected.responses?.telefono && (
                    <a href={`tel:${selected.responses.telefono}`} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 transition-all group">
                      <Phone size={16} className="text-slate-400 group-hover:text-emerald-400" />
                      <div>
                        <p className="text-xs text-slate-500">Teléfono</p>
                        <p className="text-sm text-emerald-400 font-medium">{selected.responses.telefono}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* All responses */}
              <div className="bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                  <FileText size={14} /> Detalles del Formulario
                </p>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {Object.entries(selected.responses || {}).map(([key, val]) => {
                    if (['nombre', 'posicion', 'email', 'telefono', 'empresa'].includes(key)) return null;
                    if (!val || (typeof val === 'string' && val.trim() === '')) return null;
                    return (
                      <div key={key} className="p-3 rounded-xl bg-white/[0.03]">
                        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5">{FIELD_LABELS[key] || key}</p>
                        <p className="text-sm text-slate-200 leading-relaxed">{String(val).split(',').join(' · ')}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 sticky bottom-0 pt-2 bg-gradient-to-t from-[#0a0e14] to-transparent">
                {selected.responses?.email && (
                  <a href={`mailto:${selected.responses.email}?subject=Demostración HUTEC&body=Hola ${selected.responses.nombre || ''},%0D%0A%0D%0AEn HUTEC Digital nos complace seguir con el proceso de demostración para ${selected.responses.empresa || 'su empresa'}.`}
                    className="flex-1 py-4 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
                    <Mail size={18} /> Enviar correo
                  </a>
                )}
                {selected.responses?.telefono && (
                  <a href={`https://wa.me/${selected.responses.telefono.replace(/\D/g, '')}?text=Hola ${selected.responses.nombre || ''}, soy del equipo HUTEC Digital y nos gustaría coordinar tu demostración personalizada.`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-4 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                    <Phone size={18} /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
