const mongoose = require('mongoose');

class TaskInitialData {
  constructor(userRepository, taskRepository) {
    this.userRepository = userRepository;
    this.taskRepository = taskRepository;
    this.enabled = this.parseEnabled(process.env.SEED_TEST_TASKS);
    this.date = process.env.SEED_TASKS_DATE;
    this.userId = process.env.SEED_TASKS_USER_ID;
    this.firebaseUid = process.env.SEED_TASKS_FIREBASE_UID;
    this.email = process.env.SEED_TASKS_EMAIL;
    this.displayName = process.env.SEED_TASKS_DISPLAY_NAME;
    this.defaultTitle = process.env.SEED_TASK_TITLE;
    this.defaultDescription = process.env.SEED_TASK_DESCRIPTION;
    this.defaultColor = process.env.SEED_TASK_COLOR;
  }

  parseEnabled(value) {
    if (value === undefined) {
      return true;
    }

    return !['false', '0', 'no'].includes(
      String(value).toLowerCase().trim(),
    );
  }

  async insertIfTaskCollectionsAreEmpty() {
    if (!this.enabled) {
      console.log('Initial data taskow wylaczone przez SEED_TEST_TASKS=false');
      return;
    }

    this.validateConfig();

    const dailyTaskCount = await this.taskRepository.countDaily();
    const referencedTaskCount = await this.taskRepository.countReferenced();

    if (dailyTaskCount > 0 && referencedTaskCount > 0) {
      console.log('Kolekcje taskow nie sa puste - pomijam initial data taskow');
      return;
    }

    const user = await this.getOrCreateSeedUser();
    const initialData = this.buildInitialTasks(user._id);

    if (dailyTaskCount === 0) {
      await this.taskRepository.createDaily({
        userId: user._id,
        date: initialData.taskDate,
        tasks: initialData.dailyTasks,
      });
    }

    if (referencedTaskCount === 0) {
      await this.taskRepository.insertManyReferenced(
        initialData.referencedTasks,
      );
    }

    console.log(
      `Initial data taskow dodane dla ${this.date}. ` +
        `Daily: ${
          dailyTaskCount === 0 ? initialData.dailyTasks.length : 'pominieto'
        }, ` +
        `referenced: ${
          referencedTaskCount === 0
            ? initialData.referencedTasks.length
            : 'pominieto'
        }.`,
    );
  }

  validateConfig() {
    if (!mongoose.Types.ObjectId.isValid(this.userId)) {
      throw new Error(
        'Nieprawidlowy SEED_TASKS_USER_ID. Podaj poprawne ObjectId uzytkownika.',
      );
    }

    if (!this.firebaseUid || !this.email) {
      throw new Error(
        'Ustaw SEED_TASKS_FIREBASE_UID oraz SEED_TASKS_EMAIL.',
      );
    }

    this.parseDate();
  }

  async getOrCreateSeedUser() {
    const userObjectId = new mongoose.Types.ObjectId(this.userId);
    const userById = await this.userRepository.findById(userObjectId);

    if (userById) {
      return userById;
    }

    const userByFirebaseUid = await this.userRepository.findByFirebaseUid(
      this.firebaseUid,
    );

    if (userByFirebaseUid) {
      return userByFirebaseUid;
    }

    const userByEmail = await this.userRepository.findByEmail(this.email);

    if (userByEmail) {
      return userByEmail;
    }

    return this.userRepository.create({
      _id: userObjectId,
      firebaseUid: this.firebaseUid,
      email: this.email,
      displayName: this.displayName,
      info: {
        firstName: 'Imie...',
        lastName: 'Nazwisko...',
      },
    });
  }

  buildInitialTasks(userObjectId) {
    const { year, month, day } = this.parseDate();
    const taskDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    const dailyTasks = [];
    const referencedTasks = [];

    for (
      let minutesFromStart = 0;
      minutesFromStart < 24 * 60;
      minutesFromStart += 15
    ) {
      const startTime = new Date(
        Date.UTC(year, month - 1, day, 0, minutesFromStart, 0, 0),
      );
      let endTime = new Date(startTime.getTime() + 15 * 60 * 1000);

      if (minutesFromStart === 23 * 60 + 45) {
        endTime = new Date(
          Date.UTC(year, month - 1, day, 23, 59, 0, 0),
        );
      }

      const task = {
        startTime,
        endTime,
        title: this.defaultTitle,
        description: this.defaultDescription,
        color: this.defaultColor,
        tags: [],
      };

      dailyTasks.push(task);
      referencedTasks.push({
        userId: userObjectId,
        date: taskDate,
        ...task,
      });
    }

    return { taskDate, dailyTasks, referencedTasks };
  }

  parseDate() {
    const [year, month, day] = this.date.split('-').map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    if (
      !year ||
      !month ||
      !day ||
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() + 1 !== month ||
      parsedDate.getUTCDate() !== day
    ) {
      throw new Error(
        'Nieprawidlowy SEED_TASKS_DATE. Uzyj formatu YYYY-MM-DD, np. 2026-06-03.',
      );
    }

    return { year, month, day };
  }
}

module.exports = TaskInitialData;
