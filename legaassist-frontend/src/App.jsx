import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthView from './views/auth/AuthView';
import HomeCiudadano from './views/ciudadano/HomeCiudadano';
import CrearSolicitud from './views/ciudadano/CrearSolicitud';
import HomeAdmin from './views/operador/HomeAdmin';
import PanelAdmin from './views/operador/PanelAdmin';
import HistorialCasos from './views/operador/HistorialCasos';

export default function App() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [rolActual, setRolActual] = useState('CIUDADANO');

  // Vistas internas para el rol de Ciudadano: 'HOME' | 'CREAR'
  const [vistaCiudadano, setVistaCiudadano] = useState('HOME');

  // Vistas internas para el rol de Operador: 'DASHBOARD' | 'PENDIENTES' | 'HISTORIAL'
  const [vistaAdmin, setVistaAdmin] = useState('DASHBOARD');

  // Recuperar la sesión guardada en localStorage al cargar la página
  useEffect(() => {
    const sesionGuardada = localStorage.getItem('usuario_legaassist');
    if (sesionGuardada) {
      try {
        const user = JSON.parse(sesionGuardada);
        setUsuarioActual(user);
        setRolActual(user.rol || 'CIUDADANO');
      } catch (error) {
        console.error("Error al recuperar la sesión del usuario:", error);
      }
    }
  }, []);

  // Callback cuando el usuario inicia sesión o se registra con éxito
  const handleLoginSuccess = (user) => {
    setUsuarioActual(user);
    setRolActual(user.rol || 'CIUDADANO');
    setVistaCiudadano('HOME');
    setVistaAdmin('DASHBOARD');
    localStorage.setItem('usuario_legaassist', JSON.stringify(user));
  };

  // Cierre de sesión
  const handleLogout = () => {
    setUsuarioActual(null);
    localStorage.removeItem('usuario_legaassist');
  };

  // Si el usuario no ha iniciado sesión, renderizar la pantalla de Login / Registro
  if (!usuarioActual) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Barra de navegación superior */}
      <Navbar 
        rolActual={rolActual} 
        setRolActual={setRolActual} 
        usuario={usuarioActual}
        onLogout={handleLogout}
      />

      <main className="pb-12">
        {/* ================= VISTAS DE CIUDADANO ================= */}
        {rolActual === 'CIUDADANO' ? (
          <div>
            {/* Navegación interna del Ciudadano */}
            <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex justify-center space-x-4 shadow-sm">
              <button
                onClick={() => setVistaCiudadano('HOME')}
                className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                  vistaCiudadano === 'HOME'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Mis Trámites
              </button>
              <button
                onClick={() => setVistaCiudadano('CREAR')}
                className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                  vistaCiudadano === 'CREAR'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Nueva Tutela
              </button>
            </div>

            {/* Renderizado condicional de componentes del Ciudadano */}
            {vistaCiudadano === 'HOME' ? (
              <HomeCiudadano 
                usuario={usuarioActual} 
                onIrACrear={() => setVistaCiudadano('CREAR')} 
              />
            ) : (
              <CrearSolicitud 
                usuarioId={usuarioActual.id} 
                onSolicitudCreada={() => setVistaCiudadano('HOME')} 
              />
            )}
          </div>
        ) : (
          /* ================= VISTAS DE OPERADOR / ADMIN ================= */
          <div>
            {/* Navegación interna del Operador */}
            <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex justify-center space-x-4 shadow-sm">
              <button
                onClick={() => setVistaAdmin('DASHBOARD')}
                className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                  vistaAdmin === 'DASHBOARD'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Dashboard / Métricas
              </button>
              <button
                onClick={() => setVistaAdmin('PENDIENTES')}
                className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                  vistaAdmin === 'PENDIENTES'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Bandeja de Pendientes
              </button>
              <button
                onClick={() => setVistaAdmin('HISTORIAL')}
                className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                  vistaAdmin === 'HISTORIAL'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Historial y Consulta Global
              </button>
            </div>

            {/* Renderizado condicional de componentes del Operador */}
            {vistaAdmin === 'DASHBOARD' && (
              <HomeAdmin 
                onIrAPendientes={() => setVistaAdmin('PENDIENTES')} 
                onIrAHistorial={() => setVistaAdmin('HISTORIAL')} 
              />
            )}
            {vistaAdmin === 'PENDIENTES' && <PanelAdmin />}
            {vistaAdmin === 'HISTORIAL' && <HistorialCasos />}
          </div>
        )}
      </main>
    </div>
  );
}