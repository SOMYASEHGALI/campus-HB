const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, collegeName, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !collegeName || !role) {
            return res.status(400).json({
                message: 'All fields are required',
                field: !name ? 'name' : !email ? 'email' : !password ? 'password' : !collegeName ? 'collegeName' : 'role'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Please enter a valid email address',
                field: 'email'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long',
                field: 'password'
            });
        }

        // Validate role
        const validRoles = ['student', 'staff', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                message: 'Invalid role selected. Please choose Student or Staff',
                field: 'role'
            });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'An account with this email already exists. Please login instead.',
                field: 'email'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            collegeName,
            role
        });

        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, role: user.role, collegeName: user.collegeName } });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error during registration. Please try again.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: !email ? 'Email is required' : 'Password is required',
                field: !email ? 'email' : 'password'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Please enter a valid email address',
                field: 'email'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'No account found with this email address',
                field: 'email'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Incorrect password. Please try again.',
                field: 'password'
            });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, role: user.role, collegeName: user.collegeName } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login. Please try again.' });
    }
});

router.post('/admin-login', async (req, res) => {
    try {
        const { adminKey } = req.body;
        const expectedKey = (process.env.ADMIN_KEY || 'admin123').trim();

        if (!adminKey || adminKey.trim() !== expectedKey) {
            return res.status(401).json({ message: 'Invalid admin key' });
        }

        // Find or create a default master admin
        let user = await User.findOne({ email: 'admin@campushb.com' });
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin@123', salt);
            user = new User({
                name: 'System Admin',
                email: 'admin@campushb.com',
                password: hashedPassword,
                role: 'admin',
                collegeName: 'HiringBazar Headquarters'
            });
            await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, role: user.role, collegeName: user.collegeName } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
