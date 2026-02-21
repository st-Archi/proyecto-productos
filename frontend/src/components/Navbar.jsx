import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, esAdmin, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    cerrarSesion();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="contenedor navbar-inner">
        <NavLink to="/" className="navbar-logo">
          PRODUCTOS_APP
        </NavLink>

        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'activo' : ''}>
            Catálogo
          </NavLink>
          <NavLink to="/monedas" className={({ isActive }) => isActive ? 'activo' : ''}>
            Monedas
          </NavLink>

          {usuario ? (
            <>
              {/* Solo admins ven el panel de administración */}
              {esAdmin && (
                <NavLink to="/admin" className={({ isActive }) => isActive ? 'activo' : ''}>
                  Admin
                </NavLink>
              )}
              <span style={{ color: '#888', fontSize: '0.85rem' }}>
                {usuario.nombre}
                {esAdmin && <span className="etiqueta etiqueta-admin" style={{ marginLeft: 6 }}>ADMIN</span>}
              </span>
              <button className="btn btn-secundario btn-sm" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primario btn-sm">
              Iniciar sesión
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
