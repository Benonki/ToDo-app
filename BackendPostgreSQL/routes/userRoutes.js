const express = require("express");
const verifyFirebaseToken = require("../middleware/auth");

function createUserRoutes(userController) {
  const router = express.Router();

  router.get("/profile", verifyFirebaseToken, userController.getProfile);
  router.put("/profile", verifyFirebaseToken, userController.updateProfile);

  return router;
}

module.exports = createUserRoutes;
