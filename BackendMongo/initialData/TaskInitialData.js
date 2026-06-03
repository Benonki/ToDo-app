const mongoose = require('mongoose');
const Task = require('../models/Task');

class TaskInitialData {
    constructor() {
        this.enabled = 'true';
        this.date = '2026-06-03';
        this.userId = '6a1005b57d30d0da77b216f1';
        this.defaultTitle = 'g';
        this.defaultDescription = '';
        this.defaultColor = '#4A90E2';
    }

    async insertIfTaskCollectionsAreEmpty() {
        if (!this.enabled) {
            console.log('Initial data tasków wyłączone przez SEED_TEST_TASKS=false');
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(this.userId)) {
            throw new Error('Nieprawidłowy SEED_TASKS_USER_ID. Podaj poprawne ObjectId użytkownika.');
        }

        const dailyTaskCount = await Task.daily.countDocuments({});
        const referencedTaskCount = await Task.referenced.countDocuments({});

        if (dailyTaskCount > 0 && referencedTaskCount > 0) {
            console.log('Kolekcje tasków nie są puste - pomijam initial data tasków');
            return;
        }

        const userObjectId = new mongoose.Types.ObjectId(this.userId);
        const initialData = this.buildInitialTasks(userObjectId);

        if (dailyTaskCount === 0) {
            await Task.daily.create({
                userId: userObjectId,
                date: initialData.taskDate,
                tasks: initialData.dailyTasks
            });
        }

        if (referencedTaskCount === 0) {
            await Task.referenced.insertMany(initialData.referencedTasks);
        }

        console.log(
            `Initial data tasków dodane dla ${this.date}. ` +
            `Daily: ${dailyTaskCount === 0 ? initialData.dailyTasks.length : 'pominięto'}, ` +
            `referenced: ${referencedTaskCount === 0 ? initialData.referencedTasks.length : 'pominięto'}.`
        );
    }

    buildInitialTasks(userObjectId) {
        const { year, month, day } = this.parseDate();
        const taskDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
        const dailyTasks = [];
        const referencedTasks = [];

        for (let minutesFromStart = 0; minutesFromStart < 24 * 60; minutesFromStart += 15) {
            const startTime = new Date(Date.UTC(year, month - 1, day, 0, minutesFromStart, 0, 0));
            const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);

            if (minutesFromStart === 23 * 60 + 45) {
                endTime.setUTCHours(23, 59, 0, 0);
            }

            const task = {
                startTime,
                endTime,
                title: this.defaultTitle,
                description: this.defaultDescription,
                color: this.defaultColor
            };

            dailyTasks.push(task);
            referencedTasks.push({
                userId: userObjectId,
                date: taskDate,
                ...task
            });
        }

        return { taskDate, dailyTasks, referencedTasks };
    }

    parseDate() {
        const [year, month, day] = this.date.split('-').map(Number);

        if (!year || !month || !day) {
            throw new Error('Nieprawidłowy SEED_TASKS_DATE. Użyj formatu YYYY-MM-DD, np. 2026-06-03.');
        }

        return { year, month, day };
    }
}

module.exports = TaskInitialData;
