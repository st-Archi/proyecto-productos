import { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [paginacion, setPaginacion] = useState({ pagina: 1, totalPaginas: 1, total: 0 });
  const [filtros, setFiltros] = useState({ buscar: '', categoria: '' });
  const [cargando, setCargando] = useState(true);

  // Función para cargar productos con filtros y paginación
  const cargarProductos = useCallback(async (pagina = 1) => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        pagina,
        limite: 9,
        ...(filtros.buscar && { buscar: filtros.buscar }),
        ...(filtros.categoria && { categoria: filtros.categoria }),
      });

      const res = await fetch(`${API_URL}/productos?${params}`);
      const datos = await res.json();

      if (datos.ok) {
        setProductos(datos.data);
        setPaginacion({
          pagina,
          totalPaginas: datos.paginacion.totalPaginas,
          total: datos.paginacion.total,
        });
      }
    } catch {
      console.error('Error al cargar productos');
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarProductos(1);
  }, [cargarProductos]);

  function handleFiltroChange(e) {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  }

  function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio);
  }

  return (
    <div className="pagina">
      <div className="contenedor">
        <div className="seccion-header">
          <div>
            <h1>Catálogo</h1>
            <p style={{ color: 'var(--texto-secundario)', marginTop: 4, fontSize: '0.9rem' }}>
              {paginacion.total} productos disponibles
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="filtros">
          <div className="campo">
            <label>Buscar</label>
            <input
              name="buscar"
              value={filtros.buscar}
              onChange={handleFiltroChange}
              placeholder="Nombre o descripción..."
            />
          </div>
          <div className="campo">
            <label>Categoría</label>
            <input
              name="categoria"
              value={filtros.categoria}
              onChange={handleFiltroChange}
              placeholder="Filtrar por categoría..."
            />
          </div>
        </div>

        {/* Productos */}
        {cargando ? (
          <p className="cargando">Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p className="cargando">No se encontraron productos.</p>
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

                {p.descripcion && (
                  <p className="tarjeta-descripcion">{p.descripcion}</p>
                )}

                <div className="tarjeta-footer">
                  <span className="tarjeta-precio">{formatearPrecio(p.precio)}</span>
                  <span className="tarjeta-stock">
                    {p.stock > 0 ? `${p.stock} en stock` : 'Sin stock'}
                  </span>
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
    </div>
  );
}
