const mongoose = require('mongoose');
const DatabaseQueryTimer = require('../lib/DatabaseQueryTimer');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String },
  info: {
    firstName: { type: String,  default: 'Imie...' },
    lastName: { type: String,  default: 'Nazwisko...' }
  }
}, { timestamps: true });

class UserModel {
  constructor() {
    this.model = mongoose.model('User', userSchema);
  }

  create(data) {
    return DatabaseQueryTimer.measure(
      'User.create',
      () => this.model.create(data)
    );
  }

  findOne(filter) {
    return DatabaseQueryTimer.measure(
      'User.findOne',
      () => this.model.findOne(filter).exec()
    );
  }

  findOneAndUpdate(filter, update, options) {
    return DatabaseQueryTimer.measure(
      'User.findOneAndUpdate',
      () => this.model.findOneAndUpdate(filter, update, options).exec()
    );
  }
}

module.exports = new UserModel();
