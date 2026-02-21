import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

export default function Login() {
  const [tab, setTab] = useState('login'); // 'login' o 'registro'
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setExito('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');
    setCargando(true);

    try {
      const endpoint = tab === 'login' ? 'login' : 'registro';
      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const datos = await res.json();

      if (!datos.ok) {
        setError(datos.mensaje);
      } else if (tab === 'login') {
        iniciarSesion(datos.token, datos.usuario);
        navigate('/');
      } else {
        // Registro exitoso: cambiamos a login
        setExito('¡Cuenta creada! Ahora inicia sesión.');
        setTab('login');
        setForm({ ...form, password: '' });
      }
    } catch {
      setError('Error de conexión. ¿Está el servidor corriendo?');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-pagina">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <h1 style={{ fontFamily: 'var(--fuente-titulo)', fontSize: '1.4rem', color: 'var(--acento)' }}>
            <span className="login-logo-dot" />
            PRODUCTOS
          </h1>
          <p className="login-titulo">Sistema de gestión</p>
        </div>

        {/* Tabs Login / Registro */}
        <div className="login-tabs">
          <button className={`login-tab ${tab === 'login' ? 'activo' : ''}`} onClick={() => setTab('login')}>
            Iniciar sesión
          </button>
          <button className={`login-tab ${tab === 'registro' ? 'activo' : ''}`} onClick={() => setTab('registro')}>
            Registrarse
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'registro' && (
            <div className="campo">
              <label>Nombre</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Tu nombre" />
            </div>
          )}

          <div className="campo">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="correo@ejemplo.com" />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
          </div>

          {error && <p className="error-msg">{error}</p>}
          {exito && <p className="exito-msg">{exito}</p>}

          <button type="submit" className="btn btn-primario" disabled={cargando} style={{ marginTop: 4 }}>
            {cargando ? 'Cargando...' : tab === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--texto-secundario)' }}>
          Para crear una cuenta admin, regístrate normalmente y luego actualiza el rol en la base de datos.
        </p>
      </div>
    </div>
  );
}
