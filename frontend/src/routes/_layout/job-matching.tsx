// frontend/src/routes/_layout/job-matching.tsx
import React, { useState, useCallback } from "react";
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
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  Description,
  CheckCircle,
  Error,
  Analytics,
  RocketLaunch,
} from "@mui/icons-material";

import { createFileRoute } from "@tanstack/react-router";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

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

export const Route = createFileRoute("/_layout/job-matching")({
  component: JobMatching,
});

function JobMatching() {
  // Form state
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [mandatoryConditions, setMandatoryConditions] = useState("");
  const [qualificationThreshold, setQualificationThreshold] = useState(85);
  const [uploadedFiles, setUploadedFiles] = useState<CVFile[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/job-matching/upload-cvs`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setUploadedFiles(data.files);
    },
  });

  // Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/job-matching/analyze`,
        {
          job_title: jobTitle,
          job_description: jobDescription,
          cvs: uploadedFiles.map((file) => ({
            id: file.id,
            name: file.name,
            content: file.content,
          })),
          qualification_threshold: qualificationThreshold,
          elimination_conditions: mandatoryConditions || null,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setAnalysisResult(data.analysis);
    },
  });

  // Dropzone configuration
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      uploadMutation.mutate(acceptedFiles);
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    multiple: true,
  });

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles((files) => files.filter((f) => f.id !== fileId));
  };

  const handleAnalysis = () => {
    if (!jobTitle.trim()) {
      alert("Please enter a job title");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please enter a job description");
      return;
    }
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one CV");
      return;
    }
    analysisMutation.mutate();
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
          label="Start Matching Mode Active"
          sx={{
            mt: 2,
            bgcolor: "rgba(255,255,255,0.2)",
            color: "white",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        />
      </Box>

      {/* Main Content */}
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
                  background:
                    "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
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
                  Please like name job like to help IRIS focus on the right
                  candidates
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
                  Provide a detailed description of the role and key
                  responsibilities
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
              placeholder="e.g. PMP certification, 5+ years in Java development"
              value={mandatoryConditions}
              onChange={(e) => setMandatoryConditions(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Box>

          {/* Qualification Threshold */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Qualification Threshold (%)
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              gutterBottom
            >
              Set the minimum score to mark candidates as qualified
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Typography variant="body2" sx={{ minWidth: "120px" }}>
                Minimum score to mark candidates as qualified
              </Typography>
              <Box sx={{ flex: 1, mx: 3 }}>
                <Slider
                  value={qualificationThreshold}
                  onChange={(_, value) =>
                    setQualificationThreshold(value as number)
                  }
                  aria-labelledby="qualification-threshold-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={0}
                  max={100}
                  sx={{
                    "& .MuiSlider-thumb": {
                      bgcolor: "primary.main",
                    },
                    "& .MuiSlider-track": {
                      bgcolor: "primary.main",
                    },
                  }}
                />
              </Box>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {qualificationThreshold}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Upload CVs Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <CloudUpload sx={{ mr: 2, color: "primary.main" }} />
            <Typography variant="h5" fontWeight="bold">
              Upload Candidate CVs
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Drag & drop or select CV files for IRIS analysis
          </Typography>

          {/* Dropzone */}
          <Box
            {...getRootProps()}
            sx={{
              border: "2px dashed",
              borderColor: isDragActive ? "primary.main" : "grey.300",
              borderRadius: 2,
              p: 6,
              textAlign: "center",
              bgcolor: isDragActive ? "action.hover" : "background.paper",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drop CV Files Here
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or click to browse and select files
            </Typography>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              sx={{ mt: 2 }}
              disabled={uploadMutation.isPending}
            >
              Choose Files
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
              Supports: PDF, DOCX, TXT files • Max 10MB each
            </Typography>
          </Box>

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Uploading and processing files...
              </Typography>
            </Box>
          )}

          {/* Upload Error */}
          {uploadMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Upload failed: {uploadMutation.error?.message}
            </Alert>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Uploaded Files ({uploadedFiles.length})
                </Typography>
                <List dense>
                  {uploadedFiles.map((file) => (
                    <ListItem key={file.id}>
                      <Box sx={{ mr: 2 }}>
                        {file.status === "uploaded" ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Error color="error" />
                        )}
                      </Box>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(1)} KB • ${file.type.toUpperCase()}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteFile(file.id)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Analysis Section */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<RocketLaunch />}
            onClick={handleAnalysis}
            disabled={
              analysisMutation.isPending ||
              !jobTitle.trim() ||
              !jobDescription.trim() ||
              uploadedFiles.length === 0
            }
            sx={{
              py: 2,
              px: 6,
              fontSize: "1.1rem",
              fontWeight: "bold",
            }}
          >
            Launch Analysis
          </Button>

          {analysisMutation.isPending && (
            <Box sx={{ mt: 3 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                IRIS is analyzing candidates... This may take a few moments.
              </Typography>
            </Box>
          )}

          {analysisMutation.isError && (
            <Alert severity="error" sx={{ mt: 3 }}>
              Analysis failed: {analysisMutation.error?.message}
            </Alert>
          )}
        </Box>

        {/* Results Section */}
        {analysisResult && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Analysis Results
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h4" color="primary.main">
                    {analysisResult.analysis.total_candidates}
                  </Typography>
                  <Typography variant="body2">Total Candidates</Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h4" color="success.main">
                    {analysisResult.summary.qualified_count}
                  </Typography>
                  <Typography variant="body2">Qualified</Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h4" color="text.secondary">
                    {analysisResult.analysis.qualification_threshold}%
                  </Typography>
                  <Typography variant="body2">Threshold</Typography>
                </Paper>
              </Box>

              {/* Candidates List */}
              <Typography variant="subtitle1" gutterBottom>
                Candidate Analysis:
              </Typography>
              {analysisResult.candidates.map((candidate, index) => (
                <Card
                  key={candidate.id}
                  sx={{
                    mb: 2,
                    bgcolor: candidate.qualified ? "success.light" : "grey.100",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {candidate.name}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="h6" fontWeight="bold">
                          {candidate.overall_score.toFixed(1)}%
                        </Typography>
                        <Chip
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
                          {candidate.strengths.map((strength, i) => (
                            <li key={i}>
                              <Typography variant="caption">
                                {strength}
                              </Typography>
                            </li>
                          ))}
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
                          {candidate.weaknesses.map((weakness, i) => (
                            <li key={i}>
                              <Typography variant="caption">
                                {weakness}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {/* Recommendations */}
              <Box sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  IRIS Recommendations:
                </Typography>
                <Typography variant="body2">
                  {analysisResult.summary.recommendations}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Container>
  );
}

export default JobMatching;
