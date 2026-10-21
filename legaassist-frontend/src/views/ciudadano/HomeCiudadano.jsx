import React, { useState, useEffect } from 'react';
import { solicitudesAPI } from '../../api/client';
import { PlusCircle, FileText, Upload, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';

export default function HomeCiudadano({ usuario, onIrACrear }) {
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  // Cargar solicitudes del usuario actual
  const cargarMisCasos = async () => {
    setLoading(true);
    try {
      // Usamos el filtro de búsqueda por usuario para traer sus casos
      const res = await solicitudesAPI.obtenerTodas(usuario.nombre, '');
      // Filtramos estrictamente por su id o teléfono para mayor precisión
      const filtradas = res.data.filter(s => s.usuarios?.telefono === usuario.telefono);
      setMisSolicitudes(filtradas);
    } catch (e) {
      console.error("Error al cargar tus solicitudes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMisCasos();
  }, [usuario]);

  // Manejar subida de cédula
  const handleSubirCedula = async (solicitudId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(solicitudId);
    try {
      await solicitudesAPI.subirCedula(solicitudId, file);
      alert("✅ ¡Cédula subida con éxito!");
      cargarMisCasos();
    } catch (error) {
      console.error("Error al subir cédula:", error);
      alert("Hubo un error al subir la foto de la cédula.");
    } finally {
      setUploadingId(null);
    }
  };

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
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <span className="text-xs font-mono uppercase bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold">Portal Ciudadano</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">Hola, {usuario.nombre} 👋</h2>
          <p className="text-sm text-slate-500">Aquí puedes hacer seguimiento a tus tutelas y adjuntar documentos requeridos.</p>
        </div>
        <button
          onClick={onIrACrear}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-xl transition-colors flex items-center space-x-2 shadow-md shadow-blue-200 text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nueva Solicitud de Tutela</span>
        </button>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-4">Mis Trámites Activos</h3>

      {loading ? (
        <p className="text-slate-400 text-center py-8">Cargando tus trámites...</p>
      ) : misSolicitudes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No tienes solicitudes registradas todavía.</p>
          <p className="text-xs text-slate-400 mt-1">Haz clic en "Nueva Solicitud de Tutela" para comenzar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {misSolicitudes.map((sol) => {
            const docGenerado = sol.documentos_generados?.[0] || {};
            return (
              <div key={sol.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{sol.tipo_tramite}</span>
                    {renderBadgeEstado(sol.estado)}
                  </div>
                  <p className="text-xs text-slate-500 max-w-lg line-clamp-2">"{sol.problema_descripcion}"</p>
                  <span className="text-[10px] font-mono text-slate-400">ID: {sol.id}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  {/* Estado de la Cédula */}
                  {sol.cedula_url ? (
                    <a
                      href={sol.cedula_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-200 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ver Cédula</span>
                    </a>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center space-x-1 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-2 rounded-xl hover:bg-amber-100 font-medium transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingId === sol.id ? 'Subiendo...' : 'Subir Cédula'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleSubirCedula(sol.id, e)}
                      />
                    </label>
                  )}

                  {/* Descarga de PDF si está aprobado */}
                  {docGenerado.pdf_url && (
                    <a
                      href={docGenerado.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs bg-green-600 text-white px-3 py-2 rounded-xl hover:bg-green-700 font-medium shadow-sm shadow-green-100"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Descargar Tutela PDF</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}