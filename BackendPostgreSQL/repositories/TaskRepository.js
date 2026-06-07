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

  async findTaskItemsByUserAndDateRange(userId, startOfDay, endOfDay) {
    return DatabaseQueryTimer.measure("TaskItem.findManyByDateRange", () =>
      this.prisma.taskItem.findMany({
        where: {
          userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: {
          startTime: "asc",
        },
      }),
    );
  }

  async findTaskItemByIdAndUser(userId, taskId) {
    return DatabaseQueryTimer.measure("TaskItem.findByIdAndUser", () =>
      this.prisma.taskItem.findFirst({
        where: {
          id: taskId,
          userId,
        },
      }),
    );
  }

  async createTaskItem(data) {
    return DatabaseQueryTimer.measure("TaskItem.create", () =>
      this.prisma.taskItem.create({
        data,
      }),
    );
  }

  async updateTaskItemByIdAndUser(userId, taskId, data) {
    return DatabaseQueryTimer.measure("TaskItem.updateByIdAndUser", async () => {
      const taskItem = await this.prisma.taskItem.findFirst({
        where: {
          id: taskId,
          userId,
        },
      });

      if (!taskItem) {
        return null;
      }

      return this.prisma.taskItem.update({
        where: { id: taskId },
        data,
      });
    });
  }

  async deleteTaskItemByIdAndUser(userId, taskId) {
    return DatabaseQueryTimer.measure("TaskItem.deleteByIdAndUser", () =>
      this.prisma.taskItem.deleteMany({
        where: {
          id: taskId,
          userId,
        },
      }),
    );
  }
}

module.exports = TaskRepository;
