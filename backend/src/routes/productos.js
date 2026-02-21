const express = require('express');
const { pool } = require('../config/database');
const { autenticar, soloAdmin } = require('../middleware/auth');
const { validarCampos } = require('../middleware/errorHandler');

const router = express.Router();

// ============================================================
// GET /api/productos
// Lista productos con PAGINACIÓN y FILTROS
// Pública: no necesita token
// Ejemplo: /api/productos?pagina=1&limite=10&categoria=ropa&buscar=camisa
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    // Paginación - si no se mandan, usamos valores por defecto
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;

    // Filtros opcionales
    const { categoria, buscar } = req.query;

    let condiciones = [];
    let valores = [];

    if (categoria) {
      condiciones.push('categoria = ?');
      valores.push(categoria);
    }

    if (buscar) {
      condiciones.push('(nombre LIKE ? OR descripcion LIKE ?)');
      valores.push(`%${buscar}%`, `%${buscar}%`);
    }

    const where = condiciones.length > 0 ? 'WHERE ' + condiciones.join(' AND ') : '';

    // Contar el total para calcular cuántas páginas hay
    const [totalRows] = await pool.query(`SELECT COUNT(*) as total FROM productos ${where}`, valores);
    const total = totalRows[0].total;

    // Obtener los productos de esta página
    const [productos] = await pool.query(
      `SELECT * FROM productos ${where} ORDER BY creado_en DESC LIMIT ? OFFSET ?`,
      [...valores, limite, offset]
    );

    res.json({
      ok: true,
      data: productos,
      paginacion: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// GET /api/productos/:id
// Obtiene un producto por ID
// Pública
// ============================================================
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      const error = new Error('Producto no encontrado.');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ ok: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// POST /api/productos
// Crea un producto nuevo
// Protegida: solo admins
// ============================================================
router.post(
  '/',
  autenticar,
  soloAdmin,
  validarCampos(['nombre', 'precio']),
  async (req, res, next) => {
    try {
      const { nombre, descripcion, precio, categoria, stock } = req.body;

      const [resultado] = await pool.query(
        'INSERT INTO productos (nombre, descripcion, precio, categoria, stock) VALUES (?, ?, ?, ?, ?)',
        [nombre, descripcion || null, precio, categoria || null, stock || 0]
      );

      res.status(201).json({
        ok: true,
        mensaje: 'Producto creado.',
        id: resultado.insertId,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// PUT /api/productos/:id
// Actualiza un producto
// Protegida: solo admins
// ============================================================
router.put('/:id', autenticar, soloAdmin, async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, categoria, stock } = req.body;

    const [existe] = await pool.query('SELECT id FROM productos WHERE id = ?', [req.params.id]);
    if (existe.length === 0) {
      const error = new Error('Producto no encontrado.');
      error.statusCode = 404;
      return next(error);
    }

    await pool.query(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, stock = ? WHERE id = ?',
      [nombre, descripcion, precio, categoria, stock, req.params.id]
    );

    res.json({ ok: true, mensaje: 'Producto actualizado.' });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// DELETE /api/productos/:id
// Elimina un producto
// Protegida: solo admins
// ============================================================
router.delete('/:id', autenticar, soloAdmin, async (req, res, next) => {
  try {
    const [existe] = await pool.query('SELECT id FROM productos WHERE id = ?', [req.params.id]);
    if (existe.length === 0) {
      const error = new Error('Producto no encontrado.');
      error.statusCode = 404;
      return next(error);
    }

    await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);

    res.json({ ok: true, mensaje: 'Producto eliminado.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
