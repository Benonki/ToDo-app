require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const User = require('./models/User');
const Task = require('./models/Task');
const Tag = require('./models/Tag');

const UserRepository = require('./repositories/UserRepository');
const TaskRepository = require('./repositories/TaskRepository');
const TagRepository = require('./repositories/TagRepository');

const AuthService = require('./services/AuthService');
const UserService = require('./services/UserService');
const TaskService = require('./services/TaskService');

const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const TaskController = require('./controllers/TaskController');

const createAuthRoutes = require('./routes/authRoutes');
const createUserRoutes = require('./routes/userRoutes');
const createTaskRoutes = require('./routes/taskRoutes');

class App {
  constructor() {
    this.app = express();
    this.initializeDependencies();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeDependencies() {
    const userRepository = new UserRepository(User);
    const taskRepository = new TaskRepository(Task);
    const tagRepository = new TagRepository(Tag);

    const authService = new AuthService(userRepository);
    const userService = new UserService(userRepository);
    const taskService = new TaskService(
      userRepository,
      taskRepository,
      tagRepository,
    );

    this.authController = new AuthController(authService);
    this.userController = new UserController(userService);
    this.taskController = new TaskController(taskService);
  }

  initializeMiddlewares() {
    this.app.use(morgan('dev'));
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL,
      }),
    );
    this.app.use(express.json());
  }

  initializeRoutes() {
    this.app.use('/auth', createAuthRoutes(this.authController));
    this.app.use('/tasks', createTaskRoutes(this.taskController));
    this.app.use('/users', createUserRoutes(this.userController));
  }

  initializeErrorHandling() {
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Nie znaleziono endpointu',
      });
    });
  }

  getApp() {
    return this.app;
  }
}

module.exports = new App().getApp();
