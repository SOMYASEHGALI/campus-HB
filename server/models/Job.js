const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: String },
    experience: { type: String },
    description: { type: String, required: true },
    skills: { type: [String] },
    allowedColleges: { type: [String] }, // List of colleges that can see this job
    formUrl: { type: String }, // This will be the unique form URL for the job
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
