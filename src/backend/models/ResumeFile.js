const mongoose = require('mongoose');
require('../src/database');

const ResumeFileSchema = new mongoose.Schema({
    resume_id: { type: String, required: true, unique: true, index:  true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    resume_data: { type: Buffer, required: true }, // File data as binary
    resume_file_name: { type: String, required: true, trim: true },
    resume_file_type: { type: String, required: true, trim: true },
    resume_file_size: { type: Number, required: true },
    resume_upload_date:  { type: Date, default: Date.now }
},

// Track when the user uploaded their resume to the system
{timestamps: true}

);

module.exports = mongoose.model('ResumeFile', ResumeFileSchema);