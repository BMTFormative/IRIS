// frontend/src/modules/core-data/components/CandidateForm.tsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Chip,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

interface CandidateFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  current_title: string;
  current_company: string;
  location: string;
  linkedin_url: string;
  portfolio_url: string;
  years_experience?: number;
  skills: string[];
  emails: string[];
  phones: string[];
  source: string;
  tags: string[];
  notes: string;
}

interface CandidateFormProps {
  initialData?: Partial<CandidateFormData>;
  onSubmit: (data: CandidateFormData) => void;
  isLoading?: boolean;
}

const CandidateForm: React.FC<CandidateFormProps> = ({ 
  initialData, 
  onSubmit, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<CandidateFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    current_title: '',
    current_company: '',
    location: '',
    linkedin_url: '',
    portfolio_url: '',
    skills: [],
    emails: [],
    phones: [],
    source: 'manual',
    tags: [],
    notes: '',
    ...initialData
  });

  const handleInputChange = (field: keyof CandidateFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.type === 'number' ? Number(event.target.value) : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof CandidateFormData) => (
    event: SelectChangeEvent<string>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleArrayChange = (field: 'skills' | 'emails' | 'phones' | 'tags') => (
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
    'AWS', 'Git', 'TypeScript', 'Node.js', 'MongoDB', 'Redis', 'Java',
    'C++', 'Go', 'Kubernetes', 'Machine Learning', 'Data Science',
    'Product Management', 'UI/UX Design', 'DevOps', 'Agile', 'Scrum'
  ];

  const sourceOptions = [
    'manual', 'linkedin', 'referral', 'website', 'recruiter', 'job_board',
    'networking', 'career_fair', 'social_media', 'other'
  ];

  const tagOptions = [
    'senior', 'junior', 'mid-level', 'remote', 'local', 'available',
    'interview-ready', 'actively-looking', 'passive', 'high-priority'
  ];

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? 'Edit Candidate' : 'Add New Candidate'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Personal Information
            </Typography>
          </Grid>
          
          <Grid size={{xs: 12, md: 6}}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.first_name}
              onChange={handleInputChange('first_name')}
              required
              variant="outlined"
            />
          </Grid>
          
          <Grid size={{xs: 12, md: 6}}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.last_name}
              onChange={handleInputChange('last_name')}
              required
              variant="outlined"
            />
          </Grid>
          
          <Grid size={{xs: 12, md: 6}}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
              variant="outlined"
            />
          </Grid>
          
          <Grid size={{xs: 12, md: 6}}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              variant="outlined"
              placeholder="+1-555-123-4567"
            />
          </Grid>
          
          <Grid size={12}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={handleInputChange('location')}
              variant="outlined"
              placeholder="San Francisco, CA"
            />
          </Grid>
          
          {/* Professional Information */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Professional Information
            </Typography>
          </Grid>
          
          <Grid size={{xs: 12, md: 6}}>
            <TextField
              fullWidth
              label="Current Title"
              value={formData.current_title}
              onChange={handleInputChange('current_title')}
              variant="outlined"
            />
          </Grid>
          
          <Grid size={{xs: 12, md: 6}}>
            <TextField
              fullWidth
              label="Current Company"
              value={formData.current_company}
              onChange={handleInputChange('current_company')}
              variant="outlined"
            />
          </Grid>
          
          <Grid size={{xs: 12, md: 6}}>
            <TextField
              fullWidth
              label="Years of Experience"
              type="number"
              value={formData.years_experience || ''}
              onChange={handleInputChange('years_experience')}
              variant="outlined"
              inputProps={{ min: 0, max: 50 }}
            />
          </Grid>
          
          <Grid size={{xs: 12, md: 6}}>
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={formData.source}
                label="Source"
                onChange={handleSelectChange('source')}
              >
                {sourceOptions.map((source) => (
                  <MenuItem key={source} value={source}>
                    {source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Links & Social */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Links & Social
            </Typography>
          </Grid>
          
          <Grid size={{xs: 12, md: 6}}>
            <TextField
              fullWidth
              label="LinkedIn URL"
              value={formData.linkedin_url}
              onChange={handleInputChange('linkedin_url')}
              variant="outlined"
              placeholder="https://linkedin.com/in/username"
            />
          </Grid>
          
          <Grid size={{xs: 12, md: 6}}>
            <TextField
              fullWidth
              label="Portfolio URL"
              value={formData.portfolio_url}
              onChange={handleInputChange('portfolio_url')}
              variant="outlined"
              placeholder="https://portfolio.com"
            />
          </Grid>
          
          {/* Skills & Tags */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Skills & Tags
            </Typography>
          </Grid>
          
          <Grid size={12}>
            <Autocomplete
              multiple
              options={skillOptions}
              freeSolo
              value={formData.skills}
              onChange={handleArrayChange('skills')}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    color="primary"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Skills"
                  placeholder="Select or type skills..."
                />
              )}
            />
          </Grid>
          
          <Grid size={12}>
            <Autocomplete
              multiple
              options={tagOptions}
              freeSolo
              value={formData.tags}
              onChange={handleArrayChange('tags')}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="filled"
                    label={option}
                    {...getTagProps({ index })}
                    color="secondary"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Add tags..."
                />
              )}
            />
          </Grid>
          
          {/* Additional Information */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Additional Information
            </Typography>
          </Grid>
          
          <Grid size={12}>
            <Autocomplete
              multiple
              freeSolo
              value={formData.emails}
              onChange={handleArrayChange('emails')}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    color="info"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Additional Emails"
                  placeholder="Add additional email addresses..."
                />
              )}
              options={[]}
            />
          </Grid>
          
          <Grid size={12}>
            <Autocomplete
              multiple
              freeSolo
              value={formData.phones}
              onChange={handleArrayChange('phones')}
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
                  label="Additional Phones"
                  placeholder="Add additional phone numbers..."
                />
              )}
              options={[]}
            />
          </Grid>
          
          <Grid size={12}>
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={handleInputChange('notes')}
              multiline
              rows={4}
              variant="outlined"
              placeholder="Add any additional notes about the candidate..."
            />
          </Grid>
          
          {/* Submit Button */}
          <Grid size={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
              <Button variant="outlined" color="secondary">
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (initialData ? 'Update Candidate' : 'Add Candidate')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CandidateForm;