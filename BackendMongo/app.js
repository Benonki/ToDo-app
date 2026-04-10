require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const User = require('./models/User');
const { verifyFirebaseToken } = require('./middleware/auth');

const app = express();

app.use(morgan('dev')); // logger
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json())

// Endpoint na sprawdzenie czy serwer działa
app.get('/api/status', (req, res) => {
  res.json({
    status: 'Serwer działa',
    dbStatus: mongoose.connection.readyState === 1 ? 'Połączono' : 'Brak połączenia',
    environment: process.env.NODE_ENV
  });
});

app.post("/auth/sync-user", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name } = req.firebaseUser;

    if (!uid || !email) {
      return res.status(400).json({
        message: "Brak danych użytkownika z Firebase",
      });
    }

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email,
        displayName: name || null,
      });
    } else {
      user = await User.findOneAndUpdate(
          { firebaseUid: uid },
          { email, displayName: name || user.displayName },
          { new: true }
      );
    }

    return res.json({ user });
  } catch (error) {
    console.error("Sync user error:", error);
    return res.status(500).json({
      message: "Nie udało się zsynchronizować użytkownika",
    });
  }
});

app.get("/auth/me", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.firebaseUser;

    const user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      return res.status(404).json({
        message: "Nie znaleziono użytkownika w bazie",
      });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({
      message: "Nie udało się pobrać użytkownika",
    });
  }
});

// Obsługa błędów 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Nie znaleziono endpointu'
  });
});

module.exports = app;