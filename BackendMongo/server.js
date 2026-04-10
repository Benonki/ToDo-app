require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('Połączono z MongoDB');

      app.listen(PORT, () => {
          console.log(`Serwer działa na porcie ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Błąd krytyczny przy uruchamianiu serwera:', err);
      process.exit(1);
    });