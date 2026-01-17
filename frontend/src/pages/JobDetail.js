import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`);
      setJob(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setApplying(true);
      await axios.post('/api/applications', {
        jobId: id,
        coverLetter
      });
      setApplyDialogOpen(false);
      setCoverLetter('');
      alert('Application submitted successfully!');
      fetchJob();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container>
        <Alert severity="error">{error || 'Job not found'}</Alert>
      </Container>
    );
  }

  const canApply = isAuthenticated && user?.role === 'job_seeker' && job.status === 'open';

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {job.title}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {job.company} • {job.location}
        </Typography>

        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="body1" paragraph>
            {job.description}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Required Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {job.requiredSkills?.map((skill, index) => (
              <Chip key={index} label={skill} />
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Employment Type:</strong> {job.employmentType}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Experience Required:</strong> {job.experienceRequired} years
          </Typography>
          {job.salary?.min && (
            <Typography variant="body2" color="text.secondary">
              <strong>Salary:</strong> {job.salary.currency} {job.salary.min} - {job.salary.max}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          {canApply && (
            <Button
              variant="contained"
              onClick={() => setApplyDialogOpen(true)}
            >
              Apply Now
            </Button>
          )}
          {user?.role === 'employer' && job.postedBy?._id === user.id && (
            <Button
              variant="outlined"
              component={Link}
              to={`/applications?jobId=${job._id}`}
            >
              View Applications
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)}>
        <DialogTitle>Apply for {job.title}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Cover Letter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            margin="normal"
            placeholder="Tell us why you're a good fit for this position..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleApply}
            variant="contained"
            disabled={applying}
          >
            {applying ? 'Applying...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetail;
