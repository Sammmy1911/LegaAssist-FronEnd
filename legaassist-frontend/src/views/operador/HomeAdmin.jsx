import React, { useState, useEffect } from 'react';
import { solicitudesAPI } from '../../api/client';
import { Clock, AlertCircle, CheckCircle2, FileText, ArrowUpRight, Search, RefreshCw } from 'lucide-react';

export default function HomeAdmin({ onIrAPendientes, onIrAHistorial }) {
  const [metricas, setMetricas] = useState({
    pendientes: 0,
    observados: 0,
    aprobados: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  const cargarMetricas = async () => {
    setLoading(true);
    try {
      const res = await solicitudesAPI.obtenerTodas();
      const todassolicitudes = res.data || [];

      const pendientes = todassolicitudes.filter(s => s.estado === 'EN_REVISION').length;
      const observados = todassolicitudes.filter(s => s.estado === 'OBSERVADO').length;
      const aprobados = todassolicitudes.filter(s => s.estado === 'APROBADO').length;

      setMetricas({
        pendientes,
        observados,
        aprobados,
        total: todassolicitudes.length
      });
    } catch (e) {
      console.error("Error al cargar métricas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMetricas();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 space-y-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <span className="text-xs font-mono uppercase bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-semibold">
            Panel de Control
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">Centro de Operaciones LegaAssist ⚖️</h2>
          <p className="text-sm text-slate-500">Gestión centralizada de tutelas, validación de identidades y aprobación de borradores IA.</p>
        </div>
        <button
          onClick={cargarMetricas}
          disabled={loading}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          title="Actualizar datos"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">En Revisión</p>
            <h3 className="text-3xl font-extrabold text-blue-600 mt-1">{metricas.pendientes}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Requieren atención</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Observados</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{metricas.observados}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Con requerimiento</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Aprobados</p>
            <h3 className="text-3xl font-extrabold text-green-600 mt-1">{metricas.aprobados}</h3>
            <p className="text-[11px] text-slate-500 mt-1">PDFs generados</p>
          </div>
          <div className="p-3 bg-green-50 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Procesados</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{metricas.total}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Histórico general</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-2xl">
            <FileText className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      </div>

      {/* Accesos Directos Operativos */}
      <div className="grid md:grid-cols-2 gap-6">
        <div 
          onClick={onIrAPendientes}
          className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-md cursor-pointer hover:opacity-95 transition-all flex justify-between items-center group"
        >
          <div>
            <span className="text-xs font-mono text-indigo-300 uppercase">Acción prioritaria</span>
            <h3 className="text-xl font-bold mt-1">Bandeja de Pendientes</h3>
            <p className="text-xs text-slate-300 mt-1">Revisa las solicitudes en cola, edita el texto borrador de Groq y aprueba tutelas.</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-6 h-6 text-white" />
          </div>
        </div>

        <div 
          onClick={onIrAHistorial}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-all flex justify-between items-center group"
        >
          <div>
            <span className="text-xs font-mono text-indigo-600 uppercase">Consulta y Auditoría</span>
            <h3 className="text-xl font-bold text-slate-800 mt-1">Historial Global y Filtros</h3>
            <p className="text-xs text-slate-500 mt-1">Busca casos por usuario o teléfono, verifica fotos de cédulas y descarga PDFs aprobados.</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-indigo-50 transition-colors">
            <Search className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
}