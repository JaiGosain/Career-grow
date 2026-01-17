import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    skills: user?.skills || [],
    experience: user?.experience || 0,
    education: user?.education || '',
    bio: user?.bio || '',
    company: user?.company || ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await updateProfile(formData);
    if (result.success) {
      setMessage('Profile updated successfully!');
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>
        {message && (
          <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          {user?.role === 'job_seeker' && (
            <>
              <TextField
                fullWidth
                label="Experience (years)"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
                margin="normal"
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                label="Education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                margin="normal"
              />
              <Box sx={{ mt: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label="Add Skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    size="small"
                  />
                  <Button onClick={handleAddSkill} variant="outlined">
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onDelete={() => handleRemoveSkill(skill)}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}
          {user?.role === 'employer' && (
            <TextField
              fullWidth
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              margin="normal"
            />
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            margin="normal"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Profile;
