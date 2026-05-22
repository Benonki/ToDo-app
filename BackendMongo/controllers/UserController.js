const UserService = require('../services/UserService');

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async getProfile(req, res) {
        try {
            const { uid } = req.firebaseUser;

            const user = await this.userService.getProfile(uid);

            if (!user) {
                return res.status(404).json({
                    message: 'Nie znaleziono użytkownika w bazie',
                });
            }

            return res.json({ user });
        } catch (error) {
            console.error('Get profile error:', error);
            return res.status(500).json({
                message: 'Nie udało się pobrać profilu',
            });
        }
    }

    async updateProfile(req, res) {
        try {
            const { uid } = req.firebaseUser;
            const { info } = req.body;

            if (!info) {
                return res.status(400).json({
                    message: 'Brak obiektu info',
                });
            }

            const user = await this.userService.updateProfile(uid, info);

            if (!user) {
                return res.status(404).json({
                    message: 'Nie znaleziono użytkownika w bazie',
                });
            }

            return res.json({ user });
        } catch (error) {
            console.error('Update profile error:', error);
            return res.status(500).json({
                message: error.message || 'Nie udało się zaktualizować profilu',
            });
        }
    }
}

module.exports = UserController;