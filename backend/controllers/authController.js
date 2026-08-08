const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'pasco_jwt_secret_key_2026';
const usersJsonPath = path.join(__dirname, '../data/users.json');

// Default pre-seeded dummy users
const defaultDummyUsers = [
  {
    id: 'usr_001',
    name: 'John Smith',
    email: 'john@example.co.uk',
    passwordHash: bcrypt.hashSync('password123', 10),
    phone: '07123 456789',
    customerType: 'Retail Consumer',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_002',
    name: 'Chef Ahad Chowdhury (Royal Oak)',
    email: 'trade@curryhouse.co.uk',
    passwordHash: bcrypt.hashSync('pasco123', 10),
    phone: '01942 889900',
    customerType: 'Wholesale / Foodservice',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_003',
    name: 'Pasco Trade Administrator',
    email: 'admin@pascofoods.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    phone: '01942 493220',
    customerType: 'Wholesale / Foodservice',
    createdAt: new Date().toISOString()
  }
];

// Helper to get local users from JSON
const getLocalUsers = () => {
  try {
    if (!fs.existsSync(usersJsonPath)) {
      fs.writeFileSync(usersJsonPath, JSON.stringify(defaultDummyUsers, null, 2), 'utf8');
      return defaultDummyUsers;
    }
    const data = fs.readFileSync(usersJsonPath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return defaultDummyUsers;
  }
};

// Helper to save local user
const saveLocalUser = (userObj) => {
  try {
    const users = getLocalUsers();
    users.unshift(userObj);
    fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving local user:', e.message);
  }
};

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, customerType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check MongoDB if active
    try {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please login instead.'
        });
      }
    } catch (dbErr) {
      // Check local JSON users fallback
      const localUsers = getLocalUsers();
      if (localUsers.some(u => u.email.toLowerCase() === normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please login instead.'
        });
      }
    }

    let newUserObj = null;

    try {
      const user = new User({
        name,
        email: normalizedEmail,
        password,
        phone: phone || '',
        customerType: customerType || 'Retail Consumer'
      });
      const saved = await user.save();
      newUserObj = {
        id: saved._id.toString(),
        name: saved.name,
        email: saved.email,
        phone: saved.phone,
        customerType: saved.customerType
      };
    } catch (err) {
      // Local fallback creation
      const passwordHash = bcrypt.hashSync(password, 10);
      newUserObj = {
        id: `usr_${Date.now()}`,
        name,
        email: normalizedEmail,
        phone: phone || '',
        customerType: customerType || 'Retail Consumer'
      };
      saveLocalUser({
        ...newUserObj,
        passwordHash,
        createdAt: new Date().toISOString()
      });
    }

    const token = generateToken(newUserObj.id, newUserObj.email);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: newUserObj
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during signup.'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Try MongoDB
    try {
      const user = await User.findOne({ email: normalizedEmail });
      if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id.toString(), user.email);
        return res.status(200).json({
          success: true,
          message: 'Login successful!',
          token,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            customerType: user.customerType
          }
        });
      }
    } catch (dbErr) {
      console.log('MongoDB login query failed, checking local users JSON fallback');
    }

    // 2. Check local JSON fallback users
    const localUsers = getLocalUsers();
    const localUser = localUsers.find(u => u.email.toLowerCase() === normalizedEmail);

    if (localUser && bcrypt.compareSync(password, localUser.passwordHash)) {
      const token = generateToken(localUser.id, localUser.email);
      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: localUser.id,
          name: localUser.name,
          email: localUser.email,
          phone: localUser.phone || '',
          customerType: localUser.customerType || 'Retail Consumer'
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password. Please try again.'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private (JWT Header)
const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Try MongoDB
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        return res.status(200).json({
          success: true,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            customerType: user.customerType
          }
        });
      }
    } catch (e) {}

    // Check local fallback
    const localUsers = getLocalUsers();
    const localUser = localUsers.find(u => u.id === decoded.id || u.email.toLowerCase() === decoded.email.toLowerCase());

    if (localUser) {
      return res.status(200).json({
        success: true,
        user: {
          id: localUser.id,
          name: localUser.name,
          email: localUser.email,
          phone: localUser.phone || '',
          customerType: localUser.customerType || 'Retail Consumer'
        }
      });
    }

    return res.status(404).json({
      success: false,
      message: 'User profile not found.'
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  defaultDummyUsers
};
