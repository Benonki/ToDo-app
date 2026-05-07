class TaskController {
  constructor(taskService) {
    this.taskService = taskService;
  }

  getTasks = async (req, res) => {
    try {
      const { uid } = req.firebaseUser;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ message: "Data jest wymagana" });
      }

      const tasks = await this.taskService.getTasksByDate(uid, date);
      return res.json({ tasks });
    } catch (error) {
      console.error("Get tasks error:", error);
      return res.status(500).json({ message: "Nie udalo sie pobrac zadan" });
    }
  };

  createTask = async (req, res) => {
    try {
      const { uid } = req.firebaseUser;
      const { date, startTime, endTime, title, description, color } = req.body;

      if (!date || !startTime || !endTime) {
        return res.status(400).json({
          message: "Data, czas rozpoczecia i zakonczenia sa wymagane",
        });
      }

      const task = await this.taskService.createTask(uid, {
        date,
        startTime,
        endTime,
        title,
        description,
        color,
      });

      return res.status(201).json({ task });
    } catch (error) {
      console.error("Create task error:", error);
      return res.status(500).json({ message: "Nie udalo sie utworzyc zadania" });
    }
  };

  updateTask = async (req, res) => {
    try {
      const { uid } = req.firebaseUser;
      const { taskId } = req.params;

      const task = await this.taskService.updateTask(uid, taskId, req.body);

      if (!task) {
        return res.status(404).json({ message: "Nie znaleziono zadania" });
      }

      return res.json({ task });
    } catch (error) {
      console.error("Update task error:", error);
      return res.status(500).json({
        message: "Nie udalo sie zaktualizowac zadania",
      });
    }
  };

  deleteTask = async (req, res) => {
    try {
      const { uid } = req.firebaseUser;
      const { date, taskId } = req.params;

      const deleted = await this.taskService.deleteTask(uid, date, taskId);

      if (!deleted) {
        return res.status(404).json({ message: "Nie znaleziono zadania" });
      }

      return res.json({ message: "Zadanie usuniete" });
    } catch (error) {
      console.error("Delete task error:", error);
      return res.status(500).json({ message: "Nie udalo sie usunac zadania" });
    }
  };
}

module.exports = TaskController;
