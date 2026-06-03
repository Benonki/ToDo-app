class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  getProfile = async (req, res) => {
    try {
      const { uid } = req.firebaseUser;
      const user = await this.userService.getProfile(uid);

      if (!user) {
        return res.status(404).json({
          message: "Nie znaleziono uzytkownika w bazie",
        });
      }

      return res.json({ user });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({
        message: "Nie udalo sie pobrac profilu",
      });
    }
  };

  updateProfile = async (req, res) => {
    try {
      const { uid } = req.firebaseUser;
      const { info } = req.body;

      if (!info) {
        return res.status(400).json({
          message: "Brak obiektu info",
        });
      }

      const user = await this.userService.updateProfile(uid, info);

      if (!user) {
        return res.status(404).json({
          message: "Nie znaleziono uzytkownika w bazie",
        });
      }

      return res.json({ user });
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({
        message: error.message || "Nie udalo sie zaktualizowac profilu",
      });
    }
  };
}

module.exports = UserController;
