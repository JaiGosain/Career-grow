import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/api/applications');
      setApplications(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await axios.put(`/api/applications/${selectedApplication._id}/status`, {
        status,
        notes
      });
      setStatusDialogOpen(false);
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const openStatusDialog = (application) => {
    setSelectedApplication(application);
    setStatus(application.status);
    setNotes(application.notes || '');
    setStatusDialogOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'default',
      reviewed: 'info',
      shortlisted: 'primary',
      rejected: 'error',
      accepted: 'success'
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {user?.role === 'job_seeker' ? 'My Applications' : 'Job Applications'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : applications.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No applications found
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {applications.map((application) => (
            <Card key={application._id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="h6">
                      {user?.role === 'job_seeker'
                        ? application.job?.title
                        : application.applicant?.name}
                    </Typography>
                    <Typography color="text.secondary">
                      {user?.role === 'job_seeker'
                        ? `${application.job?.company} • ${application.job?.location}`
                        : application.applicant?.email}
                    </Typography>
                    {user?.role === 'employer' && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          Skills: {application.applicant?.skills?.join(', ')}
                        </Typography>
                        <Typography variant="body2">
                          Experience: {application.applicant?.experience} years
                        </Typography>
                      </Box>
                    )}
                    {application.coverLetter && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {application.coverLetter.substring(0, 200)}...
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={application.status}
                    color={getStatusColor(application.status)}
                  />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    component={Link}
                    to={user?.role === 'job_seeker' ? `/jobs/${application.job?._id}` : `/applications/${application._id}`}
                  >
                    View Details
                  </Button>
                  {user?.role === 'employer' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openStatusDialog(application)}
                    >
                      Update Status
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Application Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="reviewed">Reviewed</MenuItem>
              <MenuItem value="shortlisted">Shortlisted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Applications;
