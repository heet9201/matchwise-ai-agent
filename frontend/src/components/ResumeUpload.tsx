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
    Chip,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useJobDescription } from '../contexts/JobDescriptionContext';
import { useResume } from '../contexts/ResumeContext';
import { useSettings } from '../contexts/SettingsContext';
import { apiService, AnalysisResult } from '../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface UploadedFile {
    file: File;
    status: 'pending' | 'processing' | 'analyzing' | 'analyzed' | 'generating_email' | 'success' | 'error';
    error?: string;
    progress?: number;
    startTime?: number;
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

    const handleClearAll = useCallback(() => {
        setUploadedFiles([]);
        setResults([]);
        setUploadProgress(0);
        setError(null);
    }, [setResults]);

    const { settings } = useSettings();

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_FILES = 10;

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!jobDescription) {
            setError('Please input a job description first');
            return;
        }

        if (acceptedFiles.length === 0) return;

        // Clear previous results and reset state for new upload session
        const hasCompletedFiles = uploadedFiles.some(f => f.status === 'success' || f.status === 'error');
        const pendingFiles = uploadedFiles.filter(f => f.status === 'pending');

        // If there are completed files, start fresh. If only pending files, allow adding more
        const baseFiles = hasCompletedFiles ? [] : pendingFiles;

        // Check total number of files
        if (baseFiles.length + acceptedFiles.length > MAX_FILES) {
            setError(`Maximum ${MAX_FILES} files allowed`);
            return;
        }

        // Validate file sizes
        const oversizedFiles = acceptedFiles.filter(file => file.size > MAX_FILE_SIZE);
        if (oversizedFiles.length > 0) {
            setError(`Some files exceed the 10MB size limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
            return;
        }

        const newFiles = acceptedFiles.map(file => ({
            file,
            status: 'pending' as const,
        }));

        // If starting fresh, also reset results and progress
        if (hasCompletedFiles) {
            setResults([]);
            setUploadProgress(0);
        }

        setUploadedFiles([...baseFiles, ...newFiles]);
        setShowUploadDialog(true);
    }, [jobDescription, uploadedFiles, setResults]);

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

            let allResults: any[] = [];

            // Use streaming API with progress updates
            await apiService.analyzeResumesStream(formData, (update) => {
                if (update.type === 'progress') {
                    const percentage = update.percentage || 0;
                    setUploadProgress(percentage);

                    // Update individual file status based on the progress status
                    setUploadedFiles(files =>
                        files.map(file => {
                            if (file.file.name === update.filename) {
                                let fileStatus: UploadedFile['status'] = 'pending';

                                if (update.status === 'processing') {
                                    fileStatus = 'processing';
                                } else if (update.status === 'analyzing') {
                                    fileStatus = 'analyzing';
                                } else if (update.status === 'analyzed') {
                                    fileStatus = 'analyzed';
                                } else if (update.status === 'generating_email') {
                                    fileStatus = 'generating_email';
                                } else if (update.status === 'complete') {
                                    fileStatus = 'success';
                                } else if (update.status === 'error') {
                                    fileStatus = 'error';
                                }

                                return {
                                    ...file,
                                    status: fileStatus,
                                    progress: 100, // Individual file is 100% when status updates arrive
                                    error: update.error
                                };
                            }
                            return file;
                        })
                    );

                    // Store or update result if available
                    if (update.result) {
                        const existingIndex = allResults.findIndex(r =>
                            'filename' in r && 'filename' in update.result! && r.filename === update.result.filename
                        );
                        if (existingIndex >= 0) {
                            allResults[existingIndex] = update.result;
                        } else {
                            allResults.push(update.result);
                        }
                    }
                } else if (update.type === 'complete') {
                    // All done - use percentage from backend or default to 100%
                    setUploadProgress(100);

                    if (update.results && update.results.length > 0) {
                        // Filter to only AnalysisResult types (with filename property)
                        const analysisResults = update.results.filter((r): r is AnalysisResult => 'filename' in r);
                        const results = analysisResults.map(result => ({
                            ...result,
                            is_best_match: result.is_best_match ?? false
                        }));
                        setResults(results);

                        // Update all file statuses as complete
                        setUploadedFiles(files =>
                            files.map(file => {
                                const result = analysisResults.find(r => r.filename === file.file.name);
                                if (result) {
                                    return {
                                        ...file,
                                        status: 'success',
                                        progress: 100
                                    };
                                }
                                return file;
                            })
                        );

                        // Close dialog after a short delay
                        setTimeout(() => {
                            setShowUploadDialog(false);
                        }, 1000);
                    }
                } else if (update.type === 'error') {
                    throw new Error(update.error || 'Analysis failed');
                }
            });

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
        }
    }, [jobDescription, uploadedFiles, settings, setResults]);

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
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready
                                    </Typography>
                                    {uploadedFiles.some(f => f.status === 'success' || f.status === 'error') && !isLoading && (
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<RestartAltIcon />}
                                            onClick={handleClearAll}
                                        >
                                            Clear All & Start New
                                        </Button>
                                    )}
                                </Box>
                                <List>
                                    {uploadedFiles.map((uploadedFile, index) => (
                                        <ListItem
                                            key={uploadedFile.file.name + index}
                                            secondaryAction={
                                                uploadedFile.status === 'pending' && (
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
                                                {(uploadedFile.status === 'processing' || uploadedFile.status === 'analyzing' || uploadedFile.status === 'analyzed' || uploadedFile.status === 'generating_email') && (
                                                    <Box position="relative" display="inline-flex">
                                                        <CircularProgress size={24} variant="determinate" value={uploadedFile.progress || 0} />
                                                        <Box
                                                            position="absolute"
                                                            top={0}
                                                            left={0}
                                                            bottom={0}
                                                            right={0}
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                        >
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                                                                {Math.round(uploadedFile.progress || 0)}%
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                )}
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
                            </>
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
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Analyzing Resumes</Typography>
                        {!isLoading && (
                            <Chip
                                label="Complete"
                                color="success"
                                icon={<CheckCircleIcon />}
                                size="small"
                            />
                        )}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 3, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Overall Progress
                            </Typography>
                            <Typography variant="h6" color="primary">
                                {Math.round(uploadProgress)}%
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={uploadProgress}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 5,
                                            backgroundColor: uploadProgress === 100 ? '#4caf50' : '#1976d2'
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                {uploadedFiles.filter(f => f.status === 'success').length} of {uploadedFiles.length} files processed
                            </Typography>
                            {isLoading && (
                                <Typography variant="caption" color="primary">
                                    Processing...
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
                        Files Status
                    </Typography>
                    <List sx={{ mt: 1 }}>
                        {uploadedFiles.map((file, index) => (
                            <ListItem
                                key={index}
                                sx={{
                                    border: '1px solid',
                                    borderColor: file.status === 'success' ? 'success.light' :
                                        file.status === 'error' ? 'error.light' :
                                            (file.status === 'processing' || file.status === 'analyzing' || file.status === 'analyzed' || file.status === 'generating_email') ? 'primary.light' : 'grey.300',
                                    borderRadius: 1,
                                    mb: 1,
                                    backgroundColor: file.status === 'success' ? 'success.lighter' :
                                        file.status === 'error' ? 'error.lighter' :
                                            (file.status === 'processing' || file.status === 'analyzing' || file.status === 'analyzed' || file.status === 'generating_email') ? 'primary.lighter' : 'transparent'
                                }}
                            >
                                <ListItemIcon>
                                    {file.status === 'success' && <CheckCircleIcon color="success" />}
                                    {file.status === 'error' && <ErrorIcon color="error" />}
                                    {(file.status === 'processing' || file.status === 'analyzing' || file.status === 'analyzed' || file.status === 'generating_email') && (
                                        <CircularProgress size={24} />
                                    )}
                                    {file.status === 'pending' && <UploadFileIcon />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" fontWeight="medium">
                                            {file.file.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {file.status === 'error' ? file.error :
                                                    file.status === 'processing' ? '📄 Extracting text...' :
                                                        file.status === 'analyzing' ? '🔍 Analyzing resume...' :
                                                            file.status === 'analyzed' ? '✅ Analysis complete, waiting for email...' :
                                                                file.status === 'generating_email' ? '✉️ Generating personalized email...' :
                                                                    file.status === 'success' ? '✓ Completed successfully' :
                                                                        'Waiting to process'}
                                            </Typography>
                                            {(file.status === 'processing' || file.status === 'analyzing' || file.status === 'analyzed' || file.status === 'generating_email') && file.progress !== undefined && (
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={file.progress}
                                                    sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                                                />
                                            )}
                                        </Box>
                                    }
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
