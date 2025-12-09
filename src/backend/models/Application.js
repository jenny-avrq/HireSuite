const mongoose = require('mongoose');
require('../src/database');

const ApplicationSchema = new mongoose.Schema({
    application_id: { type: String, required: true, unique: true, index: true },
    personal_info_id: { type: String, ref: 'PersonalInformation', required: true },
    job_id: { type: String, ref: 'JobListing', required: true },
    status: { type: String, required: true }
},

// Track when the applicant has submit their application to a job listed on the system
{timestamps: true}

);

// Prevent the same user to apply to the same job twice
ApplicationSchema.index(
    { personal_info_id: 1, job_id: 1 },
    { unique: true }
);

module.exports = mongoose.model('Application', ApplicationSchema);