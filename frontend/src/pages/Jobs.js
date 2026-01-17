import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [search, location]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;

      const response = await axios.get('/api/jobs', { params });
      setJobs(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch jobs. Make sure the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Job Listings
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Search jobs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <TextField
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{ minWidth: 200 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : jobs.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No jobs found
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} md={6} key={job._id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {job.title}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {job.company} • {job.location}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                    {job.description.substring(0, 150)}...
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {job.requiredSkills?.slice(0, 3).map((skill, index) => (
                      <Chip key={index} label={skill} size="small" />
                    ))}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {job.employmentType} • {job.experienceRequired}+ years experience
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} to={`/jobs/${job._id}`}>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Jobs;
