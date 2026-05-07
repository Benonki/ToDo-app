class TaskRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByUserAndDateRange(userId, startOfDay, endOfDay) {
    return this.prisma.task.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  async findByUserAndDate(userId, date) {
    return this.prisma.task.findFirst({
      where: {
        userId,
        date,
      },
    });
  }

  async findManyByUser(userId) {
    return this.prisma.task.findMany({
      where: { userId },
    });
  }

  async create(data) {
    return this.prisma.task.create({
      data,
    });
  }

  async updateTasks(id, tasks) {
    return this.prisma.task.update({
      where: { id },
      data: { tasks },
    });
  }
}

module.exports = TaskRepository;
