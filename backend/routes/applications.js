import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all applications (filtered by user role)
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'job_seeker') {
      query.applicant = req.user._id;
    } else if (req.user.role === 'employer') {
      // Get applications for jobs posted by this employer
      const jobs = await Job.find({ postedBy: req.user._id });
      const jobIds = jobs.map(job => job._id);
      query.job = { $in: jobIds };
    }

    const applications = await Application.find(query)
      .populate('job', 'title company location')
      .populate('applicant', 'name email skills experience education')
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single application
router.get('/:id', authenticate, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant', 'name email skills experience education bio');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authorization
    if (req.user.role === 'job_seeker' && application.applicant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'employer') {
      const job = await Job.findById(application.job._id);
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create application
router.post('/', authenticate, async (req, res) => {
  try {
    const { jobId, coverLetter, resume } = req.body;

    if (req.user.role !== 'job_seeker') {
      return res.status(403).json({ message: 'Only job seekers can apply' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not open for applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = new Application({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      resume
    });

    await application.save();
    job.applications.push(application._id);
    await job.save();

    await application.populate('job', 'title company location');
    await application.populate('applicant', 'name email skills');
    
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status (employers only)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify employer owns the job
    const job = await Job.findById(application.job);
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    if (notes) application.notes = notes;
    if (status !== 'pending') {
      application.reviewedAt = new Date();
    }

    await application.save();
    await application.populate('job', 'title company');
    await application.populate('applicant', 'name email skills');
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete application
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authorization
    if (application.applicant.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
