import React, { useState, useEffect } from 'react';
import { solicitudesAPI } from '../../api/client';
import RevisionCaso from './RevisionCaso';
import { RefreshCw, FileSearch, User, Phone, Calendar } from 'lucide-react';

export default function PanelAdmin() {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [casoSeleccionado, setCasoSeleccionado] = useState(null);

  // Cargar las solicitudes pendientes desde el backend de FastAPI
  const cargarPendientes = async () => {
    setLoading(true);
    try {
      const response = await solicitudesAPI.obtenerPendientes();
      setPendientes(response.data);
    } catch (error) {
      console.error("Error al obtener las solicitudes pendientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  // Si el operario seleccionó un caso, mostramos la pantalla de edición/revisión
  if (casoSeleccionado) {
    return (
      <RevisionCaso
        caso={casoSeleccionado}
        onVolver={() => {
          setCasoSeleccionado(null);
          cargarPendientes(); // Recargar la lista al volver
        }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Panel de Operadores</h2>
          <p className="text-sm text-slate-500">
            Bandeja de tutelas en revisión para edición de IA, aprobación y requerimientos.
          </p>
        </div>
        <button
          onClick={cargarPendientes}
          disabled={loading}
          className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refrescar</span>
        </button>
      </div>

      {pendientes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <FileSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No hay solicitudes pendientes en este momento.</p>
          <p className="text-xs text-slate-400 mt-1">Las nuevas tutelas enviadas por los ciudadanos aparecerán aquí automáticamente.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {pendientes.map((solicitud) => {
            const usuario = solicitud.usuarios || {};
            return (
              <div
                key={solicitud.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {solicitud.estado}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ID: {solicitud.id.slice(0, 8)}...
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-lg mb-1">
                    {solicitud.tipo_tramite || "Acción de Tutela"}
                  </h3>

                  <div className="space-y-1 text-sm text-slate-600 mb-3">
                    <p className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{usuario.nombre || "Ciudadano sin nombre"}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{usuario.telefono || "Sin teléfono"}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-3">
                    "{solicitud.problema_descripcion}"
                  </p>
                </div>

                <button
                  onClick={() => setCasoSeleccionado(solicitud)}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl text-sm transition-colors"
                >
                  Revisar y Editar Borrador IA
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}