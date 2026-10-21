import React, { useState, useEffect } from 'react';
import { solicitudesAPI } from '../../api/client';
import { ArrowLeft, CheckCircle, Send, FileText, ExternalLink, MessageSquare } from 'lucide-react';

export default function RevisionCaso({ caso, onVolver }) {
  const docGenerado = caso.documentos_generados?.[0] || {};
  const [textoEditable, setTextoEditable] = useState(docGenerado.contenido_texto_ia || '');
  const [loadingAprobar, setLoadingAprobar] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');

  // Cargar historial de chat
  const cargarMensajes = async () => {
    try {
      const res = await solicitudesAPI.obtenerMensajes(caso.id);
      setMensajes(res.data.mensajes || []);
    } catch (e) {
      console.error("Error al cargar mensajes:", e);
    }
  };

  useEffect(() => {
    cargarMensajes();
  }, [caso.id]);

  // Aprobar la solicitud
  const handleAprobar = async () => {
    setLoadingAprobar(true);
    try {
      const res = await solicitudesAPI.revisar(caso.id, {
        estado: 'APROBADO',
        contenido_texto_aprobado: textoEditable,
        asesor_id: 'OPERADOR_01'
      });
      alert("✅ ¡Solicitud Aprobada y PDF Generado!");
      onVolver();
    } catch (error) {
      console.error("Error al aprobar:", error);
      alert("Hubo un error al aprobar la solicitud.");
    } finally {
      setLoadingAprobar(false);
    }
  };

  // Enviar observación al ciudadano por chat
  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    try {
      await solicitudesAPI.enviarMensaje(caso.id, {
        emisor_id: 'OPERADOR_01',
        emisor_tipo: 'ADMIN',
        mensaje: nuevoMensaje
      });
      setNuevoMensaje('');
      cargarMensajes();
    } catch (e) {
      console.error("Error al enviar mensaje:", e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 p-6">
      <button
        onClick={onVolver}
        className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium text-sm">Volver a la bandeja</span>
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Columna Izquierda: Información del Ciudadano & Cédula */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Datos del Ciudadano</h3>
            <p className="text-sm text-slate-600"><strong className="text-slate-800">Nombre:</strong> {caso.usuarios?.nombre}</p>
            <p className="text-sm text-slate-600"><strong className="text-slate-800">Teléfono:</strong> {caso.usuarios?.telefono}</p>
            <p className="text-sm text-slate-600"><strong className="text-slate-800">Trámite:</strong> {caso.tipo_tramite}</p>
          </div>

          {/* Estado de la Cédula */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Documento de Identidad</h3>
            {caso.cedula_url ? (
              <a
                href={caso.cedula_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:underline text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ver Foto de Cédula Adjunta</span>
              </a>
            ) : (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                ⚠️ El ciudadano aún no ha subido la foto de su cédula.
              </p>
            )}
          </div>

          {/* Chat Interno con el Ciudadano */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Chat / Requerimientos</span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 text-xs">
              {mensajes.length === 0 ? (
                <p className="text-slate-400 italic text-center mt-4">Sin mensajes en el historial.</p>
              ) : (
                mensajes.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl max-w-[85%] ${
                      msg.emisor_tipo === 'ADMIN'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p className="font-semibold text-[10px] opacity-75">{msg.emisor_tipo}</p>
                    <p>{msg.mensaje}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleEnviarMensaje} className="flex space-x-1">
              <input
                type="text"
                placeholder="Escribe una observación..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Editor del Borrador de la IA */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Revisar Borrador IA (Groq)</h3>
              <p className="text-xs text-slate-500">Puedes editar el texto antes de aprobar y generar el PDF final.</p>
            </div>
            <button
              onClick={handleAprobar}
              disabled={loadingAprobar}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-5 rounded-xl transition-colors flex items-center space-x-2 shadow-md shadow-green-200"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loadingAprobar ? 'Aprobando...' : 'Aprobar y Generar PDF'}</span>
            </button>
          </div>

          <textarea
            value={textoEditable}
            onChange={(e) => setTextoEditable(e.target.value)}
            rows={18}
            className="w-full flex-1 p-4 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}