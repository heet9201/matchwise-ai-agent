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
import { useMode } from '../contexts/ModeContext';

interface InstructionsProps {
    isCandidateMode?: boolean;
}

const recruiterSteps = [
    {
        label: 'Configure Recruitment Settings',
        icon: <SettingsIcon />,
        description: `Start by setting your recruitment criteria:`,
        points: [
            'Minimum Required Score: Set the minimum score (default 70%) candidates need to achieve for acceptance',
        ],
        tip: 'Candidates meeting this score threshold will receive acceptance emails, others will receive rejection emails.',
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
        ],
        tip: 'Jobs meeting this score threshold will have personalized application emails generated for you.',
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
            'The system analyzes each job against your resume',
            'For good matches (score ≥ goal %), personalized application emails are generated automatically',
        ],
        tip: 'Ready-to-send application emails save you hours of customization work!',
    },
];

const Instructions: React.FC<InstructionsProps> = ({ isCandidateMode = false }) => {
    const { mode } = useMode();
    const steps = isCandidateMode ? candidateSteps : recruiterSteps;
    return (
        <Fade in={true} timeout={800}>
            <Accordion
                sx={{
                    mb: 3,
                    background: mode === 'recruiter'
                        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                        : 'linear-gradient(135deg, rgba(24, 17, 43, 0.9) 0%, rgba(45, 27, 61, 0.9) 100%)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    boxShadow: mode === 'recruiter'
                        ? '0 8px 32px 0 rgba(99, 102, 241, 0.12)'
                        : '0 8px 32px 0 rgba(168, 85, 247, 0.12)',
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
                    expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(255, 255, 255, 0.95)' }} />}
                    sx={{
                        background: mode === 'recruiter'
                            ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                            : 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                        color: 'rgba(255, 255, 255, 0.95)',
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
                            <InfoIcon sx={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 28 }} />
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
                        background: mode === 'recruiter'
                            ? 'rgba(15, 23, 42, 0.5)'
                            : 'rgba(24, 17, 43, 0.5)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Alert
                        severity="info"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            background: mode === 'recruiter'
                                ? 'rgba(59, 130, 246, 0.15)'
                                : 'rgba(168, 85, 247, 0.15)',
                            border: '1px solid',
                            borderColor: mode === 'recruiter'
                                ? 'rgba(99, 102, 241, 0.3)'
                                : 'rgba(168, 85, 247, 0.3)',
                            color: 'rgba(226, 232, 240, 0.95)',
                            '& .MuiAlert-icon': {
                                color: mode === 'recruiter'
                                    ? 'rgba(147, 197, 253, 1)'
                                    : 'rgba(216, 180, 254, 1)',
                            },
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

                    <Stepper
                        orientation="vertical"
                        sx={{
                            mt: 2,
                            '& .MuiStepConnector-line': {
                                borderColor: mode === 'recruiter'
                                    ? 'rgba(99, 102, 241, 0.2)'
                                    : 'rgba(168, 85, 247, 0.2)',
                            },
                        }}
                    >
                        {steps.map((step, index) => (
                            <Step key={`${step.label}-${index}`} active={true}>
                                <StepLabel
                                    icon={
                                        <Box
                                            sx={{
                                                background: mode === 'recruiter'
                                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                                    : 'linear-gradient(135deg, #a855f7, #ec4899)',
                                                borderRadius: '50%',
                                                width: 40,
                                                height: 40,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'rgba(255, 255, 255, 0.95)',
                                                boxShadow: mode === 'recruiter'
                                                    ? '0 4px 12px rgba(99, 102, 241, 0.4)'
                                                    : '0 4px 12px rgba(168, 85, 247, 0.4)',
                                            }}
                                        >
                                            {step.icon}
                                        </Box>
                                    }
                                >
                                    <Typography
                                        variant="h6"
                                        fontWeight={600}
                                        sx={{
                                            color: 'rgba(226, 232, 240, 0.95)'
                                        }}
                                    >
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
                                            background: mode === 'recruiter'
                                                ? 'rgba(30, 41, 59, 0.6)'
                                                : 'rgba(45, 27, 61, 0.6)',
                                            backdropFilter: 'blur(10px)',
                                            borderLeft: '4px solid',
                                            borderColor: mode === 'recruiter'
                                                ? '#6366f1'
                                                : '#a855f7',
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            paragraph
                                            sx={{
                                                color: 'rgba(203, 213, 225, 0.9)'
                                            }}
                                        >
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
                                                            background: mode === 'recruiter'
                                                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                                                : 'linear-gradient(135deg, #a855f7, #ec4899)',
                                                            mt: 1,
                                                            mr: 1.5,
                                                            flexShrink: 0,
                                                            boxShadow: mode === 'recruiter'
                                                                ? '0 0 8px rgba(99, 102, 241, 0.5)'
                                                                : '0 0 8px rgba(168, 85, 247, 0.5)',
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'rgba(203, 213, 225, 0.85)'
                                                        }}
                                                    >
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
                                                    background: mode === 'recruiter'
                                                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))'
                                                        : 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                                                    border: '1px solid',
                                                    borderColor: mode === 'recruiter'
                                                        ? 'rgba(99, 102, 241, 0.3)'
                                                        : 'rgba(168, 85, 247, 0.3)',
                                                    color: 'rgba(226, 232, 240, 0.95)',
                                                    fontWeight: 500,
                                                    backdropFilter: 'blur(10px)',
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
                                background: 'rgba(34, 197, 94, 0.15)',
                                border: '1px solid',
                                borderColor: 'rgba(34, 197, 94, 0.3)',
                                color: 'rgba(167, 243, 208, 1)',
                                '& .MuiAlert-icon': {
                                    color: 'rgba(134, 239, 172, 1)',
                                },
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
