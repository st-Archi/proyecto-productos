import { createContext, useContext, useState, useEffect } from 'react';

// Contexto global de autenticación
// Permite que cualquier componente sepa si el usuario está logueado
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al iniciar la app, revisamos si hay sesión guardada en localStorage
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  function iniciarSesion(tokenNuevo, usuarioNuevo) {
    localStorage.setItem('token', tokenNuevo);
    localStorage.setItem('usuario', JSON.stringify(usuarioNuevo));
    setToken(tokenNuevo);
    setUsuario(usuarioNuevo);
  }

  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  }

  // Función helper para hacer peticiones con el token incluido
  function fetchAuth(url, opciones = {}) {
    return fetch(url, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...opciones.headers,
      },
    });
  }

  const esAdmin = usuario?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ usuario, token, esAdmin, cargando, iniciarSesion, cerrarSesion, fetchAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto fácilmente
export function useAuth() {
  return useContext(AuthContext);
}
