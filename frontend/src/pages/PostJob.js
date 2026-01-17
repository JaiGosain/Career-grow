import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: user?.company || '',
    location: '',
    employmentType: 'full-time',
    experienceRequired: 0,
    requiredSkills: [],
    salary: {
      min: 0,
      max: 0,
      currency: 'USD'
    }
  });
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('salary.')) {
      const salaryField = name.split('.')[1];
      setFormData({
        ...formData,
        salary: { ...formData.salary, [salaryField]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/jobs', formData);
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Post a Job
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Job Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Employment Type</InputLabel>
            <Select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              label="Employment Type"
            >
              <MenuItem value="full-time">Full-time</MenuItem>
              <MenuItem value="part-time">Part-time</MenuItem>
              <MenuItem value="contract">Contract</MenuItem>
              <MenuItem value="internship">Internship</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Experience Required (years)"
            name="experienceRequired"
            type="number"
            value={formData.experienceRequired}
            onChange={handleChange}
            margin="normal"
            inputProps={{ min: 0 }}
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                label="Add Required Skill"
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
              {formData.requiredSkills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                />
              ))}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Min Salary"
              name="salary.min"
              type="number"
              value={formData.salary.min}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Max Salary"
              name="salary.max"
              type="number"
              value={formData.salary.max}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Currency"
              name="salary.currency"
              value={formData.salary.currency}
              onChange={handleChange}
              sx={{ minWidth: 100 }}
            />
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Job'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default PostJob;
