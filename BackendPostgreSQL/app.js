const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./lib/prismaClient");

const AuthService = require("./services/AuthService");
const AuthController = require("./controllers/AuthController");
const createAuthRoutes = require("./routes/authRoutes");

const app = express();
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

const authService = new AuthService(prisma);
const authController = new AuthController(authService);

app.use("/auth", createAuthRoutes(authController));

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
