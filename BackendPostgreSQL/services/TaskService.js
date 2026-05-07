const { randomUUID } = require("crypto");

class TaskService {
  constructor(userRepository, taskRepository) {
    this.userRepository = userRepository;
    this.taskRepository = taskRepository;
  }

  async getTasksByDate(uid, date) {
    const user = await this.findUser(uid);
    const { startOfDay, endOfDay } = this.getDateRange(date);

    const taskDoc = await this.taskRepository.findByUserAndDateRange(
      user.id,
      startOfDay,
      endOfDay,
    );

    return Array.isArray(taskDoc?.tasks) ? taskDoc.tasks : [];
  }

  async createTask(uid, taskData) {
    const user = await this.findUser(uid);
    const taskDate = this.getTaskDate(taskData.date);

    const newTask = {
      _id: randomUUID(),
      startTime: this.parseDateTime(taskData.startTime),
      endTime: this.parseDateTime(taskData.endTime),
      title: taskData.title || "",
      description: taskData.description || "",
      color: taskData.color || "#4A90E2",
    };

    let taskDoc = await this.taskRepository.findByUserAndDate(user.id, taskDate);

    if (taskDoc) {
      const tasks = this.getTaskList(taskDoc).concat(newTask);
      taskDoc = await this.taskRepository.updateTasks(taskDoc.id, tasks);
    } else {
      taskDoc = await this.taskRepository.create({
        userId: user.id,
        date: taskDate,
        tasks: [newTask],
      });
    }

    return this.getTaskList(taskDoc).at(-1);
  }

  async updateTask(uid, taskId, updateData) {
    const user = await this.findUser(uid);
    const taskDoc = await this.findTaskDocumentByNestedTask(user.id, taskId);

    if (!taskDoc) return null;

    const tasks = this.getTaskList(taskDoc);
    const taskIndex = tasks.findIndex((task) => task._id === taskId);

    if (taskIndex === -1) return null;

    const updatedTask = {
      ...tasks[taskIndex],
      ...(updateData.startTime && {
        startTime: this.parseDateTime(updateData.startTime),
      }),
      ...(updateData.endTime && {
        endTime: this.parseDateTime(updateData.endTime),
      }),
      ...(updateData.title !== undefined && { title: updateData.title }),
      ...(updateData.description !== undefined && {
        description: updateData.description,
      }),
      ...(updateData.color !== undefined && { color: updateData.color }),
    };

    tasks[taskIndex] = updatedTask;

    await this.taskRepository.updateTasks(taskDoc.id, tasks);

    return updatedTask;
  }

  async deleteTask(uid, date, taskId) {
    const user = await this.findUser(uid);
    const { startOfDay, endOfDay } = this.getDateRange(date);

    const taskDoc = await this.taskRepository.findByUserAndDateRange(
      user.id,
      startOfDay,
      endOfDay,
    );

    if (!taskDoc) return false;

    const tasks = this.getTaskList(taskDoc);
    const filteredTasks = tasks.filter((task) => task._id !== taskId);

    if (filteredTasks.length === tasks.length) return false;

    await this.taskRepository.updateTasks(taskDoc.id, filteredTasks);

    return true;
  }

  async findUser(uid) {
    const user = await this.userRepository.findByFirebaseUid(uid);

    if (!user) {
      throw new Error("Uzytkownik nie znaleziony");
    }

    return user;
  }

  async findTaskDocumentByNestedTask(userId, taskId) {
    const taskDocs = await this.taskRepository.findManyByUser(userId);

    return taskDocs.find((taskDoc) =>
      this.getTaskList(taskDoc).some((task) => task._id === taskId),
    );
  }

  getTaskList(taskDoc) {
    return Array.isArray(taskDoc.tasks) ? taskDoc.tasks : [];
  }

  getDateRange(date) {
    const { year, month, day } = this.parseDateParts(date);

    return {
      startOfDay: new Date(Date.UTC(year, month - 1, day, 0, 0, 0)),
      endOfDay: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
    };
  }

  getTaskDate(date) {
    const { year, month, day } = this.parseDateParts(date);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }

  parseDateParts(value) {
    const parsedDate = new Date(value);

    if (!Number.isNaN(parsedDate.getTime())) {
      return {
        year: parsedDate.getUTCFullYear(),
        month: parsedDate.getUTCMonth() + 1,
        day: parsedDate.getUTCDate(),
      };
    }

    const [year, month, day] = String(value).split("-").map(Number);

    if (!year || !month || !day) {
      throw new Error("Nieprawidlowy format daty");
    }

    return { year, month, day };
  }

  parseDateTime(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Nieprawidlowy format daty");
    }

    return date.toISOString();
  }
}

module.exports = TaskService;
