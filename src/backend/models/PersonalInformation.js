const mongoose = require('mongoose');
require('../src/database');

const PersonalInformationSchema = new mongoose.Schema({
    personal_info_id: { type: String, required: true, unique: true, index:  true },
    user_id: { type: String, required: true, ref: 'User', unique: true },
    first_name: { type: String, default: '' },
    middle_name: { type: String, default: '', required: false },
    last_name: { type: String, default: '' },
    email: { 
        type: String, 
        trim: true, 
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phone_number: { type: String, trim: true},
    date_of_birth: { type: Date },
    age: { type: Number, default: 0 },
    gender: { type: String, default: 'Not Specified' },
    residential_address: { type: String, default: 'Not Provided' },
    resume_id: { type: String, default: null }
},

// Track when the entered their personal information to the system
{timestamps: true}

);

module.exports = mongoose.model('PersonalInformation', PersonalInformationSchema);