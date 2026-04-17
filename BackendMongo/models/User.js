const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String },
}, { timestamps: true });

class UserModel {
  constructor() {
    this.model = mongoose.model('User', userSchema);
  }

  create(data) {
    return this.model.create(data);
  }

  findOne(filter) {
    return this.model.findOne(filter);
  }

  findOneAndUpdate(filter, update, options) {
    return this.model.findOneAndUpdate(filter, update, options);
  }
}

module.exports = new UserModel();