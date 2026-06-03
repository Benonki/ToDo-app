const DatabaseQueryTimer = require("../lib/DatabaseQueryTimer");

class TaskRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByUserAndDateRange(userId, startOfDay, endOfDay) {
    return DatabaseQueryTimer.measure("Task.findFirstByDateRange", () =>
      this.prisma.task.findFirst({
        where: {
          userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
    );
  }

  async findByUserAndDate(userId, date) {
    return DatabaseQueryTimer.measure("Task.findFirstByDate", () =>
      this.prisma.task.findFirst({
        where: {
          userId,
          date,
        },
      }),
    );
  }

  async findManyByUser(userId) {
    return DatabaseQueryTimer.measure("Task.findManyByUser", () =>
      this.prisma.task.findMany({
        where: { userId },
      }),
    );
  }

  async create(data) {
    return DatabaseQueryTimer.measure("Task.create", () =>
      this.prisma.task.create({
        data,
      }),
    );
  }

  async updateTasks(id, tasks) {
    return DatabaseQueryTimer.measure("Task.updateTasks", () =>
      this.prisma.task.update({
        where: { id },
        data: { tasks },
      }),
    );
  }
}

module.exports = TaskRepository;
