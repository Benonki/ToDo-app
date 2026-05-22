const User = require('../models/User');

class AuthService {
    async syncUser({ uid, email, name }) {
        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            user = await User.create({
                firebaseUid: uid,
                email,
                displayName: name || null,
                info: {
                    firstName: 'Imie...',
                    lastName: 'Nazwisko...'
                }
            });
        } else {
            user = await User.findOneAndUpdate(
                { firebaseUid: uid },
                {
                    email,
                    displayName: name || user.displayName,
                    info: {
                        firstName: user.info?.firstName || 'Imie...',
                        lastName: user.info?.lastName || 'Nazwisko...'
                    }
                },
                { new: true }
            );
        }

        return user;
    }
}

module.exports = AuthService;