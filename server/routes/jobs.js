const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Get list of colleges
router.get('/colleges', auth, async (req, res) => {
    try {
        const colleges = await User.distinct('collegeName');
        res.json(colleges);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all jobs (only for logged in users)
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        const user = await User.findOne({ _id: req.user.id });
        console.log(user);
        if (req.user.role === 'student' || req.user.role === 'staff') {
            query.allowedColleges = user.collegeName;
            console.log(query);
        }
        const jobs = await Job.find(query).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post a job (only for admins)
router.post('/', auth, admin, async (req, res) => {
    try {
        const { title, company, location, salary, experience, description, skills, allowedColleges } = req.body;

        const newJob = new Job({
            title,
            company,
            location,
            salary,
            experience,
            description,
            skills,
            allowedColleges,
            postedBy: req.user.id
        });

        // Generate a unique form URL for this job
        // In a real app, this would be a URL to the specific job application page
        newJob.formUrl = `/apply/${newJob._id}`;

        await newJob.save();
        res.json(newJob);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single job details
router.get('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Check if user is allowed to view this job
        const user = await User.findById(req.user.id);
        if ((req.user.role === 'student' || req.user.role === 'staff') && !job.allowedColleges.includes(user.collegeName)) {
            return res.status(403).json({ message: 'You are not allowed to view this job' });
        }

        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a job (only for admins)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
