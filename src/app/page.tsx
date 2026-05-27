'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { submitDemoForm } from './actions';
import {
  Building2, Settings, User, Banknote, Clock, BarChart2, Rocket, Lightbulb,
  CheckCircle2, MessageCircle, RotateCcw, ArrowLeft, ArrowRight, Loader2,
  ChevronDown, MapPin, Utensils, Heart, Calendar, Trophy, HardHat, Leaf,
  Factory, ShoppingBag, Truck, GraduationCap, TrendingUp
} from 'lucide-react';

gsap.registerPlugin(useGSAP);

const INDUSTRY_ICONS: Record<string, React.ReactNode> = {
  'IT': <Settings size={13} />,
  'RESTAURANTES': <Utensils size={13} />,
  'EVENTOS': <Calendar size={13} />,
  'ÁREA DE LA SALUD': <Heart size={13} />,
  'Deportes': <Trophy size={13} />,
  'Construcción': <HardHat size={13} />,
  'Agricultura': <Leaf size={13} />,
  'Manufactura': <Factory size={13} />,
  'Comercio Minorista': <ShoppingBag size={13} />,
  'Transporte y Logística': <Truck size={13} />,
  'Educación': <GraduationCap size={13} />,
  'Finanzas': <TrendingUp size={13} />,
};

const SECTION_ICONS: Record<string, React.ReactNode> = {
  sec_info:       <Building2 size={20} />,
  sec_operacion:  <Settings size={20} />,
  sec_contacto:   <User size={20} />,
  sec_nomina:     <Banknote size={20} />,
  sec_asistencia: <Clock size={20} />,
  sec_reportes:   <BarChart2 size={20} />,
  sec_plan:       <Rocket size={20} />,
  sec_extra:      <Lightbulb size={20} />,
};

type QuestionType = 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox';

type QuestionItem = {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

type QuestionSection = {
  id: string;
  title: string;
  desc: string;
  items: QuestionItem[];
};

type FormState = Record<string, string>;

function getStoredFormData(): FormState {
  if (typeof window === 'undefined') return {};

  const saved = window.localStorage.getItem('hutec_demo_form');
  if (!saved) return {};

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => typeof value === 'string')
    ) as FormState;
  } catch {
    return {};
  }
}

const BASE_QUESTIONS: QuestionSection[] = [
  {
    id: "sec_info", title: "Información Básica", desc: "Datos generales para comprender el tamaño y estructura de tu operación.",
    items: [
      { id: "empresa", type: "text", label: "Nombre de la Empresa", required: true, placeholder: "Ej. Empresa S.A. de C.V." },
      { id: "industria", type: "select", label: "Sector / Industria", required: true, options: ["IT", "RESTAURANTES", "EVENTOS", "ÁREA DE LA SALUD", "Deportes", "Construcción", "Agricultura", "Manufactura", "Comercio Minorista", "Transporte y Logística", "Educación", "Finanzas", "Otro"] },
      { id: "empleados", type: "radio", label: "Número de Empleados", required: true, options: ["1-10", "11-25", "26-50", "51-100", "Más de 100"] },
      { id: "proporcion_empleados", type: "radio", label: "Tipo de Contratación Principal", required: true, options: ["Mayoría de Planta/Fijos", "Mayoría Eventuales/Temporales", "Mitad y Mitad", "Por Obra/Proyecto"] },
      { id: "ubicaciones", type: "radio", label: "Cantidad de Sucursales", required: true, options: ["1 (Única)", "2 a 3", "4 a 5", "Más de 5"] }
    ]
  },
  {
    id: "sec_operacion", title: "Operación y Esquema", desc: "Analizaremos los desafíos operacionales clave de tu empresa.",
    items: [
      { id: "cuellos_botella", type: "checkbox", label: "Principales desafíos operacionales (varios)", required: false, options: ["Gestión de inventario y activos", "Coordinación interdepartamental", "Rotación y retención de talento", "Cumplimiento fiscal/SAT", "Procesos altamente manuales"] },
      { id: "software_actual", type: "textarea", label: "¿Qué sistemas utilizan actualmente?", required: false, placeholder: "Ej. SAP, Excel, sistemas especializados..." },
      { id: "facturacion", type: "select", label: "Volumen operativo anual (Opcional)", required: false, options: ["Menos de $1M MXN", "$1M - $5M MXN", "$5M - $20M MXN", "$20M - $50M MXN", "Más de $50M MXN", "Prefiero no indicarlo"] }
    ]
  },
  {
    id: "sec_contacto", title: "Datos de Contacto", desc: "Información para coordinar tu demostración personalizada.",
    items: [
      { id: "nombre", type: "text", label: "Nombre Completo", required: true, placeholder: "Juan Pérez García" },
      { id: "posicion", type: "text", label: "Puesto / Cargo Actual", required: true, placeholder: "Gerente Administrativo, Director RRHH..." },
      { id: "email", type: "email", label: "Correo Corporativo", required: true, placeholder: "nombre@empresa.com" },
      { id: "telefono", type: "tel", label: "Teléfono / WhatsApp", required: true, placeholder: "+52 123 456 7890" }
    ]
  },
  {
    id: "sec_nomina", title: "Gestión de Nómina", desc: "Entendiendo tu proceso actual de cálculo y administración salarial.",
    items: [
      { id: "metodo_nomina", type: "radio", label: "Método actual de cálculo de nómina", required: true, options: ["Manual o en Excel", "Contador externo", "Software especializado", "Combinación de métodos"] },
      { id: "frecuencia_pago", type: "radio", label: "Frecuencia de pago predominante", required: true, options: ["Semanal", "Quincenal", "Catorcenal", "Mensual", "Múltiples"] },
      { id: "problemas_nomina", type: "checkbox", label: "Principales desafíos en nómina (varios)", required: false, options: ["Errores de cálculo recurrentes", "Consumo excesivo de tiempo", "Complicaciones SAT/CFDI", "Consultas de empleados", "Jornadas variables"] }
    ]
  },
  {
    id: "sec_asistencia", title: "Asistencia y Tiempos", desc: "Analiza tu sistema actual de control de asistencia y horarios.",
    items: [
      { id: "metodo_asistencia", type: "radio", label: "Método de registro de asistencia", required: true, options: ["Sin sistema formal", "Registro manual en papel", "Reloj checador (tarjetas)", "Biometría (huella digital)", "App móvil"] },
      { id: "empleados_campo", type: "radio", label: "¿Personal en campo o remoto?", required: true, options: ["Sí, la mayoría", "Sí, una parte", "No, solo oficina/planta"] },
      { id: "problemas_asistencia", type: "checkbox", label: "Problemas con asistencia (varios)", required: false, options: ["Suplantación / fraude", "Desorganización de registros", "Desconexión con nómina", "Dificultad en campo"] }
    ]
  },
  {
    id: "sec_reportes", title: "Análisis e Inteligencia", desc: "Reportes y análisis críticos para la operación de tu negocio.",
    items: [
      { id: "reportes_actuales", type: "radio", label: "¿Cómo analizas costos de mano de obra?", required: true, options: ["Sin análisis formal", "Revisión manual en Excel", "Reportes del contador", "Dashboard en tiempo real"] },
      { id: "reportes_necesarios", type: "checkbox", label: "Reportes de interés en HUTEC (varios)", required: false, options: ["Costo por área/proyecto", "Ausentismo y retardos", "Productividad vs Costo", "Historial salarial", "Cumplimiento en campo"] }
    ]
  },
  {
    id: "sec_plan", title: "Plan de Implementación", desc: "Cronograma y necesidades de migración de datos.",
    items: [
      { id: "timeline", type: "radio", label: "Horizonte de implementación", required: true, options: ["Inmediato (2-4 semanas)", "Corto plazo (1-2 meses)", "Mediano plazo (3-6 meses)", "En evaluación"] },
      { id: "migracion", type: "radio", label: "¿Necesitas migrar datos históricos?", required: true, options: ["Sí, múltiples años", "Sí, año actual", "No requiero historial"] }
    ]
  },
  {
    id: "sec_extra", title: "Contexto Adicional", desc: "Información extra para personalizar tu demostración al máximo.",
    items: [
      { id: "objetivos", type: "textarea", label: "Objetivo principal con HUTEC", required: false, placeholder: "Ej. Reducir carga administrativa, eficiencia operativa..." },
      { id: "comentarios", type: "textarea", label: "Aspectos específicos de tu industria", required: false, placeholder: "Ej. Turnos especiales, jornadas variables, estacionalidad..." }
    ]
  }
];

const buildIndustryQuestions = (
  infoSection: QuestionSection,
  operationSection: QuestionSection,
): QuestionSection[] => [infoSection, operationSection, ...BASE_QUESTIONS.slice(2)];

const INDUSTRY_QUESTIONS: Record<string, QuestionSection[]> = {
  restaurantes: buildIndustryQuestions(
    {
      id: "sec_info", title: "Perfil Gastronómico", desc: "Cuéntanos sobre tu operación gastronómica y estructura organizacional.",
      items: [
        { id: "empresa", type: "text", label: "Nombre del Restaurante / Cadena", required: true, placeholder: "Ej. Grupo Gastronómico del Norte S.A. de C.V." },
        { id: "tipo_restaurante", type: "select", label: "Tipo de Establecimiento", required: true, options: ["Restaurante casual de servicio completo", "Restaurante fine dining / alta cocina", "Quick Service Restaurant (QSR) / Comida rápida", "Cafetería especializada / Coffee Shop", "Bar / Pub / Antro", "Food Truck / Concesión", "Dark Kitchen / Cloud Kitchen (solo delivery)", "Cadena corporativa / Franquicia", "Catering / Servicio de banquetes", "Servicio mixto (restaurante + catering)"] },
        { id: "esquema_organizacional", type: "select", label: "Estructura organizacional", required: true, options: ["Restaurante independiente (propietario único)", "Grupo restaurantero regional", "Cadena nacional corporativa", "Franquicia matriz", "Franquicia franquiciatario", "Dark Kitchen operador múltiple marcas", "Grupo hotelero con restaurantes"] },
        { id: "empleados", type: "radio", label: "Personal total (cocina + piso + administración)", required: true, options: ["1-10 empleados", "11-25 empleados", "26-50 empleados", "51-100 empleados", "Más de 100 empleados"] },
        { id: "ubicaciones", type: "radio", label: "Número de sucursales / unidades de negocio", required: true, options: ["1 ubicación (única)", "2-3 sucursales", "4-10 sucursales", "11-25 sucursales", "Más de 25 sucursales"] },
        { id: "volumen_transacciones", type: "select", label: "Volumen mensual aproximado de nómina", required: false, options: ["Menos de $200K MXN", "$200K - $500K MXN", "$500K - $1M MXN", "$1M - $3M MXN", "$3M - $10M MXN", "Más de $10M MXN", "Prefiero no especificar"] }
      ]
    },
    {
      id: "sec_operacion", title: "Operación y Desafíos", desc: "Identifica los procesos críticos y áreas de oportunidad en tu restaurante.",
      items: [
        { id: "areas_automatizar", type: "checkbox", label: "Áreas que deseas automatizar o mejorar en HUTEC (selecciona todas las aplicables)", required: true, options: ["Control de asistencia por turno (matutino/vespertino/nocturno)", "Cálculo y distribución de propinas (meseros, bar, cocina)", "Gestión de horas extra y tiempo extra en cocina", "Control de comisiones de ventas y ventas cruzadas", "Registro de uniformes y equipo de trabajo", "Control de capacitaciones y certificaciones (manipulación de alimentos)", "Cálculo de aguinaldo, vacaciones y prima vacacional", "Gestión de prestaciones y vales de despensa", "Control de descansos y horarios de comida", "Nómina diferenciada (meseros, cocineros, administrativos)", "Cumplimiento IMSS y Altas/Bajas automatizadas", "Reportes de productividad por turno y sucursal", "Dashboard de costo de mano de obra vs ventas", "Alertas de retardos, faltas y acumulación de faltas"] },
        { id: "turnos_activos", type: "checkbox", label: "Turnos y horarios que operas (selecciona todos)", required: true, options: ["Desayuno / Turno matutino (6:00 - 14:00)", "Comida / Turno vespertino (13:00 - 22:00)", "Cena / Turno nocturno (18:00 - 02:00)", "Horario corrido de lunes a domingo", "Turnos rotativos por personal", "Fines de semana extendido (viernes-domingo)", "Servicio 24 horas / Guardias nocturnas", "Temporadas especiales (días festivos, eventos)"] },
        { id: "tipo_contratacion", type: "checkbox", label: "Tipos de personal que manejas (selecciona todos)", required: true, options: ["Personal de planta (base fijo)", "Personal eventual por temporada", "Meseros de medio tiempo (4-6 horas)", "Cocineros y chefs especializados", "Bartenders y baristas", "Personal de limpieza y mantenimiento", "Repartidores / delivery (propio)", "Personal de eventos y catering temporal", "Gerentes y subgerentes por sucursal", "Personal administrativo central"] },
        { id: "pain_points", type: "checkbox", label: "Principales dolores operativos actuales (selecciona los 3 más críticos)", required: false, options: ["Alta rotación de meseros y personal de piso", "Control de asistencia en horarios irregulares", "Cálculo complejo de propinas por mesa/bar/cocina", "Horas extra no registradas correctamente", "Faltas imprevistas sin sustitución rápida", "Cumplimiento normativo IMSS (altas/bajas tardías)", "Falta de visibilidad de costo laboral por sucursal", "Coordinación de horarios entre múltiples ubicaciones", "Conciliación de nómina con cierre de caja", "Control de capacitaciones y certificaciones vencidas", "Cálculo de aguinaldo con personal variable"] },
        { id: "sistema_actual", type: "select", label: "¿Qué sistema usas actualmente para nómina y asistencia?", required: true, options: ["Excel / hojas de cálculo manuales", "Software contable externo (ContPAQ, Aspel, etc.)", "Reloj checador tradicional (huella/tarjeta)", "App móvil de asistencia (no integrada a nómina)", "ERP corporativo (SAP, Oracle, etc.)", "Sistema propio o desarrollado internamente", "No tengo sistema formal / control manual"] },
        { id: "prioridad_implementacion", type: "radio", label: "¿Cuál es tu prioridad de implementación?", required: true, options: ["Inmediata (ya estamos en proceso de decisión)", "Corto plazo (1-2 meses)", "Mediano plazo (3-6 meses)", "Largo plazo (más de 6 meses)", "Aún en etapa de exploración"] }
      ]
    }
  ),
  construccion: buildIndustryQuestions(
    {
      id: "sec_info", title: "Perfil de la Constructora", desc: "Datos sobre tu operación en obra y estructura empresarial.",
      items: [
        { id: "empresa", type: "text", label: "Nombre de la Constructora / Desarrolladora", required: true, placeholder: "Ej. Constructora del Desarrollo S.A. de C.V." },
        { id: "tipo_obra", type: "select", label: "Tipo de Proyectos Principales", required: true, options: ["Vivienda residencial (casas, departamentos)", "Obra civil / infraestructura (carreteras, puentes)", "Edificación comercial e industrial", "Obra pública / gubernamental", "Remodelación y acabados de lujo", "Proyectos de instalaciones (eléctrica, HVAC, plomería)", "Mantenimiento industrial / Facility", "Desarrollo inmobiliario mixto"] },
        { id: "modalidad_contratacion", type: "select", label: "Modalidad de contratación predominante", required: true, options: ["Contratos por obra determinada (con inicio y fin)", "Personal eventual por jornal diario", "Personal de planta con salario mixto", "Subcontratación de especialidades (albañiles, plomeros, electricistas)", "Consorcio o uniones temporales con otras constructoras", "Modelo mixto (obra propia + subcontratistas)"] },
        { id: "empleados", type: "radio", label: "Personal promedio en todas las obras activas", required: true, options: ["1-10 trabajadores", "11-25 trabajadores", "26-50 trabajadores", "51-100 trabajadores", "Más de 100 trabajadores"] },
        { id: "obras_activas", type: "radio", label: "Obras activas simultáneas actualmente", required: true, options: ["1 obra (foco principal)", "2-3 obras simultáneas", "4-6 obras simultáneas", "7-15 obras simultáneas", "Más de 15 obras (operación regional)"] },
        { id: "alcance_geografico", type: "select", label: "Alcance geográfico de operación", required: false, options: ["Local (un municipio/ciudad)", "Regional (estado o zona)", "Nacional (varios estados)", "Internacional (presencia fuera de México)"] }
      ]
    },
    {
      id: "sec_operacion", title: "Gestión de Obra y Personal", desc: "Desafíos específicos de control en campo y gestión de personal de obra.",
      items: [
        { id: "areas_automatizar", type: "checkbox", label: "Procesos de obra que deseas digitalizar o automatizar (selecciona todos los aplicables)", required: true, options: ["Control de asistencia en campo (sin necesidad de internet)", "Registro de jornaleros y destajistas por obra", "Cálculo de pago por destajo / metraje / avance", "Control de cuadrillas y capataces por obra", "Gestión de viáticos y gastos de campo", "Registro de horas extra en obra y construcción", "Cumplimiento IMSS: Altas/Bajas de personal eventual", "Control de equipos de seguridad (casco, botas, arnés)", "Trazabilidad de trabajadores entre obras múltiples", "Reportes de avance vs. costo de mano de obra por obra", "Integración con sistema de estimaciones y facturación", "Alertas de vencimiento de contratos por obra determinada", "Control de subcontratistas y sus trabajadores", "Dashboard de productividad por capataz / supervisor"] },
        { id: "infraestructura_campo", type: "checkbox", label: "Infraestructura disponible en las obras (selecciona todos)", required: true, options: ["Internet/WiFi en caseta de obra", "Conectividad celular 4G/5G limitada", "Sin conectividad (zonas remotas)", "Caseta de obra con computadora", "Solo supervisores con smartphone", "Cámaras de seguridad / CCTV", "Acceso controlado (tarjetas/huella)"] },
        { id: "pain_points", type: "checkbox", label: "Principales dolores operativos en obra (selecciona los 3 más críticos)", required: false, options: ["Control de asistencia en zonas sin señal de internet/celular", "Cálculo y pago a destajistas (por metraje/avance)", "Alta rotación de jornaleros y falta de continuidad", "Cumplimiento IMSS: Altas tardías y sanciones", "Conciliación de estimaciones vs. costo real de mano de obra", "Viáticos y gastos de campo sin comprobación", "Faltas imprevistas sin sustitución inmediata", "Trazabilidad de trabajadores que rotan entre obras", "Control de horas extra reportadas por capataces", "Validación de identidad (suplantación de jornaleros)"] },
        { id: "sistema_actual", type: "select", label: "¿Qué sistema usas actualmente para control de personal en obra?", required: true, options: ["Listas de asistencia en papel (cuaderno de obra)", "Excel con coordinadores de obra", "WhatsApp y fotos de asistencia", "Reloj checador biométrico (donde hay luz/internet)", "App móvil con funcionamiento offline", "ERP de construcción (Procore, BuilderTREND, etc.)", "Sistema propio desarrollado internamente", "No hay sistema formal / control manual"] },
        { id: "prioridad_implementacion", type: "radio", label: "¿Cuál es tu prioridad de implementación?", required: true, options: ["Inmediata (ya estamos en proceso de decisión)", "Corto plazo (1-2 meses)", "Mediano plazo (3-6 meses)", "Largo plazo (más de 6 meses)", "Aún en etapa de exploración"] }
      ]
    }
  ),
  salud: buildIndustryQuestions(
    {
      id: "sec_info", title: "Perfil del Establecimiento de Salud", desc: "Datos de tu operación clínica y estructura organizacional.",
      items: [
        { id: "empresa", type: "text", label: "Nombre del Hospital / Clínica / Consultorio", required: true, placeholder: "Ej. Grupo Médico del Valle S.A. de C.V." },
        { id: "tipo_establecimiento", type: "select", label: "Tipo de Establecimiento", required: true, options: ["Hospital general (segundo nivel)", "Hospital de especialidades (tercer nivel)", "Hospital privado de alta complejidad", "Clínica médica / quirúrgica", "Red de consultorios médicos", "Laboratorio clínico / de análisis", "Cadena de farmacias con sucursales", "Centro de rehabilitación / fisioterapia", "Clínica dental / odontológica", "Centro de diagnóstico por imagen", "Centro de atención primaria (CAPS)"] },
        { id: "esquema_organizacional", type: "select", label: "Estructura organizacional", required: true, options: ["Clínica independiente (única sede)", "Grupo médico regional (varias especialidades)", "Red hospitalaria corporativa", "Franquicia de salud", "Hospital universitario / docencia", "Centro de salud público / gubernamental", "Operador de salud (servicios administrados)"] },
        { id: "personal_clinico", type: "radio", label: "Personal médico y clínico total", required: true, options: ["1-10 profesionales", "11-25 profesionales", "26-50 profesionales", "51-100 profesionales", "Más de 100 profesionales"] },
        { id: "sedes_ubicaciones", type: "radio", label: "Número de sedes / consultorios / hospitales", required: true, options: ["1 sede única", "2-3 sedes", "4-10 sedes", "11-25 sedes", "Más de 25 sedes"] },
        { id: "especialidades", type: "checkbox", label: "Principales especialidades médicas (selecciona las principales)", required: false, options: ["Medicina general / familiar", "Cirugía general", "Pediatría", "Ginecología y obstetricia", "Cardiología", "Ortopedia y traumatología", "Medicina interna", "Anestesiología", "Radiología / imagen", "Laboratorio clínico", "Urgencias / emergencias", "Terapia intensiva (UCI/UTI)", "Rehabilitación / fisioterapia", "Enfermería especializada", "Apoyo administrativo y operativo"] }
      ]
    },
    {
      id: "sec_operacion", title: "Gestión Clínica y de Personal", desc: "Desafíos específicos del sector salud en control de personal y guardias.",
      items: [
        { id: "areas_automatizar", type: "checkbox", label: "Áreas que deseas automatizar en HUTEC (selecciona todas las aplicables)", required: true, options: ["Control de guardias médicas y programación de rotaciones", "Cálculo de honorarios médicos vs. sueldos base", "Control de asistencia en turnos 24x7 (matutino/vespertino/nocturno)", "Gestión de guardias de 24 horas y compensaciones", "Cálculo de horas extra y tiempo extra en urgencias", "Cumplimiento IMSS: Altas/Bajas de personal clínico eventual", "Control de sustituciones emergentes y personal de refuerzo", "Registro de certificaciones y recertificaciones médicas", "Control de uniformes y equipo de protección personal (EPP)", "Nómina diferenciada: Médicos, enfermeras, técnicos, administrativos", "Gestión de prestaciones especiales (apoyo de transporte nocturno)", "Reportes de productividad médica por especialidad y sede", "Alertas de vencimiento de cédulas profesionales y licencias", "Dashboard de costo de mano de obra por consulta / paciente", "Integración con sistema HIS (expediente clínico electrónico)"] },
        { id: "guardias_turnos", type: "checkbox", label: "Tipos de guardias y turnos que operas (selecciona todos)", required: true, options: ["Turno matutino (07:00 - 15:00)", "Turno vespertino (15:00 - 23:00)", "Turno nocturno (23:00 - 07:00)", "Guardias de 24 horas (médicos de guardia)", "Guardias de fin de semana (sábado y domingo)", "Guardias de días festivos", "Cobertura de guardias por especialidad", "Sistema de post-guardia y recuperación"] },
        { id: "tipo_personal", type: "checkbox", label: "Tipos de personal que manejas (selecciona todos)", required: true, options: ["Médicos especialistas (planta/honorarios)", "Médicos generales (planta/eventual)", "Enfermeras de planta (turno fijo)", "Enfermeras de turno rotativo", "Técnicos de enfermería / auxiliares", "Personal de terapia intensiva", "Técnicos de laboratorio / imagen", "Personal de urgencias y triage", "Personal de limpieza y sanitización", "Personal de mantenimiento hospitalario", "Personal administrativo y admisiones", "Personal de farmacia y almacén"] },
        { id: "pain_points", type: "checkbox", label: "Principales dolores operativos actuales (selecciona los 3 más críticos)", required: false, options: ["Programación compleja de guardias y rotaciones médicas", "Cálculo de honorarios vs. sueldos para médicos", "Cumplimiento IMSS: Altas tardías de médicos/eventuales", "Faltas de personal en turnos críticos (urgencias/nocturnos)", "Cálculo de horas extra y guardias en nómina", "Falta de sustituciones inmediatas en ausencias", "Control de asistencia en turnos de 24 horas", "Vencimiento de certificaciones y cédulas profesionales", "Nómina compleja con múltiples esquemas (base/honorarios/mixto)", "Falta de visibilidad de costo laboral por especialidad", "Coordinación entre múltiples sedes y personal flotante"] },
        { id: "sistema_actual", type: "select", label: "¿Qué sistema usas actualmente para nómina y asistencia?", required: true, options: ["Excel / hojas de cálculo manuales", "Software contable externo (ContPAQ, Aspel, etc.)", "HIS con módulo de nómina básico", "Sistema de guardias médicas independiente", "ERP hospitalario (SAP Healthcare, Oracle Health, etc.)", "Reloj checador biométrico + nómina externa", "No tengo sistema formal / control manual"] },
        { id: "prioridad_implementacion", type: "radio", label: "¿Cuál es tu prioridad de implementación?", required: true, options: ["Inmediata (ya estamos en proceso de decisión)", "Corto plazo (1-2 meses)", "Mediano plazo (3-6 meses)", "Largo plazo (más de 6 meses)", "Aún en etapa de exploración"] }
      ]
    }
  ),
  it: buildIndustryQuestions(
    {
      id: "sec_info", title: "Perfil de la Empresa Tecnológica", desc: "Cuéntanos sobre tu operación de software, soporte o servicios digitales.",
      items: [
        { id: "empresa", type: "text", label: "Nombre de la Empresa / Startup", required: true, placeholder: "Ej. HUTEC Labs S.A.P.I. de C.V." },
        { id: "tipo_servicio_it", type: "select", label: "Modelo de negocio tecnológico", required: true, options: ["Desarrollo de software a medida (custom development)", "Producto SaaS / Plataforma propia", "Software Factory / Nearshore outsourcing", "Soporte técnico / Mesa de ayuda (ITSM)", "Consultoría tecnológica / Digital transformation", "Ciberseguridad y protección de datos", "Infraestructura Cloud / DevOps / SRE", "Inteligencia Artificial / Data Science", "Agencia digital / E-commerce / Marketing tech", "Fintech / Proptech / Healthtech / Legaltech", "Integrador de sistemas (Systems Integrator)", "Startup tecnológica en crecimiento"] },
        { id: "modelo_servicio", type: "select", label: "¿Cómo cobran principalmente?", required: true, options: ["Por proyecto fijo (fixed scope)", "Por hora / Time & Materials", "Retainer mensual (equipo dedicado)", "SaaS: Suscripción mensual/anual", "Mixto: Proyectos + Soporte continuo", "Por resultado / Performance based"] },
        { id: "tamanio_equipo", type: "radio", label: "Tamaño total del equipo (todos los departamentos)", required: true, options: ["1-10 colaboradores", "11-25 colaboradores", "26-50 colaboradores", "51-100 colaboradores", "101-250 colaboradores", "Más de 250 colaboradores"] },
        { id: "ubicaciones", type: "radio", label: "Número de oficinas / hubs / centros de trabajo", required: true, options: ["1 ubicación principal", "2-3 ubicaciones (sede + satélites)", "4-5 ubicaciones (operación regional)", "Más de 5 ubicaciones (operación multinacional)", "100% remoto sin oficinas físicas"] },
        { id: "esquema_trabajo", type: "select", label: "Esquema de trabajo predominante", required: true, options: ["100% Remoto (work from anywhere)", "Híbrido (2-3 días en oficina)", "Presencial obligatorio", "Remoto con hubs de coworking", "Equipos distribuidos por zona horaria"] }
      ]
    },
    {
      id: "sec_operacion", title: "Gestión de Proyectos y Equipos Tecnológicos", desc: "Identifica los procesos que deseas automatizar y los desafíos operativos.",
      items: [
        { id: "areas_automatizar", type: "checkbox", label: "Áreas que deseas automatizar en HUTEC (selecciona todas las aplicables)", required: true, options: ["Registro de horas por proyecto y cliente (time tracking)", "Control de asistencia en modalidad remota/híbrida", "Cálculo de nómina con complementos por proyecto", "Gestión de guardias on-call / soporte 24x7", "Reportes de productividad por desarrollador / squad", "Dashboard de rentabilidad por proyecto y cliente", "Control de horas facturables vs. no facturables", "Gestión de onboarding/offboarding técnico", "Alertas de meta de horas por proyecto (burn rate)", "Cálculo de comisiones por ventas o referidos", "Control de capacitaciones y certificaciones técnicas", "Gestión de prestaciones especiales (home office, vales)", "Integración con herramientas actuales (Jira, GitHub, Slack)", "Reportes de ausentismo y disponibilidad por equipo", "Análisis de costo por entrega / feature / sprint"] },
        { id: "roles_equipo", type: "checkbox", label: "Roles principales en tu equipo (selecciona todos)", required: true, options: ["Desarrolladores / Ingenieros de software", "QA / Testers / Automation engineers", "DevOps / Cloud engineers / SRE", "UX/UI Designers / Product Designers", "Product Managers / Product Owners", "Scrum Masters / Agile coaches", "Analistas de negocio / BA", "Soporte técnico / Helpdesk", "Ciberseguridad / Ethical hackers", "Data Engineers / Data Scientists", "Project Managers / Account Managers", "Ventas / Pre-sales / Customer Success", "Marketing / Growth hackers", "Administración / RH / Finanzas"] },
        { id: "pain_points", type: "checkbox", label: "Principales dolores operativos (selecciona los 3 más críticos)", required: false, options: ["Difícil seguimiento de horas reales por proyecto", "Falta de visibilidad de rentabilidad por cliente", "Coordinación entre squads / equipos distribuidos", "Control de asistencia en modalidad 100% remota", "Cálculo de on-call y guardias de soporte", "Onboarding/offboarding lento de personal técnico", "Sobregiro de horas en proyectos (scope creep)", "Falta de reportes de productividad individual", "Cálculo de comisiones complejas", "Seguimiento de certificaciones y capacitaciones", "Integración entre herramientas actuales", "Gestión de ausentismo sin supervisión directa"] },
        { id: "herramientas_actuales", type: "checkbox", label: "Stack tecnológico actual de gestión (selecciona todos)", required: false, options: ["Jira / Linear / Asana / Monday", "GitHub / GitLab / Bitbucket", "Slack / Microsoft Teams / Discord", "Notion / Confluence / Wiki", "HubSpot / Salesforce / Pipedrive", "Google Workspace / Microsoft 365", "Azure DevOps / AWS / GCP", "Excel / Google Sheets para reporting", "Reloj checador tradicional (irrelevante para remoto)", "ERP contable (no integrado a operación)", "Sistema propio interno", "No hay sistema formal consolidado"] },
        { id: "sistema_actual", type: "select", label: "¿Qué sistema usas actualmente para control de tiempo y nómina?", required: true, options: ["Excel / hojas de cálculo manuales", "Herramientas de time tracking (Toggl, Clockify, Harvest)", "Jira con plugins de reporting de tiempo", "ERP financiero sin integración operativa", "Sistema propio desarrollado internamente", "No hay sistema formal / procesos ad-hoc"] },
        { id: "prioridad_implementacion", type: "radio", label: "¿Cuál es tu prioridad de implementación?", required: true, options: ["Inmediata (ya estamos en proceso de decisión)", "Corto plazo (1-2 meses)", "Mediano plazo (3-6 meses)", "Largo plazo (más de 6 meses)", "Aún en etapa de exploración"] }
      ]
    }
  ),
  manufactura: buildIndustryQuestions(
    {
      id: "sec_info", title: "Perfil de la Planta Industrial", desc: "Datos clave de tu operación de manufactura y producción.",
      items: [
        { id: "empresa", type: "text", label: "Nombre de la Empresa / Planta", required: true, placeholder: "Ej. Manufacturas Industriales del Norte S.A. de C.V." },
        { id: "tipo_planta", type: "select", label: "Tipo de industria manufacturera", required: true, options: ["Automotriz / Autopartes", "Electrónica y electrodomésticos", "Alimentos y bebidas procesadas", "Textil y confección", "Plásticos y polímeros", "Metal mecánica / Forja / Fundición", "Maquinaria y equipo industrial", "Química y farmacéutica", "Papel y cartón / Empaque", "Madera y muebles", "Cerámica y vidrio", "Aeroespacial y de precisión", "Múltiples líneas de producción"] },
        { id: "esquema_produccion", type: "select", label: "Esquema de producción predominante", required: true, options: ["Producción por lotes (batch production)", "Línea de ensamble continua", "Producción bajo demanda (make-to-order)", "Producción para inventario (make-to-stock)", "Celdas de manufactura flexible", "Producción celular / celda de trabajo", "Proceso continuo 24/7 (petroquímica, cemento)"] },
        { id: "empleados", type: "radio", label: "Personal operativo total (incluyendo administrativos)", required: true, options: ["1-25 empleados", "26-100 empleados", "101-250 empleados", "251-500 empleados", "501-1000 empleados", "Más de 1000 empleados"] },
        { id: "plantas_ubicaciones", type: "radio", label: "Número de plantas o centros de producción", required: true, options: ["1 planta (única)", "2-3 plantas", "4-6 plantas", "7-10 plantas", "Más de 10 plantas (red nacional)"] },
        { id: "lineas_produccion", type: "radio", label: "Líneas de producción / procesos principales", required: true, options: ["1-2 líneas/procesos", "3-5 líneas/procesos", "6-10 líneas/procesos", "Más de 10 líneas/procesos", "Proceso continuo (sin líneas definidas)"] }
      ]
    },
    {
      id: "sec_operacion", title: "Operación y Control de Producción", desc: "Evalúa turnos, supervisión y áreas de mejora en planta.",
      items: [
        { id: "areas_automatizar", type: "checkbox", label: "Procesos que deseas automatizar en HUTEC (selecciona todos los aplicables)", required: true, options: ["Control de asistencia por línea de producción", "Registro de producción por turno y operador", "Cálculo de nómina con producción por pieza/destajo", "Control de tiempos muertos y paros de producción", "Gestión de rotación de personal entre turnos", "Cálculo de incentivos por productividad (eficiencia)", "Control de horas extra y tiempo extra programado", "Cumplimiento IMSS: Altas/Bajas de operarios/eventuales", "Control de uniformes, guantes, lentes y EPP", "Registro de capacitaciones en normas de seguridad industrial", "Reportes de OEE (Eficiencia general del equipo) vs. mano de obra", "Dashboard de costo laboral por unidad producida", "Control de comidas y descansos en turnos rotativos", "Alertas de faltas y sustituciones por línea"] },
        { id: "turnos_configuracion", type: "checkbox", label: "Configuración de turnos en planta (selecciona todos)", required: true, options: ["Primer turno (diurno 6:00 - 14:00)", "Segundo turno (vespertino 14:00 - 22:00)", "Tercer turno (nocturno 22:00 - 6:00)", "Turnos rotativos (cambia cada semana/quincena)", "Turnos fijos (operarios asignados a turno específico)", "Tiempo extra programado (pre-autorizado)", "Tiempo extra no programado (emergencias)", "Guardias de fin de semana", "Paros programados por mantenimiento"] },
        { id: "tipo_operarios", type: "checkbox", label: "Tipos de personal operativo (selecciona todos)", required: true, options: ["Operarios de línea (producción directa)", "Operarios de proceso (preparación/mezclado)", "Técnicos de mantenimiento industrial", "Supervisores de producción (líderes de turno)", "Inspectores de calidad / Control", "Almacenistas y montacarguistas", "Personal de limpieza industrial", "Jefes de producción / Coordinadores", "Ingenieros de proceso / Mejora continua", "Personal administrativo de planta"] },
        { id: "pain_points", type: "checkbox", label: "Principales dolores operativos (selecciona los 3 más críticos)", required: false, options: ["Faltas imprevistas que afectan la línea de producción", "Control de asistencia en turnos rotativos complejos", "Cálculo de nómina con destajo y piezas producidas", "Rotación alta de operarios en turnos nocturnos", "Cumplimiento IMSS: Altas tardías y sanciones", "Control de horas extra no autorizadas", "Falta de visibilidad de costo laboral por SKU/línea", "Coordinación entre múltiples plantas (personal flotante)", "Control de capacitaciones (seguridad industrial obligatoria)", "Cálculo de aguinaldo con personal variable y rotativo", "Gestión de comedores industriales y vales de despensa", "Seguimiento de uniformes y EPP entregados"] },
        { id: "sistema_actual", type: "select", label: "¿Qué sistema usas actualmente para control de personal y nómina?", required: true, options: ["Reloj checador biométrico tradicional (huella/tarjeta)", "ERP industrial (SAP, Oracle, Microsoft Dynamics)", "Sistema MES con módulo de personal", "Excel / Hojas de cálculo manuales", "Software de nómina externo (Aspel, CONTPAQi)", "App móvil básica de asistencia", "Sistema propio desarrollado internamente", "No hay sistema formal / control manual"] },
        { id: "prioridad_implementacion", type: "radio", label: "¿Cuál es tu prioridad de implementación?", required: true, options: ["Inmediata (ya estamos en proceso de decisión)", "Corto plazo (1-2 meses)", "Mediano plazo (3-6 meses)", "Largo plazo (más de 6 meses)", "Aún en etapa de exploración"] }
      ]
    }
  ),
  comercio: buildIndustryQuestions(
    {
      id: "sec_info", title: "Perfil de la Operación Retail", desc: "Datos clave de tu cadena, tienda o negocio comercial.",
      items: [
        { id: "empresa", type: "text", label: "Nombre de la Cadena / Negocio Comercial", required: true, placeholder: "Ej. Grupo Comercial del Pacífico S.A. de C.V." },
        { id: "tipo_retail", type: "select", label: "Tipo de operación comercial", required: true, options: ["Cadena retail de múltiples categorías", "Tienda departamental / gran formato", "Tienda de conveniencia (OXXO, 7-Eleven tipo)", "Boutique / Tienda especializada", "Farmacia y perfumería", "Supermercado / Hipermercado", "Electrónica y tecnología", "Moda y accesorios", "Restauración / Fast food retail", "E-commerce con presencia física (phygital)", "Mayoreo / Cash & Carry", "Autoservicio / Minisúper"] },
        { id: "formato_tienda", type: "select", label: "Formato de tienda principal", required: true, options: ["Tienda pequeña (menos de 100 m²)", "Tienda mediana (100-500 m²)", "Tienda grande (500-2000 m²)", "Tienda mega / Flagship (más de 2000 m²)", "Mixto: Múltiples formatos", "Kioscos / Islas / Puntos de venta"] },
        { id: "empleados", type: "radio", label: "Personal total en todas las sucursales", required: true, options: ["1-10 empleados", "11-50 empleados", "51-150 empleados", "151-500 empleados", "501-1000 empleados", "Más de 1000 empleados"] },
        { id: "tiendas_ubicaciones", type: "radio", label: "Número de puntos de venta / sucursales", required: true, options: ["1 tienda (única)", "2-5 tiendas", "6-15 tiendas", "16-30 tiendas", "31-50 tiendas", "51-100 tiendas", "Más de 100 tiendas (cadena nacional)"] },
        { id: "geografia", type: "select", label: "Cobertura geográfica", required: false, options: ["Local (un municipio/ciudad)", "Regional (estado o zona)", "Nacional (varios estados)", "Internacional (presencia en otros países)"] }
      ]
    },
    {
      id: "sec_operacion", title: "Operación y Gestión de Personal Retail", desc: "Evalúa desafíos de piso de venta, horarios y temporada alta.",
      items: [
        { id: "areas_automatizar", type: "checkbox", label: "Áreas que deseas automatizar en HUTEC (selecciona todos los aplicables)", required: true, options: ["Control de asistencia por tienda y horario de apertura/cierre", "Cálculo de comisiones de ventas por vendedor", "Gestión de horarios escalonados por temporada", "Control de efectivo y arqueos de caja por turno", "Rotación de personal entre sucursales (flotante)", "Cálculo de incentivos por metas de ventas", "Gestión de altas y bajas de personal eventual/temporada", "Control de descansos y horas de comida en piso", "Cumplimiento IMSS: Altas rápidas por alta rotación", "Reportes de productividad por tienda y vendedor", "Dashboard de costo de mano de obra vs. ventas por tienda", "Control de uniformes y dotación por sucursal", "Alertas de faltas y sustituciones inmediatas", "Gestión de vacaciones y descansos en temporada alta"] },
        { id: "roles_retail", type: "checkbox", label: "Roles principales en tu operación (selecciona todos)", required: true, options: ["Vendedores / Asesores de piso", "Cajeros / Responsables de caja", "Jefes de tienda / Gerentes de sucursal", "Subgerentes / Segundos al mando", "Supervisores / Zoners (visitan múltiples tiendas)", "Analistas de inventario y reposición", "Personal de seguridad y vigilancia", "Personal de limpieza y mantenimiento", "Visual merchandising / Cambio de escaparates", "Repartidores / Personal de última milla", "Personal administrativo central (CEDI / Oficinas)", "Gerentes de zona / Región"] },
        { id: "temporadas", type: "checkbox", label: "Temporadas de alto volumen (selecciona todas las aplicables)", required: true, options: ["Día del Padre / Día de las Madres", "Regreso a clases (julio-agosto)", "Buen Fin / Black Friday / Cyber Monday", "Navidad / Diciembre (todo el mes)", "Rebajas de enero / Fin de inventario", "Semana Santa / Vacaciones de primavera", "Verano / Temporada vacacional", "Días sin IVA / Eventos gubernamentales", "Hot Sale / Eventos específicos de e-commerce", "Campañas propias de la marca / Aniversario"] },
        { id: "pain_points", type: "checkbox", label: "Principales dolores operativos (selecciona los 3 más críticos)", required: false, options: ["Alta rotación de vendedores y cajeros", "Cálculo complejo de comisiones e incentivos", "Cobertura de horarios en aperturas y cierres", "Control de asistencia en múltiples ubicaciones", "Cumplimiento IMSS por alta rotación y altas tardías", "Personal 'fantasma' / Asistencia sin validación", "Coordinación de personal flotante entre sucursales", "Cálculo de nómina con horarios escalonados", "Faltas imprevistas sin sustitución rápida", "Gestión de tiempo extra en temporada alta", "Visibilidad de costo laboral por tienda/region", "Control de vacaciones en fechas restringidas"] },
        { id: "sistema_actual", type: "select", label: "¿Qué sistema usas actualmente para control de personal?", required: true, options: ["Reloj checador biométrico en cada tienda", "POS con módulo de asistencia integrado", "Software de nómina + asistencia separados", "Excel / Hojas de cálculo manuales por tienda", "App móvil básica de asistencia", "ERP retail con módulo de RH (SAP, Oracle)", "Sistema propio desarrollado internamente", "No hay sistema formal / control manual"] },
        { id: "prioridad_implementacion", type: "radio", label: "¿Cuál es tu prioridad de implementación?", required: true, options: ["Inmediata (ya estamos en proceso de decisión)", "Corto plazo (1-2 meses)", "Mediano plazo (3-6 meses)", "Largo plazo (más de 6 meses)", "Aún en etapa de exploración"] }
      ]
    }
  ),
  logistica: buildIndustryQuestions(
    {
      id: "sec_info", title: "Perfil de la Operación Logística", desc: "Datos clave de tu empresa de transporte, distribución o fulfillment.",
      items: [
        { id: "empresa", type: "text", label: "Nombre de la Empresa / Transportista", required: true, placeholder: "Ej. Logística Integral del Centro S.A. de C.V." },
        { id: "tipo_logistica", type: "select", label: "Tipo de operación logística principal", required: true, options: ["Transporte de carga foránea (larga distancia)", "Distribución local / urbana (última milla)", "Paquetería y mensajería express", "Transporte de carga especializada (refrigerada, peligrosa)", "Operador logístico 3PL (outsourcing total)", "Fulfillment / Almacén y preparación de pedidos", "Cross-docking / Centro de distribución", "Transporte de personal / Traslado de empleados", "Mudanzas y carga fraccionada (LTL)", "Transporte multimodal (ferroviario, marítimo)", "Courier / Entregas urgentes (same-day)", "Operación mixta (varios modos)"] },
        { id: "tipo_clientes", type: "select", label: "Principal tipo de clientes", required: true, options: ["Empresas manufactureras (B2B industrial)", "E-commerce / Marketplaces (B2C)", "Retail y tiendas departamentales", "Comercio en general (varios giros)", "Sector salud y farmacéutico", "Sector alimentos (cadena de frío)", "Sector construcción y proyectos", "Gobierno y sector público", "Mixto: B2B + B2C"] },
        { id: "empleados", type: "radio", label: "Personal total (operadores + almacén + admin)", required: true, options: ["1-25 empleados", "26-100 empleados", "101-250 empleados", "251-500 empleados", "501-1000 empleados", "Más de 1000 empleados"] },
        { id: "flota_vehiculos", type: "radio", label: "Tamaño de flota / unidades de transporte", required: true, options: ["1-10 unidades", "11-25 unidades", "26-50 unidades", "51-100 unidades", "101-250 unidades", "Más de 250 unidades", "No tenemos flota propia (subcontratamos)"] },
        { id: "bodegas_centros", type: "radio", label: "Centros de distribución / bodegas", required: true, options: ["1 centro (único)", "2-3 centros", "4-6 centros", "7-10 centros", "Más de 10 centros (red nacional)", "No tenemos bodegas (solo transporte)"] }
      ]
    },
    {
      id: "sec_operacion", title: "Control de Rutas y Personal Operativo", desc: "Gestión de operadores, ruteo y seguimiento en campo.",
      items: [
        { id: "areas_automatizar", type: "checkbox", label: "Procesos que deseas digitalizar (selecciona todos los aplicables)", required: true, options: ["Control de asistencia de operadores en ruta (GPS + tiempo)", "Liquidación automática de viajes (tarifa por ruta)", "Cálculo de viáticos y gastos de ruta", "Control de horas de manejo (descansos obligatorios)", "Seguimiento de entregas vs. asistencia del operador", "Gestión de turnos de operadores (matutino/vespertino/nocturno)", "Cálculo de horas extra por tiempo de espera en cliente", "Control de cumplimiento de cartas porte / SAT", "Registro de checklist de unidad (salida/entrada)", "Alertas de faltas y sustituciones de operadores", "Dashboard de productividad por unidad y operador", "Integración con TMS y sistemas de ruteo", "Control de capacitaciones (licencias de conducir, certificaciones)", "Cálculo de nómina con bonos por productividad (entregas a tiempo)", "Gestión de personal de almacén y montacarguistas"] },
        { id: "roles_operativos", type: "checkbox", label: "Tipos de personal operativo (selecciona todos)", required: true, options: ["Operadores de unidad (choferes)", "Ayudantes / Peones de carga", "Personal de almacén (recibo/despacho)", "Montacarguistas y maniobristas", "Supervisores de ruta / Jefes de flota", "Despachadores / Coordinadores de tráfico", "Personal de seguridad de bodega", "Personal de mantenimiento de unidades", "Administrativos de centro de distribución", "Ejecutivos de cuenta / Atención a clientes"] },
        { id: "tipo_rutas", type: "checkbox", label: "Tipos de rutas / servicios (selecciona todos)", required: true, options: ["Rutas locales (dentro de la misma ciudad)", "Rutas foráneas (entre ciudades)", "Rutas de última milla (domicilio particular)", "Servicio express / Urgente (mismo día)", "Servicio programado (clientes fijos)", "Servicio spot (viajes eventuales)", "Rutas nocturnas / Guardias 24hrs", "Transporte de personal (trabajadores a plantas)", "Entregas a tiendas y puntos de venta", "Recolección de mercancía (cliente → bodega)"] },
        { id: "pain_points", type: "checkbox", label: "Principales dolores operativos (selecciona los 3 más críticos)", required: false, options: ["Control de asistencia de operadores en ruta (sin supervisión directa)", "Cálculo de liquidaciones por viaje / tarifa variable", "Rotación alta de operadores (competencia por choferes)", "Control de viáticos y gastos sin comprobación", "Faltas imprevistas sin sustitución inmediata de operador", "Horas extra por tiempo de espera en cliente / aduana", "Cumplimiento de licencias y certificaciones vencidas", "Control de descansos obligatorios entre viajes", "Validación de entregas vs. asistencia real", "Coordinación entre múltiples centros de distribución", "Cálculo de nómina con múltiples tarifas por ruta", "Incidencias en ruta sin registro ni seguimiento"] },
        { id: "sistema_actual", type: "select", label: "¿Qué sistema usas actualmente para control de operadores?", required: true, options: ["GPS con botón de asistencia / Llegada a cliente", "TMS con control de asistencia integrado", "WhatsApp / Fotos de asistencia", "Hojas de ruta en papel firmadas", "App móvil básica de geolocalización", "Excel / Hojas de cálculo manuales", "Sistema propio / Plataforma interna", "No hay sistema formal / Control manual"] },
        { id: "prioridad_implementacion", type: "radio", label: "¿Cuál es tu prioridad de implementación?", required: true, options: ["Inmediata (ya estamos en proceso de decisión)", "Corto plazo (1-2 meses)", "Mediano plazo (3-6 meses)", "Largo plazo (más de 6 meses)", "Aún en etapa de exploración"] }
      ]
    }
  ),
  agricultura: buildIndustryQuestions(
    {
      id: "sec_info", title: "Perfil del Agronegocio", desc: "Datos de tu operación agrícola, ganadera o agroindustrial.",
      items: [
        { id: "empresa", type: "text", label: "Nombre del Rancho / Agronegocio", required: true, placeholder: "Ej. Agrícola del Pacífico S.A. de C.V." },
        { id: "tipo_agro", type: "select", label: "Tipo de operación agropecuaria", required: true, options: ["Agricultura (cultivos a cielo abierto)", "Agricultura protegida / Invernaderos", "Empaque / Empacadora / Centro de acopio", "Ganadería / Producción pecuaria", "Agroindustria / Procesamiento", "Vivero / Horticultura / Flores", "Silvicultura / Producción forestal", "Operación agroforestal mixta", "Distribución agropecuaria"] },
        { id: "productos_principales", type: "checkbox", label: "Principales productos o cultivos (selecciona todos)", required: false, options: ["Hortalizas / Vegetales (tomate, chile, cebolla)", "Frutas (berries, cítricos, aguacate, uva)", "Cereales / Granos (maíz, trigo, sorgo)", "Forrajes / Alimento para ganado", "Ganado bovino (carne o leche)", "Ganado porcino / Avícola / Ovino", "Productos orgánicos / Especializados", "Flores / Plantas ornamentales", "Semillas / Vivero"] },
        { id: "extension_terreno", type: "select", label: "Extensión aproximada", required: false, options: ["Menos de 10 hectáreas", "10-50 hectáreas", "50-200 hectáreas", "200-500 hectáreas", "Más de 500 hectáreas", "No aplica (solo procesamiento)"] },
        { id: "empleados", type: "radio", label: "Personal operativo promedio (temporada alta)", required: true, options: ["1-10 trabajadores", "11-25 trabajadores", "26-50 trabajadores", "51-100 trabajadores", "Más de 100 trabajadores"] },
        { id: "ubicaciones", type: "radio", label: "Campos / ranchos / centros de trabajo", required: true, options: ["1 rancho/campo (único)", "2-3 ranchos/campos", "4-5 ranchos/campos", "Más de 5 ranchos/campos"] }
      ]
    },
    {
      id: "sec_operacion", title: "Gestión de Campo y Jornaleros", desc: "Control de cuadrillas, pagos por rendimiento y operación sin conectividad.",
      items: [
        { id: "areas_automatizar", type: "checkbox", label: "Procesos agropecuarios a automatizar (selecciona todos los aplicables)", required: true, options: ["Control de asistencia en campo sin internet (modo offline)", "Registro de jornaleros por cuadrilla y capataz", "Pago por rendimiento / cajas / kilos cosechados", "Cálculo de jornales diarios y semanales", "Control de actividades agrícolas (siembra, riego, fumigación)", "Cumplimiento IMSS: Altas/Bajas de personal eventual", "Control de prestaciones (alimentación en campo, transporte)", "Registro de horas extra en temporada de cosecha", "Trazabilidad de trabajadores entre campos/ranchos", "Control de herramientas y equipo de trabajo (machetes, tijeras)", "Gestión de contratación temporal por temporada", "Reportes de productividad por cuadrilla y actividad", "Dashboard de costo de mano de obra por hectárea/cultivo", "Alertas de vencimiento de contratos temporales"] },
        { id: "temporada_trabajo", type: "checkbox", label: "Temporadas de trabajo (selecciona todas las aplicables)", required: true, options: ["Siembra (preparación de terreno, siembra)", "Cultivo / Mantenimiento (riego, fertilización)", "Cosecha (pico de mano de obra)", "Empaque / Selección / Clasificación", "Operación continua todo el año", "Temporadas específicas por cultivo"] },
        { id: "tipo_personal_agro", type: "checkbox", label: "Tipos de personal que manejas (selecciona todos)", required: true, options: ["Jornaleros de campo / Cuadrillas", "Capataces / Encargados de cuadrilla", "Tractoristas / Maquinistas", "Personal de empaque / Selección", "Técnicos agrícolas / Agrónomos", "Personal de riego / Fumigación", "Trabajadores especializados (podadores, injertadores)", "Personal de mantenimiento de equipo", "Personal administrativo / Oficina", "Guardias / Seguridad del campo"] },
        { id: "pain_points", type: "checkbox", label: "Principales dolores operativos (selecciona los 3 más críticos)", required: false, options: ["Control de asistencia sin conectividad en campos remotos", "Cálculo de pago por rendimiento (cajas/piezas cosechadas)", "Alta rotación de jornaleros temporales", "Cumplimiento IMSS: Altas tardías de personal eventual", "Supervisión de múltiples cuadrillas en campos dispersos", "Control de viáticos y gastos de campo", "Faltas imprevistas sin sustitución de cuadrillas", "Cálculo de nómina con personal mixto (planta/eventual)", "Trazabilidad de trabajadores entre campos (personal flotante)", "Control de capacitaciones en normas agrícolas", "Gestión de prestaciones (comidas en campo, transporte)", "Cálculo de aguinaldo con personal muy variable"] },
        { id: "sistema_actual", type: "select", label: "¿Qué sistema usas actualmente para control de personal?", required: true, options: ["Listas de asistencia en papel / Cuaderno de campo", "WhatsApp y fotos de asistencia", "Excel con supervisores", "App básica con funcionamiento offline", "Sistema propio desarrollado internamente", "ERP agropecuario con módulo de personal", "No hay sistema formal / Control manual"] },
        { id: "prioridad_implementacion", type: "radio", label: "¿Cuál es tu prioridad de implementación?", required: true, options: ["Inmediata (ya estamos en proceso de decisión)", "Corto plazo (1-2 meses)", "Mediano plazo (3-6 meses)", "Largo plazo (más de 6 meses)", "Aún en etapa de exploración"] }
      ]
    }
  ),
  educacion: buildIndustryQuestions(
    {
      id: "sec_info", title: "Perfil de la Institución Educativa", desc: "Datos de tu plantel, universidad, colegio o red educativa.",
      items: [
        { id: "empresa", type: "text", label: "Nombre de la Institución", required: true, placeholder: "Ej. Universidad del Norte / Colegio San Patricio" },
        { id: "tipo_institucion", type: "select", label: "Tipo de institución educativa", required: true, options: ["Preescolar / Kindergarten", "Primaria / Escuela básica", "Secundaria / Middle School", "Preparatoria / Bachillerato / High School", "Universidad / Institución de educación superior", "Tecnológico / Instituto técnico", "Centro de capacitación / Training center", "Academia de idiomas / Idiomas especializados", "Escuela de arte / deporte / especializada", "Red de colegios / Cadena educativa"] },
        { id: "esquema_educativo", type: "select", label: "Esquema de operación", required: true, options: ["Escuela / Colegio privado", "Escuela / Colegio público", "Universidad privada", "Universidad pública", "Instituto técnico privado", "Instituto técnico público", "Franquicia educativa / Licenciatario", "Corporativo educativo (múltiples marcas)"] },
        { id: "alumnos_aprox", type: "select", label: "Número aproximado de alumnos", required: false, options: ["Menos de 100 alumnos", "100-500 alumnos", "500-1000 alumnos", "1000-3000 alumnos", "3000-10000 alumnos", "Más de 10000 alumnos"] },
        { id: "empleados", type: "radio", label: "Personal docente y administrativo", required: true, options: ["1-10 empleados", "11-25 empleados", "26-50 empleados", "51-100 empleados", "101-250 empleados", "Más de 250 empleados"] },
        { id: "ubicaciones", type: "radio", label: "Número de planteles, campus o sedes", required: true, options: ["1 plantel/campus (único)", "2-3 planteles/campus", "4-5 planteles/campus", "6-10 planteles/campus", "Más de 10 planteles/campus"] }
      ]
    },
    {
      id: "sec_operacion", title: "Gestión Académica y Administrativa", desc: "Control de horarios docentes, sustituciones y ciclos escolares.",
      items: [
        { id: "areas_automatizar", type: "checkbox", label: "Áreas educativas a automatizar (selecciona todos los aplicables)", required: true, options: ["Control de asistencia de docentes por horario de clase", "Registro de horas no lectivas (preparación, comisiones)", "Gestión de sustituciones docentes inmediatas", "Control de personal administrativo y de apoyo", "Cálculo de nómina docente (horas frente a grupo)", "Cálculo de nómina administrativa", "Cumplimiento IMSS: Altas/Bajas de personal eventual", "Control de capacitaciones y certificaciones docentes", "Gestión de vacaciones en períodos escolares", "Control de contratos por ciclo escolar / cuatrimestre", "Reportes de costo laboral por área académica", "Dashboard de asistencia por plantel y departamento", "Alertas de retardos y faltas de docentes", "Gestión de prestaciones y vales para personal"] },
        { id: "modelo_clases", type: "radio", label: "Modelo de operación académica", required: true, options: ["100% Presencial (clases en aula)", "Híbrido (presencial + en línea)", "En línea / Virtual", "Mixto por nivel (preescolar presencial, universidad híbrida)", "Distancia con sesiones presenciales periódicas"] },
        { id: "roles_educativos", type: "checkbox", label: "Roles principales en tu institución (selecciona todos)", required: true, options: ["Docentes / Profesores / Maestros frente a grupo", "Coordinadores académicos / Jefes de área", "Directores / Gerentes de plantel", "Personal administrativo (secretaría, tesorería)", "Personal de apoyo (intendencia, vigilancia, mantenimiento)", "Personal de servicios (cafetería, librería, estacionamiento)", "Tutores / Psicopedagogos / Orientadores", "Investigadores / Posgrados (solo universidades)", "Personal de recursos humanos y nómina", "Personal de marketing y admisiones"] },
        { id: "pain_points", type: "checkbox", label: "Retos operativos frecuentes (selecciona los 3 más críticos)", required: false, options: ["Control de horarios docentes complejos (múltiples grupos)", "Sustituciones urgentes cuando un docente falta", "Coordinación entre múltiples planteles/campus", "Cálculo de nómina docente con horas variables", "Seguimiento de personal por ciclo escolar o cuatrimestre", "Cumplimiento IMSS de personal eventual (eventos, reemplazos)", "Faltas imprevistas de docentes sin aviso", "Gestión de vacaciones en fechas restringidas (vacaciones escolares)", "Control de asistencia de personal administrativo", "Carga administrativa manual para RH", "Falta de visibilidad de costos por área académica", "Coordinación de horarios entre planteles (personal flotante)"] },
        { id: "sistema_actual", type: "select", label: "¿Qué sistema usas actualmente para control de personal?", required: true, options: ["Excel / hojas de cálculo manuales", "Sistema escolar / ERP educativo (SIFE, EduAdmin, etc.)", "Control biométrico + software de nómina separado", "LMS con módulo básico de asistencia (Canvas, Moodle)", "App móvil de asistencia simple", "Sistema propio desarrollado internamente", "No hay sistema formal / Control manual"] },
        { id: "prioridad_implementacion", type: "radio", label: "¿Cuál es tu prioridad de implementación?", required: true, options: ["Inmediata (ya estamos en proceso de decisión)", "Corto plazo (1-2 meses)", "Mediano plazo (3-6 meses)", "Largo plazo (más de 6 meses)", "Aún en etapa de exploración"] }
      ]
    }
  ),
  finanzas: buildIndustryQuestions(
    {
      id: "sec_info", title: "Perfil de la Firma Financiera", desc: "Datos de tu despacho contable, financiera o firma de servicios.",
      items: [
        { id: "empresa", type: "text", label: "Nombre de la Empresa / Firma", required: true, placeholder: "Ej. Integral Financial Services / Contadores Asociados" },
        { id: "tipo_financiera", type: "select", label: "Tipo de firma", required: true, options: ["Despacho contable / Firma de contadores", "Financiera regulada (SOFOM, SOCAP)", "Casa de cambio / Money exchange", "Crédito / Microcrédito / Crowdfunding", "Cobranza / Reestructura financiera", "Seguros / Agencia de seguros", "Casa de bolsa / Asset management", "Fintech / Neobank / Financiera digital", "Consultoría financiera / Auditoría", "Backoffice de institución financiera"] },
        { id: "servicios_principales", type: "checkbox", label: "Servicios principales (selecciona todos)", required: false, options: ["Contabilidad general y estados financieros", "Auditoría / Revisión fiscal", "Nómina y cálculo de impuestos", "Outsourcing contable / Outsourcing de nómina", "Crédito / Préstamos / Factoraje", "Cobranza administrativa / Judicial", "Seguros (venta, siniestros)", "Asesoría financiera / Wealth management", "Consultoría fiscal y corporativa", "Procesamiento de pagos / Transacciones"] },
        { id: "empleados", type: "radio", label: "Personal total", required: true, options: ["1-10 empleados", "11-25 empleados", "26-50 empleados", "51-100 empleados", "101-250 empleados", "Más de 250 empleados"] },
        { id: "ubicaciones", type: "radio", label: "Número de oficinas / sucursales", required: true, options: ["1 oficina (única)", "2-3 oficinas/sucursales", "4-5 oficinas/sucursales", "6-10 oficinas/sucursales", "Más de 10 oficinas/sucursales"] },
        { id: "clientes_tipo", type: "select", label: "Tipo de clientes principal", required: false, options: ["Empresas PYMEs (personas morales)", "Personas físicas / Clientes individuales", "Grandes empresas / Corporativos", "Sector gubernamental / Público", "Clientes internacionales / Cross-border", "Mixto: todos los segmentos"] }
      ]
    },
    {
      id: "sec_operacion", title: "Operación y Control de Ejecutivos", desc: "Productividad, comisiones, cumplimiento normativo.",
      items: [
        { id: "areas_automatizar", type: "checkbox", label: "Áreas financieras a automatizar (selecciona todos los aplicables)", required: true, options: ["Control de asistencia de ejecutivos y asesores", "Registro de horas trabajadas por cliente/caso", "Cálculo de comisiones por ventas o cierres", "Cálculo de bonos por metas de producción", "Control de productividad por ejecutivo (clientes atendidos)", "Gestión de incentivos y esquemas de compensación", "Cumplimiento IMSS: Altas/Bajas de personal eventual", "Control de capacitaciones y certificaciones (CPC, CNBV)", "Dashboard de rentabilidad por ejecutivo / asesor", "Reportes de costo de mano de obra por servicio", "Control de vacaciones y descansos en cierre fiscal", "Gestión de prestaciones (vales, seguros, ahorro)", "Alertas de vencimiento de cédulas profesionales", "Integración con sistemas de contabilidad (Aspel, CONTPAQi)"] },
        { id: "modelo_operacion", type: "radio", label: "Modelo operativo predominante", required: true, options: ["Atención a clientes en oficina (branch)", "Atención a clientes en campo / Visitas", "Procesamiento interno / Backoffice / Shared Services", "Contact center / Call center", "Modelo híbrido (oficina + campo)", "100% digital / Remoto (asesores virtuales)"] },
        { id: "roles_financieros", type: "checkbox", label: "Roles principales en tu firma (selecciona todos)", required: true, options: ["Contadores / Auditores / Revisores fiscales", "Asesores financieros / Wealth advisors", "Ejecutivos de cuenta / Account executives", "Analistas de crédito / Underwriters", "Cobranza / Recuperación de cartera", "Atención a clientes / Service desk", "Analistas contables / Staff contable", "Gerentes de sucursal / Branch managers", "Directores de área / Regional managers", "Personal de compliance / Auditoría interna", "Soporte administrativo y RH", "Tecnología / Sistemas"] },
        { id: "pain_points", type: "checkbox", label: "Retos operativos frecuentes (selecciona los 3 más críticos)", required: false, options: ["Control de productividad por ejecutivo/asistente", "Cálculo complejo de comisiones e incentivos", "Cumplimiento normativo (CNBV, CNB, SAT, auditorías)", "Alta rotación de asesores y ejecutivos", "Carga manual de información para reportes", "Seguimiento por cartera, sucursal o producto", "Control de asistencia con horarios irregulares", "Nómina compleja con múltiples esquemas de compensación", "Faltas de personal en fechas críticas (cierre fiscal)", "Falta de visibilidad de rentabilidad por ejecutivo", "Coordinación entre múltiples oficinas/sucursales", "Control de capacitaciones obligatorias y certificaciones"] },
        { id: "sistema_actual", type: "select", label: "¿Qué sistema usas actualmente para control de personal?", required: true, options: ["Excel / hojas de cálculo manuales", "Sistema contable con módulo de RH (Aspel NOI, CONTPAQi)", "CRM financiero con control de asistencia", "ERP corporativo (SAP, Oracle Financials)", "App móvil de asistencia + nómina externa", "Core bancario con módulo de personal", "Sistema propio desarrollado internamente", "No hay sistema formal / Control manual"] },
        { id: "prioridad_implementacion", type: "radio", label: "¿Cuál es tu prioridad de implementación?", required: true, options: ["Inmediata (ya estamos en proceso de decisión)", "Corto plazo (1-2 meses)", "Mediano plazo (3-6 meses)", "Largo plazo (más de 6 meses)", "Aún en etapa de exploración"] }
      ]
    }
  ),
  deportes: buildIndustryQuestions(
    {
      id: "sec_info", title: "Perfil del Centro Deportivo", desc: "Datos de tu gimnasio, club o centro de entrenamiento físico.",
      items: [
        { id: "empresa", type: "text", label: "Nombre del Centro / Cadena", required: true, placeholder: "Ej. Sports Club Elite / Gimnasio Fitness Pro" },
        { id: "tipo_deportivo", type: "select", label: "Tipo de centro deportivo", required: true, options: ["Gimnasio tradicional / Fitness center", "Boutique fitness (especializado)", "Club deportivo privado", "Academia deportiva (futbol, tenis, natación)", "Centro de CrossFit / Functional training", "Estudio de yoga / pilates / barre", "Centro de artes marciales / box", "Centro acuático / Alberca olímpica", "Pista de hielo / Deportes de invierno", "Complejo deportivo múltiples disciplinas", "Franquicia deportiva", "Mixto: Varios tipos de servicios"] },
        { id: "modelo_negocio", type: "select", label: "Modelo de negocio principal", required: true, options: ["Membresías mensuales/anuales", "Pase por visita / Day pass", "Paquetes de clases grupales", "Entrenamiento personalizado (PT)", "Eventos deportivos / Torneos", "Alquiler de instalaciones", "Mixto: Combinación de modelos"] },
        { id: "empleados", type: "radio", label: "Personal total (instructores + staff)", required: true, options: ["1-10 empleados", "11-25 empleados", "26-50 empleados", "51-100 empleados", "101-200 empleados", "Más de 200 empleados"] },
        { id: "ubicaciones", type: "radio", label: "Número de sedes / sucursales", required: true, options: ["1 sede (única)", "2-3 sedes", "4-6 sedes", "7-10 sedes", "Más de 10 sedes (cadena regional/nacional)"] },
        { id: "miembros_aprox", type: "select", label: "Base de miembros/clientes aproximada", required: false, options: ["Menos de 100 miembros", "100-500 miembros", "500-1000 miembros", "1000-3000 miembros", "3000-10000 miembros", "Más de 10000 miembros"] }
      ]
    },
    {
      id: "sec_operacion", title: "Operación y Gestión Deportiva", desc: "Control de instructores, horarios extendidos y rentabilidad.",
      items: [
        { id: "areas_automatizar", type: "checkbox", label: "Áreas a automatizar en HUTEC (selecciona todos los aplicables)", required: true, options: ["Control de asistencia de instructores por clase/entrenamiento", "Registro de horas de entrenamiento personal (PT)", "Cálculo de comisiones por ventas de membresías", "Gestión de horarios de clases grupales y reservas", "Control de ingresos por recepción y horarios extendidos", "Cálculo de pagos a instructores por clase impartida", "Cumplimiento IMSS: Altas/Bajas de instructores eventuales", "Reportes de productividad por instructor (clases/clientes)", "Dashboard de ocupación de instalaciones vs. costo laboral", "Control de capacitaciones y certificaciones deportivas", "Gestión de uniformes y equipo de trabajo", "Alertas de vencimiento de membresías y renovaciones", "Coordinación de staff entre múltiples sedes"] },
        { id: "horarios_operacion", type: "checkbox", label: "Horarios y servicios operados (selecciona todos)", required: true, options: ["Lunes a viernes (horario comercial)", "Lunes a viernes (extendido)", "Fines de semana completo", "Entrenamiento matutino temprano (5:00-9:00)", "Entrenamiento vespertino (18:00-22:00)", "Servicio 24 horas (acceso controlado)", "Clases grupales programadas", "Entrenamiento personalizado flexible", "Eventos especiales y competencias"] },
        { id: "tipo_staff", type: "checkbox", label: "Tipos de personal que manejas (selecciona todos)", required: true, options: ["Instructores / Entrenadores certificados", "Entrenadores personales (PT)", "Profesores de clases grupales", "Staff de recepción y atención a clientes", "Vendedores / Asesores de membresías", "Gerentes de sede / Coordinadores", "Personal de limpieza y mantenimiento", "Fisioterapeutas / Nutriólogos / Staff de bienestar", "Seguridad y vigilancia", "Personal administrativo central"] },
        { id: "pain_points", type: "checkbox", label: "Principales dolores operativos (selecciona los 3 más críticos)", required: false, options: ["Cobertura de instructores en horarios extendidos/fines de semana", "Cálculo de comisiones complejas por ventas y upgrades", "Control de asistencia con horarios irregulares y flexibles", "Alta rotación de instructores y recepcionistas", "Coordinación de horarios de clases y sustituciones", "Faltas imprevistas de instructores sin sustitución", "Cálculo de pagos a instructores por clase/hora trabajada", "Falta de visibilidad de rentabilidad por sede/instructor", "Gestión de múltiples sedes con personal flotante", "Control de capacitaciones y certificaciones vigentes"] },
        { id: "sistema_actual", type: "select", label: "¿Qué sistema usas actualmente para gestión del centro?", required: true, options: ["Software de gimnasio especializado (Gympass, Mindbody, etc.)", "Excel / hojas de cálculo manuales", "App básica de asistencia + nómina externa", "Sistema propio desarrollado internamente", "Sin sistema formal / Control manual", "Sistema de punto de venta (POS) integrado"] },
        { id: "prioridad_implementacion", type: "radio", label: "¿Cuál es tu prioridad de implementación?", required: true, options: ["Inmediata (ya estamos en proceso de decisión)", "Corto plazo (1-2 meses)", "Mediano plazo (3-6 meses)", "Largo plazo (más de 6 meses)", "Aún en etapa de exploración"] }
      ]
    }
  ),
  eventos: buildIndustryQuestions(
    {
      id: "sec_info", title: "Perfil de la Empresa de Eventos", desc: "Datos de tu operación de producción, coordinación o entretenimiento.",
      items: [
        { id: "empresa", type: "text", label: "Nombre de la Agencia / Productora", required: true, placeholder: "Ej. Producciones Horizonte / Eventos Elite" },
        { id: "tipo_evento", type: "select", label: "Tipo de operación de eventos", required: true, options: ["Eventos corporativos (conferencias, congresos, lanzamientos)", "Eventos sociales (bodas, XV años, fiestas privadas)", "Producción técnica (iluminación, audio, video)", "Banquetes y catering para eventos", "Entretenimiento y espectáculos (shows, conciertos)", "Ferias y exposiciones comerciales", "Eventos deportivos y carreras", "Eventos gubernamentales e institucionales", "Agencia integral (full service)", "Especialista nicho (florista, decoración, mobiliario)", "Renta de mobiliario y equipo para eventos", "Operación mixta (varios tipos de eventos)"] },
        { id: "esquema_operacion", type: "select", label: "Esquema de operación", required: true, options: ["Agencia con staff propio base + freelance por evento", "Coordinadora que subcontrata todo (outsourcing)", "Productora con equipo técnico propio", "Operador de venue / espacio propio", "Empresa familiar / Independiente", "Franquicia de eventos", "Corporativo con múltiples divisiones"] },
        { id: "empleados", type: "radio", label: "Equipo base propio (admin + operación)", required: true, options: ["1-5 empleados (micro empresa)", "6-15 empleados (pequeña)", "16-30 empleados (mediana)", "31-60 empleados (grande)", "61-100 empleados", "Más de 100 empleados"] },
        { id: "eventos_simultaneos", type: "radio", label: "Capacidad de eventos simultáneos", required: true, options: ["1 evento a la vez", "2-3 eventos simultáneos", "4-6 eventos simultáneos", "7-10 eventos simultáneos", "Más de 10 eventos simultáneos"] },
        { id: "volumen_anual", type: "select", label: "Volumen anual de eventos", required: false, options: ["Menos de 20 eventos/año", "20-50 eventos/año", "50-100 eventos/año", "100-200 eventos/año", "200-500 eventos/año", "Más de 500 eventos/año"] }
      ]
    },
    {
      id: "sec_operacion", title: "Gestión de Eventos y Staff Temporal", desc: "Coordinación de staff eventual, montaje y rentabilidad por evento.",
      items: [
        { id: "areas_automatizar", type: "checkbox", label: "Áreas a automatizar en HUTEC (selecciona todos los aplicables)", required: true, options: ["Registro y control de asistencia de staff eventual por evento", "Cálculo de pagos a freelance / staff temporal por hora/evento", "Gestión de contratos temporales por evento específico", "Control de horas extra en montaje, evento y desmontaje", "Coordinación de staff entre múltiples eventos simultáneos", "Cumplimiento IMSS: Altas/Bajas de personal eventual por evento", "Reportes de costo de mano de obra por evento (rentabilidad)", "Control de uniformes y equipo de trabajo asignado", "Gestión de viáticos y gastos de traslado del staff", "Trazabilidad de personal que trabaja en múltiples eventos", "Alertas de staff disponible por tipo de rol (mozos, seguridad)", "Dashboard de ocupación de recursos humanos por fecha", "Integración con sistema de ventas y cotización de eventos", "Gestión de prestaciones para staff base"] },
        { id: "roles_eventos", type: "checkbox", label: "Roles que requieres en eventos (selecciona todos)", required: true, options: ["Coordinadores / Productores de evento", "Montajistas / Técnicos de iluminación y audio", "Meseros / Staff de servicio", "Bartenders / Cantineros", "Seguridad / Vigilancia privada", "Valet parking / Estacionamiento", "Registro / Hostess / Recepción", "Cocineros / Chefs (catering)", "Personal de limpieza post-evento", "Dj's / Animadores / Entretenimiento", "Fotógrafos / Videógrafos", "Personal de vestir y vestuario"] },
        { id: "temporada_eventos", type: "checkbox", label: "Temporadas de alta demanda (selecciona todas)", required: true, options: ["Diciembre (fiestas navideñas y cierre de año)", "Semana Santa / Vacaciones de primavera", "Verano (bodas y eventos sociales)", "Septiembre (inicio de temporada corporativa)", "Octubre (congresos y convenciones)", "Febrero (San Valentín, eventos románticos)", "Eventos constantes todo el año (operación estable)", "Picos esporádicos según proyectos"] },
        { id: "pain_points", type: "checkbox", label: "Principales dolores operativos (selecciona los 3 más críticos)", required: false, options: ["Contratación rápida de staff eventual calificado", "Control de asistencia de personal disperso en múltiples venues", "Cálculo de pagos a freelance con tarifas variables por rol", "Faltas de último momento sin sustitución inmediata", "Cumplimiento IMSS de personal eventual contratado", "Horas extra no registradas en montaje/desmontaje", "Falta de rentabilidad real por evento (costo laboral oculto)", "Coordinación de staff entre eventos simultáneos", "Rotación alta de coordinadores y staff base", "Gestión de viáticos y gastos sin comprobación", "Trazabilidad de equipo y uniformes prestados a staff"] },
        { id: "sistema_actual", type: "select", label: "¿Qué sistema usas actualmente para gestión de eventos?", required: true, options: ["Software especializado de eventos (Eventbrite, Cvent, etc.)", "WhatsApp grupos + Excel", "Monday.com / Asana / Trello", "CRM + hojas de cálculo", "Sistema propio desarrollado internamente", "Sin sistema formal / Control manual"] },
        { id: "prioridad_implementacion", type: "radio", label: "¿Cuál es tu prioridad de implementación?", required: true, options: ["Inmediata (ya estamos en proceso de decisión)", "Corto plazo (1-2 meses)", "Mediano plazo (3-6 meses)", "Largo plazo (más de 6 meses)", "Aún en etapa de exploración"] }
      ]
    }
  ),
};

const INDUSTRY_KEY_MAP: Record<string, string> = {
  restaurantes: 'restaurantes', restaurant: 'restaurantes',
  'área de la salud': 'salud', 'area de la salud': 'salud', salud: 'salud', health: 'salud',
  construccion: 'construccion', 'construcción': 'construccion',
  it: 'it', tecnologia: 'it', 'tecnología': 'it', software: 'it',
  manufactura: 'manufactura', industria: 'manufactura',
  comercio: 'comercio', retail: 'comercio', 'comercio minorista': 'comercio',
  logistica: 'logistica', 'logística': 'logistica', transporte: 'logistica', 'transporte y logística': 'logistica',
  agricultura: 'agricultura', agro: 'agricultura',
  educacion: 'educacion', 'educación': 'educacion',
  finanzas: 'finanzas', financiero: 'finanzas',
  deportes: 'deportes', fitness: 'deportes',
  eventos: 'eventos', entretenimiento: 'eventos',
};

const INDUSTRY_PREFILL: Record<string, string> = {
  restaurantes: 'RESTAURANTES',
  salud: 'ÁREA DE LA SALUD',
  construccion: 'Construcción',
  it: 'IT',
  manufactura: 'Manufactura',
  comercio: 'Comercio Minorista',
  logistica: 'Transporte y Logística',
  agricultura: 'Agricultura',
  educacion: 'Educación',
  finanzas: 'Finanzas',
  deportes: 'Deportes',
  eventos: 'EVENTOS',
};

function getQuestionsForIndustry(param: string | null) {
  if (!param) return BASE_QUESTIONS;
  const key = INDUSTRY_KEY_MAP[param.toLowerCase().trim()] || '';
  return INDUSTRY_QUESTIONS[key] || BASE_QUESTIONS;
}

function FormContent() {
  const searchParams = useSearchParams();
  const industryParam = searchParams.get('q');
  const questions = getQuestionsForIndustry(industryParam);
  const normalizedKey = industryParam ? (INDUSTRY_KEY_MAP[industryParam.toLowerCase().trim()] || '') : '';
  const prefillIndustry = normalizedKey ? INDUSTRY_PREFILL[normalizedKey] : undefined;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormState>(() => (
    prefillIndustry ? { industria: prefillIndustry } : getStoredFormData()
  ));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to('.orb', { y: 30, x: 20, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: { amount: 4 } });
  });

  const animateOut = (cb: () => void) => gsap.to(formRef.current?.children || [], { opacity: 0, y: -20, duration: 0.3, stagger: 0.05, ease: "power2.in", onComplete: cb });
  const animateIn = () => gsap.fromTo(formRef.current?.children || [], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "back.out(1.7)" });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      gsap.fromTo(
        formRef.current?.children || [],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "back.out(1.7)" }
      );
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleChange = (id: string, value: string, type: QuestionType) => {
    setFormData(prev => {
      const n = { ...prev };
      if (type === 'checkbox') {
        const arr = (n[id] || '').split(',').filter(Boolean);
        n[id] = arr.includes(value) ? arr.filter((v: string) => v !== value).join(',') : [...arr, value].join(',');
      } else { n[id] = value; }
      return n;
    });
    if (errors[id]) setErrors(e => { const n = { ...e }; delete n[id]; return n; });
  };

  const validateStep = () => {
    const errs: Record<string, string> = {};
    questions[currentStep].items.forEach(item => {
      const val = formData[item.id];
      if (item.required && (!val || val.length === 0)) errs[item.id] = 'Este campo es requerido';
      if (item.id === 'industria' && val === 'Otro' && !formData.industria_otro) errs.industria_otro = 'Por favor indique su industria';
      if (item.type === 'email' && val && !/^\S+@\S+\.\S+$/.test(val)) errs[item.id] = 'Formato de correo inválido';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    localStorage.setItem('hutec_demo_form', JSON.stringify(formData));
    if (currentStep < questions.length - 1) { animateOut(() => { setCurrentStep(p => p + 1); setTimeout(animateIn, 50); }); }
    else { handleSubmit(); }
  };

  const handlePrev = () => { if (currentStep > 0) animateOut(() => { setCurrentStep(p => p - 1); setTimeout(animateIn, 50); }); };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsLoading(true);
      setIsSubmitting(false);
      submitDemoForm({ ...formData, _industry_param: industryParam || 'generic' })
        .then(res => { if (res?.success) localStorage.removeItem('hutec_demo_form'); })
        .catch(() => {});
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          gsap.fromTo('.success-icon', { rotation: -30, opacity: 0, scale: 0.3 }, { rotation: 0, opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1,0.4)" });
          gsap.fromTo('.success-text', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power3.out" });
        }, 50);
      }, 10000);
    }, 500);
  };

  const section = questions[currentStep];
  const pct = Math.round(((currentStep + 1) / questions.length) * 100);
  const sectionIcon = SECTION_ICONS[section.id] || <Settings size={20} />;

  return (
    <div className="relative h-screen w-full bg-black text-white overflow-hidden flex flex-col font-sans">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-50">
        <div className="orb absolute w-[300px] h-[300px] bg-[#00f2fe] rounded-full blur-[80px] -top-[100px] -left-[100px]"></div>
        <div className="orb absolute w-[400px] h-[400px] bg-[#0a4f5f] rounded-full blur-[80px] -bottom-[150px] -right-[150px]"></div>
        <div className="orb absolute w-[200px] h-[200px] bg-[#2dd4bf] opacity-30 rounded-full blur-[80px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="flex flex-col h-full w-full max-w-[550px] mx-auto relative z-10 bg-black/40 backdrop-blur-xl shadow-2xl border-x border-white/5">
        <div className="px-5 py-5 text-center shrink-0 border-b border-white/5">
          <img src="/_PORTAFOLIO-HUTEC.png" alt="HUTEC Logo" className="h-16 mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-light mt-0.5">Evaluación de Demo Personalizada</p>
        </div>

        {!isSuccess && !isLoading && (
          <div id="progressContainer" className="px-5 pt-4 pb-2 shrink-0">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-full transition-all duration-500 shadow-[0_0_8px_#00f2fe]" style={{ width: `${pct}%` }}></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Paso {currentStep + 1} de {questions.length}</span>
              <span>{pct}% completado</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5" id="mainContent">
          {!isSuccess && !isLoading ? (
            <div ref={formRef} className="pb-10">
              <div className="mb-7">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-9 h-9 rounded-lg bg-[#00f2fe]/10 border border-[#00f2fe]/20 flex items-center justify-center text-[#00f2fe] flex-shrink-0">
                    {sectionIcon}
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-light pl-[46px]">{section.desc}</p>
              </div>

              {section.items.map(item => (
                <div key={item.id} className="mb-5">
                  <label className="block font-medium mb-2.5 text-sm text-slate-200">
                    {item.label}
                    {item.required && <span className="text-rose-400 ml-1 text-xs">*</span>}
                  </label>

                  {['text', 'email', 'tel'].includes(item.type) && (
                    <input type={item.type} placeholder={item.placeholder} value={formData[item.id] || ''}
                      onChange={e => handleChange(item.id, e.target.value, item.type)}
                      className="w-full p-3.5 bg-slate-900/80 border border-white/10 rounded-xl text-[15px] text-white transition-all focus:outline-none focus:border-[#00f2fe]/50 focus:bg-slate-900 focus:shadow-[0_0_12px_rgba(0,242,254,0.12)] placeholder:text-slate-600" />
                  )}

                  {item.type === 'textarea' && (
                    <textarea placeholder={item.placeholder} value={formData[item.id] || ''}
                      onChange={e => handleChange(item.id, e.target.value, item.type)}
                      className="w-full p-3.5 bg-slate-900/80 border border-white/10 rounded-xl text-[15px] text-white transition-all focus:outline-none focus:border-[#00f2fe]/50 focus:bg-slate-900 focus:shadow-[0_0_12px_rgba(0,242,254,0.12)] placeholder:text-slate-600 min-h-[110px] resize-none" />
                  )}

                  {item.type === 'select' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="relative">
                        <select value={formData[item.id] || ''} onChange={e => handleChange(item.id, e.target.value, item.type)}
                          className="w-full p-3.5 bg-slate-900/80 border border-white/10 rounded-xl text-[15px] text-white focus:outline-none focus:border-[#00f2fe]/50 appearance-none pr-10 cursor-pointer">
                          <option value="" disabled className="text-slate-500 bg-slate-900">Selecciona una opción...</option>
                          {item.options?.map(opt => <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#00f2fe]" />
                      </div>
                      {item.id === 'industria' && formData.industria === 'Otro' && (
                        <div className="animate-in slide-in-from-top-1 fade-in duration-300">
                          <input type="text" placeholder="Indique el enfoque de su negocio" value={formData.industria_otro || ''}
                            onChange={e => handleChange('industria_otro', e.target.value, 'text')}
                            className="w-full p-3.5 bg-slate-900/80 border border-white/10 rounded-xl text-[15px] text-white focus:outline-none focus:border-[#00f2fe]/50 placeholder:text-slate-600" />
                          {errors.industria_otro && <p className="text-rose-400 text-xs mt-1.5">{errors.industria_otro}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {['radio', 'checkbox'].includes(item.type) && (
                    <div className="flex flex-col gap-2">
                      {item.options?.map(opt => {
                        const isChecked = item.type === 'radio'
                          ? formData[item.id] === opt
                          : (formData[item.id] || '').split(',').filter(Boolean).includes(opt);
                        return (
                          <label key={opt} className={`flex items-center p-3.5 bg-slate-900/80 border rounded-xl cursor-pointer transition-all active:scale-[0.98] gap-3 ${isChecked ? 'border-[#00f2fe]/40 bg-[#00f2fe]/5' : 'border-white/10 hover:border-white/20'}`}>
                            <input type={item.type} checked={isChecked} onChange={() => handleChange(item.id, opt, item.type)} className="hidden" />
                            <div className={`flex-shrink-0 flex items-center justify-center border-2 transition-all ${item.type === 'radio' ? 'rounded-full w-4 h-4' : 'rounded w-4 h-4'} ${isChecked ? 'border-[#00f2fe]' : 'border-slate-600'}`}>
                              {isChecked && <div className={`bg-[#00f2fe] shadow-[0_0_6px_#00f2fe] ${item.type === 'radio' ? 'w-2 h-2 rounded-full' : 'w-2 h-2 rounded-sm'}`}></div>}
                            </div>
                            <span className={`text-[13.5px] leading-snug ${isChecked ? 'text-white' : 'text-slate-300'}`}>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {errors[item.id] && <p className="text-rose-400 text-xs mt-1.5">{errors[item.id]}</p>}
                </div>
              ))}
            </div>

          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6">
              <div className="relative w-20 h-20 mb-7">
                <div className="absolute inset-0 rounded-full border-[3px] border-slate-800"></div>
                <div className="absolute inset-0 rounded-full border-[3px] border-[#00f2fe] border-t-transparent animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-[3px] border-[#4facfe]/60 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.8s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-[#00f2fe] rounded-full shadow-[0_0_12px_#00f2fe] animate-pulse"></div>
                </div>
              </div>
              <h2 className="text-xl text-white font-semibold mb-2 tracking-tight">Analizando respuestas</h2>
              <p className="text-[#00f2fe] text-sm font-medium mb-4">Procesando tu perfil empresarial...</p>
              <p className="text-slate-500 text-xs leading-relaxed max-w-[240px]">Evaluamos tus necesidades para preparar la demostración más relevante para tu empresa.</p>
              <div className="flex gap-1.5 mt-8">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-[#00f2fe] rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }}></div>)}
              </div>
            </div>

          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
              <div className="success-icon mb-6">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping opacity-20"></div>
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.35)]">
                    <CheckCircle2 size={44} className="text-white" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <div className="success-text w-full">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-4">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 text-[11px] font-medium tracking-widest uppercase">Solicitud Confirmada</span>
                </div>
                <h2 className="text-2xl text-white font-bold tracking-tight mb-2">Datos Recibidos</h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-1.5">Hemos registrado tu información exitosamente.</p>
                <p className="text-slate-500 text-xs leading-relaxed mb-6 max-w-[260px] mx-auto">Nuestro equipo te contactará en las próximas <span className="text-slate-300 font-medium">24 horas</span> para agendar tu demo.</p>
                {(formData.nombre || formData.empresa) && (
                  <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 mb-5 text-left">
                    <p className="text-[10px] text-slate-500 mb-3 uppercase tracking-widest font-medium">Resumen</p>
                    <div className="space-y-2.5">
                      {formData.nombre && <div className="flex items-center gap-2.5"><User size={13} className="text-slate-500 flex-shrink-0" /><span className="text-sm text-slate-300">{formData.nombre}</span></div>}
                      {formData.empresa && <div className="flex items-center gap-2.5"><Building2 size={13} className="text-slate-500 flex-shrink-0" /><span className="text-sm text-slate-300">{formData.empresa}</span></div>}
                      {formData.industria && <div className="flex items-center gap-2.5"><span className="text-slate-500 flex-shrink-0 flex">{INDUSTRY_ICONS[formData.industria] || <Settings size={13} />}</span><span className="text-sm text-slate-300">{formData.industria}</span></div>}
                      {formData.email && <div className="flex items-center gap-2.5"><MapPin size={13} className="text-slate-500 flex-shrink-0" /><span className="text-sm text-slate-300 truncate">{formData.email}</span></div>}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2.5 w-full">
                  <a href="https://wa.me/521234567890" target="_blank" rel="noopener noreferrer"
                    className="w-full p-3.5 flex items-center justify-center gap-2.5 bg-[#00f2fe] text-black rounded-xl font-semibold text-sm shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] hover:-translate-y-0.5 transition-all active:scale-95">
                    <MessageCircle size={16} /> Contactar por WhatsApp
                  </a>
                  <button onClick={() => window.location.reload()}
                    className="w-full p-3.5 flex items-center justify-center gap-2.5 border border-white/10 text-slate-400 rounded-xl font-medium text-sm hover:border-white/20 hover:text-white transition-all active:scale-95">
                    <RotateCcw size={14} /> Enviar otro formulario
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isSuccess && !isLoading && (
          <div id="buttonGroup" className="flex gap-3 px-5 py-4 bg-black/70 border-t border-white/5 backdrop-blur-md shrink-0">
            <button onClick={handlePrev}
              className={`flex items-center justify-center w-12 h-12 rounded-xl border transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <ArrowLeft size={18} />
            </button>
            <button onClick={handleNext} disabled={isSubmitting}
              className="flex-1 flex justify-center items-center gap-2 h-12 rounded-xl text-[15px] font-semibold bg-[#00f2fe] text-black uppercase tracking-wide shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:shadow-[0_0_30px_rgba(0,242,254,0.6)] hover:-translate-y-0.5 transition-all disabled:opacity-60">
              {isSubmitting ? <><Loader2 size={17} className="animate-spin" /> Enviando...</>
                : currentStep === questions.length - 1 ? <><Rocket size={17} /> Agendar Demo</>
                : <>Siguiente <ArrowRight size={17} /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppForm() {
  return (
    <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center"><Loader2 size={32} className="text-[#00f2fe] animate-spin" /></div>}>
      <FormContent />
    </Suspense>
  );
}
