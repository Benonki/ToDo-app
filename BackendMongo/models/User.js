const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  login: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  info: {
    firstName: String,
    lastName: String
  }
});

module.exports = mongoose.model('User', userSchema, 'User');