require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const app = express();

app.use(morgan('dev')); // logger

// Endpoint na sprawdzenie czy serwer działa
app.get('/api/status', (req, res) => {
  res.json({
    status: 'Serwer działa',
    dbStatus: mongoose.connection.readyState === 1 ? 'Połączono' : 'Brak połączenia',
    environment: process.env.NODE_ENV
  });
});

// Obsługa błędów 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Nie znaleziono endpointu'
  });
});

module.exports = app;