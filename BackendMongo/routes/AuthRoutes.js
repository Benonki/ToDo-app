const express = require('express');
const AuthController = require('../controllers/AuthController');
const { verifyFirebaseToken } = require('../middleware/auth');

const router = express.Router();
const authController = new AuthController();

router.post(
    '/sync-user',
    verifyFirebaseToken,
    authController.syncUser.bind(authController)
);

router.get(
    '/me',
    verifyFirebaseToken,
    authController.getMe.bind(authController)
);

module.exports = router;