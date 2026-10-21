import React, { useState, useEffect } from 'react';
import { solicitudesAPI } from '../../api/client';
import { Search, ExternalLink, Download, CheckCircle, Clock, AlertCircle, UserSearch } from 'lucide-react';

export default function HistorialCasos() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(false);

  const cargarCasos = async () => {
    setLoading(true);
    try {
      const res = await solicitudesAPI.obtenerTodas(filtroUsuario, filtroEstado);
      setSolicitudes(res.data);
    } catch (e) {
      console.error("Error al cargar casos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarCasos();
    }, 300);
    return () => clearTimeout(timer);
  }, [filtroUsuario, filtroEstado]);

  const renderBadgeEstado = (estado) => {
    switch (estado) {
      case 'APROBADO':
        return <span className="inline-flex items-center space-x-1 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full"><CheckCircle className="w-3 h-3" /><span>Aprobado</span></span>;
      case 'OBSERVADO':
        return <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full"><AlertCircle className="w-3 h-3" /><span>Observado</span></span>;
      default:
        return <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full"><Clock className="w-3 h-3" /><span>En Revisión</span></span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Historial y Consulta Global de Casos</h2>
          <p className="text-sm text-slate-500">Busca solicitudes por ciudadano, revisa cédulas adjuntas y descarga los PDFs aprobados.</p>
        </div>

        {/* Filtros de búsqueda */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <UserSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o teléfono..."
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="relative">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            >
              <option value="">Todos los Estados</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="OBSERVADO">Observado</option>
              <option value="APROBADO">Aprobado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Usuario / Ciudadano</th>
                <th className="p-4">Trámite</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Cédula</th>
                <th className="p-4">Documento Generado (PDF)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    Cargando información...
                  </td>
                </tr>
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No se encontraron casos registrados.
                  </td>
                </tr>
              ) : (
                solicitudes.map((s) => {
                  const usuario = s.usuarios || {};

                  // Extraemos el objeto de documentos_generados (que puede venir como array u objeto)
                  const docGenerado = Array.isArray(s.documentos_generados)
                    ? s.documentos_generados[0] || {}
                    : s.documentos_generados || {};

                  // 📍 BÚSQUEDA EXACTA: revisamos la propiedad 'archivo_pdf_url'
                  const pdfUrlFinal =
                    docGenerado.archivo_pdf_url ||
                    docGenerado.pdf_url ||
                    s.archivo_pdf_url ||
                    s.pdf_url;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{usuario.nombre || "Usuario no identificado"}</p>
                        <p className="text-xs text-slate-400">Tel: {usuario.telefono || "N/A"}</p>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{s.tipo_tramite}</td>
                      <td className="p-4">{renderBadgeEstado(s.estado)}</td>
                      <td className="p-4">
                        {s.cedula_url ? (
                          <a
                            href={s.cedula_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-600 hover:underline text-xs bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Ver Cédula</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No subida</span>
                        )}
                      </td>
                      <td className="p-4">
                        {pdfUrlFinal ? (
                          <a
                            href={pdfUrlFinal}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-green-700 hover:underline text-xs bg-green-50 px-2.5 py-1 rounded-lg border border-green-200 font-medium shadow-sm hover:bg-green-100 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar PDF</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">En proceso</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}