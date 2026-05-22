const User = require('../models/User');

class UserService {
    async getProfile(uid) {
        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            return null;
        }

        return user;
    }

    async updateProfile(uid, infoData) {
        const { firstName, lastName } = infoData;

        if (!firstName || !lastName) {
            throw new Error('Imię i nazwisko są wymagane');
        }

        const user = await User.findOneAndUpdate(
            { firebaseUid: uid },
            {
                $set: {
                    'info.firstName': firstName,
                    'info.lastName': lastName
                }
            },
            { new: true }
        );

        return user;
    }
}

module.exports = UserService;