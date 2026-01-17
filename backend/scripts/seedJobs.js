import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Job from '../models/Job.js';

dotenv.config();

const sampleJobs = [
  {
    title: 'Senior Full Stack Developer',
    description: 'We are looking for an experienced Full Stack Developer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.',
    company: 'TechCorp Inc.',
    location: 'New York, NY',
    employmentType: 'full-time',
    experienceRequired: 5,
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
    salary: {
      min: 120000,
      max: 180000,
      currency: 'USD'
    },
    status: 'open'
  },
  {
    title: 'Frontend Developer',
    description: 'Join our frontend team to build beautiful and responsive user interfaces. We use React, TypeScript, and modern CSS frameworks.',
    company: 'DesignStudio',
    location: 'San Francisco, CA',
    employmentType: 'full-time',
    experienceRequired: 3,
    requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'],
    salary: {
      min: 90000,
      max: 130000,
      currency: 'USD'
    },
    status: 'open'
  },
  {
    title: 'Backend Developer',
    description: 'We need a skilled Backend Developer to design and implement scalable server-side applications. Experience with microservices architecture is a plus.',
    company: 'CloudTech Solutions',
    location: 'Remote',
    employmentType: 'full-time',
    experienceRequired: 4,
    requiredSkills: ['Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS'],
    salary: {
      min: 110000,
      max: 160000,
      currency: 'USD'
    },
    status: 'open'
  },
  {
    title: 'DevOps Engineer',
    description: 'Looking for a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. Experience with Kubernetes and cloud platforms required.',
    company: 'InfraSystems',
    location: 'Austin, TX',
    employmentType: 'full-time',
    experienceRequired: 4,
    requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
    salary: {
      min: 115000,
      max: 170000,
      currency: 'USD'
    },
    status: 'open'
  },
  {
    title: 'Junior Software Developer',
    description: 'Great opportunity for a junior developer to grow their skills. We provide mentorship and work on exciting projects.',
    company: 'StartupHub',
    location: 'Seattle, WA',
    employmentType: 'full-time',
    experienceRequired: 1,
    requiredSkills: ['JavaScript', 'React', 'Node.js'],
    salary: {
      min: 70000,
      max: 95000,
      currency: 'USD'
    },
    status: 'open'
  },
  {
    title: 'UI/UX Designer',
    description: 'We are seeking a creative UI/UX Designer to design intuitive and engaging user experiences for our web and mobile applications.',
    company: 'Creative Agency',
    location: 'Los Angeles, CA',
    employmentType: 'full-time',
    experienceRequired: 3,
    requiredSkills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
    salary: {
      min: 85000,
      max: 120000,
      currency: 'USD'
    },
    status: 'open'
  }
];

async function seedJobs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careergrow');
    console.log('MongoDB Connected');

    // Find or create a sample employer
    let employer = await User.findOne({ email: 'employer@example.com' });
    
    if (!employer) {
      employer = new User({
        name: 'Sample Employer',
        email: 'employer@example.com',
        password: 'password123',
        role: 'employer',
        company: 'TechCorp Inc.'
      });
      await employer.save();
      console.log('Created sample employer account');
    }

    // Clear existing jobs (optional - comment out if you want to keep existing jobs)
    // await Job.deleteMany({});
    // console.log('Cleared existing jobs');

    // Create jobs
    const jobs = [];
    for (const jobData of sampleJobs) {
      const job = new Job({
        ...jobData,
        postedBy: employer._id
      });
      await job.save();
      jobs.push(job);
      console.log(`Created job: ${job.title}`);
    }

    console.log(`\n✅ Successfully seeded ${jobs.length} jobs!`);
    console.log(`\nYou can now:`);
    console.log(`1. View jobs at http://localhost:3000/jobs`);
    console.log(`2. Login as employer: email: employer@example.com, password: password123`);
    console.log(`3. Or register a new account to post your own jobs`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
}

seedJobs();
