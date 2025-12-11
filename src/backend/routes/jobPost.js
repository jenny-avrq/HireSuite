const  express = require('express');
const router = express.Router();
const JobListing = require('../models/JobListing');
const { generateJobId } = require('../src/generateID');
const { requireAdmin } = require('../src/adminAuth');

// POST job vacancy
router.post('/post-job', requireAdmin, async (req, res) => {
    try {
        // Extract job information from the request sent from the frontend
        const {
            jobTitle,
            jobType,
            jobLocation, 
            jobExperience,
            skills,
            jobDescription
        } = req.body;

        // Generate jobId and status
        const jobId = generateJobId();
        const status = 'Active';

        // Save job vacancy to database
        const newJob = await JobListing.create ({
            job_id: jobId,
            job_title: jobTitle,
            job_type: jobType,
            location: jobLocation,
            experience: jobExperience,
            skills: skills,
            description: jobDescription,
            status: status
        });

        res.status(200).json({
            message: 'Job vacancy successfully posted.',
            success: true,
            job: newJob,
            job_id: newJob.job_id
        });

    } catch (err) {
        console.error('Error posting job vacancy:', err);
        res.status(500).json({ error: 'Database Error', details: err.message });
    }
});

// GET job listings
router.get('/get-jobs', async (req, res) => {
    try {
        const jobList = await JobListing.find({});

        if (!jobList || jobList.length === 0) {
            return res.status(404).json({ error: 'Job List Empty' });
        }

        console.log('Job Listings successfully fetched');

        res.status(200).json(jobList);

    } catch (err) {
        console.error('Error fetching job listing', err);
        res.status(500).json(({ error: 'Database error.' }));
    }
})

// UPDATE job post with the use of jobId
router.put('/edit-job/:jobId', async (req, res) => {
    // Extract job information from the request sent from the frontend
    const {
        jobTitle,
        jobType,
        jobLocation, 
        jobExperience,
        skills,
        jobDescription
    } = req.body;

    const jobId = req.params.jobId;

    try {
        const updatedJob = await JobListing.findOneAndUpdate(
            // Filter by job id
            { job_id: jobId },
            // Fields to update
            {
                job_title: jobTitle,
                job_type: jobType,
                location: jobLocation,
                experience: jobExperience,
                skills: skills,
                description: jobDescription
            },
            // Return the updated document
            { new: true } 
        );

        if (!updatedJob) {
            return res.status(404).json({ error: 'No Job matched the job ID.' });
        }

        console.log('Job Post successfully updated!');
        res.status(200).json({ success: true, job: updatedJob });

    }catch (err) {
        console.error('Error updating job post', err);
        res.status(500).json(({ error: 'Database error.' }));
    }
})

// DELETE job post with the use of jobId
router.delete('/remove-post/:jobId', requireAdmin, async (req, res) => {
    const jobId = req.params.jobId;

    try {
        const deleteJob = await JobListing.findOneAndDelete({ job_id: jobId })

        if (!deleteJob) {
            return res.status(404).json({ error: 'No Job matched the job ID.' });
        }

        console.log('Job Post successfully deleted!');
        res.status(200).json({ success: true, job: deleteJob });
    
    } catch (err) {
        console.error('Error deleting job post', err);
        res.status(500).json(({ error: 'Database error.' }));
    }
})

module.exports = router;