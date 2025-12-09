const  express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateUserId, generatePersonalInfoId } = require('../src/generateID');

// SIGNIN
router.post('/signup', async (req, res) => {
    // Get and store user inputs
    const {
        signupEmail: email,
        signupPhone: phoneNumber,
        signupPassword: password,
        signupConfirmPassword
    } = req.body;

    // Validate if passwords match
    if (password !== signupConfirmPassword) {
        return res.status(400).json({ success: false, message: 'Password do not match.' });
    }

    // Generate ids and role
    const userId = generateUserId();
    const personalInfoId = generatePersonalInfoId();
    const role = 'Applicant';

    try {
        // Check if the email or phone already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone_number: phoneNumber }]
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email or phone number already exists.' });
        }

        // Create user
        const newUser = await User.create({
            user_id: userId,
            email,
            phone_number: phoneNumber,
            password,
            role
        });

        // Save session and redirect to Applicant Homepage
        req.session.userId = userId;
        req.session.role = role;

        res.status(200).json({ success: true, redirect: '/applicant-home' });
    
    } catch (err) {
        console.error('Registration error:', err);

        // Handle Mongoose duplicate key error
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email or phone already exists.' });
        }

        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    const {
        loginEmail,
        loginPassword
    } = req.body;

    try {
        // Find user by email or phone number
        const user = await User.findOne({
            $or: [
                { email: loginEmail },
                { phone_number: loginEmail}
            ]
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email/phone or password.' });
        }

        // Compare password
        const isMatch = await user.comparePassword(loginPassword);
        if(!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email/phone or password.' });
        }

        // Save session information
        req.session.userId = user.user_id;
        req.session.role = user.role;

        // Redirect based on role
        if (user.role === 'Applicant') {
            return res.status(200).json({ success: true, redirect: 'applicant-home' });
        } else if (user.role === 'Admin') {
            return res.status(200).json({ success: true, redirect: '/admin-home' });
        } else {
            return res.status(200).json({ success: true, redirect: '/' });
        }

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
    }
})

module.exports = router;