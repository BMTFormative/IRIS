// frontend/src/routes/jobs.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Fab,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { createFileRoute } from '@tanstack/react-router';

import MUIDataTable, { Column, Action } from '../modules/core-data/components/MUIDataTable';
import JobForm from '../modules/core-data/components/JobForm';

// Mock data - replace with actual API calls
const mockJobs = [
  {
    id: '1',
    title: 'Senior Python Developer',
    job_number: 'ENG-2025-001',
    location: 'San Francisco, CA',
    department: 'Engineering',
    status: 'published',
    priority: 'high',
    employment_type: 'full-time',
    remote_allowed: true,
    required_skills: ['Python', 'FastAPI', 'PostgreSQL'],
    preferred_skills: ['React', 'Docker'],
    tags: ['engineering', 'senior', 'remote'],
    salary_min: 120000,
    salary_max: 180000,
    created_at: '2025-01-10T10:00:00Z'
  },
  {
    id: '2',
    title: 'Frontend React Developer',
    job_number: 'ENG-2025-002',
    location: 'New York, NY',
    department: 'Engineering',
    status: 'draft',
    priority: 'medium',
    employment_type: 'full-time',
    remote_allowed: false,
    required_skills: ['React', 'TypeScript', 'JavaScript'],
    preferred_skills: ['Material-UI', 'Node.js'],
    tags: ['engineering', 'frontend'],
    salary_min: 90000,
    salary_max: 140000,
    created_at: '2025-01-09T14:30:00Z'
  },
  {
    id: '3',
    title: 'Product Manager',
    job_number: 'PM-2025-001',
    location: 'Remote',
    department: 'Product',
    status: 'published',
    priority: 'high',
    employment_type: 'full-time',
    remote_allowed: true,
    required_skills: ['Product Management', 'Analytics', 'Agile'],
    preferred_skills: ['SQL', 'A/B Testing'],
    tags: ['product', 'senior', 'remote'],
    salary_min: 110000,
    salary_max: 160000,
    created_at: '2025-01-08T16:00:00Z'
  }
];

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState(mockJobs);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  // Define table columns
  const columns: Column[] = [
    {
      id: 'job_number',
      label: 'Job #',
      minWidth: 120,
      format: (value) => (
        <Typography variant="body2" fontFamily="monospace" color="primary">
          {value}
        </Typography>
      )
    },
    {
      id: 'title',
      label: 'Title',
      minWidth: 200,
      format: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {row?.department}
          </Typography>
        </Box>
      )
    },
    {
      id: 'location',
      label: 'Location',
      minWidth: 150,
      format: (value, row) => (
        <Box>
          <Typography variant="body2">{value}</Typography>
          {row?.remote_allowed && (
            <Chip label="Remote OK" size="small" color="success" variant="outlined" />
          )}
        </Box>
      )
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => (
        <Chip 
          label={value} 
          size="small"
          color={value === 'published' ? 'success' : value === 'draft' ? 'warning' : 'default'}
          variant="filled"
        />
      )
    },
    {
      id: 'priority',
      label: 'Priority',
      minWidth: 100,
      format: (value) => (
        <Chip 
          label={value} 
          size="small"
          color={value === 'high' ? 'error' : value === 'medium' ? 'warning' : 'info'}
          variant="outlined"
        />
      )
    },
    {
      id: 'required_skills',
      label: 'Skills',
      minWidth: 250,
      format: (value) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {value?.slice(0, 3)?.map((skill: string) => (
            <Chip key={skill} label={skill} size="small" variant="outlined" />
          ))}
          {value?.length > 3 && (
            <Chip label={`+${value.length - 3}`} size="small" variant="outlined" />
          )}
        </Box>
      )
    },
    {
      id: 'salary_range',
      label: 'Salary',
      minWidth: 150,
      format: (value, row) => {
        if (row?.salary_min && row?.salary_max) {
          return (
            <Typography variant="body2" color="success.main">
              ${(row.salary_min / 1000).toFixed(0)}k - ${(row.salary_max / 1000).toFixed(0)}k
            </Typography>
          );
        }
        return <Typography variant="body2" color="textSecondary">Not specified</Typography>;
      }
    }
  ];

  // Define table actions
  const actions: Action[] = [
    {
      icon: <ViewIcon />,
      label: 'View',
      onClick: (row) => console.log('View job:', row)
    },
    {
      icon: <EditIcon />,
      label: 'Edit',
      onClick: (row) => {
        setEditingJob(row);
        setDialogOpen(true);
      }
    },
    {
      icon: <DeleteIcon />,
      label: 'Delete',
      onClick: (row) => console.log('Delete job:', row),
      color: 'error'
    }
  ];

  const handleSubmit = (data: any) => {
    console.log('Job data:', data);
    if (editingJob) {
      // Update existing job
      setJobs(jobs.map(job => job.id === editingJob.id ? { ...job, ...data } : job));
    } else {
      // Add new job
      const newJob = {
        ...data,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      setJobs([...jobs, newJob]);
    }
    setDialogOpen(false);
    setEditingJob(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingJob(null);
  };

  const handleDeleteJobs = (selectedIds: string[]) => {
    console.log('Delete jobs:', selectedIds);
    setJobs(jobs.filter(job => !selectedIds.includes(job.id)));
  };

  return (
    <Container maxWidth="xl">
      <Box pt={8} mb={4}>
        {/* Page Header */}
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 700,
            color: '#1976D2',
            position: 'relative',
            display: 'inline-block',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -4,
              left: 0,
              width: '100%',
              height: 3,
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              borderRadius: '2px',
            },
          }}
        >
          Jobs Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontSize: '1.1rem' }}>
          Manage job postings and track applications
        </Typography>

        {/* Statistics Cards - Updated Grid syntax */}
        <Grid container spacing={3} sx={{ mt: 3, mb: 4 }}>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon color="primary" />
                  <Box>
                    <Typography variant="h6">
                      {jobs.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Jobs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Published" color="success" size="small" />
                  <Box>
                    <Typography variant="h6">
                      {jobs.filter(j => j.status === 'published').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Published
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Draft" color="default" size="small" />
                  <Box>
                    <Typography variant="h6">
                      {jobs.filter(j => j.status === 'draft').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Drafts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="High Priority" color="error" size="small" />
                  <Box>
                    <Typography variant="h6">
                      {jobs.filter(j => j.priority === 'high').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      High Priority
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Add Job Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Job Listings
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Add New Job
          </Button>
        </Box>

        {/* Jobs Table - Using Official MUI Table */}
        <MUIDataTable
          title="Jobs"
          columns={columns}
          rows={jobs}
          actions={actions}
          loading={loading}
          onDelete={handleDeleteJobs}
        />

        {/* Job Form Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingJob ? 'Edit Job' : 'Create New Job'}
          </DialogTitle>
          <DialogContent>
            <JobForm
              initialData={editingJob}
              onSubmit={handleSubmit}
              isLoading={loading}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
};

export const Route = createFileRoute('/jobs')({
  component: JobsPage,
});

export default JobsPage;