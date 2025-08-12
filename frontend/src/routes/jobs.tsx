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
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { createFileRoute } from '@tanstack/react-router';

import DataTable, { Column, Action } from '../modules/core-data/components/DataTable';
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
  }
];

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState(mockJobs);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

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
            {row.department}
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
          {row.remote_allowed && (
            <Chip label="Remote OK" size="small" color="success" variant="outlined" />
          )}
        </Box>
      )
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value) => {
        const colors = {
          draft: 'default',
          published: 'success',
          closed: 'error',
          archived: 'warning'
        } as const;
        return (
          <Chip
            label={value.charAt(0).toUpperCase() + value.slice(1)}
            color={colors[value as keyof typeof colors] || 'default'}
            size="small"
          />
        );
      }
    },
    {
      id: 'priority',
      label: 'Priority',
      minWidth: 100,
      format: (value) => {
        const colors = {
          low: 'info',
          medium: 'warning',
          high: 'error',
          urgent: 'error'
        } as const;
        return (
          <Chip
            label={value.charAt(0).toUpperCase() + value.slice(1)}
            color={colors[value as keyof typeof colors] || 'default'}
            size="small"
            variant={value === 'urgent' ? 'filled' : 'outlined'}
          />
        );
      }
    },
    {
      id: 'required_skills',
      label: 'Skills',
      minWidth: 200
    },
    {
      id: 'salary_range',
      label: 'Salary',
      minWidth: 120,
      format: (_, row) => {
        if (row.salary_min && row.salary_max) {
          return (
            <Typography variant="body2">
              ${row.salary_min.toLocaleString()} - ${row.salary_max.toLocaleString()}
            </Typography>
          );
        }
        return <Typography variant="body2" color="textSecondary">—</Typography>;
      }
    },
    {
      id: 'created_at',
      label: 'Created',
      minWidth: 120,
      format: (value) => new Date(value).toLocaleDateString()
    }
  ];

  // Define table actions
  const actions: Action[] = [
    {
      label: 'View',
      icon: <ViewIcon />,
      onClick: (job) => {
        console.log('View job:', job);
        // Navigate to job detail page
      },
      color: 'primary'
    },
    {
      label: 'Edit',
      icon: <EditIcon />,
      onClick: (job) => {
        setEditingJob(job);
        setDialogOpen(true);
      },
      color: 'primary'
    },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      onClick: (job) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
          setJobs(prev => prev.filter(j => j.id !== job.id));
        }
      },
      color: 'error',
      show: (job) => job.status === 'draft' // Only show delete for draft jobs
    }
  ];

  const handleCreateJob = () => {
    setEditingJob(null);
    setDialogOpen(true);
  };

  const handleJobSubmit = (jobData: any) => {
    if (editingJob) {
      // Update existing job
      setJobs(prev => prev.map(job => 
        job.id === editingJob.id 
          ? { ...job, ...jobData, updated_at: new Date().toISOString() }
          : job
      ));
    } else {
      // Create new job
      const newJob = {
        ...jobData,
        id: String(Date.now()),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setJobs(prev => [newJob, ...prev]);
    }
    setDialogOpen(false);
    setEditingJob(null);
  };

  const handleSearch = (searchTerm: string) => {
    // Implement search functionality
    console.log('Search:', searchTerm);
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    // Implement sorting
    console.log('Sort:', column, direction);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Jobs
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage job postings and track applications
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateJob}
          size="large"
        >
          Create Job
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
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
        
        <Grid item xs={12} sm={6} md={3}>
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
        
        <Grid item xs={12} sm={6} md={3}>
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
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Remote" color="info" size="small" />
                <Box>
                  <Typography variant="h6">
                    {jobs.filter(j => j.remote_allowed).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Remote OK
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Jobs Table */}
      <DataTable
        title="All Jobs"
        columns={columns}
        data={jobs}
        actions={actions}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        total={jobs.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearch={handleSearch}
        onSort={handleSort}
        selectable={true}
        bulkActions={[
          {
            label: 'Delete Selected',
            icon: <DeleteIcon />,
            onClick: (selectedIds) => {
              if (window.confirm(`Delete ${selectedIds.length} jobs?`)) {
                setJobs(prev => prev.filter(job => !selectedIds.includes(job.id)));
              }
            },
            color: 'error'
          }
        ]}
      />

      {/* Create/Edit Job Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingJob ? 'Edit Job' : 'Create New Job'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <JobForm
              initialData={editingJob}
              onSubmit={handleJobSubmit}
              isLoading={loading}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add job"
        onClick={handleCreateJob}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

// Export the route
export const Route = createFileRoute('/jobs')({
  component: JobsPage,
});

export default JobsPage;