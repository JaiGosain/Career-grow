import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import WorkIcon from '@mui/icons-material/Work';
import ChatIcon from '@mui/icons-material/Chat';
import RecommendIcon from '@mui/icons-material/Recommend';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to CareerGrow
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your gateway to finding the perfect job or the perfect candidate
        </Typography>
        {!isAuthenticated && (
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/register"
              sx={{ mr: 2 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/jobs"
            >
              Browse Jobs
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <WorkIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Job Posting
              </Typography>
              <Typography color="text.secondary">
                Post jobs or browse through thousands of opportunities. Find your
                dream job or the perfect candidate.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <ChatIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Real-time Chat
              </Typography>
              <Typography color="text.secondary">
                Communicate directly with employers or candidates through our
                real-time messaging system.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <RecommendIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Smart Recommendations
              </Typography>
              <Typography color="text.secondary">
                Get personalized job recommendations based on your skills and
                experience using our AI-powered system.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
