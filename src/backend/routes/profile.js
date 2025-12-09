const  express = require('express');
const router = express.Router();
const PersonalInformation = require('../models/PersonalInformation');
const ResumeFile = require('../models/ResumeFile');
const { generatePersonalInfoId, generateResumeId } = require('../src/generateID');
const multer = require('multer');
const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB Limit
    storage: multer.memoryStorage() // Store file in memory as Buffer
});

// POST personal information
router.post('/update', upload.single('resumeFile') , async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: User not logged in.' });
        }

        // Extract personal information from the request sent from the frontend
        const {
            firstName,
            middleName,
            lastName,
            email,
            phoneNumber,
            dateOfBirth,
            gender,
            address,
            age
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phoneNumber || !dateOfBirth || !gender || !address) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // Validate age
        const parsedAge = parseInt(age, 10);
        if (isNaN(parsedAge)) {
            return res.status(400).json({ error: 'Invalid age.' });
        }

        // Check for existing personal information
        let personalInformation = await PersonalInformation.findOne({ user_id: userId });
        let resumeId = personalInformation ? personalInformation.resume_id : null;

        // Handle resume
        if (req.file) {
            const bufferData = req.file.buffer;
            const fileName = req.file.originalname;
            const fileType = req.file.mimetype;
            const fileSize = req.file.size;

            let resumeFileDoc;

            if (resumeId) {
                resumeFileDoc = await ResumeFile.findOneAndUpdate(
                    { resume_id: resumeId },
                    {
                        resume_data: bufferData,
                        resume_file_name: fileName,
                        resume_file_type: fileType,
                        resume_file_size: fileSize,
                        resume_upload_date: new Date()
                    },
                    { new: true }
                );
            } else {
                // Create new resume
                resumeId = generateResumeId();
                
                resumeFileDoc = new ResumeFile({
                    resume_id: resumeId,
                    user_id: userId,
                    resume_data: bufferData,
                    resume_file_name: fileName,
                    resume_file_type: fileType,
                    resume_file_size: fileSize,
                    resume_upload_date: new Date()
                });
                
                await resumeFileDoc.save();
            }
        }

        // Upsert personal information
        const personalInfoId = personalInformation ? personalInformation.personal_info_id : generatePersonalInfoId();

        personalInformation = await PersonalInformation.findOneAndUpdate (
            { user_id: userId },
            {
                personal_info_id: personalInfoId,
                first_name: firstName,
                middle_name: middleName || '',
                last_name: lastName,
                email: email,
                phone_number: phoneNumber,
                date_of_birth: dateOfBirth,
                age: parsedAge,
                gender: gender,
                residential_address: address,
                resume_id: resumeId
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            message: 'Profile successfully updated.',
            id: personalInformation.personal_info_id,
            resumeId: resumeId,
            success: true
        });

    } catch (err) {
        console.error('Error saving profile:', err);
        res.status(500).json({ error: 'Database Error', details: err.message });
    }
});

// GET personal information
router.get('/fetch', async (req, res) => {
    try  {
        // Get user in session
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: User not logged in.' });
        }

        // Find the personal information by user_id
        const profile = await PersonalInformation.findOne({ user_id: userId }).lean();

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found.' });
        }

        let resume = null;

        // Convert buffer resume data to base64 for frontend
        if (profile.resume_id) {
            const resumeDoc = await ResumeFile.findOne({ resume_id: profile.resume_id}).lean();

            if (resumeDoc) {
                resume = {
                    resumeId: resumeDoc.resume_id,
                    fileName: resumeDoc.resume_file_name,
                    fileType: resumeDoc.resume_file_type,
                    fileSize: resumeDoc.resume_file_size
                };
            }
        }

        res.status(200).json(Object.assign({}, profile, { resume }));
        console.log('Profile fetched successfully for user:', userId);

    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: 'Database error.' });
    }
});

// GET resume file with the resumeId
router.get('/resume/:resumeId', async (req, res) => {
    try {
        // Check if the user is logged in session
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: User not logged in.' });
        }

        const { resumeId } = req.params;
        const resume = await ResumeFile.findOne({ resume_id: resumeId });

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found.' });
        }

        if (resume.user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.set({
            'Content-Type': resume.resume_file_type,
            'Content-Disposition': `inline; filename="${resume.resume_file_name}"`,
            'Content-Length': resume.resume_file_size
        });

        res.send(resume.resume_data);

    } catch (err) {
        console.error('Error fetching resume:', err);
        res.status(500).json({ error: 'Database error.' });
    }
});

// DELETE resume file
router.post('/remove-resume', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Find the personal information document for the user in session
        const personalInformation = await PersonalInformation.findOne({ user_id: userId });

        if(!personalInformation) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const resumeId = personalInformation.resume_id;

        // Remove resume id from personal information
        personalInformation.resume_id = null;
        await personalInformation.save();

        // Delete resume document if it exists
        if (resumeId) {
            await ResumeFile.deleteOne({ resume_id: resumeId });
        }

        console.log('Resume removed successfully for user:');
        res.status(200).json({ message: 'Resume removed successfully' });

    } catch (err) {
        console.error('Error removing resume:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;