const express = require("express");
const verifyFirebaseToken = require("../middleware/auth");

function createAuthRoutes(authController) {
  const router = express.Router();

  router.post("/sync-user", verifyFirebaseToken, authController.syncUser);
  router.get("/me", verifyFirebaseToken, authController.getMe);

  return router;
}

module.exports = createAuthRoutes;
