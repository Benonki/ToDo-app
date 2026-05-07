const express = require("express");
const verifyFirebaseToken = require("../middleware/auth");

function createTaskRoutes(taskController) {
  const router = express.Router();

  router.get("/", verifyFirebaseToken, taskController.getTasks);
  router.post("/", verifyFirebaseToken, taskController.createTask);
  router.put("/:taskId", verifyFirebaseToken, taskController.updateTask);
  router.delete("/:date/:taskId", verifyFirebaseToken, taskController.deleteTask);

  return router;
}

module.exports = createTaskRoutes;
