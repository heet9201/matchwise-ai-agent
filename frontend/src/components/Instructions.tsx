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
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const steps = [
    {
        label: 'Configure Recruitment Settings',
        description: `Start by setting your recruitment criteria:
• Minimum Required Score: Set the minimum score (default 70%) candidates need to achieve
• Maximum Missing Skills: Set how many required skills (default 3) candidates can lack
These settings help ensure you find the best matches for your position.`,
    },
    {
        label: 'Add Job Description',
        description: `You have three options to input the job description:
1. Upload a Job Description file (PDF, DOC, DOCX)
2. Type or paste the job description manually
3. Generate a new job description by providing key details
Choose the method that works best for you.`,
    },
    {
        label: 'Upload Resumes',
        description: `Once you have your job description:
• Upload up to 10 resumes at once (PDF, DOC, DOCX)
• The system will analyze each resume against your job description
• Candidates meeting your criteria will automatically receive interview invitations
• Others will receive polite rejection emails
You can see the analysis results and generated emails immediately.`,
    },
];

const Instructions: React.FC = () => {
    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <InfoIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                    How to Use This Platform
                </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
                Welcome to the AI-Powered Recruitment Assistant! Follow these simple steps to
                streamline your recruitment process.
            </Alert>

            <Stepper orientation="vertical">
                {steps.map((step) => (
                    <Step key={step.label} active={true}>
                        <StepLabel>
                            <Typography variant="subtitle1">{step.label}</Typography>
                        </StepLabel>
                        <StepContent>
                            <Typography variant="body2" color="textSecondary" style={{ whiteSpace: 'pre-line' }}>
                                {step.description}
                            </Typography>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>

            <Box mt={3}>
                <Alert severity="success">
                    The platform will automatically handle candidate communication based on your settings,
                    saving you time while maintaining professionalism.
                </Alert>
            </Box>
        </Paper>
    );
};

export default Instructions;
