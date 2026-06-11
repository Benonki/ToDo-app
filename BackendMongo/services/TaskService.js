const Task = require('../models/Task');
const Tag = require('../models/Tag');
const User = require('../models/User');

const TASK_STORAGE_MODES = {
    DAILY: 'daily',
    REFERENCED: 'referenced'
};

class TaskService {
    constructor(storageMode = process.env.TASK_STORAGE_MODE) {
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

        if (normalized === TASK_STORAGE_MODES.DAILY || normalized === TASK_STORAGE_MODES.REFERENCED) {
            return normalized;
        }

        throw new Error(`Nieprawidłowy TASK_STORAGE_MODE: ${storageMode}. Użyj daily albo referenced.`);
    }

    async getUserByFirebaseUid(uid) {
        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            throw new Error('Użytkownik nie znaleziony');
        }

        return user;
    }

    parseDateParts(date) {
        const rawDate = String(date || '').trim();

        const onlyDateMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (onlyDateMatch) {
            return {
                year: Number(onlyDateMatch[1]),
                month: Number(onlyDateMatch[2]),
                day: Number(onlyDateMatch[3])
            };
        }

        const parsedDate = new Date(rawDate);
        if (!isNaN(parsedDate.getTime())) {
            return {
                year: parsedDate.getUTCFullYear(),
                month: parsedDate.getUTCMonth() + 1,
                day: parsedDate.getUTCDate()
            };
        }

        throw new Error('Nieprawidłowy format daty. Użyj YYYY-MM-DD albo pełnej daty ISO.');
    }

    getStartAndEndOfDay(date) {
        const { year, month, day } = this.parseDateParts(date);

        return {
            startOfDay: new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)),
            endOfDay: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
        };
    }

    getTaskDate(date) {
        const { year, month, day } = this.parseDateParts(date);
        return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
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

    async formatTasksForResponse(tasks) {
        const taskObjects = (tasks || []).map((task) => (
            typeof task.toObject === 'function' ? task.toObject() : task
        ));

        const tagIds = taskObjects.flatMap((task) => (
            Array.isArray(task.tags)
                ? task.tags.map((tag) => this.getTagIdAsString(tag)).filter(Boolean)
                : []
        ));

        const tagDocuments = await Tag.findByIds(tagIds);
        const tagMap = new Map(
            tagDocuments.map((tag) => [tag._id.toString(), tag.name])
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
                : []
        }));
    }

    async formatTaskForResponse(task) {
        const formattedTasks = await this.formatTasksForResponse(task ? [task] : []);
        return formattedTasks[0] || null;
    }

    async buildTaskPayload(taskData) {
        const newTask = {
            startTime: new Date(taskData.startTime),
            endTime: new Date(taskData.endTime),
            title: taskData.title || '',
            description: taskData.description || '',
            color: taskData.color || '#4A90E2',
            tags: await Tag.findOrCreateMany(taskData.tags)
        };

        if (isNaN(newTask.startTime.getTime()) || isNaN(newTask.endTime.getTime())) {
            throw new Error('Nieprawidłowy format daty');
        }

        return newTask;
    }

    async buildUpdateFields(updateData, useArrayPrefix = false) {
        const prefix = useArrayPrefix ? 'tasks.$.' : '';
        const updateFields = {};

        if (updateData.date) {
            updateFields[`${prefix}date`] = this.getTaskDate(updateData.date);
        }
        if (updateData.startTime) {
            updateFields[`${prefix}startTime`] = new Date(updateData.startTime);
        }
        if (updateData.endTime) {
            updateFields[`${prefix}endTime`] = new Date(updateData.endTime);
        }
        if (updateData.title !== undefined) {
            updateFields[`${prefix}title`] = updateData.title;
        }
        if (updateData.description !== undefined) {
            updateFields[`${prefix}description`] = updateData.description;
        }
        if (updateData.color !== undefined) {
            updateFields[`${prefix}color`] = updateData.color;
        }
        if (updateData.tags !== undefined) {
            updateFields[`${prefix}tags`] = await Tag.findOrCreateMany(updateData.tags);
        }

        return updateFields;
    }

    async getTasksByDate(uid, date) {
        const user = await this.getUserByFirebaseUid(uid);
        const { startOfDay, endOfDay } = this.getStartAndEndOfDay(date);

        if (this.storageMode === TASK_STORAGE_MODES.REFERENCED) {
            const tasks = await Task.referenced.find(
                {
                    userId: user._id,
                    date: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                },
                { sort: { startTime: 1 } }
            );

            return this.formatTasksForResponse(tasks);
        }

        const taskDoc = await Task.daily.findOne({
            userId: user._id,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (!taskDoc || !taskDoc.tasks) {
            return [];
        }

        const sortedTasks = taskDoc.tasks
            .map(task => task.toObject())
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        return this.formatTasksForResponse(sortedTasks);
    }

    async createTask(uid, taskData) {
        const user = await this.getUserByFirebaseUid(uid);
        const { date } = taskData;
        const taskDate = this.getTaskDate(date);
        const newTask = await this.buildTaskPayload(taskData);

        if (this.storageMode === TASK_STORAGE_MODES.REFERENCED) {
            const task = await Task.referenced.create({
                userId: user._id,
                date: taskDate,
                ...newTask
            });

            return this.formatTaskForResponse(task);
        }

        let taskDoc = await Task.daily.findOne({
            userId: user._id,
            date: taskDate
        });

        if (taskDoc) {
            taskDoc.tasks.push(newTask);
            await Task.daily.saveDocument(taskDoc);
        } else {
            taskDoc = await Task.daily.create({
                userId: user._id,
                date: taskDate,
                tasks: [newTask]
            });
        }

        const createdTask = taskDoc.tasks[taskDoc.tasks.length - 1];
        return this.formatTaskForResponse(createdTask);
    }

    async updateTask(uid, taskId, updateData) {
        const user = await this.getUserByFirebaseUid(uid);

        if (this.storageMode === TASK_STORAGE_MODES.REFERENCED) {
            const updateFields = await this.buildUpdateFields(updateData, false);

            const task = await Task.referenced.findOneAndUpdate(
                {
                    _id: taskId,
                    userId: user._id
                },
                { $set: updateFields },
                { new: true }
            );

            return this.formatTaskForResponse(task);
        }

        const updateFields = await this.buildUpdateFields(updateData, true);
        delete updateFields['tasks.$.date'];

        const taskDoc = await Task.daily.findOneAndUpdate(
            {
                userId: user._id,
                'tasks._id': taskId
            },
            { $set: updateFields },
            { new: true }
        );

        if (!taskDoc) {
            return null;
        }

        const updatedTask = taskDoc.tasks.find(task => task._id.toString() === taskId);
        return this.formatTaskForResponse(updatedTask);
    }

    async deleteTask(uid, date, taskId) {
        const user = await this.getUserByFirebaseUid(uid);

        if (this.storageMode === TASK_STORAGE_MODES.REFERENCED) {
            const result = await Task.referenced.deleteOne({
                _id: taskId,
                userId: user._id
            });

            return result.deletedCount > 0;
        }

        const taskDate = this.getTaskDate(date);

        const result = await Task.daily.updateOne(
            {
                userId: user._id,
                date: taskDate
            },
            {
                $pull: { tasks: { _id: taskId } }
            }
        );

        return result.modifiedCount > 0;
    }

    getStorageMode() {
        return this.storageMode;
    }
}

module.exports = TaskService;
module.exports.TASK_STORAGE_MODES = TASK_STORAGE_MODES;
