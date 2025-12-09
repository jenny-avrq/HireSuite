const mongoose = require('mongoose');
require('../src/database');

const InterviewScheduleSchema = new mongoose.Schema({
    interview_id: { type: String, required: true, unique: true, index: true },
    application_id: { type: String, ref: 'Application', required: true },
    interview_datetime: { type: Date, default: Date.now, required: true },
    location: { type: String, required: true },
    notes: { type: String, required: false }
},

// Track when the the admin has scheduled an interview for a specific job application
{timestamps: true}

);

module.exports = mongoose.model('InterviewSchedule', InterviewScheduleSchema);