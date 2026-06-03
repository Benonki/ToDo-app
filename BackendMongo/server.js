require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const TaskInitialData = require('./initialData/TaskInitialData');

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('Połączono z MongoDB');

      const taskInitialData = new TaskInitialData();
      await taskInitialData.insertIfTaskCollectionsAreEmpty();

      app.listen(PORT, () => {
          console.log(`Serwer działa na porcie ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Błąd krytyczny przy uruchamianiu serwera:', err);
      process.exit(1);
    });
