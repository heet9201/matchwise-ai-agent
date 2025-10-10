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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useJobDescription } from '../contexts/JobDescriptionContext';

const JobDescriptionDisplay: React.FC = () => {
    const { jobDescription } = useJobDescription();
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
        <Accordion
            sx={{
                mt: 3,
                backgroundColor: '#f8f9fa',
                '&.MuiAccordion-root': {
                    borderRadius: 1,
                    '&:before': {
                        display: 'none',
                    },
                },
            }}
            defaultExpanded={false}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e0e0e0',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                    <Typography variant="h6" component="h2" color="primary">
                        Generated Job Description
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label="Ready for Analysis"
                            color="success"
                            icon={<CheckCircleIcon />}
                            size="small"
                        />
                        <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy();
                                }}
                                color={copied ? "success" : "default"}
                                size="small"
                            >
                                {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                    Job description is ready! You can now proceed with resume analysis.
                </Alert>
                <Box sx={{
                    backgroundColor: 'white',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    whiteSpace: 'pre-wrap'
                }}>
                    <Typography variant="body1" component="div" sx={{ lineHeight: 1.8 }}>
                        {jobDescription}
                    </Typography>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default JobDescriptionDisplay;