import { useState, useEffect } from 'react';
import API_URL from '../config';

export default function Monedas() {
  const [tasas, setTasas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Convertidor
  const [form, setForm] = useState({ cantidad: '', de: 'USD', a: 'MXN' });
  const [resultado, setResultado] = useState(null);
  const [convirtiendo, setConvirtiendo] = useState(false);

  useEffect(() => {
    async function cargarTasas() {
      try {
        const res = await fetch(`${API_URL}/monedas`);
        const datos = await res.json();
        if (datos.ok) setTasas(datos);
        else setError('No se pudieron cargar las tasas.');
      } catch {
        setError('Error de conexión con el servidor.');
      } finally {
        setCargando(false);
      }
    }
    cargarTasas();
  }, []);

  async function convertir(e) {
    e.preventDefault();
    setConvirtiendo(true);
    setResultado(null);
    try {
      const params = new URLSearchParams(form);
      const res = await fetch(`${API_URL}/monedas/convertir?${params}`);
      const datos = await res.json();
      if (datos.ok) setResultado(datos);
      else setError(datos.mensaje);
    } catch {
      setError('Error al convertir.');
    } finally {
      setConvirtiendo(false);
    }
  }

  const monedas = ['USD', 'MXN', 'EUR', 'CAD'];

  return (
    <div className="pagina">
      <div className="contenedor">
        <div className="seccion-header">
          <div>
            <h1>Tipo de cambio</h1>
            <p style={{ color: 'var(--texto-secundario)', marginTop: 4, fontSize: '0.9rem' }}>
              Tasas actualizadas en tiempo real · Base: USD
            </p>
          </div>
        </div>

        {cargando && <p className="cargando">Cargando tasas de cambio...</p>}
        {error && <p className="error-msg">{error}</p>}

        {tasas && (
          <>
            {/* Tasas actuales */}
            <div className="tasas-grid" style={{ marginBottom: 32 }}>
              {Object.entries(tasas.tasas).map(([moneda, tasa]) => (
                <div key={moneda} className="tasa-item">
                  <div className="tasa-moneda">{moneda}</div>
                  <div className="tasa-valor">
                    {tasa === 1 ? '1.00' : tasa.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Convertidor */}
            <div className="convertidor-card">
              <h2 style={{ fontSize: '1rem' }}>Convertidor</h2>

              <form onSubmit={convertir} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-fila">
                  <div className="campo">
                    <label>Cantidad</label>
                    <input
                      type="number"
                      name="cantidad"
                      value={form.cantidad}
                      onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                      required
                      min="0"
                      step="any"
                      placeholder="100"
                    />
                  </div>
                  <div className="campo">
                    <label>De</label>
                    <select
                      name="de"
                      value={form.de}
                      onChange={(e) => setForm({ ...form, de: e.target.value })}
                    >
                      {monedas.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="campo">
                    <label>A</label>
                    <select
                      name="a"
                      value={form.a}
                      onChange={(e) => setForm({ ...form, a: e.target.value })}
                    >
                      {monedas.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primario" disabled={convirtiendo}>
                  {convirtiendo ? 'Calculando...' : 'Convertir'}
                </button>
              </form>

              {resultado && (
                <div className="exito-msg" style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                  <strong>{resultado.cantidad} {resultado.de}</strong>
                  {' = '}
                  <strong style={{ color: 'var(--acento)', fontSize: '1.3rem' }}>
                    {resultado.resultado} {resultado.a}
                  </strong>
                </div>
              )}
            </div>

            <p style={{ marginTop: 16, fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
              Fecha de actualización: {tasas.fecha}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
