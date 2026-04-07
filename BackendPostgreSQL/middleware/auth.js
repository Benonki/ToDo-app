import admin from "../lib/firebaseAdmin.js";

export async function verifyFirebaseToken(req, res, next) {
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
    return res.status(401).json({ message: "Nieprawidłowy token" });
  }
}
