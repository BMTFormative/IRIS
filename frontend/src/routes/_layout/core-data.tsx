// frontend/src/routes/core-data.tsx
import React, { useState, useEffect } from 'react';
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
import { jobApi, candidateApi } from '@/services/api';

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
  // Data state
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingData(true);
        const jobRes = await jobApi.getJobs({ skip: 0, limit: 100 });
        setJobs(jobRes.jobs);
        const candRes = await candidateApi.getCandidates({ skip: 0, limit: 100 });
        setCandidates(candRes.candidates);
      } catch (error) {
        console.error('Error loading core-data:', error);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);
 

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

  const handleSubmit = async (data: any) => {
    try {
      if (dialogType === 'job') {
        if (editingItem) {
          const updated = await jobApi.updateJob(editingItem.id, data);
          setJobs(jobs.map(job => (job.id === updated.id ? updated : job)));
        } else {
          const created = await jobApi.createJob(data);
          setJobs([...jobs, created]);
        }
      } else {
        if (editingItem) {
          const updated = await candidateApi.updateCandidate(editingItem.id, data);
          setCandidates(candidates.map(c => (c.id === updated.id ? updated : c)));
        } else {
          const created = await candidateApi.createCandidate(data);
          setCandidates([...candidates, created]);
        }
      }
    } catch (error: any) {
      // Log detailed API error if available
      if (error.status === 422 && error.message) {
        console.error('Validation errors:', error.message);
      } else {
        console.error('Submit error:', error);
      }
    } finally {
      setDialogOpen(false);
      setEditingItem(null);
    }
  };


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

  const handleDeleteJobs = async (selectedIds: string[]) => {
    console.log('Delete jobs:', selectedIds);
    try {
      await Promise.all(selectedIds.map(id => jobApi.deleteJob(id)));
      setJobs(prev => prev.filter(job => !selectedIds.includes(job.id)));
    } catch (error) {
      console.error('Delete jobs error:', error);
    }
  };

  const handleDeleteCandidates = async (selectedIds: string[]) => {
    console.log('Delete candidates:', selectedIds);
    try {
      await Promise.all(selectedIds.map(id => candidateApi.deleteCandidate(id)));
      setCandidates(prev => prev.filter(c => !selectedIds.includes(c.id)));
    } catch (error) {
      console.error('Delete candidates error:', error);
    }
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
                    <Typography variant="h6">{jobs.length}</Typography>
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
                    <Typography variant="h6">{candidates.length}</Typography>
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
              rows={jobs}
              actions={jobActions}
              loading={loadingData}
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
              rows={candidates}
              actions={candidateActions}
              loading={loadingData}
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
                onCancel={handleCloseDialog}
              />
            ) : (
              <CandidateForm
                initialData={editingItem}
                onSubmit={handleSubmit}
                isLoading={false}
                onCancel={handleCloseDialog}
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