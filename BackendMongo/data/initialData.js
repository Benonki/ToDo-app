const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initialUser = {
  login: 'test',
  password: 'test',
  info: {
    firstName: 'ImieTest',
    lastName: 'NazTest'
  }
};

const initializeData = async () => {
  try {
    const count = await User.countDocuments();

    if (count === 0) {
      const hashedPassword = await bcrypt.hash(initialUser.password, 12);

      const user = new User({
        login: initialUser.login,
        password: hashedPassword,
        info: initialUser.info
      });

      await user.save();
      console.log('Wprowadzono podstawowe dane');
    }
  } catch (error) {
    console.error('Błąd podczas wprowadzania podstawowych danych:', error);
  }
};

module.exports = { initializeData };