const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const mysql = require('./db/mysql');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const authenticateToken = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes - Login page as homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// Auth routes (no authentication required)
app.use('/api/auth', authRoutes);

// User routes - Mixed authentication
const userController = require('./controllers/userController');

// Public routes (no authentication)
app.get('/api/users', userController.getAllUsers);
app.get('/api/users/search', userController.searchStudents);
app.get('/api/users/:id', userController.getUserById);

// Protected routes (authentication required)
app.post('/api/users', authenticateToken, userController.addUser);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await mysql.connect();
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📁 Serving static files from: ${path.join(__dirname, '..', 'public')}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
