const DatabaseQueryTimer = require("../lib/DatabaseQueryTimer");

class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByFirebaseUid(firebaseUid) {
    return DatabaseQueryTimer.measure("User.findUnique", () =>
      this.prisma.user.findUnique({
        where: { firebaseUid },
      }),
    );
  }

  async create(data) {
    return DatabaseQueryTimer.measure("User.create", () =>
      this.prisma.user.create({
        data,
      }),
    );
  }

  async updateByFirebaseUid(firebaseUid, data) {
    return DatabaseQueryTimer.measure("User.update", () =>
      this.prisma.user.update({
        where: { firebaseUid },
        data,
      }),
    );
  }

  async updateInfoByFirebaseUid(firebaseUid, info) {
    return this.updateByFirebaseUid(firebaseUid, { info });
  }
}

module.exports = UserRepository;
