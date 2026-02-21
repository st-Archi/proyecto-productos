import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModalProducto from '../components/ModalProducto';
import API_URL from '../config';

export default function Admin() {
  const { esAdmin, fetchAuth } = useAuth();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [paginacion, setPaginacion] = useState({ pagina: 1, totalPaginas: 1 });
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  // Redirigir si no es admin
  useEffect(() => {
    if (!esAdmin) navigate('/');
  }, [esAdmin, navigate]);

  const cargarProductos = useCallback(async (pagina = 1) => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/productos?pagina=${pagina}&limite=10`);
      const datos = await res.json();
      if (datos.ok) {
        setProductos(datos.data);
        setPaginacion({ pagina, totalPaginas: datos.paginacion.totalPaginas });
      }
    } catch {
      console.error('Error al cargar productos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  function abrirNuevo() {
    setProductoEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(producto) {
    setProductoEditando(producto);
    setModalAbierto(true);
  }

  async function eliminar(id) {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;

    try {
      const res = await fetchAuth(`${API_URL}/productos/${id}`, { method: 'DELETE' });
      const datos = await res.json();
      if (datos.ok) cargarProductos(paginacion.pagina);
    } catch {
      alert('Error al eliminar.');
    }
  }

  function onGuardado() {
    setModalAbierto(false);
    cargarProductos(paginacion.pagina);
  }

  function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio);
  }

  return (
    <div className="pagina">
      <div className="contenedor">
        <div className="seccion-header">
          <h1>Panel Admin</h1>
          <button className="btn btn-primario" onClick={abrirNuevo}>
            + Nuevo producto
          </button>
        </div>

        {cargando ? (
          <p className="cargando">Cargando...</p>
        ) : productos.length === 0 ? (
          <p className="cargando">No hay productos aún.</p>
        ) : (
          <div className="grid-productos">
            {productos.map((p) => (
              <div key={p.id} className="tarjeta-producto">
                <div>
                  <h3 className="tarjeta-nombre">{p.nombre}</h3>
                  {p.categoria && (
                    <span className="etiqueta" style={{ marginTop: 6, display: 'inline-block' }}>
                      {p.categoria}
                    </span>
                  )}
                </div>

                {p.descripcion && <p className="tarjeta-descripcion">{p.descripcion}</p>}

                <div className="tarjeta-footer">
                  <span className="tarjeta-precio">{formatearPrecio(p.precio)}</span>
                  <span className="tarjeta-stock">{p.stock} en stock</span>
                </div>

                <div className="tarjeta-acciones">
                  <button className="btn btn-secundario btn-sm" onClick={() => abrirEditar(p)}>
                    Editar
                  </button>
                  <button className="btn btn-peligro btn-sm" onClick={() => eliminar(p.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {paginacion.totalPaginas > 1 && (
          <div className="paginacion">
            <button
              className="btn btn-secundario btn-sm"
              disabled={paginacion.pagina === 1}
              onClick={() => cargarProductos(paginacion.pagina - 1)}
            >
              ← Anterior
            </button>
            <span className="paginacion-info">
              Página {paginacion.pagina} de {paginacion.totalPaginas}
            </span>
            <button
              className="btn btn-secundario btn-sm"
              disabled={paginacion.pagina === paginacion.totalPaginas}
              onClick={() => cargarProductos(paginacion.pagina + 1)}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <ModalProducto
          producto={productoEditando}
          onCerrar={() => setModalAbierto(false)}
          onGuardado={onGuardado}
        />
      )}
    </div>
  );
}
