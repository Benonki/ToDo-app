class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async syncUser(firebaseUser) {
    const { uid, email, name } = firebaseUser;

    if (!uid || !email) {
      throw new Error("Brak danych użytkownika z Firebase");
    }

    let user = await this.userRepository.findByFirebaseUid(uid);

    if (!user) {
      user = await this.userRepository.create({
        firebaseUid: uid,
        email,
        displayName: name || null,
      });
    } else {
      user = await this.userRepository.updateByFirebaseUid(uid, {
        email,
        displayName: name || user.displayName,
      });
    }

    return user;
  }

  async getMe(firebaseUser) {
    const user = await this.userRepository.findByFirebaseUid(firebaseUser.uid);

    if (!user) {
      throw new Error("Nie znaleziono użytkownika");
    }

    return user;
  }
}

module.exports = AuthService;
