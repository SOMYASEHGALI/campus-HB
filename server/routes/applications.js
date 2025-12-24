const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { auth } = require('../middleware/authMiddleware');
const { Parser } = require('json2csv');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const upload = require('../config/multer');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const router = express.Router();


// Submit application (by student)
router.post('/submit', auth, upload.single('resume'), async (req, res) => {
    try {
        const { jobId, studentName, email, phone, rollNumber, resumeUrl } = req.body;
        if (!jobId || !studentName || !email || !phone || !rollNumber || !resumeUrl) {
            return res.status(400).json({ message: "All Field Required" });
        }

        // Check if user is student
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can submit applications' });
        }

        const user = await User.findOne({ _id: req.user.id });
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
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

        const user = await User.findOne({ _id: req.user.id });

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

        if (req.user.role === 'student') {
            return res.status(403).json({ message: 'You are not allowed to download application' });
        }


        if (req.user.role === 'staff') {
            const user = await User.findById(req.user.id);
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

// Get admin statistics (colleges and all applications)
router.get('/admin/stats', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Data Recovery: Ensure all applications submitted by staff are marked as bulk
        const staffUsers = await User.find({ role: 'staff' }).select('_id');
        const staffIds = staffUsers.map(u => u._id);
        await Application.updateMany(
            { $or: [{ uploadedBy: { $in: staffIds } }, { studentId: { $in: staffIds } }] },
            { $set: { isBulk: true } }
        );

        // Get unique colleges and count of users in each
        const collegeStats = await User.aggregate([
            { $match: { role: { $ne: 'admin' } } },
            { $group: { _id: '$collegeName', userCount: { $sum: 1 } } }
        ]);

        // Get total applications per college
        const applicationStats = await Application.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $group: {
                    _id: '$user.collegeName',
                    appCount: { $sum: 1 },
                    bulkCount: { $sum: { $cond: ["$isBulk", 1, 0] } }
                }
            }
        ]);

        // Get all applications with populated data for the list
        const allApplications = await Application.find()
            .populate('jobId', 'title company')
            .populate('studentId', 'name collegeName')
            .populate('uploadedBy', 'name collegeName')
            .sort({ appliedAt: -1 });

        console.log(`[Admin Audit] Total Applications: ${allApplications.length}`);
        console.log(`[Admin Audit] Bulk Applications: ${allApplications.filter(a => a.isBulk).length}`);

        res.json({
            colleges: collegeStats.map(c => {
                const appStat = applicationStats.find(a => a._id === c._id) || { appCount: 0, bulkCount: 0 };
                return {
                    name: c._id,
                    users: c.userCount,
                    applications: appStat.appCount,
                    bulkUploads: appStat.bulkCount
                };
            }),
            applications: allApplications
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export all applications to CSV
router.get('/export-all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const applications = await Application.find()
            .populate('jobId', 'title company')
            .populate('studentId', 'name collegeName');

        const fields = [
            { label: 'Student Name', value: 'studentName' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Roll Number', value: 'rollNumber' },
            { label: 'College', value: 'studentId.collegeName' },
            { label: 'Job Title', value: 'jobId.title' },
            { label: 'Company', value: 'jobId.company' },
            { label: 'Applied At', value: 'appliedAt' }
        ];

        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(applications);

        res.header('Content-Type', 'text/csv');
        res.attachment(`all_applications_export.csv`);
        return res.send(csv);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk submit applications (by staff)
router.post('/bulk-submit', auth, async (req, res) => {
    try {
        const { jobId, students } = req.body;
        if (!jobId || !students || !Array.isArray(students)) {
            return res.status(400).json({ message: "Invalid bulk data" });
        }

        if (req.user.role !== 'staff' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only staff can perform bulk uploads' });
        }

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const staff = await User.findById(req.user.id);

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const studentData of students) {
            try {
                // Check if student exists or create a placeholder if needed
                // For this implementation, we assume staff provides student info
                // We'll create applications without requiring pre-existing student users for bulk

                const application = new Application({
                    jobId,
                    studentId: req.user.id, // Linked to staff since it's bulk
                    studentName: studentData.name,
                    email: studentData.email,
                    phone: studentData.phone,
                    rollNumber: studentData.rollNumber,
                    resumeUrl: studentData.resumeUrl,
                    isBulk: true,
                    uploadedBy: req.user.id
                });

                await application.save();
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ student: studentData.name, error: err.message });
            }
        }

        res.json({ message: 'Bulk processing completed', results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk upload actual resume files (PDF/Docx)
// No compression used: Each file is stored individually on the disk
router.post('/bulk-upload-cvs', auth, upload.array('resumes'), async (req, res) => {
    try {
        const { jobId } = req.body;
        const files = req.files;

        if (!jobId || !files || files.length === 0) {
            return res.status(400).json({ message: "No files or jobId provided" });
        }

        if (req.user.role !== 'staff' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const results = { success: 0, failed: 0, entries: [] };

        // Processing each file individually to ensure no data loss or accidental compression
        for (const file of files) {
            try {
                // Ensure unique filename by prepending timestamp and using normalized original name
                const safeName = file.originalname.replace(/\s+/g, '_');
                const uniqueName = `CV-${Date.now()}-${Math.floor(Math.random() * 1000)}-${safeName}`;
                const uploadPath = path.join(__dirname, '../uploads', uniqueName);

                // Write each individual file to the server's local disk (Uncompressed)
                fs.writeFileSync(uploadPath, file.buffer);

                // Extract student name from the filename
                const cleanName = file.originalname.split('.')[0]
                    .replace(/[_-]/g, ' ')
                    .replace(/\d+/g, '')
                    .trim();

                const application = new Application({
                    jobId,
                    studentId: req.user.id,
                    studentName: cleanName || 'Individual Bulk Upload',
                    email: `candidate.${Date.now()}.${Math.floor(Math.random() * 999)}@hiringbazar.io`,
                    phone: '9999999999',
                    rollNumber: 'BATCH-2025',
                    resumeUrl: `/api/applications/download-cv/${uniqueName}`, // Using dedicated download bridge
                    isBulk: true,
                    uploadedBy: req.user.id
                });

                await application.save();
                results.success++;
                results.entries.push(application);
                console.log(`[Bulk Audit] Saved file individually: ${uniqueName}`);
            } catch (err) {
                results.failed++;
                console.error('Individual File Save Error:', err);
            }
        }

        res.json({
            message: `Successfully stored ${results.success} uncompressed documents locally on the server.`,
            results
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dedicated Download Bridge to prevent PDF corruption or CORS issues
router.get('/download-cv/:filename', (req, res) => {
    try {
        const filePath = path.join(__dirname, '../uploads', req.params.filename);
        if (fs.existsSync(filePath)) {
            // Set headers for individual file download
            res.download(filePath, (err) => {
                if (err) console.error('Download Transfer Error:', err);
            });
        } else {
            res.status(404).send('File not found on storage');
        }
    } catch (err) {
        res.status(500).send('Download protocol error');
    }
});

// Single CV upload (for one-by-one bulk processing)
router.post('/upload-single-cv', auth, upload.single('resume'), async (req, res) => {
    try {
        const { jobId } = req.body;
        const file = req.file;

        if (!jobId || !file) {
            return res.status(400).json({ message: "File or jobId missing" });
        }

        const safeName = file.originalname.replace(/\s+/g, '_');
        const uniqueName = `CV-${Date.now()}-${Math.floor(Math.random() * 1000)}-${safeName}`;
        const uploadPath = path.join(__dirname, '../uploads', uniqueName);

        fs.writeFileSync(uploadPath, file.buffer);

        const cleanName = file.originalname.split('.')[0]
            .replace(/[_-]/g, ' ')
            .replace(/\d+/g, '')
            .trim();

        const application = new Application({
            jobId,
            studentId: req.user.id,
            studentName: cleanName || 'Applicant',
            email: `candidate.${Date.now()}.${Math.floor(Math.random() * 99)}@hiringbazar.io`,
            phone: '9999999999',
            rollNumber: 'BATCH-2025',
            resumeUrl: `/api/applications/download-cv/${uniqueName}`,
            isBulk: true,
            uploadedBy: req.user.id
        });

        await application.save();

        res.json({
            success: true,
            message: "File stored individually",
            application
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
