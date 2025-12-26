const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
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
        console.log('[Get Jobs] User:', user.email, 'Role:', user.role, 'College:', user.collegeName);

        // Students and staff can only see jobs for their college
        if (req.user.role === 'student' || req.user.role === 'staff') {
            query.allowedColleges = { $in: [user.collegeName] };
            console.log('[Get Jobs] Filtering for college:', user.collegeName);
        } else {
            console.log('[Get Jobs] Admin - showing all jobs');
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        console.log('[Get Jobs] Found', jobs.length, 'jobs');
        res.json(jobs);
    } catch (err) {
        console.error('[Get Jobs] Error:', err);
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
        if (!job) {
            console.log('[Get Job Details] Job not found:', req.params.id);
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user is allowed to view this job
        const user = await User.findById(req.user.id);
        console.log('[Get Job Details] User:', user.email, 'College:', user.collegeName);
        console.log('[Get Job Details] Job allowed colleges:', job.allowedColleges);

        if ((req.user.role === 'student' || req.user.role === 'staff') && !job.allowedColleges.includes(user.collegeName)) {
            console.log('[Get Job Details] Access DENIED - College not in allowed list');
            return res.status(403).json({ message: 'You are not allowed to view this job' });
        }

        console.log('[Get Job Details] Access GRANTED');
        res.json(job);
    } catch (err) {
        console.error('[Get Job Details] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a job (only for admins)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findByIdAndDelete(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Clean up associated applications
        const result = await Application.deleteMany({ jobId: jobId });
        console.log(`[Admin Audit] Deleted job ${jobId} and ${result.deletedCount} associated applications`);

        res.json({ message: 'Job and all associated candidate data removed successfully' });
    } catch (err) {
        console.error('Delete Job Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
