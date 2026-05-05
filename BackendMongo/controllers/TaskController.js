const TaskService = require('../services/TaskService');

class TaskController {
    constructor() {
        this.taskService = new TaskService();
    }

    async getTasks(req, res) {
        try {
            const { uid } = req.firebaseUser;
            const { date } = req.query;

            if (!date) {
                return res.status(400).json({ message: 'Data jest wymagana' });
            }

            const tasks = await this.taskService.getTasksByDate(uid, date);
            return res.json({ tasks });
        } catch (error) {
            console.error('Get tasks error:', error);
            return res.status(500).json({ message: 'Nie udało się pobrać zadań' });
        }
    }

    async createTask(req, res) {
        try {
            const { uid } = req.firebaseUser;
            const { date, startTime, endTime, title, description, color } = req.body;

            if (!date || !startTime || !endTime) {
                return res.status(400).json({
                    message: 'Data, czas rozpoczęcia i zakończenia są wymagane'
                });
            }

            const task = await this.taskService.createTask(uid, {
                date,
                startTime,
                endTime,
                title,
                description,
                color
            });

            return res.status(201).json({ task });
        } catch (error) {
            console.error('Create task error:', error);
            return res.status(500).json({ message: 'Nie udało się utworzyć zadania' });
        }
    }

    async updateTask(req, res) {
        try {
            const { uid } = req.firebaseUser;
            const { taskId } = req.params;
            const updateData = req.body;

            const task = await this.taskService.updateTask(uid, taskId, updateData);

            if (!task) {
                return res.status(404).json({ message: 'Nie znaleziono zadania' });
            }

            return res.json({ task });
        } catch (error) {
            console.error('Update task error:', error);
            return res.status(500).json({ message: 'Nie udało się zaktualizować zadania' });
        }
    }

    async deleteTask(req, res) {
        try {
            const { uid } = req.firebaseUser;
            const { taskId, date } = req.params;

            const result = await this.taskService.deleteTask(uid, date, taskId);

            if (!result) {
                return res.status(404).json({ message: 'Nie znaleziono zadania' });
            }

            return res.json({ message: 'Zadanie usunięte' });
        } catch (error) {
            console.error('Delete task error:', error);
            return res.status(500).json({ message: 'Nie udało się usunąć zadania' });
        }
    }
}

module.exports = TaskController;