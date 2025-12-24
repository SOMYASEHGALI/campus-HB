const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { auth } = require('../middleware/authMiddleware');
const { Parser } = require('json2csv');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const upload = require('../config/multer');
const User = require('../models/User');
const router = express.Router();


// Submit application (by student)
router.post('/submit', auth, upload.single('resume'), async (req, res) => {
    try {
        const { jobId, studentName, email, phone, rollNumber, resumeUrl } = req.body;
        if(!jobId || !studentName || !email || !phone || !rollNumber || !resumeUrl){
            return res.stutus(400).json({message : "All FielD Required"});
        }

        // Check if user is student
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can submit applications' });
        }

        const user = await User.findOne({_id : req.user.id});
        if(!user){
            return res.status(404).json({message : 'user not found'});
        }

        // Validate job exists and student belongs to allowed college
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (!job.allowedColleges.includes(user.collegeName)) {
            return res.status(403).json({ message: 'You are not allowed to apply for this job' });
        }

         //  DUPLICATE CHECK
        const alreadyApplied = await Application.findOne({
            jobId,
            studentId: req.user.id,
        });

        if (alreadyApplied) {
        return res.status(409).json({
            message: "You have already applied for this job",
        });
        }

        let finalResumeUrl = resumeUrl; // Use provided link if no file

        // If file uploaded, upload to Cloudinary
        if (req.file) {
            finalResumeUrl = await uploadToCloudinary(req.file.buffer);
        }

        const application = new Application({
            jobId,
            studentId: req.user.id,
            studentName,
            email,
            phone,
            rollNumber,
            resumeUrl: finalResumeUrl
        });

        await application.save();
        res.json({ message: 'Application submitted successfully', application });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get applications for a specific job (for colleges/admins)
router.get('/job/:jobId', auth, async (req, res) => {
    try {
        let query = { jobId: req.params.jobId };

        const user = await User.findOne({_id : req.user.id});

        // If college, only see applications from their college's students
        if (req.user.role === 'staff') {
            // Find students from this college
            const students = await User.find({ collegeName: user.collegeName, role: 'student' }).select('_id');
            query.studentId = { $in: students.map(s => s._id) };
        }
        // Admins see all

        const applications = await Application.find(query).populate('studentId', 'name collegeName');
        res.json(applications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export applications to CSV (spreadsheet format)
router.get('/export/:jobId', auth, async (req, res) => {
    try {
        let query = { jobId: req.params.jobId };

        if(req.user.role === 'student'){
            return res.status(403).json({ message: 'You are not allowed to download application' }); 
        }

        
        if (req.user.role === 'stuff') {
            const students = await User.find({ collegeName: user.collegeName, role: 'student' }).select('_id');
            query.studentId = { $in: students.map(s => s._id) };
        }

        const applications = await Application.find(query).populate('studentId', 'name collegeName');

        console.log(applications)

        const fields = ['studentName', 'email', 'phone', 'rollNumber', 'studentId.name', 'studentId.collegeName', 'appliedAt'];
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
