const DatabaseQueryTimer = require('../lib/DatabaseQueryTimer');

class UserRepository {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async findById(id) {
    return DatabaseQueryTimer.measure('User.findById', () =>
      this.userModel.findById(id).exec(),
    );
  }

  async findByFirebaseUid(firebaseUid) {
    return DatabaseQueryTimer.measure('User.findByFirebaseUid', () =>
      this.userModel.findOne({ firebaseUid }).exec(),
    );
  }

  async findByEmail(email) {
    return DatabaseQueryTimer.measure('User.findByEmail', () =>
      this.userModel.findOne({ email }).exec(),
    );
  }

  async create(data) {
    return DatabaseQueryTimer.measure('User.create', () =>
      this.userModel.create(data),
    );
  }

  async updateByFirebaseUid(firebaseUid, data) {
    return DatabaseQueryTimer.measure('User.updateByFirebaseUid', () =>
      this.userModel
        .findOneAndUpdate(
          { firebaseUid },
          { $set: data },
          {
            new: true,
            runValidators: true,
          },
        )
        .exec(),
    );
  }

  async updateInfoByFirebaseUid(firebaseUid, info) {
    return this.updateByFirebaseUid(firebaseUid, { info });
  }
}

module.exports = UserRepository;