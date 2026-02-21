const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { validarCampos } = require('../middleware/errorHandler');
require('dotenv').config();

const router = express.Router();

// ============================================================
// POST /api/auth/registro
// Crea un nuevo usuario
// ============================================================
router.post('/registro', validarCampos(['nombre', 'email', 'password']), async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar si ya existe el email
    const [existe] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existe.length > 0) {
      const error = new Error('Ya existe una cuenta con ese email.');
      error.statusCode = 409;
      return next(error);
    }

    // Encriptar la contraseña (nunca guardes contraseñas en texto plano)
    const hash = await bcrypt.hash(password, 10);

    // Solo se puede crear admin si se pasa rol='admin' (en producción esto estaría más restringido)
    const rolFinal = rol === 'admin' ? 'admin' : 'usuario';

    await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hash, rolFinal]
    );

    res.status(201).json({ ok: true, mensaje: 'Usuario creado correctamente.' });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// POST /api/auth/login
// Inicia sesión y devuelve un token JWT
// ============================================================
router.post('/login', validarCampos(['email', 'password']), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      const error = new Error('Email o contraseña incorrectos.');
      error.statusCode = 401;
      return next(error);
    }

    const usuario = rows[0];

    // Comparar contraseña
    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      const error = new Error('Email o contraseña incorrectos.');
      error.statusCode = 401;
      return next(error);
    }

    // Crear el token JWT (expira en 8 horas)
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      ok: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
