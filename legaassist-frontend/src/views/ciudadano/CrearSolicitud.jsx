import React, { useState, useEffect } from 'react';
import { solicitudesAPI } from '../../api/client';
import { WifiOff, Wifi, Send, FileText, CheckCircle2, Upload } from 'lucide-react';

export default function CrearSolicitud({ onSolicitudCreada }) {
  const [formData, setFormData] = useState({
    cedula_usuario: '',
    tipo_tramite: 'TUTELA',
    problema_descripcion: '',
    telefono_contacto: ''
  });

  const [archivoCedula, setArchivoCedula] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(false);
  const [resultadoExito, setResultadoExito] = useState(null);

  // 1. Monitorear estado de la red en tiempo real
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Cargar borrador guardado en localStorage al iniciar (Offline-first)
  useEffect(() => {
    const borradorGuardado = localStorage.getItem('draft_tutela');
    if (borradorGuardado) {
      try {
        setFormData(JSON.parse(borradorGuardado));
      } catch (e) {
        console.error("Error al leer el borrador local", e);
      }
    }
  }, []);

  // 3. Manejar cambios en los inputs de texto y autoguardar en localStorage
  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevosDatos = { ...formData, [name]: value };
    setFormData(nuevosDatos);
    localStorage.setItem('draft_tutela', JSON.stringify(nuevosDatos));
  };

  // 4. Manejar la selección del archivo de la cédula
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoCedula(e.target.files[0]);
    }
  };

  // 5. Enviar solicitud a FastAPI usando FormData
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("cedula_usuario", formData.cedula_usuario.trim());
    formDataToSend.append("tipo_tramite", formData.tipo_tramite);
    formDataToSend.append("problema_descripcion", formData.problema_descripcion);
    
    if (formData.telefono_contacto) {
      formDataToSend.append("telefono_contacto", formData.telefono_contacto.trim());
    }

    if (archivoCedula) {
      formDataToSend.append("file_cedula", archivoCedula);
    } else {
      alert("⚠️ Por favor, adjunta la foto de la cédula de identidad.");
      setLoading(false);
      return;
    }

    if (!isOnline) {
      let cola = JSON.parse(localStorage.getItem('cola_offline')) || [];
      cola.push(formData);
      localStorage.setItem('cola_offline', JSON.stringify(cola));
      
      alert("⚠️ Estás sin conexión. Tus datos se guardaron localmente.");
      setLoading(false);
      return;
    }

    try {
      const response = await solicitudesAPI.crear(formDataToSend);
      setResultadoExito(response.data);
      // Limpiar borrador local tras éxito
      localStorage.removeItem('draft_tutela');
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      alert(error.response?.data?.detail || "Error al conectar con el servidor de FastAPI.");
    } finally {
      setLoading(false);
    }
  };

  if (resultadoExito) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-slate-100 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">¡Solicitud Creada con Éxito!</h2>
        <p className="text-slate-600 mt-2">Tu tutela y documento de identidad han sido guardados correctamente.</p>
        
        <div className="mt-6 p-4 bg-slate-50 rounded-xl text-left border border-slate-200">
          <span className="text-xs font-mono font-semibold text-blue-600 uppercase">ID de Solicitud:</span>
          <p className="text-sm font-mono text-slate-700 break-all">{resultadoExito.solicitud_id}</p>
          
          <span className="text-xs font-mono font-semibold text-blue-600 uppercase mt-3 block">Borrador IA (Groq):</span>
          <p className="text-sm text-slate-600 mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap">{resultadoExito.borrador_ia}</p>
        </div>

        <button
          onClick={() => {
            setResultadoExito(null);
            setFormData({ cedula_usuario: '', telefono_contacto: '', tipo_tramite: 'TUTELA', problema_descripcion: '' });
            setArchivoCedula(null);
            if (onSolicitudCreada) onSolicitudCreada(resultadoExito.solicitud_id);
          }}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
        >
          Ir a Seguimiento
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Nueva Solicitud de Tutela</h2>
          <p className="text-sm text-slate-500">Completa los datos y adjunta tu cédula para iniciar el trámite.</p>
        </div>
        {/* Indicador de Red */}
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isOnline ? 'En línea' : 'Modo Offline'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Número de Cédula (Ciudadano)</label>
          <input
            type="text"
            name="cedula_usuario"
            required
            value={formData.cedula_usuario}
            onChange={handleChange}
            placeholder="Ej. 111222333"
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono / WhatsApp (Opcional)</label>
          <input
            type="tel"
            name="telefono_contacto"
            value={formData.telefono_contacto}
            onChange={handleChange}
            placeholder="Ej. 3001234567"
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Foto del Documento de Identidad (Cédula)</label>
          <input
            type="file"
            accept="image/*,.pdf"
            required
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-slate-400 mt-1">Sube una foto clara de tu cédula (obligatorio).</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Trámite</label>
          <select
            name="tipo_tramite"
            value={formData.tipo_tramite}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          >
            <option value="TUTELA">Acción de Tutela</option>
            <option value="DERECHO_PETICION">Derecho de Petición</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Problema</label>
          <textarea
            name="problema_descripcion"
            required
            rows={4}
            value={formData.problema_descripcion}
            onChange={handleChange}
            placeholder="Describe detalladamente qué vulneración de tus derechos estás sufriendo..."
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-xs text-slate-400 mt-1">💾 Tus cambios se guardan localmente de forma automática.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-md shadow-blue-200"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Subiendo cédula y generando IA...' : 'Enviar Solicitud'}</span>
        </button>
      </form>
    </div>
  );
}