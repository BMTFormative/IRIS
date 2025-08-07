// frontend/src/routes/_layout/job-matching.tsx
import React, { useState, useCallback, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Slider,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  Description,
  CheckCircle,
  Error,
  Analytics,
  RocketLaunch,
  Save as SaveIcon,
  Visibility as ViewIcon,
  Work as WorkIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

import { createFileRoute } from "@tanstack/react-router";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Types
interface CVFile {
  id: string;
  name: string;
  size: number;
  content: string;
  type: string;
  status: "uploaded" | "failed";
}

interface AnalysisResult {
  analysis: {
    total_candidates: number;
    qualification_threshold: number;
    screening_date: string;
  };
  candidates: Array<{
    id: string;
    name: string;
    overall_score: number;
    qualified: boolean;
    strengths: string[];
    weaknesses: string[];
    match_summary: string;
  }>;
  summary: {
    qualified_count: number;
    top_candidates: string[];
    recommendations: string;
  };
}

interface SavedSession {
  id: string;
  job_title: string;
  created_at: string;
  total_candidates: number;
  qualified_candidates: number;
  status: string;
}

interface SessionDetails {
  id: string;
  job_title: string;
  job_description: string;
  elimination_conditions?: string;
  qualification_threshold: number;
  created_at: string;
  total_candidates: number;
  qualified_candidates: number;
  status: string;
  candidates: Array<{
    id: string;
    candidate_name?: string;
    email?: string;
    qualification_score?: number;
    is_qualified: boolean;
    rejection_reasons?: string[];
    key_strengths?: string[];
    experience_summary?: string;
    skills_summary?: string;
  }>;
}

export const Route = createFileRoute("/_layout/job-matching")({
  component: JobMatching,
});

function JobMatching() {
  // Main tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Form state
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [mandatoryConditions, setMandatoryConditions] = useState("");
  const [qualificationThreshold, setQualificationThreshold] = useState(85);
  const [uploadedFiles, setUploadedFiles] = useState<CVFile[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Saved results state
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetails | null>(null);
  const [sessionDetailsOpen, setSessionDetailsOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      // Send all files in a single request (backend expects List[UploadFile])
      const formData = new FormData();
      files.forEach(file => {
        formData.append("files", file);  // Use "files" (plural) to match backend
      });

      const response = await axios.post(`${API_BASE_URL}/api/v1/job-matching/upload-cvs`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Transform backend response to frontend format
      if (response.data.success && response.data.files) {
        return response.data.files.map((fileData: any) => ({
          id: fileData.id || Math.random().toString(36).substr(2, 9),
          name: fileData.name,
          size: fileData.size,
          content: fileData.content || "",
          type: fileData.type || "application/octet-stream",
          status: "uploaded" as const,
        }));
      }

      // Fallback if backend doesn't return expected format
      return files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        content: "",
        type: file.type,
        status: "uploaded" as const,
      }));
    },
    onSuccess: (uploadedData) => {
      setUploadedFiles((prev) => [...prev, ...uploadedData]);
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      setError("Failed to upload files. Please try again.");
    },
  });

  // Analysis mutation  
  const analysisMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        job_title: jobTitle,
        job_description: jobDescription,
        elimination_conditions: mandatoryConditions,
        qualification_threshold: qualificationThreshold, // Send as percentage (85 not 0.85)
        cvs: uploadedFiles.map(f => ({
          id: f.id,
          name: f.name,
          content: f.content,
          type: f.type,
          size: f.size
        })),
      };

      const response = await axios.post(`${API_BASE_URL}/api/v1/job-matching/analyze`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Analysis response:", data);
      setAnalysisResult(data);
    },
    onError: (error) => {
      console.error("Analysis failed:", error);
      setError("Analysis failed. Please try again.");
    },
  });

  // File dropzone
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        uploadMutation.mutate(acceptedFiles);
      }
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    multiple: true,
  });

  // Remove file
  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Handle analysis
  const handleAnalysis = () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one CV");
      return;
    }
    setError(null);
    analysisMutation.mutate();
  };

  // Save results
  const saveResults = async () => {
    if (!analysisResult) {
      setError("No results to save");
      return;
    }

    setSaveLoading(true);
    try {
      const saveData = {
        job_title: jobTitle,
        job_description: jobDescription,
        elimination_conditions: mandatoryConditions,
        qualification_threshold: qualificationThreshold / 100,
        candidates: analysisResult.candidates?.map(candidate => ({
          name: candidate.name || `Candidate ${candidate.id}`,
          qualification_score: (candidate.overall_score || 0) / 100,
          is_qualified: candidate.qualified || false,
          key_strengths: candidate.strengths || [],
          rejection_reasons: candidate.qualified ? [] : (candidate.weaknesses || []),
          experience_summary: candidate.match_summary || "No summary available",
        })) || []
      };

      const response = await axios.post(`${API_BASE_URL}/api/v1/job-matching/save-results`, saveData);

      if (response.data.success) {
        setSuccessMessage('Results saved successfully!');
        setTabValue(1); // Switch to saved results tab
        fetchSavedSessions(); // Refresh saved sessions
      }
    } catch (err) {
      setError('Failed to save results');
    } finally {
      setSaveLoading(false);
    }
  };

  // Fetch saved sessions
  const fetchSavedSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/job-matching/saved-sessions`);
      if (response.data.success) {
        setSavedSessions(response.data.sessions);
      }
    } catch (err) {
      console.error('Error fetching saved sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Fetch session details
  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/job-matching/session/${sessionId}`);
      if (response.data.success) {
        setSelectedSession(response.data.data);
        setSessionDetailsOpen(true);
      }
    } catch (err) {
      setError('Failed to load session details');
    }
  };

  // Delete session
  const deleteSession = async (sessionId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/job-matching/session/${sessionId}`);
      setSavedSessions(prev => prev.filter(s => s.id !== sessionId));
      setSuccessMessage('Session deleted successfully');
    } catch (err) {
      setError('Failed to delete session');
    }
  };

  // Load saved sessions when switching to saved results tab
  useEffect(() => {
    if (tabValue === 1) {
      fetchSavedSessions();
    }
  }, [tabValue]);

  // Format date utility
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
          borderRadius: 2,
          p: 4,
          mb: 4,
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          🎯 Job Matching
        </Typography>
        <Chip
          label="IRIS Analysis System"
          sx={{
            mt: 2,
            bgcolor: "rgba(255,255,255,0.2)",
            color: "white",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        />
      </Box>

      {/* Alert Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Main Tabs */}
      <Paper elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: '64px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            }
          }}
          variant="fullWidth"
        >
          <Tab 
            icon={<Analytics />} 
            label="New Analysis" 
            iconPosition="start"
          />
          <Tab 
            icon={<SaveIcon />} 
            label="Saved Results" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          {/* Define Position Section */}
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Description sx={{ mr: 2, color: "primary.main" }} />
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: "#1976D2",
                  position: "relative",
                  display: "inline-block",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -4,
                    left: 0,
                    width: "100%",
                    height: 3,
                    background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                    borderRadius: "2px",
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                    animation: "slideIn 0.8s ease-out 0.2s forwards",
                  },
                  "@keyframes slideIn": {
                    "0%": {
                      transform: "scaleX(0)",
                    },
                    "100%": {
                      transform: "scaleX(1)",
                    },
                  },
                }}
              >
                Define Your Position
              </Typography>
            </Box>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 1,
                fontSize: "1.1rem",
                opacity: 0,
                animation: "fadeIn 0.6s ease-out 0.5s forwards",
                "@keyframes fadeIn": {
                  "0%": {
                    opacity: 0,
                    transform: "translateY(10px)",
                  },
                  "100%": {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
              }}
            >
              Set up your job requirements for IRIS analysis
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 3,
                mt: 3,
              }}
            >
              {/* Job Title */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Job Title *{" "}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    Please like name job like to help IRIS focus on the right candidates
                  </Typography>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Box>

              {/* Job Description */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Job Description *{" "}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    Provide a detailed description of the role and key responsibilities
                  </Typography>
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe the role, key responsibilities, required skills, and ideal candidate profile..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            {/* Mandatory Conditions */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Mandatory (Must Have) Conditions{" "}
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                >
                  List the mandatory requirements and minimum qualifications
                </Typography>
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g. 5+ years of experience, React expertise, Computer Science degree"
                value={mandatoryConditions}
                onChange={(e) => setMandatoryConditions(e.target.value)}
                variant="outlined"
                size="small"
                multiline
                rows={2}
              />
            </Box>

            {/* Qualification Threshold */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Qualification Threshold: {qualificationThreshold}%
              </Typography>
              <Slider
                value={qualificationThreshold}
                onChange={(_, newValue) => setQualificationThreshold(newValue as number)}
                min={50}
                max={95}
                step={5}
                marks
                sx={{
                  color: "#1976D2",
                  "& .MuiSlider-thumb": {
                    backgroundColor: "#1976D2",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Upload Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CloudUpload sx={{ mr: 2, color: "primary.main" }} />
              <Typography variant="h5" sx={{ color: "#1976D2", fontWeight: 600 }}>
                Upload CVs
              </Typography>
            </Box>

            <Box
              {...getRootProps()}
              sx={{
                border: "2px dashed",
                borderColor: isDragActive ? "#1976D2" : "#ccc",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                cursor: "pointer",
                bgcolor: isDragActive ? "rgba(25, 118, 210, 0.1)" : "background.paper",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#1976D2",
                  bgcolor: "rgba(25, 118, 210, 0.05)",
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? "Drop files here..." : "Drag & drop CV files here"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to select files • PDF, DOCX, TXT supported
              </Typography>
            </Box>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Uploaded Files ({uploadedFiles.length})
                </Typography>
                <List>
                  {uploadedFiles.map((file) => (
                    <ListItem key={file.id}>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(1)} KB`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton onClick={() => removeFile(file.id)}>
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          {/* Analysis Button */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleAnalysis}
              disabled={analysisMutation.isPending || uploadMutation.isPending}
              startIcon={<RocketLaunch />}
              sx={{
                background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                px: 4,
                py: 2,
                fontSize: "1.2rem",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(33, 150, 243, 0.4)",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(33, 150, 243, 0.5)",
                },
              }}
            >
              {analysisMutation.isPending ? "Analyzing..." : "Launch IRIS Analysis"}
            </Button>
            {analysisMutation.isPending && (
              <LinearProgress sx={{ mt: 2, maxWidth: 400, mx: "auto" }} />
            )}
          </Box>

          {/* Analysis Results */}
          {analysisResult && (
            <Card sx={{ mt: 4, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ color: "#1976D2", fontWeight: 600 }}>
                    <Analytics sx={{ mr: 1, verticalAlign: "middle" }} />
                    Analysis Results
                  </Typography>
                  
                  <Button
                    variant="contained"
                    onClick={saveResults}
                    disabled={saveLoading}
                    startIcon={<SaveIcon />}
                    sx={{
                      background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                    }}
                  >
                    {saveLoading ? 'Saving...' : 'Save Results'}
                  </Button>
                </Box>

                {/* Summary Statistics */}
                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <Chip
                    label={`Total: ${analysisResult.analysis?.total_candidates || analysisResult.candidates?.length || 0}`}
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                  />
                  <Chip
                    label={`Qualified: ${analysisResult.summary?.qualified_count || analysisResult.candidates?.filter(c => c.qualified).length || 0}`}
                    color="success"
                    sx={{ fontWeight: "bold" }}
                  />
                  <Chip
                    label={`Pass Rate: ${
                      analysisResult.candidates?.length 
                        ? ((analysisResult.candidates.filter(c => c.qualified).length / analysisResult.candidates.length) * 100).toFixed(1)
                        : '0'
                    }%`}
                    color="info"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>

                {/* Candidates */}
                {analysisResult.candidates?.map((candidate) => (
                  <Card key={candidate.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold">
                          {candidate.name}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            Score: {candidate.overall_score}%
                          </Typography>
                          <Chip
                            icon={candidate.qualified ? <CheckCircle /> : <Error />}
                            label={
                              candidate.qualified ? "QUALIFIED" : "NOT QUALIFIED"
                            }
                            color={candidate.qualified ? "success" : "error"}
                            size="small"
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" gutterBottom>
                        {candidate.match_summary}
                      </Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 2,
                          mt: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="success.main"
                          >
                            Strengths:
                          </Typography>
                          <ul style={{ margin: "4px 0", paddingLeft: "16px" }}>
                            {candidate.strengths?.map((strength, i) => (
                              <li key={i}>
                                <Typography variant="caption">
                                  {strength}
                                </Typography>
                              </li>
                            )) || <li><Typography variant="caption">None listed</Typography></li>}
                          </ul>
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="error.main"
                          >
                            Areas for Improvement:
                          </Typography>
                          <ul style={{ margin: "4px 0", paddingLeft: "16px" }}>
                            {candidate.weaknesses?.map((weakness, i) => (
                              <li key={i}>
                                <Typography variant="caption">
                                  {weakness}
                                </Typography>
                              </li>
                            )) || <li><Typography variant="caption">None listed</Typography></li>}
                          </ul>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                {/* Recommendations */}
                {analysisResult.summary?.recommendations && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      IRIS Recommendations:
                    </Typography>
                    <Typography variant="body2">
                      {analysisResult.summary.recommendations}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Paper>
      )}

      {/* Saved Results Tab */}
      {tabValue === 1 && (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ color: "#1976D2", fontWeight: 600, mb: 3 }}>
            📊 Saved Job Matching Results
          </Typography>

          {loadingSessions ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <LinearProgress sx={{ width: '100%', maxWidth: 300 }} />
            </Box>
          ) : savedSessions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Saved Results Yet
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your completed analyses will appear here for future reference.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {savedSessions.map((session) => (
                <Grid item xs={12} md={6} lg={4} key={session.id}>
                  <Card 
                    sx={{
                      height: '100%',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      border: '1px solid',
                      borderColor: 'primary.light',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(33, 150, 243, 0.15)',
                        borderColor: 'primary.main',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <WorkIcon sx={{ color: 'primary.main', mr: 1, mt: 0.5 }} />
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            lineHeight: 1.3,
                            flexGrow: 1,
                            color: '#1976D2'
                          }}
                        >
                          {session.job_title}
                        </Typography>
                      </Box>

                      <Stack spacing={2} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimeIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(session.created_at)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {session.total_candidates} Total
                            </Typography>
                          </Box>
                          <Chip
                            label={`${session.qualified_candidates} Qualified`}
                            color={session.qualified_candidates > 0 ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>
                      </Stack>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => fetchSessionDetails(session.id)}
                          sx={{ 
                            flexGrow: 1,
                            background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                          }}
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
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* Session Details Dialog */}
      <Dialog
        open={sessionDetailsOpen}
        onClose={() => setSessionDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: '90vh' }
        }}
      >
        {selectedSession && (
          <>
            <DialogTitle>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {selectedSession.job_title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analysis completed on {formatDate(selectedSession.created_at)}
              </Typography>
            </DialogTitle>

            <DialogContent dividers>
              {/* Job Description */}
              <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Job Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedSession.job_description}
                  </Typography>
                </CardContent>
              </Card>

              {/* Candidates Results */}
              <Typography variant="h6" gutterBottom color="primary.main">
                Candidates ({selectedSession.candidates.length})
              </Typography>
              
              <Grid container spacing={2}>
                {selectedSession.candidates.map((candidate, index) => (
                  <Grid item xs={12} md={6} key={candidate.id}>
                    <Card 
                      variant="outlined"
                      sx={{
                        border: '2px solid',
                        borderColor: candidate.is_qualified ? 'success.light' : 'error.light',
                        borderRadius: 2,
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {candidate.is_qualified ? (
                            <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                          ) : (
                            <Error sx={{ color: 'error.main', mr: 1 }} />
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
                            sx={{ mb: 2, fontWeight: 'bold' }}
                          />
                        )}

                        {candidate.email && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            📧 {candidate.email}
                          </Typography>
                        )}

                        {candidate.key_strengths && candidate.key_strengths.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                              Key Strengths:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {candidate.key_strengths.slice(0, 3).map((strength, idx) => (
                                <Chip
                                  key={idx}
                                  label={strength}
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {candidate.rejection_reasons && candidate.rejection_reasons.length > 0 && (
                          <Box>
                            <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                              Concerns:
                            </Typography>
                            <List dense sx={{ mt: 0.5 }}>
                              {candidate.rejection_reasons.slice(0, 2).map((reason, idx) => (
                                <ListItem key={idx} sx={{ py: 0, pl: 0 }}>
                                  <Typography variant="caption">
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
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setSessionDetailsOpen(false)} 
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default JobMatching;