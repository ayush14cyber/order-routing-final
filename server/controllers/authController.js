const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide username, password, and role' });
    }

    if (!['admin', 'manager'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be admin or manager' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    const newUser = new User({ username, password, role });
    await newUser.save();

    res.status(201).json({ 
      success: true, 
      data: { username: newUser.username, role: newUser.role }, 
      message: 'User registered successfully' 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide username, password, and role' });
    }

    // Find user by both username and role
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(404).json({ success: false, message: `No ${role} account found with this username` });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_if_missing',
      { expiresIn: '8h' }
    );

    res.status(200).json({ 
      success: true, 
      data: { token, username: user.username, role: user.role }, 
      message: 'Logged in successfully' 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
