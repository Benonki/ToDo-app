const ProfileInfo = require("./ProfileInfo");

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

    const info = new ProfileInfo(infoData).validateRequired();
    const updatedUser = await this.userRepository.updateInfoByFirebaseUid(
      uid,
      info,
    );

    return this.withProfileInfoDefaults(updatedUser);
  }

  withProfileInfoDefaults(user) {
    return {
      ...user,
      info: new ProfileInfo(user.info).withDefaults(),
    };
  }
}

module.exports = UserService;
