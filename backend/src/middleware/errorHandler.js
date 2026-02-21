// ============================================================
// MIDDLEWARE DE MANEJO DE ERRORES
// Se coloca AL FINAL de todas las rutas en index.js
// Express lo reconoce como manejador de errores por tener 4 parámetros
// ============================================================

function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);

  // Si el error tiene un statusCode lo usamos, si no, 500 (error del servidor)
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    ok: false,
    mensaje: err.message || 'Error interno del servidor',
  });
}

// ============================================================
// MIDDLEWARE DE VALIDACIÓN DE DATOS
// Úsalo en las rutas que necesiten verificar campos obligatorios
// Ejemplo: validarCampos(['nombre', 'precio'])
// ============================================================

function validarCampos(campos) {
  return (req, res, next) => {
    const faltantes = campos.filter((campo) => {
      const valor = req.body[campo];
      return valor === undefined || valor === null || valor === '';
    });

    if (faltantes.length > 0) {
      const error = new Error(`Faltan los campos: ${faltantes.join(', ')}`);
      error.statusCode = 400;
      return next(error);
    }

    next();
  };
}

module.exports = { errorHandler, validarCampos };
