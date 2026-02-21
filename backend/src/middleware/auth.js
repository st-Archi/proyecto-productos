const jwt = require('jsonwebtoken');
require('dotenv').config();

// ============================================================
// MIDDLEWARE: Verifica que el usuario esté autenticado
// Agrega req.usuario con los datos del token si es válido
// ============================================================

function autenticar(req, res, next) {
  // El token viene en el header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ ok: false, mensaje: 'Acceso denegado. Inicia sesión primero.' });
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = datos; // { id, email, rol }
    next();
  } catch {
    return res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado.' });
  }
}

// ============================================================
// MIDDLEWARE: Solo permite el acceso a administradores
// Úsalo DESPUÉS de autenticar()
// ============================================================

function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ ok: false, mensaje: 'No tienes permisos de administrador.' });
  }
  next();
}

module.exports = { autenticar, soloAdmin };
