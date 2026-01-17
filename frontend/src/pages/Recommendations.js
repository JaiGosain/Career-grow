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
  Chip,
  CircularProgress,
  Alert,
  Grid,
  LinearProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      if (user?.role === 'job_seeker') {
        const response = await axios.get('/api/recommendations/jobs');
        setRecommendations(response.data);
      } else if (user?.role === 'employer') {
        const response = await axios.get('/api/recommendations/candidates');
        setRecommendations(response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch recommendations');
    } finally {
      setLoading(false);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {user?.role === 'job_seeker' ? 'Job Recommendations' : 'Candidate Recommendations'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {recommendations.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No recommendations available
        </Typography>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {recommendations.map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  {user?.role === 'job_seeker' ? (
                    <>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {item.job.title}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        {item.job.company} • {item.job.location}
                      </Typography>
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Match Score: {item.matchPercentage}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={item.matchPercentage}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {item.matchingSkills?.map((skill, idx) => (
                          <Chip key={idx} label={skill} size="small" color="primary" />
                        ))}
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {item.job.description.substring(0, 150)}...
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {item.candidate.name}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        {item.candidate.email}
                      </Typography>
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Match Score: {item.matchPercentage}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={item.matchPercentage}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Skills:</strong> {item.candidate.skills?.join(', ')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Experience:</strong> {item.candidate.experience} years
                      </Typography>
                      {item.candidate.education && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Education:</strong> {item.candidate.education}
                        </Typography>
                      )}
                      {item.matchingSkills?.length > 0 && (
                        <Box sx={{ mt: 1, mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Matching Skills:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {item.matchingSkills.map((skill, idx) => (
                              <Chip key={idx} label={skill} size="small" color="primary" />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
                <CardActions>
                  {user?.role === 'job_seeker' ? (
                    <Button size="small" component={Link} to={`/jobs/${item.job._id}`}>
                      View Job
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      onClick={async () => {
                        // Create chat with candidate
                        try {
                          const response = await axios.post('/api/chat', {
                            participantId: item.candidate.id
                          });
                          window.location.href = `/chat/${response.data._id}`;
                        } catch (err) {
                          alert('Failed to start chat');
                        }
                      }}
                    >
                      Contact Candidate
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Recommendations;
