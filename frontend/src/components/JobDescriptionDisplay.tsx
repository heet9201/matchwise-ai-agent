import React from 'react';
import {
    Typography,
    Box,
    Chip,
    Alert,
    IconButton,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Fade,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import { useJobDescription } from '../contexts/JobDescriptionContext';
import { useMode } from '../contexts/ModeContext';

const JobDescriptionDisplay: React.FC = () => {
    const { jobDescription } = useJobDescription();
    const { mode } = useMode();
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(jobDescription);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!jobDescription) {
        return null;
    }

    return (
        <Fade in={true} timeout={800}>
            <Accordion
                sx={{
                    mt: 3,
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                        <Box display="flex" alignItems="center">
                            <DescriptionIcon sx={{ mr: 2, fontSize: 32 }} />
                            <Box>
                                <Typography variant="h6" component="h2" fontWeight={600}>
                                    Generated Job Description
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    Click to view full description
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                label="Ready for Analysis"
                                icon={<CheckCircleIcon />}
                                size="small"
                                sx={{
                                    bgcolor: 'success.main',
                                    color: 'white',
                                    fontWeight: 600,
                                }}
                            />
                            <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy();
                                    }}
                                    size="small"
                                    sx={{
                                        bgcolor: copied ? 'success.light' : 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: copied ? 'success.main' : 'rgba(255,255,255,0.3)',
                                        },
                                    }}
                                >
                                    {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{
                    p: 4,
                    background: mode === 'recruiter'
                        ? 'rgba(15, 23, 42, 0.5)'
                        : 'rgba(24, 17, 43, 0.5)',
                }}>
                    <Alert
                        severity="success"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            background: mode === 'recruiter'
                                ? 'rgba(34, 197, 94, 0.15)'
                                : 'rgba(34, 197, 94, 0.15)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            color: 'rgba(167, 243, 208, 1)',
                        }}
                    >
                        <Typography variant="body2" fontWeight={500}>
                            ✅ Job description is ready! You can now proceed with resume analysis.
                        </Typography>
                    </Alert>
                    <Box sx={{
                        background: mode === 'recruiter'
                            ? 'rgba(30, 41, 59, 0.6)'
                            : 'rgba(45, 27, 61, 0.6)',
                        backdropFilter: 'blur(10px)',
                        p: 3,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '500px',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            bgcolor: 'grey.100',
                            borderRadius: 2,
                        },
                        '&::-webkit-scrollbar-thumb': {
                            bgcolor: 'primary.main',
                            borderRadius: 2,
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                        },
                    }}>
                        <Typography variant="body1" component="div" sx={{ lineHeight: 1.8 }}>
                            {jobDescription}
                        </Typography>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Fade>
    );
};

export default JobDescriptionDisplay;