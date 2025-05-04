const express = require('express');
const router = express.Router();
const path = require('path');
const AuthService = require('../services/authService');

// Serve the config page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/config.html'));
});

router.post('/admin/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const admin = await AuthService.createAdmin({ username, email, password });

        res.status(201).json({ 
            message: 'Admin created successfully',
            user: admin
        });
    } catch (error) {
        console.error('Admin signup error:', error);
        res.status(500).json({ 
            message: error.message || 'Failed to create admin account'
        });
    }
});

router.use((req, res) => {
    return res.redirect('/config');
});

module.exports = router; 