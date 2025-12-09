const mongoose = require('mongoose');
require('../src/database');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index:  true },

    email: { 
        type: String, 
        trim: true, 
        unique: true, 
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },

    phone_number: { type: String, trim: true, unique: true, required: true },

    password: { 
        type: String, 
        required: true, 
        validate: {
            validator: function (value) {
                //  Password must have a minimum of 8 characters, 1 uppercase, 1 lowercase, 1 digit
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
            },
            message: 'Password must be at least 8 characters long, and include uppercase, lowercase, and a number.'
        }
    },

    role: { type: String, default: 'Applicant' }
},

// Track when the user registered to the system
{timestamps: true}

);

// Hash password before saving to the database
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare passwords for login
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);