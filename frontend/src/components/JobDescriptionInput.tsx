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
    jobTitle: string;
    yearsExperience: number;
    mustHaveSkills: string;
    companyName: string;
    employmentType: string;
    industry: string;
    location: string;
}

const JobDescriptionInput: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setJobDescription } = useJobDescription();
    const { register, handleSubmit, formState: { errors } } = useForm<JDFormData>();

    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
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

    const onGenerateSubmit = async (data: JDFormData) => {
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
        <Paper sx={{ mb: 3 }}>
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
                    <div {...getRootProps()} style={{
                        border: '2px dashed',
                        borderColor: isDragActive ? '#1976d2' : '#ccc',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                        transition: 'all 0.2s ease'
                    }}>
                        <input {...getInputProps()} />
                        <Typography>
                            Drag & drop a job description file here, or click to select one
                        </Typography>
                        <Typography variant="caption" display="block">
                            Supported formats: PDF, DOC, DOCX
                        </Typography>
                    </div>
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
                                    error={!!errors.jobTitle}
                                    helperText={errors.jobTitle?.message}
                                    {...register('jobTitle', { required: 'Job title is required' })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Years of Experience"
                                    error={!!errors.yearsExperience}
                                    helperText={errors.yearsExperience?.message}
                                    {...register('yearsExperience', {
                                        required: 'Years of experience is required',
                                        min: { value: 0, message: 'Must be 0 or greater' }
                                    })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Must-have Skills (comma-separated)"
                                    error={!!errors.mustHaveSkills}
                                    helperText={errors.mustHaveSkills?.message}
                                    {...register('mustHaveSkills', { required: 'Skills are required' })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    error={!!errors.companyName}
                                    helperText={errors.companyName?.message}
                                    {...register('companyName', { required: 'Company name is required' })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Employment Type"
                                    error={!!errors.employmentType}
                                    helperText={errors.employmentType?.message}
                                    {...register('employmentType', { required: 'Employment type is required' })}
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
