const { randomUUID } = require("crypto");

class TaskInitialData {
  constructor(prisma) {
    this.prisma = prisma;
    this.enabled = this.parseEnabled(process.env.SEED_TEST_TASKS);
    this.date = process.env.SEED_TASKS_DATE || "2026-06-03";
    this.userId = process.env.SEED_TASKS_USER_ID || "seed-task-user";
    this.firebaseUid = process.env.SEED_TASKS_FIREBASE_UID || "seed-task-user";
    this.email = process.env.SEED_TASKS_EMAIL || "seed-task-user@example.com";
    this.displayName = process.env.SEED_TASKS_DISPLAY_NAME || "Seed task user";
    this.defaultTitle = process.env.SEED_TASK_TITLE || "g";
    this.defaultDescription = process.env.SEED_TASK_DESCRIPTION || "";
    this.defaultColor = process.env.SEED_TASK_COLOR || "#4A90E2";
  }

  parseEnabled(value) {
    if (value === undefined) {
      return true;
    }

    return !["false", "0", "no"].includes(String(value).toLowerCase().trim());
  }

  async insertIfTaskTablesAreEmpty() {
    if (!this.enabled) {
      console.log("Initial data taskow wylaczone przez SEED_TEST_TASKS=false");
      return;
    }

    this.validateConfig();

    const jsonbTaskCount = await this.prisma.task.count();
    const relationalTaskCount = await this.prisma.taskItem.count();

    if (jsonbTaskCount > 0 && relationalTaskCount > 0) {
      console.log("Tabele taskow nie sa puste - pomijam initial data taskow");
      return;
    }

    const user = await this.getOrCreateSeedUser();
    const initialData = this.buildInitialTasks(user.id);

    if (jsonbTaskCount === 0) {
      await this.prisma.task.create({
        data: {
          userId: user.id,
          date: initialData.taskDate,
          tasks: initialData.jsonbTasks,
        },
      });
    }

    if (relationalTaskCount === 0) {
      await this.prisma.taskItem.createMany({
        data: initialData.relationalTasks,
      });
    }

    console.log(
      `Initial data taskow dodane dla ${this.date}. ` +
        `JSONB: ${jsonbTaskCount === 0 ? initialData.jsonbTasks.length : "pominieto"}, ` +
        `relational: ${
          relationalTaskCount === 0
            ? initialData.relationalTasks.length
            : "pominieto"
        }.`,
    );
  }

  validateConfig() {
    if (!this.userId || !this.firebaseUid || !this.email) {
      throw new Error(
        "Nieprawidlowe initial data taskow. Ustaw SEED_TASKS_USER_ID, SEED_TASKS_FIREBASE_UID i SEED_TASKS_EMAIL.",
      );
    }

    this.parseDate();
  }

  async getOrCreateSeedUser() {
    const userById = await this.prisma.user.findUnique({
      where: { id: this.userId },
    });

    if (userById) {
      return userById;
    }

    const userByFirebaseUid = await this.prisma.user.findUnique({
      where: { firebaseUid: this.firebaseUid },
    });

    if (userByFirebaseUid) {
      return userByFirebaseUid;
    }

    const userByEmail = await this.prisma.user.findUnique({
      where: { email: this.email },
    });

    if (userByEmail) {
      return userByEmail;
    }

    return this.prisma.user.create({
      data: {
        id: this.userId,
        firebaseUid: this.firebaseUid,
        email: this.email,
        displayName: this.displayName,
        info: {},
      },
    });
  }

  buildInitialTasks(userId) {
    const { year, month, day } = this.parseDate();
    const taskDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    const jsonbTasks = [];
    const relationalTasks = [];

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
        endTime = new Date(Date.UTC(year, month - 1, day, 23, 59, 0, 0));
      }

      jsonbTasks.push({
        _id: randomUUID(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        title: this.defaultTitle,
        description: this.defaultDescription,
        color: this.defaultColor,
        tags: [],
      });

      relationalTasks.push({
        userId,
        date: taskDate,
        startTime,
        endTime,
        title: this.defaultTitle,
        description: this.defaultDescription,
        color: this.defaultColor,
      });
    }

    return { taskDate, jsonbTasks, relationalTasks };
  }

  parseDate() {
    const [year, month, day] = this.date.split("-").map(Number);

    if (!year || !month || !day) {
      throw new Error(
        "Nieprawidlowy SEED_TASKS_DATE. Uzyj formatu YYYY-MM-DD, np. 2026-06-03.",
      );
    }

    return { year, month, day };
  }
}

module.exports = TaskInitialData;
