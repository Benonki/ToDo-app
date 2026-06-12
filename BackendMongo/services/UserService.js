class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getProfile(uid) {
    const user = await this.userRepository.findByFirebaseUid(uid);

    if (!user) {
      return null;
    }

    return this.withProfileInfoDefaults(user);
  }

  async updateProfile(uid, infoData) {
    const user = await this.userRepository.findByFirebaseUid(uid);

    if (!user) {
      return null;
    }

    const info = this.validateProfileInfo(infoData);
    const updatedUser = await this.userRepository.updateInfoByFirebaseUid(
      uid,
      info,
    );

    return this.withProfileInfoDefaults(updatedUser);
  }

  validateProfileInfo(infoData) {
    const { firstName, lastName } = infoData || {};

    if (typeof firstName !== 'string' || typeof lastName !== 'string') {
      throw new Error('Imie i nazwisko sa wymagane');
    }

    const normalizedInfo = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };

    if (!normalizedInfo.firstName || !normalizedInfo.lastName) {
      throw new Error('Imie i nazwisko sa wymagane');
    }

    return normalizedInfo;
  }

  withProfileInfoDefaults(user) {
    const userObject =
      typeof user?.toObject === 'function' ? user.toObject() : user;
    const info = userObject?.info || {};

    return {
      ...userObject,
      info: {
        ...info,
        firstName:
          typeof info.firstName === 'string' && info.firstName.trim()
            ? info.firstName
            : 'Imie...',
        lastName:
          typeof info.lastName === 'string' && info.lastName.trim()
            ? info.lastName
            : 'Nazwisko...',
      },
    };
  }
}

module.exports = UserService;