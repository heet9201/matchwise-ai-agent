import React, { useState, useCallback } from 'react';
import {
    Paper,
    Typography,
    Button,
    Box,
    Alert,
    Tabs,
    Tab,
    TextField,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Chip,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import WorkIcon from '@mui/icons-material/Work';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';
import TextFieldsIcon from '@mui/icons-material/TextFields';

export interface JobDescription {
    id: string;
    type: 'text' | 'file' | 'url';
    content: string | File;
    companyName: string;
    displayName: string;
}

interface JobDescriptionsUploadProps {
    jobs: JobDescription[];
    onJobsChange: (jobs: JobDescription[]) => void;
}

const JobDescriptionsUpload: React.FC<JobDescriptionsUploadProps> = ({ jobs, onJobsChange }) => {
    const [tabValue, setTabValue] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [textInput, setTextInput] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [urlInput, setUrlInput] = useState('');

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_JOBS = 10;

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (jobs.length + acceptedFiles.length > MAX_JOBS) {
            setError(`Maximum ${MAX_JOBS} job descriptions allowed`);
            return;
        }

        const oversizedFiles = acceptedFiles.filter(file => file.size > MAX_FILE_SIZE);
        if (oversizedFiles.length > 0) {
            setError(`Some files exceed the 10MB size limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
            return;
        }

        const newJobs: JobDescription[] = acceptedFiles.map((file, idx) => ({
            id: `file_${Date.now()}_${idx}`,
            type: 'file',
            content: file,
            companyName: file.name.replace(/\.[^/.]+$/, ''),
            displayName: file.name,
        }));

        onJobsChange([...jobs, ...newJobs]);
        setError(null);
    }, [jobs, onJobsChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc', '.docx'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        multiple: true,
    });

    const handleAddText = () => {
        if (!textInput.trim() || textInput.trim().length < 50) {
            setError('Job description text must be at least 50 characters long');
            return;
        }

        if (jobs.length >= MAX_JOBS) {
            setError(`Maximum ${MAX_JOBS} job descriptions allowed`);
            return;
        }

        const newJob: JobDescription = {
            id: `text_${Date.now()}`,
            type: 'text',
            content: textInput.trim(),
            companyName: companyName.trim() || 'Company',
            displayName: `${companyName.trim() || 'Company'} - Text Input`,
        };

        onJobsChange([...jobs, newJob]);
        setTextInput('');
        setCompanyName('');
        setError(null);
    };

    const handleAddUrl = () => {
        if (!urlInput.trim()) {
            setError('Please enter a valid URL');
            return;
        }

        // Validate URL format
        try {
            const url = new URL(urlInput.trim());
            if (!['http:', 'https:'].includes(url.protocol)) {
                setError('Please enter a valid HTTP or HTTPS URL');
                return;
            }
        } catch {
            setError('Please enter a valid URL (e.g., https://example.com/job-posting)');
            return;
        }

        if (jobs.length >= MAX_JOBS) {
            setError(`Maximum ${MAX_JOBS} job descriptions allowed`);
            return;
        }

        const newJob: JobDescription = {
            id: `url_${Date.now()}`,
            type: 'url',
            content: urlInput.trim(),
            companyName: companyName.trim() || 'Company',
            displayName: `${companyName.trim() || 'Company'} - URL`,
        };

        onJobsChange([...jobs, newJob]);
        setUrlInput('');
        setCompanyName('');
        setError(null);
    };

    const handleRemove = (id: string) => {
        onJobsChange(jobs.filter(job => job.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'text':
                return <TextFieldsIcon color="primary" />;
            case 'file':
                return <DescriptionIcon color="primary" />;
            case 'url':
                return <LinkIcon color="primary" />;
            default:
                return <WorkIcon color="primary" />;
        }
    };

    return (
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
                variant="h6"
                gutterBottom
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
            >
                <WorkIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                Add Job Descriptions
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    mb: 2,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
            >
                Add up to {MAX_JOBS} job descriptions to analyze ({jobs.length}/{MAX_JOBS})
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                variant="fullWidth"
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    mb: 2,
                    minHeight: { xs: 56, sm: 64 },
                    '& .MuiTab-root': {
                        minHeight: { xs: 56, sm: 64 },
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        px: { xs: 0.5, sm: 2 },
                        py: { xs: 1.5, sm: 2 },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 0.5, sm: 1 },
                    },
                    '& .MuiTab-iconWrapper': {
                        marginRight: { xs: 0, sm: 1 },
                        marginBottom: { xs: 0.25, sm: 0 }
                    }
                }}
            >
                <Tab
                    label="Upload"
                    icon={<DescriptionIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />}
                    iconPosition="top"
                    wrapped
                />
                <Tab
                    label="Paste Text"
                    icon={<TextFieldsIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />}
                    iconPosition="top"
                    wrapped
                />
                <Tab
                    label="From URL"
                    icon={<LinkIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />}
                    iconPosition="top"
                    wrapped
                />
            </Tabs>

            <Box sx={{ mb: 3 }}>
                {tabValue === 0 && (
                    <Box
                        {...getRootProps()}
                        sx={{
                            border: '2px dashed',
                            borderColor: isDragActive ? 'primary.main' : 'grey.300',
                            borderRadius: 2,
                            p: { xs: 2, sm: 4 },
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'action.hover',
                            },
                        }}
                    >
                        <input {...getInputProps()} />
                        <DescriptionIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            {isDragActive ? 'Drop job description files here' : 'Drag & drop job descriptions'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            or click to browse (PDF, DOC, DOCX - max 10MB each)
                        </Typography>
                    </Box>
                )}

                {tabValue === 1 && (
                    <Box>
                        <TextField
                            fullWidth
                            label="Company Name (Optional)"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            sx={{ mb: 2 }}
                            size="small"
                            InputProps={{
                                sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                            }}
                            InputLabelProps={{
                                sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                            }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={8}
                            label="Paste Job Description"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Paste the job description text here (minimum 50 characters)"
                            sx={{ mb: 2 }}
                            InputProps={{
                                sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                            }}
                            InputLabelProps={{
                                sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleAddText}
                            startIcon={<AddIcon />}
                            disabled={jobs.length >= MAX_JOBS}
                            fullWidth
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Add Job Description
                        </Button>
                    </Box>
                )}

                {tabValue === 2 && (
                    <Box>
                        <TextField
                            fullWidth
                            label="Company Name (Optional)"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            sx={{ mb: 2 }}
                            size="small"
                            InputProps={{
                                sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                            }}
                            InputLabelProps={{
                                sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Job Posting URL"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://example.com/job-posting"
                            sx={{ mb: 2 }}
                            type="url"
                            InputProps={{
                                sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                            }}
                            InputLabelProps={{
                                sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                            }}
                        />
                        <Alert severity="info" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Paste any public job posting URL (LinkedIn, Indeed, Glassdoor, company career pages, etc.)
                        </Alert>
                        <Button
                            variant="contained"
                            onClick={handleAddUrl}
                            startIcon={<AddIcon />}
                            disabled={!urlInput.trim()}
                            fullWidth
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Add from URL
                        </Button>
                    </Box>
                )}
            </Box>

            {jobs.length > 0 && (
                <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Added Job Descriptions ({jobs.length})
                    </Typography>
                    <List>
                        {jobs.map((job) => (
                            <ListItem
                                key={job.id}
                                sx={{
                                    bgcolor: 'action.hover',
                                    borderRadius: 1,
                                    mb: 1,
                                }}
                                secondaryAction={
                                    <IconButton edge="end" onClick={() => handleRemove(job.id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemIcon>
                                    {getIcon(job.type)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={job.displayName}
                                    secondary={
                                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                            <Chip label={job.type.toUpperCase()} size="small" />
                                            <Chip label={job.companyName} size="small" variant="outlined" />
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}
        </Paper>
    );
};

export default JobDescriptionsUpload;
