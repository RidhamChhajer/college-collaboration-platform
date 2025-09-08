const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/mysql');

const authController = {
  register: async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    try {
      // Check if user exists
      const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ 
          success: false, 
          error: 'Email already registered' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
      const [result] = await db.query(query, [username, email, hashedPassword]);

      const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

      res.status(201).json({ 
        success: true, 
        message: 'User registered successfully', 
        token,
        user: { userId: result.insertId, username, email }
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password required' 
      });
    }

    try {
      const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }

      const user = users[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }

      const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

      res.json({ 
        success: true, 
        message: 'Login successful', 
        token,
        user: { userId: user.user_id, username: user.username, email: user.email }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  getProfile: async (req, res) => {
    try {
      const [users] = await db.query('SELECT user_id, username, email FROM users WHERE user_id = ?', [req.userId]);
      if (users.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, user: users[0] });
    } catch (err) {
      console.error('Profile error:', err);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
};

module.exports = authController;
