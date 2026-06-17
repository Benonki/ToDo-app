const { randomUUID } = require("crypto");

const TASK_STORAGE_MODES = {
  JSONB: "jsonb",
  RELATIONAL: "relational",
};

class TaskService {
  constructor(
    userRepository,
    taskRepository,
    tagRepository,
    storageMode = process.env.TASK_STORAGE_MODE,
  ) {
    this.userRepository = userRepository;
    this.taskRepository = taskRepository;
    this.tagRepository = tagRepository;
    this.storageMode = this.normalizeStorageMode(storageMode);
  }

  normalizeStorageMode(storageMode) {
    if (!storageMode) {
      return TASK_STORAGE_MODES.JSONB;
    }

    const normalized = storageMode.toLowerCase().trim();

    if (["jsonb"].includes(normalized)) {
      return TASK_STORAGE_MODES.JSONB;
    }

    if (["relational"].includes(normalized)) {
      return TASK_STORAGE_MODES.RELATIONAL;
    }

    throw new Error(
      `Nieprawidlowy TASK_STORAGE_MODE: ${storageMode}. Uzyj jsonb albo relational.`,
    );
  }

  async getTasksByDate(uid, date) {
    const user = await this.findUser(uid);

    if (this.storageMode === TASK_STORAGE_MODES.RELATIONAL) {
      return this.getRelationalTasksByDate(user.id, date);
    }

    return this.getJsonbTasksByDate(user.id, date);
  }

  async getJsonbTasksByDate(userId, date) {
    const { startOfDay, endOfDay } = this.getDateRange(date);

    const taskDoc = await this.taskRepository.findByUserAndDateRange(
      userId,
      startOfDay,
      endOfDay,
    );

    const tasks = this.getTaskList(taskDoc).sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime),
    );

    return this.formatJsonbTasksForResponse(tasks);
  }

  async getRelationalTasksByDate(userId, date) {
    const { startOfDay, endOfDay } = this.getDateRange(date);
    const taskItems = await this.taskRepository.findTaskItemsByUserAndDateRange(
      userId,
      startOfDay,
      endOfDay,
    );

    return taskItems.map((taskItem) => this.toResponseTask(taskItem));
  }

  async createTask(uid, taskData) {
    const user = await this.findUser(uid);

    if (this.storageMode === TASK_STORAGE_MODES.RELATIONAL) {
      return this.createRelationalTask(user.id, taskData);
    }

    return this.createJsonbTask(user.id, taskData);
  }

  async createJsonbTask(userId, taskData) {
    const taskDate = this.getTaskDate(taskData.date);
    const newTask = await this.buildJsonbTaskPayload(taskData);

    let taskDoc = await this.taskRepository.findByUserAndDate(userId, taskDate);

    if (taskDoc) {
      const tasks = this.getTaskList(taskDoc).concat(newTask);
      taskDoc = await this.taskRepository.updateTasks(taskDoc.id, tasks);
    } else {
      taskDoc = await this.taskRepository.create({
        userId,
        date: taskDate,
        tasks: [newTask],
      });
    }

    return this.formatJsonbTaskForResponse(this.getTaskList(taskDoc).at(-1));
  }

  async createRelationalTask(userId, taskData) {
    const taskPayload = await this.buildRelationalTaskPayload(userId, taskData);
    const taskItem = await this.taskRepository.createTaskItem(taskPayload);

    return this.toResponseTask(taskItem);
  }

  async updateTask(uid, taskId, updateData) {
    const user = await this.findUser(uid);

    if (this.storageMode === TASK_STORAGE_MODES.RELATIONAL) {
      return this.updateRelationalTask(user.id, taskId, updateData);
    }

    return this.updateJsonbTask(user.id, taskId, updateData);
  }

  async updateJsonbTask(userId, taskId, updateData) {
    const taskDoc = await this.findTaskDocumentByNestedTask(userId, taskId);

    if (!taskDoc) return null;

    const tasks = this.getTaskList(taskDoc);
    const taskIndex = tasks.findIndex((task) => task._id === taskId);

    if (taskIndex === -1) return null;

    const updatedTask = {
      ...tasks[taskIndex],
      ...(await this.buildJsonbUpdateFields(updateData)),
    };

    tasks[taskIndex] = updatedTask;

    await this.taskRepository.updateTasks(taskDoc.id, tasks);

    return this.formatJsonbTaskForResponse(updatedTask);
  }

  async updateRelationalTask(userId, taskId, updateData) {
    const updateFields = await this.buildRelationalUpdateFields(updateData);

    if (Object.keys(updateFields).length === 0) {
      const taskItem = await this.taskRepository.findTaskItemByIdAndUser(
        userId,
        taskId,
      );

      return this.toResponseTask(taskItem);
    }

    const taskItem = await this.taskRepository.updateTaskItemByIdAndUser(
      userId,
      taskId,
      updateFields,
    );

    return this.toResponseTask(taskItem);
  }

  async deleteTask(uid, date, taskId) {
    const user = await this.findUser(uid);

    if (this.storageMode === TASK_STORAGE_MODES.RELATIONAL) {
      const result = await this.taskRepository.deleteTaskItemByIdAndUser(
        user.id,
        taskId,
      );

      return result.count > 0;
    }

    const taskDate = this.getTaskDate(date);

    const taskDoc = await this.taskRepository.findByUserAndDate(
      user.id,
      taskDate,
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

  async buildJsonbTaskPayload(taskData) {
    const tags = await this.findOrCreateTagDocuments(taskData.tags);

    return {
      _id: randomUUID(),
      startTime: this.parseDateTime(taskData.startTime),
      endTime: this.parseDateTime(taskData.endTime),
      title: taskData.title || "",
      description: taskData.description || "",
      color: taskData.color || "#4A90E2",
      tags: tags.map((tag) => tag.id),
    };
  }

  async buildRelationalTaskPayload(userId, taskData) {
    const tags = await this.findOrCreateTagDocuments(taskData.tags);
    const payload = {
      userId,
      date: this.getTaskDate(taskData.date),
      startTime: this.parseDateObject(taskData.startTime),
      endTime: this.parseDateObject(taskData.endTime),
      title: taskData.title || "",
      description: taskData.description || "",
      color: taskData.color || "#4A90E2",
    };

    const tagConnectData = this.buildTagConnectData(tags);

    if (tagConnectData.length > 0) {
      payload.tags = {
        connect: tagConnectData,
      };
    }

    return payload;
  }

  async buildJsonbUpdateFields(updateData) {
    const updateFields = {
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

    if (updateData.tags !== undefined) {
      const tags = await this.findOrCreateTagDocuments(updateData.tags);
      updateFields.tags = tags.map((tag) => tag.id);
    }

    return updateFields;
  }

  async buildRelationalUpdateFields(updateData) {
    const updateFields = {
      ...(updateData.date && { date: this.getTaskDate(updateData.date) }),
      ...(updateData.startTime && {
        startTime: this.parseDateObject(updateData.startTime),
      }),
      ...(updateData.endTime && {
        endTime: this.parseDateObject(updateData.endTime),
      }),
      ...(updateData.title !== undefined && { title: updateData.title }),
      ...(updateData.description !== undefined && {
        description: updateData.description,
      }),
      ...(updateData.color !== undefined && { color: updateData.color }),
    };

    if (updateData.tags !== undefined) {
      const tags = await this.findOrCreateTagDocuments(updateData.tags);
      updateFields.tags = {
        set: this.buildTagConnectData(tags),
      };
    }

    return updateFields;
  }

  toResponseTask(taskItem) {
    if (!taskItem) return null;

    return {
      _id: taskItem.id,
      date: taskItem.date,
      startTime: taskItem.startTime,
      endTime: taskItem.endTime,
      title: taskItem.title,
      description: taskItem.description,
      color: taskItem.color,
      tags: Array.isArray(taskItem.tags)
        ? taskItem.tags.map((tag) => tag.name).filter(Boolean)
        : [],
    };
  }

  async formatJsonbTasksForResponse(tasks) {
    const tagIds = (tasks || []).flatMap((task) =>
      Array.isArray(task.tags)
        ? task.tags.map((tag) => this.getTagIdAsString(tag)).filter(Boolean)
        : [],
    );

    const tagDocuments = await this.tagRepository.findByIds(tagIds);
    const tagMap = new Map(tagDocuments.map((tag) => [tag.id, tag.name]));

    return (tasks || []).map((task) => ({
      ...task,
      tags: Array.isArray(task.tags)
        ? task.tags
            .map((tag) => {
              if (typeof tag === "object" && tag.name) {
                return tag.name;
              }

              const tagId = this.getTagIdAsString(tag);

              if (tagId) {
                return tagMap.get(tagId) || null;
              }

              return typeof tag === "string" ? tag : null;
            })
            .filter(Boolean)
        : [],
    }));
  }

  async formatJsonbTaskForResponse(task) {
    const formattedTasks = await this.formatJsonbTasksForResponse(
      task ? [task] : [],
    );

    return formattedTasks[0] || null;
  }

  async findOrCreateTagDocuments(tags) {
    return this.tagRepository.findOrCreateMany(tags);
  }

  buildTagConnectData(tags) {
    return (tags || []).map((tag) => ({ id: tag.id }));
  }

  getTagIdAsString(tag) {
    if (!tag) {
      return null;
    }

    if (typeof tag === "object" && tag.id) {
      return tag.id.toString();
    }

    if (typeof tag === "object" && tag._id) {
      return tag._id.toString();
    }

    if (typeof tag === "string" && this.isLikelyUuid(tag)) {
      return tag;
    }

    return null;
  }

  isLikelyUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  getTaskList(taskDoc) {
    return Array.isArray(taskDoc?.tasks) ? taskDoc.tasks : [];
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

  parseDateObject(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Nieprawidlowy format daty");
    }

    return date;
  }

  parseDateTime(value) {
    return this.parseDateObject(value).toISOString();
  }

  getStorageMode() {
    return this.storageMode;
  }
}

module.exports = TaskService;
module.exports.TASK_STORAGE_MODES = TASK_STORAGE_MODES;
