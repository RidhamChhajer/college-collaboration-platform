const db = require('../db/mysql');

const userController = {
  getAllUsers: async (req, res) => {
    try {
      console.log('🔍 Fetching all users...');
      const [rows] = await db.query('SELECT * FROM students ORDER BY created_at DESC');
      
      const users = rows.map(user => ({
        ...user,
        skills: user.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : [],
        interests: user.interests ? (typeof user.interests === 'string' ? JSON.parse(user.interests) : user.interests) : []
      }));
      
      console.log(`✅ Found ${users.length} users`);
      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  },

  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      console.log(`🔍 Fetching user with ID: ${userId}`);
      
      const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [userId]);
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      const user = {
        ...rows[0],
        skills: rows[0].skills ? (typeof rows[0].skills === 'string' ? JSON.parse(rows[0].skills) : rows[0].skills) : [],
        interests: rows[0].interests ? (typeof rows[0].interests === 'string' ? JSON.parse(rows[0].interests) : rows[0].interests) : []
      };
      
      console.log('✅ User found:', user.name);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user'
      });
    }
  },

  addUser: async (req, res) => {
    try {
      console.log('📝 Adding new user...');
      console.log('Request body:', req.body);
      
      const { name, email, roll_number, branch, year, class: userClass, skills, interests } = req.body;
      const userId = req.userId; // From auth middleware
      
      // Validation
      if (!name || !email || !roll_number) {
        return res.status(400).json({
          success: false,
          error: 'Name, email, and roll number are required'
        });
      }
      
      // Check if this user already has a student profile
      const [existingProfile] = await db.query('SELECT * FROM students WHERE user_id = ?', [userId]);
      if (existingProfile.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'You already have a student profile'
        });
      }
      
      // Check if email or roll number already exists
      const [existingUsers] = await db.query(
        'SELECT * FROM students WHERE email = ? OR roll_number = ?',
        [email, roll_number]
      );
      
      if (existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        if (existingUser.email === email) {
          return res.status(400).json({
            success: false,
            error: 'Email already exists'
          });
        }
        if (existingUser.roll_number == roll_number) {
          return res.status(400).json({
            success: false,
            error: 'Roll number already exists'
          });
        }
      }
      
      // Prepare JSON data properly
      const skillsJson = skills && Array.isArray(skills) && skills.length > 0 
        ? JSON.stringify(skills) 
        : null;
      
      const interestsJson = interests && Array.isArray(interests) && interests.length > 0 
        ? JSON.stringify(interests) 
        : null;
      
      // Insert new student profile
      const query = `
        INSERT INTO students (user_id, name, email, roll_number, branch, year, class, skills, interests)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        userId,
        name,
        email,
        roll_number,
        branch || null,
        year || null,
        userClass || null,
        skillsJson,
        interestsJson
      ];
      
      const [result] = await db.query(query, values);
      
      console.log('✅ Student profile created with ID:', result.insertId);
      res.status(201).json({
        success: true,
        message: 'Student profile created successfully',
        data: {
          id: result.insertId,
          name,
          email,
          roll_number
        }
      });
    } catch (error) {
      console.error('❌ Error adding student profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create student profile'
      });
    }
  },

  searchStudents: async (req, res) => {
    try {
      const { search, branch, year, skills, interests, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
      
      let query = `
        SELECT s.*, u.username 
        FROM students s 
        JOIN users u ON s.user_id = u.user_id 
        WHERE 1=1
      `;
      const params = [];

      // Search by name
      if (search) {
        query += ' AND (s.name LIKE ? OR s.email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      // Filter by branch
      if (branch) {
        query += ' AND s.branch = ?';
        params.push(branch);
      }

      // Filter by year
      if (year) {
        query += ' AND s.year = ?';
        params.push(year);
      }

      // Sorting
      const allowedSortFields = ['name', 'created_at', 'branch', 'year'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      query += ` ORDER BY s.${sortField} ${order}`;

      const [rows] = await db.query(query, params);

      // Parse JSON fields
      const students = rows.map(student => ({
        ...student,
        skills: student.skills ? JSON.parse(student.skills) : [],
        interests: student.interests ? JSON.parse(student.interests) : []
      }));

      res.json({
        success: true,
        data: students,
        count: students.length
      });
    } catch (error) {
      console.error('❌ Error searching students:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search students'
      });
    }
  }
};

module.exports = userController;
