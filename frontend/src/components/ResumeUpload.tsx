import React, { useState, useCallback } from 'react';
import {
    Paper,
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    LinearProgress,
    IconButton,
    Stack,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useJobDescription } from '../contexts/JobDescriptionContext';
import { useResume } from '../contexts/ResumeContext';
import { useSettings } from '../contexts/SettingsContext';
import { apiService } from '../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { AnalysisResult } from '../types/analysis';

interface UploadedFile {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

const ResumeUpload: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { jobDescription } = useJobDescription();
    const { setResults } = useResume();

    const handleRemoveFile = useCallback((index: number) => {
        setUploadedFiles(files => files.filter((_, i) => i !== index));
    }, []);

    const { settings } = useSettings();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0 || !jobDescription) return;

        const newFiles = acceptedFiles.map(file => ({
            file,
            status: 'pending' as const,
        }));

        setUploadedFiles(prev => [...prev, ...newFiles]);
        setShowUploadDialog(true);
    }, [jobDescription]);

    const processFiles = useCallback(async () => {
        if (!jobDescription || uploadedFiles.length === 0) return;

        setIsLoading(true);
        setError(null);
        setUploadProgress(0);

        const pendingFiles = uploadedFiles.filter(f => f.status === 'pending');

        try {
            const formData = new FormData();
            formData.append('job_description', jobDescription);
            formData.append('minimum_score', settings.minimumScore.toString());
            formData.append('max_missing_skills', settings.maxMissingSkills.toString());

            pendingFiles.forEach(f => {
                formData.append('resumes', f.file);
            });

            const response = await apiService.analyzeResumes(formData);
            const rawResults = response.data?.results || [];
            const results: AnalysisResult[] = rawResults.map(result => ({
                ...result,
                is_best_match: (result as any).is_best_match ?? false // Set default to false if not provided by API
            }));

            if (response.success && results.length > 0) {
                setResults(results);

                // Update file statuses based on analysis results
                setUploadedFiles(files =>
                    files.map(file => {
                        const result = response.data?.results.find(r => r.filename === file.file.name);
                        if (result) {
                            return {
                                ...file,
                                status: result.score >= 70 ? 'success' : 'error',
                                error: result.score < 70 ? 'Score too low' : undefined
                            };
                        }
                        return file;
                    })
                );

                setShowUploadDialog(false);
            } else {
                throw new Error(response.error || 'Failed to analyze resumes');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to analyze resumes');
            setUploadedFiles(files =>
                files.map(file => ({
                    ...file,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Failed to analyze resume'
                }))
            );
        } finally {
            setIsLoading(false);
            setUploadProgress(100);
        }
    }, [jobDescription, uploadedFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc', '.docx'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 10,
        disabled: isLoading,
    });

    return (
        <>
            <Paper sx={{ mb: 3, p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <UploadFileIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                        Upload Resumes
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!jobDescription ? (
                    <Alert severity="warning">
                        Please input a job description first
                    </Alert>
                ) : (
                    <>
                        <div {...getRootProps()} style={{
                            border: '2px dashed',
                            borderColor: isDragActive ? '#1976d2' : '#ccc',
                            padding: '20px',
                            textAlign: 'center',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                            opacity: isLoading ? 0.7 : 1,
                            transition: 'all 0.2s ease'
                        }}>
                            <input {...getInputProps()} />
                            <Stack spacing={1} alignItems="center">
                                <FileUploadIcon color="primary" sx={{ fontSize: 40 }} />
                                {isDragActive ? (
                                    <Typography>
                                        Drop the files here...
                                    </Typography>
                                ) : (
                                    <>
                                        <Typography>
                                            Drag & drop up to 10 resumes here, or click to select files
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Supported formats: PDF, DOC, DOCX
                                        </Typography>
                                    </>
                                )}
                            </Stack>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <List sx={{ mt: 2 }}>
                                {uploadedFiles.map((uploadedFile, index) => (
                                    <ListItem
                                        key={uploadedFile.file.name + index}
                                        secondaryAction={
                                            uploadedFile.status !== 'uploading' && (
                                                <IconButton
                                                    edge="end"
                                                    aria-label="delete"
                                                    onClick={() => handleRemoveFile(index)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )
                                        }
                                    >
                                        <ListItemIcon>
                                            {uploadedFile.status === 'success' && <CheckCircleIcon color="success" />}
                                            {uploadedFile.status === 'error' && <ErrorIcon color="error" />}
                                            {uploadedFile.status === 'uploading' && <CircularProgress size={24} />}
                                            {uploadedFile.status === 'pending' && <UploadFileIcon />}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={uploadedFile.file.name}
                                            secondary={uploadedFile.error || ''}
                                            secondaryTypographyProps={{
                                                color: uploadedFile.error ? 'error' : 'textSecondary'
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </>
                )}
            </Paper>

            <Dialog
                open={showUploadDialog}
                onClose={() => !isLoading && setShowUploadDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Analyzing Resumes</DialogTitle>
                <DialogContent>
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                            {isLoading ? 'Processing...' : 'Analysis Complete'}
                        </Typography>
                    </Box>
                    <List sx={{ mt: 2 }}>
                        {uploadedFiles.map((file, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    {file.status === 'success' && <CheckCircleIcon color="success" />}
                                    {file.status === 'error' && <ErrorIcon color="error" />}
                                    {file.status === 'uploading' && <CircularProgress size={24} />}
                                    {file.status === 'pending' && <UploadFileIcon />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={file.file.name}
                                    secondary={file.status === 'error' ? file.error : ''}
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setShowUploadDialog(false)}
                        disabled={isLoading}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={processFiles}
                        disabled={isLoading || uploadedFiles.length === 0}
                        variant="contained"
                        color="primary"
                        startIcon={<FileUploadIcon />}
                    >
                        Process Files
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ResumeUpload;
