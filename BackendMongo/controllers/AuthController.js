const UserService = require('../services/AuthService');

class AuthController {
    constructor() {
        this.userService = new UserService();
    }

    async syncUser(req, res) {
        try {
            const { uid, email, name } = req.firebaseUser;

            if (!uid || !email) {
                return res.status(400).json({
                    message: 'Brak danych użytkownika z Firebase',
                });
            }

            const user = await this.userService.syncUser({ uid, email, name });

            return res.json({ user });
        } catch (error) {
            console.error('Sync user error:', error);
            return res.status(500).json({
                message: 'Nie udało się zsynchronizować użytkownika',
            });
        }
    }

    async getMe(req, res) {
        try {
            const { uid } = req.firebaseUser;

            const user = await this.userService.findUserByUid(uid);

            if (!user) {
                return res.status(404).json({
                    message: 'Nie znaleziono użytkownika w bazie',
                });
            }

            return res.json({ user });
        } catch (error) {
            console.error('Get me error:', error);
            return res.status(500).json({
                message: 'Nie udało się pobrać użytkownika',
            });
        }
    }
}

module.exports = AuthController;