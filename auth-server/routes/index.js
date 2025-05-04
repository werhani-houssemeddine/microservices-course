const express = require('express');
const AuthService = require('../services/authService');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

router.post('/user-details', async (req, res) => {
  const ids = req.body.ids;
  const decoded = await AuthService.validateToken(req.headers.authorization.split(' ')[1]);
  if(decoded !== null) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid or missing user IDs' });
    }
    
    try {
      const users = await AuthService.getUsersByIds(ids);
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch user details' });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});


router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await AuthService.register({ username: name, email, password });
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: error.message || 'Failed to register user'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login({ email, password });
    res.status(200).json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      message: error.message || 'Invalid credentials'
    });
  }
});

router.get('/validate', async (req, res) => {
  try {
    console.log("req.headers.authorization: ", req.headers.authorization);
    const decoded = await AuthService.validateToken(req.headers.authorization.split(' ')[1]);
    console.log("decoded: ", decoded);
    res.status(200).json({ valid: true, id: decoded.id, valid: true });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      message: error.message || 'Invalid Token'
    });
  }
});

module.exports = router;
