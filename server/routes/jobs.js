const express = require('express');
const Job = require('../models/Job');
const { auth, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all jobs (only for logged in users)
router.get('/', auth, async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post a job (only for admins)
router.post('/', auth, admin, async (req, res) => {
    try {
        const { title, company, location, salary, experience, description, skills } = req.body;

        const newJob = new Job({
            title,
            company,
            location,
            salary,
            experience,
            description,
            skills,
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
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
