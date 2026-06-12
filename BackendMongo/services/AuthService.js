class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async syncUser(firebaseUser) {
    const { uid, email, name } = firebaseUser;

    if (!uid || !email) {
      throw new Error('Brak danych użytkownika z Firebase');
    }

    let user = await this.userRepository.findByFirebaseUid(uid);

    if (!user) {
      user = await this.userRepository.create({
        firebaseUid: uid,
        email,
        displayName: name || null,
        info: this.getProfileDefaults(),
      });
    } else {
      const currentUser = this.toPlainObject(user);

      user = await this.userRepository.updateByFirebaseUid(uid, {
        email,
        displayName: name || currentUser.displayName,
        info: this.withProfileDefaults(currentUser.info),
      });
    }

    return user;
  }

  async getMe(firebaseUser) {
    const user = await this.userRepository.findByFirebaseUid(firebaseUser.uid);

    if (!user) {
      throw new Error('Nie znaleziono użytkownika');
    }

    return user;
  }

  getProfileDefaults() {
    return {
      firstName: 'Imie...',
      lastName: 'Nazwisko...',
    };
  }

  withProfileDefaults(info) {
    const currentInfo =
      info !== null && typeof info === 'object' && !Array.isArray(info)
        ? info
        : {};

    const defaults = this.getProfileDefaults();

    return {
      ...currentInfo,
      firstName:
        typeof currentInfo.firstName === 'string' &&
        currentInfo.firstName.trim()
          ? currentInfo.firstName
          : defaults.firstName,
      lastName:
        typeof currentInfo.lastName === 'string' && currentInfo.lastName.trim()
          ? currentInfo.lastName
          : defaults.lastName,
    };
  }

  toPlainObject(document) {
    return typeof document?.toObject === 'function'
      ? document.toObject()
      : document;
  }
}

module.exports = AuthService;