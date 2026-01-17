import express from 'express';
import { body, validationResult } from 'express-validator';
import Job from '../models/Job.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const { status, search, skills, location } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (skills) {
      const skillsArray = skills.split(',');
      query.requiredSkills = { $in: skillsArray };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email company')
      .sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email company')
      .populate('applications');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create job (employers only)
router.post('/', authenticate, authorize('employer', 'admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('requiredSkills').isArray().withMessage('Required skills must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = new Job({
      ...req.body,
      postedBy: req.user._id
    });

    await job.save();
    await job.populate('postedBy', 'name email company');
    
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update job
router.put('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the owner or admin
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(job, req.body);
    job.updatedAt = new Date();
    await job.save();
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete job
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the owner or admin
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
