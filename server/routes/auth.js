const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, collegeName, role } = req.body;

        // Validate role
        const validRoles = ['student', 'staff', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

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
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, role: user.role, collegeName: user.collegeName } });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
