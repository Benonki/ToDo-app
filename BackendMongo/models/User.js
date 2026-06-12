const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    displayName: { type: String, default: null },
    info: {
        firstName: { type: String, default: 'Imie...' },
        lastName: { type: String, default: 'Nazwisko...' }
    }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);