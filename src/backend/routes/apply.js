const  express = require('express');
const router = express.Router();
const requireAdmin = require('../src/adminAuth');
const Application = require('../models/Application');
const PersonalInformation  = require('../models/PersonalInformation');
const ResumeFile = require('../models/ResumeFile');
const JobListing = require('../models/JobListing');
const { generateApplicationId } = require('../src/generateID');

// POST job application
router.post('/submit-application', async (req, res) => {
    try {
        // Check if user is logged in
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: User not logged in.' });
        }

        const {
            resumeId,
            jobId
        } = req.body;

        // Fetch personal information ID
        const personalInformation = await PersonalInformation.findOne({ user_id: userId });
        if (!personalInformation) {
            return res.status(404).json({ err: 'Personal Information not found.' });
        }

        // Fetch resume ID
        const resume = await ResumeFile.findOne({ resume_id: resumeId });
        if (!resume) return res.status(404).json({ err: 'Resume not found.' });

        // Fetch job ID
        const job = await JobListing.findOne({ job_id: jobId });
        if (!job) return res.status(404).json({ err: 'Job not found.' });

        // Generate jobId and status
        const applicationId = generateApplicationId();
        const status = 'under-review';

        // Save job vacancy to database
        const app = await Application.create ({
            application_id: applicationId,
            personal_info_id: personalInformation.personal_info_id,
            resume_id: resumeId,
            job_id: jobId,
            status: status
        });

        res.status(200).json({
            message: 'Job application successfully submitted!.',
            success: true,
            application: app
        });

    } catch (err) {
        console.error('Error submitting application:', err);
        res.status(500).json({ error: 'Database Error', details: err.message });
    }
});

// GET applications
router.get('/get-applications',  async (req, res) => {
    try  {
        const applications = await Application.aggregate([
            {
                $lookup: {
                    from: "personalinformations",
                    localField: "personal_info_id",
                    foreignField: "personal_info_id",
                    as: "personalInfo"
                }
            },
            { $unwind: "$personalInfo" },

            {
                $lookup: {
                    from: "joblistings",
                    localField: "job_id",
                    foreignField: "job_id",
                    as: "job"
                }
            },
            { $unwind: "$job" },

            {
                $lookup: {
                    from: "resumefiles",
                    localField: "resume_id",
                    foreignField: "resume_id",
                    as: "resume"
                }
            },
            { $unwind: "$resume" },

            // Final projection for cleaner output
            {
                $project: {
                    application_id: 1,
                    status: 1,
                    createdAt: 1,
                    "personalInfo.first_name": 1,
                    "personalInfo.last_name": 1,
                    "personalInfo.email": 1,
                    "personalInfo.phone_number": 1,
                    "resume.resume_file_name": 1,
                    "job.job_title": 1
                }
            }
        ]);

        res.status(200).json(applications);
        console.log('All applications successfully fetched!');
        console.log("DATA FROM DATABASE:", applications);

    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(500).json({ error: 'Database error.' });
    }
});

// GET my applications for applicant
router.get('/my-applications', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const personalInfo = await PersonalInformation.findOne({ user_id: userId });
    if (!personalInfo) return res.status(404).json({ error: 'Personal Information not found' });

    const applications = await Application.aggregate([
      { $match: { personal_info_id: personalInfo.personal_info_id } },
      {
        $lookup: {
          from: "joblistings",
          localField: "job_id",
          foreignField: "job_id",
          as: "job"
        }
      },
      { $unwind: "$job" },
      {
        $project: {
          application_id: 1,
          status: 1,
          createdAt: 1,
          jobTitle: "$job.job_title"
        }
      }
    ]);

    res.status(200).json({ applications });
  } catch (err) {
    console.error('Error fetching my applications:', err);
    res.status(500).json({ error: 'Database error.' });
  }
});

// UPDATE application status
router.put('/update-status/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['hired', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const updatedApplication = await Application.findOneAndUpdate(
      { application_id: applicationId },
      { status },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({
      message: `Application ${status} successfully`,
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;