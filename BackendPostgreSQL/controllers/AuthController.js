class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  syncUser = async (req, res) => {
    try {
      const user = await this.authService.syncUser(req.firebaseUser);
      return res.json({ user });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getMe = async (req, res) => {
    try {
      const user = await this.authService.getMe(req.firebaseUser);
      return res.json({ user });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}

module.exports = AuthController;
