const TASK_STORAGE_MODES = {
  DAILY: 'daily',
  REFERENCED: 'referenced',
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
      return TASK_STORAGE_MODES.DAILY;
    }

    const normalized = storageMode.toLowerCase().trim();

    if (normalized === 'embedded') {
      return TASK_STORAGE_MODES.DAILY;
    }

    if (
      normalized === TASK_STORAGE_MODES.DAILY ||
      normalized === TASK_STORAGE_MODES.REFERENCED
    ) {
      return normalized;
    }

    throw new Error(
      `Nieprawidlowy TASK_STORAGE_MODE: ${storageMode}. Uzyj daily albo referenced.`,
    );
  }

  async getTasksByDate(uid, date) {
    const user = await this.findUser(uid);
    const { startOfDay, endOfDay } = this.getDateRange(date);

    if (this.storageMode === TASK_STORAGE_MODES.REFERENCED) {
      const tasks =
        await this.taskRepository.findReferencedByUserAndDateRange(
          user._id,
          startOfDay,
          endOfDay,
        );

      return this.formatTasksForResponse(tasks);
    }

    const taskDocument =
      await this.taskRepository.findDailyByUserAndDateRange(
        user._id,
        startOfDay,
        endOfDay,
      );

    const tasks = Array.isArray(taskDocument?.tasks)
      ? taskDocument.tasks
          .map((task) => this.toPlainObject(task))
          .sort(
            (firstTask, secondTask) =>
              new Date(firstTask.startTime) - new Date(secondTask.startTime),
          )
      : [];

    return this.formatTasksForResponse(tasks);
  }

  async createTask(uid, taskData) {
    const user = await this.findUser(uid);
    const taskDate = this.getTaskDate(taskData.date);
    const newTask = await this.buildTaskPayload(taskData);

    if (this.storageMode === TASK_STORAGE_MODES.REFERENCED) {
      const task = await this.taskRepository.createReferenced({
        userId: user._id,
        date: taskDate,
        ...newTask,
      });

      return this.formatTaskForResponse(task);
    }

    let taskDocument = await this.taskRepository.findDailyByUserAndDate(
      user._id,
      taskDate,
    );

    if (taskDocument) {
      taskDocument.tasks.push(newTask);
      taskDocument = await this.taskRepository.saveDaily(taskDocument);
    } else {
      taskDocument = await this.taskRepository.createDaily({
        userId: user._id,
        date: taskDate,
        tasks: [newTask],
      });
    }

    const createdTask = taskDocument.tasks.at(-1);
    return this.formatTaskForResponse(createdTask);
  }

  async updateTask(uid, taskId, updateData) {
    const user = await this.findUser(uid);

    if (this.storageMode === TASK_STORAGE_MODES.REFERENCED) {
      const updateFields = await this.buildUpdateFields(updateData, true);
      const task = await this.taskRepository.updateReferencedByIdAndUser(
        user._id,
        taskId,
        updateFields,
      );

      return this.formatTaskForResponse(task);
    }

    const taskDocument = await this.taskRepository.findDailyByNestedTask(
      user._id,
      taskId,
    );

    if (!taskDocument) {
      return null;
    }

    const task = taskDocument.tasks.id(taskId);

    if (!task) {
      return null;
    }

    const updateFields = await this.buildUpdateFields(updateData, false);
    Object.assign(task, updateFields);

    await this.taskRepository.saveDaily(taskDocument);

    return this.formatTaskForResponse(task);
  }

  async deleteTask(uid, date, taskId) {
    const user = await this.findUser(uid);

    if (this.storageMode === TASK_STORAGE_MODES.REFERENCED) {
      const result = await this.taskRepository.deleteReferencedByIdAndUser(
        user._id,
        taskId,
      );

      return result.deletedCount > 0;
    }

    const result = await this.taskRepository.deleteDailyTaskByUserAndTaskId(
      user._id,
      taskId,
    );

    return result.modifiedCount > 0;
  }

  async findUser(uid) {
    const user = await this.userRepository.findByFirebaseUid(uid);

    if (!user) {
      throw new Error('Uzytkownik nie znaleziony');
    }

    return user;
  }

  async buildTaskPayload(taskData) {
    const startTime = this.parseDateObject(taskData.startTime);
    const endTime = this.parseDateObject(taskData.endTime);


    return {
      startTime,
      endTime,
      title: taskData.title || '',
      description: taskData.description || '',
      color: taskData.color || '#4A90E2',
      tags: await this.tagRepository.findOrCreateMany(taskData.tags),
    };
  }

  async buildUpdateFields(updateData, includeDate) {
    const updateFields = {};

    if (includeDate && updateData.date) {
      updateFields.date = this.getTaskDate(updateData.date);
    }

    if (updateData.startTime) {
      updateFields.startTime = this.parseDateObject(updateData.startTime);
    }

    if (updateData.endTime) {
      updateFields.endTime = this.parseDateObject(updateData.endTime);
    }

    if (updateData.title !== undefined) {
      updateFields.title = updateData.title;
    }

    if (updateData.description !== undefined) {
      updateFields.description = updateData.description;
    }

    if (updateData.color !== undefined) {
      updateFields.color = updateData.color;
    }

    if (updateData.tags !== undefined) {
      updateFields.tags = await this.tagRepository.findOrCreateMany(
        updateData.tags,
      );
    }
    return updateFields;
  }

  async formatTasksForResponse(tasks) {
    const taskObjects = (tasks || []).map((task) => this.toPlainObject(task));
    const tagIds = taskObjects.flatMap((task) =>
      Array.isArray(task.tags)
        ? task.tags
            .map((tag) => this.getTagIdAsString(tag))
            .filter(Boolean)
        : [],
    );

    const tagDocuments = await this.tagRepository.findByIds(tagIds);
    const tagMap = new Map(
      tagDocuments.map((tag) => [tag._id.toString(), tag.name]),
    );

    return taskObjects.map((task) => ({
      ...task,
      tags: Array.isArray(task.tags)
        ? task.tags
            .map((tag) => {
              if (typeof tag === 'object' && tag.name) {
                return tag.name;
              }

              const tagId = this.getTagIdAsString(tag);
              return tagMap.get(tagId) || null;
            })
            .filter(Boolean)
        : [],
    }));
  }

  async formatTaskForResponse(task) {
    const formattedTasks = await this.formatTasksForResponse(
      task ? [task] : [],
    );

    return formattedTasks[0] || null;
  }

  getTagIdAsString(tag) {
    if (!tag) {
      return null;
    }

    if (typeof tag === 'object' && tag._id) {
      return tag._id.toString();
    }

    return tag.toString();
  }

  getDateRange(date) {
    const { year, month, day } = this.parseDateParts(date);

    return {
      startOfDay: new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)),
      endOfDay: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
    };
  }

  getTaskDate(date) {
    const { year, month, day } = this.parseDateParts(date);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  }

  parseDateParts(value) {
    const rawDate = String(value || '').trim();
    const dateOnlyMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1]);
      const month = Number(dateOnlyMatch[2]);
      const day = Number(dateOnlyMatch[3]);

      this.validateDateParts(year, month, day);
      return { year, month, day };
    }

    const parsedDate = new Date(rawDate);

    if (!Number.isNaN(parsedDate.getTime())) {
      return {
        year: parsedDate.getUTCFullYear(),
        month: parsedDate.getUTCMonth() + 1,
        day: parsedDate.getUTCDate(),
      };
    }

    throw new Error('Nieprawidlowy format daty');
  }

  validateDateParts(year, month, day) {
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day
    ) {
      throw new Error('Nieprawidlowy format daty');
    }
  }

  parseDateObject(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new Error('Nieprawidlowy format daty');
    }

    return date;
  }

  toPlainObject(document) {
    return typeof document?.toObject === 'function'
      ? document.toObject()
      : document;
  }

  getStorageMode() {
    return this.storageMode;
  }
}

module.exports = TaskService;
module.exports.TASK_STORAGE_MODES = TASK_STORAGE_MODES;
