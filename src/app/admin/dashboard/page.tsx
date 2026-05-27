'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSubmissions } from '../../actions';
import {
  Building2, User, Mail, Phone, Calendar, RefreshCw, LogOut,
  ChevronRight, Search, Filter, BarChart2, Users, FileText,
  Clock, X, Briefcase, Link2
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

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2 text-slate-400">{icon}<span className="text-xs uppercase tracking-wider font-medium">{label}</span></div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
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

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await getSubmissions();
    if (res.success) { setSubmissions(res.data as Submission[]); setError(''); }
    else { setError(res.error || 'Error al cargar datos'); }
    setLoading(false);
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
    <div className="min-h-screen bg-[#060a10] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/8 bg-black/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00f2fe] rounded-lg flex items-center justify-center text-sm font-black text-black shadow-[0_0_15px_rgba(0,242,254,0.4)]">H</div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-tight">HUTEC Admin</h1>
              <p className="text-[10px] text-slate-500 leading-tight">Panel CRM</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/admin/questionnaire')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#00f2fe]/30 text-[#00f2fe] text-xs font-medium hover:bg-[#00f2fe]/5 transition-all">
              <Link2 size={13} /> Cuestionarios
            </button>
            <button onClick={loadData} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-slate-400 text-xs hover:bg-white/5 hover:text-white transition-all">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-slate-400 text-xs hover:bg-white/5 hover:text-white transition-all">
              <LogOut size={13} /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<FileText size={15} />} label="Total Leads" value={submissions.length} sub="registros totales" />
          <StatCard icon={<Calendar size={15} />} label="Hoy" value={todayCount} sub="formularios hoy" />
          <StatCard icon={<Users size={15} />} label="Industrias" value={industries.length} sub="sectores distintos" />
          <StatCard icon={<BarChart2 size={15} />} label="Este Mes" value={submissions.filter(s => {
            const d = new Date(s.created_at);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length} sub="del mes actual" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Buscar empresa, nombre, email..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#00f2fe]/40 placeholder:text-slate-600" />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#00f2fe]/40 appearance-none cursor-pointer min-w-[160px]">
              <option value="" className="bg-slate-900">Todas las industrias</option>
              {industries.map(i => <option key={i} value={i} className="bg-slate-900">{i}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        {error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5 text-rose-400 text-sm">
            Error: {error} — Revisa la política RLS de Supabase (SELECT para anon).
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500 gap-3">
            <RefreshCw size={18} className="animate-spin" /> Cargando registros...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No se encontraron registros.</p>
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/[0.02]">
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Empresa</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider hidden md:table-cell">Contacto</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider hidden lg:table-cell">Industria</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider hidden lg:table-cell">Empleados</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(sub => {
                  const r = sub.responses || {};
                  return (
                    <tr key={sub.id} className="hover:bg-white/[0.03] transition-colors cursor-pointer" onClick={() => setSelected(sub)}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#00f2fe]/10 border border-[#00f2fe]/20 flex items-center justify-center text-[#00f2fe] flex-shrink-0">
                            <Building2 size={14} />
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm leading-tight">{r.empresa || <span className="text-slate-500 italic">Sin nombre</span>}</div>
                            <div className="text-xs text-slate-500 leading-tight">{r.posicion || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="text-slate-300 text-sm">{r.nombre || '—'}</div>
                        <div className="text-slate-500 text-xs">{r.email || ''}</div>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        {r.industria ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20">{r.industria}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-slate-400 text-sm">{r.empleados || '—'}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Clock size={11} />
                          {formatDate(sub.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <ChevronRight size={15} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-slate-600 mt-3">{filtered.length} de {submissions.length} registros</p>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="w-full max-w-[480px] bg-[#0d1117] border-l border-white/10 overflow-y-auto">
            <div className="sticky top-0 bg-[#0d1117]/95 backdrop-blur border-b border-white/10 px-5 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-semibold text-white">{selected.responses?.empresa || 'Sin nombre'}</h2>
                <p className="text-xs text-slate-500">{formatDate(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {/* Contact block */}
              <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 space-y-2.5">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mb-3">Contacto</p>
                {selected.responses?.nombre && <div className="flex items-center gap-3"><User size={13} className="text-slate-500 flex-shrink-0" /><span className="text-sm text-slate-200">{selected.responses.nombre}</span></div>}
                {selected.responses?.posicion && <div className="flex items-center gap-3"><Briefcase size={13} className="text-slate-500 flex-shrink-0" /><span className="text-sm text-slate-200">{selected.responses.posicion}</span></div>}
                {selected.responses?.email && <div className="flex items-center gap-3"><Mail size={13} className="text-slate-500 flex-shrink-0" /><a href={`mailto:${selected.responses.email}`} className="text-sm text-[#00f2fe] hover:underline">{selected.responses.email}</a></div>}
                {selected.responses?.telefono && <div className="flex items-center gap-3"><Phone size={13} className="text-slate-500 flex-shrink-0" /><a href={`tel:${selected.responses.telefono}`} className="text-sm text-[#00f2fe] hover:underline">{selected.responses.telefono}</a></div>}
              </div>

              {/* All responses */}
              <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mb-3">Respuestas del formulario</p>
                <div className="space-y-3">
                  {Object.entries(selected.responses || {}).map(([key, val]) => {
                    if (['nombre', 'posicion', 'email', 'telefono'].includes(key)) return null;
                    if (!val || (typeof val === 'string' && val.trim() === '')) return null;
                    return (
                      <div key={key}>
                        <p className="text-[11px] text-slate-500 font-medium mb-0.5">{FIELD_LABELS[key] || key}</p>
                        <p className="text-sm text-slate-200 leading-relaxed">{String(val).split(',').join(' · ')}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {selected.responses?.email && (
                  <a href={`mailto:${selected.responses.email}?subject=Demostración HUTEC&body=Hola ${selected.responses.nombre || ''},%0D%0A%0D%0AEn HUTEC Digital nos complace seguir con el proceso de demostración para ${selected.responses.empresa || 'su empresa'}.`}
                    className="flex-1 py-3 flex items-center justify-center gap-2 bg-[#00f2fe] text-black rounded-xl text-sm font-semibold hover:shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all">
                    <Mail size={15} /> Enviar correo
                  </a>
                )}
                {selected.responses?.telefono && (
                  <a href={`https://wa.me/${selected.responses.telefono.replace(/\D/g, '')}?text=Hola ${selected.responses.nombre || ''}, soy del equipo HUTEC Digital y nos gustaría coordinar tu demostración personalizada.`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-3 flex items-center justify-center gap-2 border border-white/10 text-slate-300 rounded-xl text-sm font-medium hover:bg-white/5 transition-all">
                    <Phone size={14} /> WhatsApp
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
