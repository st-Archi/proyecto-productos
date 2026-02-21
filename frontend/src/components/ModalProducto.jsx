import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

// Modal para crear o editar un producto
// Si recibe `producto` como prop, está en modo edición
// Si no lo recibe, está en modo creación
export default function ModalProducto({ producto, onCerrar, onGuardado }) {
  const { fetchAuth } = useAuth();
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    stock: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Si estamos editando, cargamos los datos actuales
  useEffect(() => {
    if (producto) {
      setForm({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio: producto.precio || '',
        categoria: producto.categoria || '',
        stock: producto.stock || '',
      });
    }
  }, [producto]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const url = producto
        ? `${API_URL}/productos/${producto.id}`
        : `${API_URL}/productos`;

      const metodo = producto ? 'PUT' : 'POST';

      const res = await fetchAuth(url, {
        method: metodo,
        body: JSON.stringify(form),
      });

      const datos = await res.json();

      if (!datos.ok) {
        setError(datos.mensaje);
      } else {
        onGuardado(); // Avisamos al padre que guarde y cierre
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="overlay" onClick={onCerrar}>
      {/* Evitamos que el click dentro del modal lo cierre */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{producto ? 'Editar producto' : 'Nuevo producto'}</h3>
          <button className="modal-cerrar" onClick={onCerrar}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="form-grupo">
          <div className="campo">
            <label>Nombre *</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>

          <div className="campo">
            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} />
          </div>

          <div className="form-fila">
            <div className="campo">
              <label>Precio (MXN) *</label>
              <input type="number" name="precio" value={form.precio} onChange={handleChange} min="0" step="0.01" required />
            </div>
            <div className="campo">
              <label>Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" />
            </div>
          </div>

          <div className="campo">
            <label>Categoría</label>
            <input name="categoria" value={form.categoria} onChange={handleChange} placeholder="Ej: Electrónica, Ropa..." />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secundario" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primario" disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
