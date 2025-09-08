const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Middleware to log requests
router.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Routes - GET requests are public, POST requires authentication
router.get('/', userController.getAllUsers);
router.get('/search', userController.searchStudents);
router.get('/:id', userController.getUserById);
router.post('/', userController.addUser); // This will be protected by middleware in server.js

module.exports = router;
