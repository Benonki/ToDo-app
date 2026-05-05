require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

class App {
  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddlewares() {
    this.app.use(morgan('dev'));
    this.app.use(cors({ origin: 'http://localhost:5173' }));
    this.app.use(express.json());
  }

  initializeRoutes() {
    this.app.use('/auth', authRoutes);
    this.app.use('/tasks', taskRoutes);
  }

  initializeErrorHandling() {
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Nie znaleziono endpointu'
      });
    });
  }

  getApp() {
    return this.app;
  }
}

module.exports = new App().getApp();