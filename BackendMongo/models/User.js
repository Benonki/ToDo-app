const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, default: null },
  info: {
    firstName: String,
    lastName: String
  }
});

module.exports = mongoose.model('User', userSchema, 'User');