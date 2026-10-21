import React, { useState } from 'react';
import axios from 'axios';

export default function AuthView({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(false); // false para Registro, true para Login
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    rol: 'CIUDADANO'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ¡Crucial para evitar recargas o comportamientos extraños del formulario!
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        // Petición de Login con Cédula
        const response = await axios.post('http://127.0.0.1:8000/api/auth/login', {
          cedula: formData.cedula.trim()
        });
        
        alert(`¡Bienvenido de nuevo, ${response.data.usuario.nombre}!`);
        onLoginSuccess(response.data.usuario);
      } else {
        // Petición de Registro con Cédula
        const response = await axios.post('http://127.0.0.1:8000/api/auth/registro', {
          nombre: formData.nombre.trim(),
          cedula: formData.cedula.trim(),
          telefono: formData.telefono ? formData.telefono.trim() : null,
          rol: formData.rol
        });

        alert('¡Registro exitoso! Ahora puedes iniciar sesión con tu cédula.');
        setIsLogin(true); // Cambiar automáticamente a la vista de login tras el éxito
      }
    } catch (error) {
      console.error("Error de autenticación:", error);
      const mensajeError = error.response?.data?.detail || "Hubo un error en la autenticación con el servidor.";
      setErrorMsg(mensajeError);
      alert(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 font-sans">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        
        {/* Cabecera */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-wide">LegaAssist</h1>
          <p className="text-slate-400 text-sm mt-2">
            {isLogin 
              ? 'Inicia sesión con tu número de cédula' 
              : 'Crea tu cuenta con tu cédula de ciudadanía'}
          </p>
        </div>

        {/* Mensaje de error visual si ocurre alguno */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Campo Nombre (Solo visible en Registro) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre"
                required={!isLogin}
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Mario Ben"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          )}

          {/* Campo Cédula (Obligatorio para ambos) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Número de Cédula
            </label>
            <input
              type="text"
              name="cedula"
              required
              value={formData.cedula}
              onChange={handleChange}
              placeholder="Ej. 1110345178"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Campos adicionales solo para Registro */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Teléfono (Opcional)
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej. 3001234567"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tipo de Perfil
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="CIUDADANO">Ciudadano</option>
                  <option value="OPERADOR">Operador / Administrador</option>
                </select>
              </div>
            </>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}</span>
            {!loading && <span>→</span>}
          </button>
        </form>

        {/* Botón para alternar entre Login y Registro */}
        <div className="mt-6 text-center border-t border-slate-700/60 pt-4">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
            }}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isLogin 
              ? '¿No tienes cuenta? Regístrate aquí' 
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

      </div>
    </div>
  );
}