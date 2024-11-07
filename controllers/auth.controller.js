const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Token = require('../models/token.model');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
  );
  
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
    console.log('Registration attempt:', {
      email: req.body.email,
      hasPassword: !!req.body.password
    });
  
    try {
      const { email, password,name } = req.body;
  
      // Validation
      if (!email || !password || !name) {
        console.log('Missing required fields');
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }
  
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Invalid email format');
        return res.status(400).json({ 
          error: 'Please enter a valid email address' 
        });
      }
  
      // Password validation
      if (password.length < 6) {
        console.log('Password too short');
        return res.status(400).json({ 
          error: 'Password must be at least 6 characters long' 
        });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('User already exists:', email);
        return res.status(400).json({ 
          error: 'Email already registered' 
        });
      }
  
      // Create user
      const user = await User.create({ 
        name,
        email, 
        password 
      });
      console.log('User created successfully:', user._id);
  
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);
      console.log('Tokens generated for user:', user._id);
  
      // Save refresh token
      await Token.create({
        userId: user._id,
        refreshToken,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      console.log('Refresh token saved');
  
      // Send response
      res.status(201).json({
        message: 'Registration successful',
        user: { 
          id: user._id, 
          email: user.email, 
          name:user.name,
          userType:user.userType
        },
        accessToken,
        refreshToken
      });
  
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: 'Registration failed. Please try again.',
        details: error.message 
      });
    }
  };

  exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const { accessToken, refreshToken } = generateTokens(user._id);
      
      await Token.create({
        userId: user._id,
        refreshToken,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
  
      res.json({ 
        accessToken, 
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          name:user.name,
          userType: user.userType
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const token = await Token.findOne({
      userId: decoded.userId,
      refreshToken,
      expires: { $gt: new Date() }
    });
    
    if (!token) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    
    await Token.findByIdAndDelete(token._id);
    await Token.create({
      userId: decoded.userId,
      refreshToken: newRefreshToken,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};