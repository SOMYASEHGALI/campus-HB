const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { auth } = require('../middleware/authMiddleware');
const { Parser } = require('json2csv');
const router = express.Router();

// Submit application student data (by college)
router.post('/submit', auth, async (req, res) => {
    try {
        const { jobId, studentName, email, phone, rollNumber, resumeUrl } = req.body;

        const application = new Application({
            jobId,
            collegeId: req.user.id,
            studentName,
            email,
            phone,
            rollNumber,
            resumeUrl
        });

        await application.save();
        res.json({ message: 'Application submitted successfully', application });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get applications for a specific job (mostly for admin or college to see their own)
router.get('/job/:jobId', auth, async (req, res) => {
    try {
        let query = { jobId: req.params.jobId };

        // If not admin, can only see their own college's submissions
        if (req.user.role !== 'admin') {
            query.collegeId = req.user.id;
        }

        const applications = await Application.find(query).populate('collegeId', 'collegeName');
        res.json(applications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export applications to CSV (spreadsheet format)
router.get('/export/:jobId', auth, async (req, res) => {
    try {
        let query = { jobId: req.params.jobId };
        if (req.user.role !== 'admin') {
            query.collegeId = req.user.id;
        }

        const applications = await Application.find(query).populate('collegeId', 'collegeName');

        const fields = ['studentName', 'email', 'phone', 'rollNumber', 'collegeId.collegeName', 'appliedAt'];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(applications);

        res.header('Content-Type', 'text/csv');
        res.attachment(`applications_job_${req.params.jobId}.csv`);
        return res.send(csv);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
