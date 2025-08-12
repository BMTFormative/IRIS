// frontend/src/routes/core-data.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Card,
  CardContent,
  Grid,
  Container,
  Tab,
  Tabs,
  Paper,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { createFileRoute } from '@tanstack/react-router';

import MUIDataTable, { Column, Action } from '../../modules/core-data/components/MUIDataTable';
import JobForm from '../../modules/core-data/components/JobForm';
import CandidateForm from '../../modules/core-data/components/CandidateForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`core-data-tabpanel-${index}`}
      aria-labelledby={`core-data-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CoreDataPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'job' | 'candidate'>('job');
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const openDialog = (type: 'job' | 'candidate', item?: any) => {
    setDialogType(type);
    setEditingItem(item || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (data: any) => {
    console.log(`${dialogType} data:`, data);
    // Handle form submission here
    setDialogOpen(false);
    setEditingItem(null);
  };

  // Mock data with proper id fields
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
      created_at: '2025-01-09T14:30:00Z'
    }
  ];

  const mockCandidates = [
    {
      id: '1',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@email.com',
      current_title: 'Senior Developer',
      current_company: 'Tech Corp',
      location: 'San Francisco, CA',
      skills: ['Python', 'React', 'AWS'],
      source: 'linkedin',
      created_at: '2025-01-08T09:00:00Z'
    },
    {
      id: '2',
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane.doe@email.com',
      current_title: 'Product Manager',
      current_company: 'Startup Inc',
      location: 'New York, NY',
      skills: ['Product Management', 'Analytics', 'Agile'],
      source: 'referral',
      created_at: '2025-01-07T15:30:00Z'
    }
  ];

  // Table columns for jobs
  const jobColumns: Column[] = [
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
      minWidth: 100,
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
    }
  ];

  // Table columns for candidates
  const candidateColumns: Column[] = [
    {
      id: 'first_name',
      label: 'Name',
      minWidth: 150,
      format: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {`${value} ${row?.last_name || ''}`}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {row?.email}
          </Typography>
        </Box>
      )
    },
    {
      id: 'current_title',
      label: 'Current Role',
      minWidth: 180,
      format: (value, row) => (
        <Box>
          <Typography variant="body2">{value}</Typography>
          <Typography variant="caption" color="textSecondary">
            {row?.current_company}
          </Typography>
        </Box>
      )
    },
    {
      id: 'location',
      label: 'Location',
      minWidth: 150,
    },
    {
      id: 'skills',
      label: 'Skills',
      minWidth: 200,
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
      id: 'source',
      label: 'Source',
      minWidth: 100,
      format: (value) => (
        <Chip 
          label={value} 
          size="small"
          color={value === 'linkedin' ? 'primary' : value === 'referral' ? 'success' : 'default'}
          variant="outlined"
        />
      )
    }
  ];

  const jobActions: Action[] = [
    {
      icon: <ViewIcon />,
      label: 'View',
      onClick: (row) => console.log('View job:', row)
    },
    {
      icon: <EditIcon />,
      label: 'Edit',
      onClick: (row) => openDialog('job', row)
    },
    {
      icon: <DeleteIcon />,
      label: 'Delete',
      onClick: (row) => console.log('Delete job:', row),
      color: 'error'
    }
  ];

  const candidateActions: Action[] = [
    {
      icon: <ViewIcon />,
      label: 'View',
      onClick: (row) => console.log('View candidate:', row)
    },
    {
      icon: <EditIcon />,
      label: 'Edit',
      onClick: (row) => openDialog('candidate', row)
    },
    {
      icon: <DeleteIcon />,
      label: 'Delete',
      onClick: (row) => console.log('Delete candidate:', row),
      color: 'error'
    }
  ];

  const handleDeleteJobs = (selectedIds: string[]) => {
    console.log('Delete jobs:', selectedIds);
    // Implement delete logic here
  };

  const handleDeleteCandidates = (selectedIds: string[]) => {
    console.log('Delete candidates:', selectedIds);
    // Implement delete logic here
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
          Core Data Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontSize: '1.1rem' }}>
          Manage jobs, candidates, applications, and core ATS entities
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mt: 3, mb: 4 }}>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon color="primary" />
                  <Box>
                    <Typography variant="h6">{mockJobs.length}</Typography>
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
                  <PersonIcon color="secondary" />
                  <Box>
                    <Typography variant="h6">{mockCandidates.length}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Candidates
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
                  <AssignmentIcon color="success" />
                  <Box>
                    <Typography variant="h6">0</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Applications
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
                  <BusinessIcon color="info" />
                  <Box>
                    <Typography variant="h6">0</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Companies
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Data Management Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="core data tabs">
              <Tab 
                label="Jobs" 
                icon={<WorkIcon />} 
                iconPosition="start"
                id="core-data-tab-0"
                aria-controls="core-data-tabpanel-0"
              />
              <Tab 
                label="Candidates" 
                icon={<PersonIcon />} 
                iconPosition="start"
                id="core-data-tab-1"
                aria-controls="core-data-tabpanel-1"
              />
              <Tab 
                label="Applications" 
                icon={<AssignmentIcon />} 
                iconPosition="start"
                id="core-data-tab-2"
                aria-controls="core-data-tabpanel-2"
                disabled
              />
              <Tab 
                label="Companies" 
                icon={<BusinessIcon />} 
                iconPosition="start"
                id="core-data-tab-3"
                aria-controls="core-data-tabpanel-3"
                disabled
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Jobs Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openDialog('job')}
                sx={{
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                }}
              >
                Add New Job
              </Button>
            </Box>
            <MUIDataTable
              title="Jobs"
              columns={jobColumns}
              rows={mockJobs}
              actions={jobActions}
              loading={false}
              onDelete={handleDeleteJobs}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Candidates Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openDialog('candidate')}
                sx={{
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                }}
              >
                Add New Candidate
              </Button>
            </Box>
            <MUIDataTable
              title="Candidates"
              columns={candidateColumns}
              rows={mockCandidates}
              actions={candidateActions}
              loading={false}
              onDelete={handleDeleteCandidates}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" color="textSecondary">
              Applications module coming soon...
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" color="textSecondary">
              Companies module coming soon...
            </Typography>
          </TabPanel>
        </Paper>

        {/* Form Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingItem 
              ? `Edit ${dialogType === 'job' ? 'Job' : 'Candidate'}` 
              : `Create New ${dialogType === 'job' ? 'Job' : 'Candidate'}`
            }
          </DialogTitle>
          <DialogContent>
            {dialogType === 'job' ? (
              <JobForm
                initialData={editingItem}
                onSubmit={handleSubmit}
                isLoading={false}
              />
            ) : (
              <CandidateForm
                initialData={editingItem}
                onSubmit={handleSubmit}
                isLoading={false}
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
};

export const Route = createFileRoute('/_layout/core-data')({
  component: CoreDataPage,
});

export default CoreDataPage;