const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const router = express.Router();

// ============================================================
// GET /api/monedas
// Obtiene los tipos de cambio actuales desde una API externa gratuita
// Devuelve MXN, EUR, USD como referencia para mostrar precios
// Pública: no necesita token
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    const respuesta = await fetch(process.env.EXCHANGE_API_URL);

    if (!respuesta.ok) {
      const error = new Error('No se pudo obtener el tipo de cambio.');
      error.statusCode = 502;
      return next(error);
    }

    const datos = await respuesta.json();

    // Solo devolvemos las monedas más relevantes para México
    const monedasRelevantes = {
      USD: 1, // Base (la API usa USD como base)
      MXN: datos.rates.MXN,
      EUR: datos.rates.EUR,
      CAD: datos.rates.CAD,
    };

    res.json({
      ok: true,
      base: datos.base,
      fecha: datos.date,
      tasas: monedasRelevantes,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// GET /api/monedas/convertir?cantidad=100&de=USD&a=MXN
// Convierte una cantidad de una moneda a otra
// ============================================================
router.get('/convertir', async (req, res, next) => {
  try {
    const { cantidad, de, a } = req.query;

    if (!cantidad || !de || !a) {
      const error = new Error('Se requieren los parámetros: cantidad, de, a');
      error.statusCode = 400;
      return next(error);
    }

    const respuesta = await fetch(process.env.EXCHANGE_API_URL);
    const datos = await respuesta.json();

    const tasaDe = de.toUpperCase() === 'USD' ? 1 : datos.rates[de.toUpperCase()];
    const tasaA = datos.rates[a.toUpperCase()];

    if (!tasaDe || !tasaA) {
      const error = new Error('Moneda no soportada.');
      error.statusCode = 400;
      return next(error);
    }

    // Convertir: primero pasamos a USD, luego a la moneda destino
    const enUSD = parseFloat(cantidad) / tasaDe;
    const resultado = enUSD * tasaA;

    res.json({
      ok: true,
      de: de.toUpperCase(),
      a: a.toUpperCase(),
      cantidad: parseFloat(cantidad),
      resultado: parseFloat(resultado.toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
