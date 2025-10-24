import React, { useState } from 'react';
import {
    Paper,
    Tabs,
    Tab,
    TextField,
    Button,
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useJobDescription } from '../contexts/JobDescriptionContext';
import { apiService } from '../services/api';

interface JDFormData {
    job_title: string;
    years_experience: number;
    must_have_skills: string;
    company_name: string;
    employment_type: string;
    industry: string;
    location: string;
}

const JobDescriptionInput: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { jobDescription, setJobDescription } = useJobDescription();
    const { register, handleSubmit, formState: { errors } } = useForm<JDFormData>();

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('File size exceeds 10MB limit');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiService.uploadJobDescriptionFile(file);
            if (response.success && response.data) {
                setJobDescription(response.data.job_description);
            } else {
                throw new Error(response.error || 'Failed to process file');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to process file');
        } finally {
            setLoading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc', '.docx'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        multiple: false,
        disabled: loading,
    });

    const onManualInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJobDescription(event.target.value);
    };

    const validateSkills = (skills: string): boolean => {
        const skillList = skills.split(',').map(skill => skill.trim());
        return skillList.length >= 2 && skillList.every(skill => skill.length >= 2);
    };

    const onGenerateSubmit = async (data: JDFormData) => {
        // Validate skills format
        if (!validateSkills(data.must_have_skills)) {
            setError('Please enter at least 2 valid skills, separated by commas');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value.toString());
            });

            const response = await apiService.generateJobDescription(formData);
            if (response.success && response.data) {
                setJobDescription(response.data.job_description);
            } else {
                throw new Error(response.error || 'Failed to generate job description');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to generate job description');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ mb: 3, position: 'relative' }}>
            {loading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        zIndex: 1,
                        borderRadius: 1,
                    }}
                >
                    <CircularProgress size={40} />
                    <Typography sx={{ mt: 2 }}>
                        {tabValue === 0 ? 'Processing file...' :
                            tabValue === 1 ? 'Updating job description...' :
                                'Generating job description...'}
                    </Typography>
                </Box>
            )}
            <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                centered
                sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="Upload File" disabled={loading} />
                <Tab label="Manual Input" disabled={loading} />
                <Tab label="Generate" disabled={loading} />
            </Tabs>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
                    {error}
                </Alert>
            )}

            <Box p={3}>
                {loading && (
                    <Box display="flex" justifyContent="center" my={3}>
                        <CircularProgress />
                    </Box>
                )}
                {!loading && tabValue === 0 && (
                    <Box sx={{ height: '100%', minHeight: '300px' }}>
                        {!jobDescription ? (
                            <Box
                                {...getRootProps()}
                                sx={{
                                    border: 2,
                                    borderRadius: 1,
                                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                                    borderStyle: 'dashed',
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                            >
                                <input {...getInputProps()} />
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" color="primary" gutterBottom>
                                        Upload Job Description
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" gutterBottom>
                                        Drag & drop your file here, or click to select
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Supported formats: PDF, DOC, DOCX
                                    </Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{
                                p: 3,
                                border: '1px solid',
                                borderColor: 'success.main',
                                borderRadius: 1,
                                backgroundColor: 'success.light',
                                position: 'relative'
                            }}>
                                <Typography variant="h6" color="success.dark" gutterBottom>
                                    File Successfully Uploaded!
                                </Typography>
                                <Box sx={{
                                    mt: 2,
                                    p: 2,
                                    background: 'rgba(30, 41, 59, 0.6)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 1,
                                    boxShadow: 1
                                }}>
                                    <Typography color="text.secondary" gutterBottom>
                                        Your job description has been processed and is ready for use.
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => {
                                            setJobDescription('');
                                        }}
                                        sx={{ mt: 2 }}
                                    >
                                        Upload Another File
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}

                {!loading && tabValue === 1 && (
                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label="Job Description"
                        onChange={onManualInput}
                        placeholder="Enter the job description here..."
                    />
                )}

                {!loading && tabValue === 2 && (
                    <form onSubmit={handleSubmit(onGenerateSubmit)}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Job Title"
                                    error={!!errors.job_title}
                                    helperText={errors.job_title?.message}
                                    {...register('job_title', { required: 'Job title is required' })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Years of Experience"
                                    error={!!errors.years_experience}
                                    helperText={errors.years_experience?.message}
                                    {...register('years_experience', {
                                        required: 'Years of experience is required',
                                        min: { value: 0, message: 'Must be 0 or greater' }
                                    })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Must-have Skills (comma-separated)"
                                    error={!!errors.must_have_skills}
                                    helperText={errors.must_have_skills?.message}
                                    {...register('must_have_skills', { required: 'Skills are required' })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    error={!!errors.company_name}
                                    helperText={errors.company_name?.message}
                                    {...register('company_name', { required: 'Company name is required' })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Employment Type"
                                    error={!!errors.employment_type}
                                    helperText={errors.employment_type?.message}
                                    {...register('employment_type', { required: 'Employment type is required' })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Industry"
                                    error={!!errors.industry}
                                    helperText={errors.industry?.message}
                                    {...register('industry', { required: 'Industry is required' })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    error={!!errors.location}
                                    helperText={errors.location?.message}
                                    {...register('location', { required: 'Location is required' })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    disabled={loading}
                                >
                                    Generate Job Description
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Box>
        </Paper>
    );
};

export default JobDescriptionInput;
