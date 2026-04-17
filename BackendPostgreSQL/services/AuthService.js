class AuthService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async syncUser(firebaseUser) {
    const { uid, email, name } = firebaseUser;

    if (!uid || !email) {
      throw new Error("Brak danych użytkownika z Firebase");
    }

    let user = await this.prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          firebaseUid: uid,
          email,
          displayName: name || null,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { firebaseUid: uid },
        data: {
          email,
          displayName: name || user.displayName,
        },
      });
    }

    return user;
  }

  async getMe(firebaseUser) {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid: firebaseUser.uid },
    });

    if (!user) {
      throw new Error("Nie znaleziono użytkownika");
    }

    return user;
  }
}

module.exports = AuthService;
