// frontend/src/modules/core-data/components/JobForm.tsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  Button,
  Grid,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Autocomplete
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

interface JobFormData {
  title: string;
  description: string;
  location: string;
  department: string;
  job_number: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  salary_min?: number;
  salary_max?: number;
  employment_type: string;
  remote_allowed: boolean;
  experience_required: string;
  required_skills: string[];
  preferred_skills: string[];
  tags: string[];
}

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  onSubmit: (data: JobFormData) => void;
  isLoading?: boolean;
}

const JobForm: React.FC<JobFormProps> = ({ initialData, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    location: '',
    department: '',
    job_number: '',
    status: 'draft',
    priority: 'medium',
    employment_type: 'full-time',
    remote_allowed: false,
    experience_required: '',
    required_skills: [],
    preferred_skills: [],
    tags: [],
    ...initialData
  });

  const handleInputChange = (field: keyof JobFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.type === 'number' ? Number(event.target.value) : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof JobFormData) => (
    event: SelectChangeEvent<string>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSwitchChange = (field: keyof JobFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.checked }));
  };

  const handleSkillsChange = (field: 'required_skills' | 'preferred_skills' | 'tags') => (
    event: React.SyntheticEvent,
    newValue: string[]
  ) => {
    setFormData(prev => ({ ...prev, [field]: newValue }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  const skillOptions = [
    'Python', 'JavaScript', 'React', 'FastAPI', 'PostgreSQL', 'Docker', 
    'AWS', 'Git', 'TypeScript', 'Node.js', 'MongoDB', 'Redis'
  ];

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? 'Edit Job' : 'Create New Job'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Basic Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Job Title"
              value={formData.title}
              onChange={handleInputChange('title')}
              required
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Job Number"
              value={formData.job_number}
              onChange={handleInputChange('job_number')}
              required
              variant="outlined"
              placeholder="ENG-2025-001"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              required
              multiline
              rows={4}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={handleInputChange('location')}
              required
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={handleInputChange('department')}
              variant="outlined"
            />
          </Grid>
          
          {/* Job Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Job Details
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={handleSelectChange('status')}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={handleSelectChange('priority')}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Employment Type</InputLabel>
              <Select
                value={formData.employment_type}
                label="Employment Type"
                onChange={handleSelectChange('employment_type')}
              >
                <MenuItem value="full-time">Full-time</MenuItem>
                <MenuItem value="part-time">Part-time</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="internship">Internship</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Minimum Salary"
              type="number"
              value={formData.salary_min || ''}
              onChange={handleInputChange('salary_min')}
              variant="outlined"
              InputProps={{
                startAdornment: '$'
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Maximum Salary"
              type="number"
              value={formData.salary_max || ''}
              onChange={handleInputChange('salary_max')}
              variant="outlined"
              InputProps={{
                startAdornment: '$'
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Experience Required"
              value={formData.experience_required}
              onChange={handleInputChange('experience_required')}
              variant="outlined"
              placeholder="e.g., 3-5 years"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.remote_allowed}
                  onChange={handleSwitchChange('remote_allowed')}
                  color="primary"
                />
              }
              label="Remote Allowed"
            />
          </Grid>
          
          {/* Skills */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Skills & Requirements
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={skillOptions}
              freeSolo
              value={formData.required_skills}
              onChange={handleSkillsChange('required_skills')}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    color="error"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Required Skills"
                  placeholder="Add required skills"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={skillOptions}
              freeSolo
              value={formData.preferred_skills}
              onChange={handleSkillsChange('preferred_skills')}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    color="warning"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Preferred Skills"
                  placeholder="Add preferred skills"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={['engineering', 'remote', 'senior', 'junior', 'urgent']}
              freeSolo
              value={formData.tags}
              onChange={handleSkillsChange('tags')}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="filled"
                    label={option}
                    {...getTagProps({ index })}
                    color="primary"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Add tags for categorization"
                />
              )}
            />
          </Grid>
          
          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ minWidth: 120 }}
              >
                {isLoading ? 'Saving...' : initialData ? 'Update Job' : 'Create Job'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default JobForm;