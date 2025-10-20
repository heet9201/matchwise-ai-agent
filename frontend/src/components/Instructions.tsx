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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Fade,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface InstructionsProps {
    isCandidateMode?: boolean;
}

const recruiterSteps = [
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

const candidateSteps = [
    {
        label: 'Configure Job Match Settings',
        icon: <SettingsIcon />,
        description: `Start by setting your job search criteria:`,
        points: [
            'Minimum Required Score: Set the minimum match score (default 70%) for job recommendations',
            'Maximum Missing Skills: Set how many skills (default 3) you can afford to lack',
        ],
        tip: 'These settings help identify jobs that best match your profile.',
    },
    {
        label: 'Upload Your Resume',
        icon: <UploadFileIcon />,
        description: `First, upload your resume:`,
        points: [
            'Upload your resume (PDF, DOC, DOCX)',
            'The system will extract and analyze your skills and experience',
            'Make sure your resume is up-to-date and well-formatted',
        ],
        tip: 'A well-structured resume leads to better job matches.',
    },
    {
        label: 'Add & Analyze Job Descriptions',
        icon: <DescriptionIcon />,
        description: `Add job postings you\'re interested in:`,
        points: [
            'Upload job description files (PDF, DOC, DOCX)',
            'Type or paste job descriptions manually',
            'Provide links to job postings (Coming soon)',
            'The system analyzes each job and generates personalized cover letters',
        ],
        tip: 'Add multiple jobs at once to compare matches efficiently.',
    },
];

const Instructions: React.FC<InstructionsProps> = ({ isCandidateMode = false }) => {
    const steps = isCandidateMode ? candidateSteps : recruiterSteps;
    return (
        <Fade in={true} timeout={800}>
            <Accordion
                sx={{
                    mb: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    '&.MuiAccordion-root': {
                        borderRadius: 3,
                        overflow: 'hidden',
                        '&:before': {
                            display: 'none',
                        },
                    },
                }}
                defaultExpanded={false}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                    sx={{
                        background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                        color: 'white',
                        minHeight: 72,
                        '& .MuiAccordionSummary-content': {
                            my: 2,
                        },
                    }}
                >
                    <Box display="flex" alignItems="center" width="100%">
                        <Box
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '50%',
                                p: 1,
                                display: 'flex',
                                mr: 2,
                            }}
                        >
                            <InfoIcon sx={{ color: 'white', fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" component="h2" fontWeight={600}>
                                {isCandidateMode ? 'How to Find Your Perfect Job Match' : 'How to Use This Platform'}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {isCandidateMode
                                    ? 'Follow these steps to discover jobs that match your skills'
                                    : 'Follow these simple steps to streamline your recruitment process'}
                            </Typography>
                        </Box>
                    </Box>
                </AccordionSummary>
                <AccordionDetails
                    sx={{
                        p: 4,
                        bgcolor: '#f8f9fa',
                    }}
                >
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
                            {isCandidateMode
                                ? 'Welcome! This AI-powered platform helps you discover jobs that match your skills and automatically generates personalized cover letters.'
                                : 'Welcome! This AI-powered platform automates resume screening and candidate communication, saving you hours of manual work.'}
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
                                {isCandidateMode
                                    ? '✨ The platform analyzes your resume against multiple jobs, provides match scores, identifies skill gaps, and creates tailored cover letters for your top matches.'
                                    : '✨ The platform automatically handles candidate communication based on your settings, maintaining professionalism while saving you valuable time.'}
                            </Typography>
                        </Alert>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Fade>
    );
};

export default Instructions;
