const express = require('express');
const UserController = require('../controllers/UserController');
const { verifyFirebaseToken } = require('../middleware/auth');

const router = express.Router();
const userController = new UserController();

router.get(
    '/profile',
    verifyFirebaseToken,
    userController.getProfile.bind(userController)
);

router.put(
    '/profile',
    verifyFirebaseToken,
    userController.updateProfile.bind(userController)
);

module.exports = router;