import React from 'react';
import {
    Paper,
    Typography,
    Box,
    Chip,
    Divider,
    Alert,
    IconButton,
    Tooltip,
} from '@mui/material';
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
        <Paper sx={{ p: 3, mt: 3, position: 'relative', backgroundColor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" color="primary">
                    Generated Job Description
                </Typography>
                <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                    <IconButton
                        onClick={handleCopy}
                        color={copied ? "success" : "default"}
                        size="small"
                    >
                        {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                    </IconButton>
                </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
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
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                    label="Ready for Analysis"
                    color="success"
                    icon={<CheckCircleIcon />}
                    size="small"
                />
            </Box>
        </Paper>
    );
};

export default JobDescriptionDisplay;