import express from 'express';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get job recommendations for job seeker
router.get('/jobs', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'job_seeker') {
      return res.status(403).json({ message: 'Only job seekers can get job recommendations' });
    }

    const user = await User.findById(req.user._id);
    const userSkills = user.skills || [];
    const userExperience = user.experience || 0;

    // Get all open jobs
    const allJobs = await Job.find({ status: 'open' })
      .populate('postedBy', 'name email company');

    // Get jobs user has already applied to
    const appliedJobs = await Application.find({ applicant: req.user._id });
    const appliedJobIds = appliedJobs.map(app => app.job.toString());

    // Score and rank jobs
    const scoredJobs = allJobs
      .filter(job => !appliedJobIds.includes(job._id.toString()))
      .map(job => {
        let score = 0;

        // Skill matching (40% weight)
        const matchingSkills = job.requiredSkills.filter(skill =>
          userSkills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );
        const skillMatchRatio = job.requiredSkills.length > 0 
          ? matchingSkills.length / job.requiredSkills.length 
          : 0;
        score += skillMatchRatio * 40;

        // Experience matching (30% weight)
        if (userExperience >= job.experienceRequired) {
          score += 30;
        } else {
          const experienceRatio = userExperience / Math.max(job.experienceRequired, 1);
          score += experienceRatio * 30;
        }

        // Recency bonus (20% weight) - newer jobs get higher score
        const daysSincePosted = (new Date() - job.createdAt) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.max(0, 1 - daysSincePosted / 30); // Decay over 30 days
        score += recencyScore * 20;

        // Location preference (10% weight) - can be enhanced with user preferences
        score += 10; // Default location score

        return {
          job,
          score,
          matchingSkills,
          matchPercentage: Math.round(score)
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Top 20 recommendations

    res.json(scoredJobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get candidate recommendations for employer
router.get('/candidates', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can get candidate recommendations' });
    }

    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get all job seekers
    const candidates = await User.find({ role: 'job_seeker' });

    // Get already applied candidates
    const applications = await Application.find({ job: jobId });
    const appliedCandidateIds = applications.map(app => app.applicant.toString());

    // Score and rank candidates
    const scoredCandidates = candidates
      .filter(candidate => !appliedCandidateIds.includes(candidate._id.toString()))
      .map(candidate => {
        let score = 0;

        // Skill matching (50% weight)
        const matchingSkills = job.requiredSkills.filter(skill =>
          candidate.skills.some(candidateSkill =>
            candidateSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(candidateSkill.toLowerCase())
          )
        );
        const skillMatchRatio = job.requiredSkills.length > 0
          ? matchingSkills.length / job.requiredSkills.length
          : 0;
        score += skillMatchRatio * 50;

        // Experience matching (30% weight)
        if (candidate.experience >= job.experienceRequired) {
          score += 30;
        } else {
          const experienceRatio = candidate.experience / Math.max(job.experienceRequired, 1);
          score += experienceRatio * 30;
        }

        // Education bonus (20% weight) - simplified
        if (candidate.education) {
          score += 20;
        }

        return {
          candidate: {
            id: candidate._id,
            name: candidate.name,
            email: candidate.email,
            skills: candidate.skills,
            experience: candidate.experience,
            education: candidate.education,
            bio: candidate.bio
          },
          score,
          matchingSkills,
          matchPercentage: Math.round(score)
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Top 20 recommendations

    res.json(scoredCandidates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
