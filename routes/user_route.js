const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');

router.post('/register', userController.register);
router.post('/verify-otp', userController.verifyOTP);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken);
router.get('/users', userController.getAllUsers);
router.delete('/users/:id', userController.deleteUser);
router.patch('/users/:id/block', userController.blockUser);

module.exports = router;