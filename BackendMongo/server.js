require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const User = require('./models/User');
const Task = require('./models/Task');
const UserRepository = require('./repositories/UserRepository');
const TaskRepository = require('./repositories/TaskRepository');
const TaskInitialData = require('./initialData/TaskInitialData');

const PORT = process.env.PORT;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Polaczono z MongoDB');

    const userRepository = new UserRepository(User);
    const taskRepository = new TaskRepository(Task);
    const taskInitialData = new TaskInitialData(
      userRepository,
      taskRepository,
    );

    await taskInitialData.insertIfTaskCollectionsAreEmpty();

    app.listen(PORT, () => {
      console.log(`Serwer dziala na porcie ${PORT}`);
    });
  } catch (error) {
    console.error('Blad krytyczny przy uruchamianiu serwera:', error);
    process.exit(1);
  }
}

startServer();
