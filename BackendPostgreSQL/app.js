const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./lib/prismaClient");

const UserRepository = require("./repositories/UserRepository");
const TaskRepository = require("./repositories/TaskRepository");
const AuthService = require("./services/AuthService");
const AuthController = require("./controllers/AuthController");
const createAuthRoutes = require("./routes/authRoutes");
const TaskService = require("./services/TaskService");
const TaskController = require("./controllers/TaskController");
const createTaskRoutes = require("./routes/taskRoutes");

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

const userRepository = new UserRepository(prisma);
const taskRepository = new TaskRepository(prisma);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);
const taskService = new TaskService(userRepository, taskRepository);
const taskController = new TaskController(taskService);

app.use("/auth", createAuthRoutes(authController));
app.use("/tasks", createTaskRoutes(taskController));

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
