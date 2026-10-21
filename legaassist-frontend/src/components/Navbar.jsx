import React from 'react';
import { User, ShieldCheck, LogOut } from 'lucide-react';

export default function Navbar({ usuario, rolActual, setRolActual, onLogout }) {
  // Verificamos si el usuario actual es operador de forma segura
  const esOperador = usuario?.rol === 'OPERADOR';

  return (
    <nav className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center border-b border-slate-800">
      
      {/* Logo y marca */}
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold text-blue-400">Del derecho al campo</span>
        <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded-full font-mono">MVP</span>
      </div>

      {/* Selector de vistas condicional según el rol del usuario */}
      <div className="flex bg-slate-800 p-1 rounded-lg space-x-1">
        
        {/* El Portal Ciudadano siempre está disponible */}
        <button
          onClick={() => setRolActual('CIUDADANO')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            rolActual === 'CIUDADANO'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Portal Ciudadano</span>
        </button>

        {/* 🔒 El Panel de Operador SOLO se muestra si el usuario logueado es OPERADOR */}
        {esOperador && (
          <button
            onClick={() => setRolActual('OPERADOR')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              rolActual === 'OPERADOR'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Panel Operador / Admin</span>
          </button>
        )}
      </div>

      {/* Información del usuario y botón de cerrar sesión (opcional pero útil) */}
      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-400">Conectado como</p>
          <p className="text-sm font-semibold text-white">{usuario?.nombre || 'Usuario'}</p>
        </div>
        
        {onLogout && (
          <button
            onClick={onLogout}
            title="Cerrar Sesión"
            className="p-2 bg-slate-800 hover:bg-red-600/20 text-slate-300 hover:text-red-400 rounded-lg transition-colors border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

    </nav>
  );
}