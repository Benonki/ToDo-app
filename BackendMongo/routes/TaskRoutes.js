const express = require('express');
const TaskController = require('../controllers/TaskController');
const { verifyFirebaseToken } = require('../middleware/auth');

const router = express.Router();
const taskController = new TaskController();

router.get(
    '/',
    verifyFirebaseToken,
    taskController.getTasks.bind(taskController)
);

router.post(
    '/',
    verifyFirebaseToken,
    taskController.createTask.bind(taskController)
);

router.put(
    '/:taskId',
    verifyFirebaseToken,
    taskController.updateTask.bind(taskController)
);

router.delete(
    '/:date/:taskId',
    verifyFirebaseToken,
    taskController.deleteTask.bind(taskController)
);

module.exports = router;