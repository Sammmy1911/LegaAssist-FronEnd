import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://legaassist-backend.onrender.com/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const solicitudesAPI = {
  // Crear nueva solicitud (Ciudadano / Operador) con soporte para FormData y archivos
  crear: (formData) => api.post('/solicitudes/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Listar solicitudes en revisión (Operador)
  obtenerPendientes: () => api.get('/solicitudes/pendientes'),

  // Listar TODAS las solicitudes con filtros de búsqueda y estado (Operador)
  obtenerTodas: (usuarioQuery = '', estado = '') => 
    api.get('/solicitudes/', {
      params: {
        usuario_query: usuarioQuery || undefined,
        estado: estado || undefined,
      }
    }),

  // Revisar/Aprobar solicitud y generar PDF (Operador)
  revisar: (id, payload) => api.post(`/solicitudes/${id}/revisar`, payload),

  // Subir foto de la cédula
  subirCedula: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/solicitudes/${id}/subir-cedula`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Obtener mensajes del chat
  obtenerMensajes: (id) => api.get(`/solicitudes/${id}/mensajes`),

  // Enviar mensaje al chat interno
  enviarMensaje: (id, payload) => api.post(`/solicitudes/${id}/mensajes`, payload),
};

export const authAPI = {
  // Iniciar sesión por Cédula (envía { cedula: "..." })
  login: (credentials) => api.post('/auth/login', credentials),

  // Registrar nuevo usuario con Cédula
  registro: (userData) => api.post('/auth/registro', userData),
};

export default api;