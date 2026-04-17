class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByFirebaseUid(firebaseUid) {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
    });
  }

  async create(data) {
    return this.prisma.user.create({
      data,
    });
  }

  async updateByFirebaseUid(firebaseUid, data) {
    return this.prisma.user.update({
      where: { firebaseUid },
      data,
    });
  }
}

module.exports = UserRepository;
