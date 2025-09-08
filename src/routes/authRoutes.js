const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

// Registration
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Get profile (protected)
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
