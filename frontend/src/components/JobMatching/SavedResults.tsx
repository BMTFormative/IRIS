import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Paper,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { jobMatchingTheme } from '../../theme/jobMatchingTheme';

interface SavedSession {
  id: string;
  job_title: string;
  created_at: string;
  total_candidates: number;
  qualified_candidates: number;
  status: string;
}

interface CandidateResult {
  id: string;
  candidate_name?: string;
  email?: string;
  qualification_score?: number;
  is_qualified: boolean;
  rejection_reasons?: string[];
  key_strengths?: string[];
  experience_summary?: string;
  skills_summary?: string;
  interview_questions?: string[];
}

interface SessionDetails {
  session: {
    id: string;
    job_title: string;
    job_description: string;
    elimination_conditions?: string;
    qualification_threshold: number;
    created_at: string;
    total_candidates: number;
    qualified_candidates: number;
  };
  candidates: CandidateResult[];
}

const SavedResults: React.FC = () => {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedSessions();
  }, []);

  const fetchSavedSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/job-matching/saved-sessions');
      const data = await response.json();
      
      if (data.success) {
        setSavedSessions(data.sessions);
      } else {
        setError('Failed to load saved sessions');
      }
    } catch (err) {
      setError('Error fetching saved sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/v1/job-matching/session/${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedSession(data.data);
        setDetailsOpen(true);
      } else {
        setError('Failed to load session details');
      }
    } catch (err) {
      setError('Error fetching session details');
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/v1/job-matching/session/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSavedSessions(prev => prev.filter(session => session.id !== sessionId));
      } else {
        setError('Failed to delete session');
      }
    } catch (err) {
      setError('Error deleting session');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={jobMatchingTheme}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
          📊 Saved Job Matching Results
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {savedSessions.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: 'background.paper',
              border: '2px dashed',
              borderColor: 'primary.light',
              borderRadius: 3,
            }}
          >
            <WorkIcon sx={{ fontSize: 64, color: 'primary.light', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Saved Results Yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your completed job matching analyses will appear here for future reference.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {savedSessions.map((session) => (
              <Grid item xs={12} md={6} lg={4} key={session.id}>
                <Card 
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="flex-start" mb={2}>
                      <WorkIcon sx={{ color: 'primary.main', mr: 1, mt: 0.5 }} />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          lineHeight: 1.3,
                          flexGrow: 1,
                          color: 'text.primary',
                        }}
                      >
                        {session.job_title}
                      </Typography>
                    </Box>

                    <Stack spacing={2} mb={3}>
                      <Box display="flex" alignItems="center">
                        <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(session.created_at)}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                          <PersonIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {session.total_candidates} Total
                          </Typography>
                        </Box>
                        <Chip
                          label={`${session.qualified_candidates} Qualified`}
                          color={session.qualified_candidates > 0 ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    </Stack>

                    <Box display="flex" gap={1}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => fetchSessionDetails(session.id)}
                        sx={{ flexGrow: 1 }}
                      >
                        View Details
                      </Button>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => deleteSession(session.id)}
                        sx={{ 
                          border: '1px solid',
                          borderColor: 'error.main',
                          borderRadius: 2,
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Session Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, maxHeight: '90vh' }
          }}
        >
          {selectedSession && (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {selectedSession.session.job_title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analysis completed on {formatDate(selectedSession.session.created_at)}
                </Typography>
              </DialogTitle>

              <DialogContent dividers sx={{ p: 0 }}>
                <Box sx={{ p: 3 }}>
                  {/* Job Description */}
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary.main">
                        Job Description
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedSession.session.job_description}
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Candidates Results */}
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Candidate Results ({selectedSession.candidates.length})
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {selectedSession.candidates.map((candidate, index) => (
                      <Grid item xs={12} md={6} key={candidate.id}>
                        <Card 
                          variant="outlined"
                          sx={{
                            border: candidate.is_qualified 
                              ? '2px solid' 
                              : '1px solid',
                            borderColor: candidate.is_qualified 
                              ? 'success.main' 
                              : 'divider',
                          }}
                        >
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                              {candidate.is_qualified ? (
                                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                              ) : (
                                <CancelIcon sx={{ color: 'error.main', mr: 1 }} />
                              )}
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {candidate.candidate_name || `Candidate ${index + 1}`}
                              </Typography>
                            </Box>

                            {candidate.qualification_score && (
                              <Chip
                                label={`Score: ${(candidate.qualification_score * 100).toFixed(1)}%`}
                                color={candidate.is_qualified ? 'success' : 'error'}
                                size="small"
                                sx={{ mb: 2 }}
                              />
                            )}

                            {candidate.email && (
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                📧 {candidate.email}
                              </Typography>
                            )}

                            {candidate.key_strengths && candidate.key_strengths.length > 0 && (
                              <Box mb={1}>
                                <Typography variant="caption" color="text.secondary">
                                  Key Strengths:
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                                  {candidate.key_strengths.slice(0, 3).map((strength, idx) => (
                                    <Chip
                                      key={idx}
                                      label={strength}
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}

                            {candidate.rejection_reasons && candidate.rejection_reasons.length > 0 && (
                              <Box>
                                <Typography variant="caption" color="error.main">
                                  Rejection Reasons:
                                </Typography>
                                <List dense>
                                  {candidate.rejection_reasons.slice(0, 2).map((reason, idx) => (
                                    <ListItem key={idx} sx={{ py: 0, pl: 0 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        • {reason}
                                      </Typography>
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </DialogContent>

              <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setDetailsOpen(false)} variant="outlined">
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default SavedResults;