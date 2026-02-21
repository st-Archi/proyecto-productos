require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Importar rutas
const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const monedasRoutes = require('./routes/monedas');

const app = express();
const PORT = process.env.PORT || 4000;

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

// Permitir peticiones desde el frontend (React corre en otro puerto)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parsear el cuerpo de las peticiones como JSON
app.use(express.json());

// ============================================================
// RUTAS
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/monedas', monedasRoutes);

// Ruta de prueba para saber si el servidor está corriendo
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'Servidor funcionando correctamente 🚀' });
});

// ============================================================
// MANEJADOR DE ERRORES (siempre al final)
// ============================================================
app.use(errorHandler);

// ============================================================
// INICIAR SERVIDOR
// ============================================================
async function iniciar() {
  await initDB(); // Primero inicializamos la base de datos
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Prueba: http://localhost:${PORT}/api/health`);
  });
}

iniciar();
