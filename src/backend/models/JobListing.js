const mongoose = require('mongoose');
require('../src/database');

const JobListingSchema = new mongoose.Schema({
    job_id: { type: String, required: true, unique: true, index: true },
    job_title: { type: String, required: true },
    job_type: { type: String, required: true },
    location: { type: String, required: true },
    experience: { type: String, required: true },
    skills: { type: [String], required: true },
    description: { type: String, required: true },
    status: { type: String, required: true }
},

// Track when the admin has posted the job vacancy to the system
{timestamps: true}

);

module.exports = mongoose.model('JobListing', JobListingSchema);