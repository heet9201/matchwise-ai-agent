import React from 'react';
import {
    Paper,
    Typography,
    Box,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Alert,
    Chip,
    Stack,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const steps = [
    {
        label: 'Configure Recruitment Settings',
        icon: <SettingsIcon />,
        description: `Start by setting your recruitment criteria:`,
        points: [
            'Minimum Required Score: Set the minimum score (default 70%) candidates need to achieve',
            'Maximum Missing Skills: Set how many required skills (default 3) candidates can lack',
        ],
        tip: 'These settings help ensure you find the best matches for your position.',
    },
    {
        label: 'Add Job Description',
        icon: <DescriptionIcon />,
        description: `You have three options to input the job description:`,
        points: [
            'Upload a Job Description file (PDF, DOC, DOCX)',
            'Type or paste the job description manually',
            'Generate a new job description by providing key details',
        ],
        tip: 'Choose the method that works best for your workflow.',
    },
    {
        label: 'Upload & Analyze Resumes',
        icon: <UploadFileIcon />,
        description: `Once you have your job description:`,
        points: [
            'Upload up to 10 resumes at once (PDF, DOC, DOCX)',
            'The system will analyze each resume sequentially',
            'Qualified candidates automatically receive interview invitations',
            'Others receive polite rejection emails',
        ],
        tip: 'You can see real-time progress and results immediately.',
    },
];

const Instructions: React.FC = () => {
    return (
        <Paper
            sx={{
                p: 4,
                mb: 3,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                border: '2px solid',
                borderColor: 'primary.light',
                borderRadius: 3,
            }}
        >
            <Box display="flex" alignItems="center" mb={3}>
                <Box
                    sx={{
                        bgcolor: 'primary.main',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        mr: 2,
                    }}
                >
                    <InfoIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Box>
                    <Typography variant="h5" component="h2" fontWeight={600}>
                        How to Use This Platform
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Follow these simple steps to streamline your recruitment process
                    </Typography>
                </Box>
            </Box>

            <Alert
                severity="info"
                sx={{
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                        width: '100%'
                    }
                }}
            >
                <Typography variant="body2" fontWeight={500}>
                    Welcome! This AI-powered platform automates resume screening and candidate communication,
                    saving you hours of manual work.
                </Typography>
            </Alert>

            <Stepper orientation="vertical" sx={{ mt: 2 }}>
                {steps.map((step) => (
                    <Step key={step.label} active={true}>
                        <StepLabel
                            StepIconComponent={() => (
                                <Box
                                    sx={{
                                        bgcolor: 'primary.main',
                                        borderRadius: '50%',
                                        width: 40,
                                        height: 40,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        boxShadow: 2,
                                    }}
                                >
                                    {step.icon}
                                </Box>
                            )}
                        >
                            <Typography variant="h6" fontWeight={600}>
                                {step.label}
                            </Typography>
                        </StepLabel>
                        <StepContent>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 2,
                                    mt: 1,
                                    mb: 2,
                                    bgcolor: 'white',
                                    borderLeft: '4px solid',
                                    borderColor: 'primary.main',
                                }}
                            >
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {step.description}
                                </Typography>
                                <Stack spacing={1} sx={{ pl: 2 }}>
                                    {step.points.map((point, idx) => (
                                        <Box key={idx} display="flex" alignItems="flex-start">
                                            <Box
                                                sx={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    bgcolor: 'primary.main',
                                                    mt: 1,
                                                    mr: 1.5,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {point}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                                <Box mt={2}>
                                    <Chip
                                        label={`💡 ${step.tip}`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'primary.light',
                                            color: 'white',
                                            fontWeight: 500,
                                        }}
                                    />
                                </Box>
                            </Paper>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>

            <Box mt={3}>
                <Alert
                    severity="success"
                    sx={{
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'success.light',
                    }}
                >
                    <Typography variant="body2" fontWeight={500}>
                        ✨ The platform automatically handles candidate communication based on your settings,
                        maintaining professionalism while saving you valuable time.
                    </Typography>
                </Alert>
            </Box>
        </Paper>
    );
};

export default Instructions;
