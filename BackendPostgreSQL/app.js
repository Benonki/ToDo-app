const express = require("express");
const cors = require("cors");
const app = express();
const prisma = require("./lib/prismaClient");
const admin = require("./lib/firebaseAdmin");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "hello world!" });
});

async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Brak tokenu" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Nieprawidłowy token" });
  }
}

app.post("/auth/sync-user", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name } = req.firebaseUser;

    if (!uid || !email) {
      return res.status(400).json({
        message: "Brak danych użytkownika z Firebase",
      });
    }

    let user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email,
          displayName: name || null,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { firebaseUid: uid },
        data: {
          email,
          displayName: name || user.displayName,
        },
      });
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

    const user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

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

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to the database");
  } catch (error) {
    console.error("Failed to connect to the database", error);
  }
}

app.listen(PORT, async () => {
  console.log(`Server running on port: ${PORT}`);
  await testConnection();
});
