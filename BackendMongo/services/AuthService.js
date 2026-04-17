const User = require('../models/User');

class UserService {
    async syncUser({ uid, email, name }) {
        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            user = await User.create({
                firebaseUid: uid,
                email,
                displayName: name || null,
            });
        } else {
            user = await User.findOneAndUpdate(
                { firebaseUid: uid },
                { email, displayName: name || user.displayName },
                { new: true }
            );
        }

        return user;
    }

    async findUserByUid(uid) {
        return await User.findOne({ firebaseUid: uid });
    }
}

module.exports = UserService;