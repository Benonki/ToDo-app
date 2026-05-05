const Task = require('../models/Task');
const User = require('../models/User');

class TaskService {
    async getTasksByDate(uid, date) {
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            throw new Error('Użytkownik nie znaleziony');
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const taskDoc = await Task.findOne({
            userId: user._id,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        return taskDoc ? taskDoc.tasks : [];
    }

    async createTask(uid, taskData) {
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            throw new Error('Użytkownik nie znaleziony');
        }

        const { date, startTime, endTime, title, description, color } = taskData;

        const taskDate = new Date(date);
        taskDate.setHours(0, 0, 0, 0);

        const newTask = {
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            title: title || '',
            description: description || '',
            color: color || '#4A90E2'
        };

        if (isNaN(newTask.startTime.getTime()) || isNaN(newTask.endTime.getTime())) {
            throw new Error('Nieprawidłowy format daty');
        }

        let taskDoc = await Task.findOne({
            userId: user._id,
            date: taskDate
        });

        if (taskDoc) {
            taskDoc.tasks.push(newTask);
            await taskDoc.save();
        } else {
            taskDoc = await Task.create({
                userId: user._id,
                date: taskDate,
                tasks: [newTask]
            });
        }

        return taskDoc.tasks[taskDoc.tasks.length - 1];
    }

    async updateTask(uid, taskId, updateData) {
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            throw new Error('Użytkownik nie znaleziony');
        }

        const updateFields = {};

        if (updateData.startTime) {
            updateFields['tasks.$.startTime'] = new Date(updateData.startTime);
        }
        if (updateData.endTime) {
            updateFields['tasks.$.endTime'] = new Date(updateData.endTime);
        }
        if (updateData.title !== undefined) {
            updateFields['tasks.$.title'] = updateData.title;
        }
        if (updateData.description !== undefined) {
            updateFields['tasks.$.description'] = updateData.description;
        }
        if (updateData.color !== undefined) {
            updateFields['tasks.$.color'] = updateData.color;
        }

        const taskDoc = await Task.findOneAndUpdate(
            {
                userId: user._id,
                'tasks._id': taskId
            },
            {
                $set: updateFields
            },
            { new: true }
        );

        if (!taskDoc) return null;

        return taskDoc.tasks.find(task => task._id.toString() === taskId);
    }

    async deleteTask(uid, date, taskId) {
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            throw new Error('Użytkownik nie znaleziony');
        }

        const taskDate = new Date(date);
        taskDate.setHours(0, 0, 0, 0);

        const result = await Task.updateOne(
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
}

module.exports = TaskService;