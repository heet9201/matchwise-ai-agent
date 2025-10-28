import React, { useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Paper,
    Chip,
    IconButton,
    Divider,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import EmailIcon from '@mui/icons-material/Email'
import StarIcon from '@mui/icons-material/Star'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'

interface CandidateEmailDisplayProps {
    email: string
    emailType: string
    companyName: string
    score: number
    jobSource: string
    isOpen: boolean
    onClose: () => void
}

const CandidateEmailDisplay: React.FC<CandidateEmailDisplayProps> = ({
    email,
    emailType,
    companyName,
    score,
    jobSource,
    isOpen,
    onClose,
}) => {
    const [copied, setCopied] = useState(false)

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(email)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                }
            }}
        >
            <DialogTitle sx={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: emailType === 'application'
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
            }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                        {emailType === 'application' ? (
                            <CheckCircleIcon sx={{ color: '#22c55e' }} />
                        ) : (
                            <CancelIcon sx={{ color: '#f97316' }} />
                        )}
                        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                            {emailType === 'application' ? 'Application Email' : 'Email'}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.9)',
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3, pb: 2 }}>
                <Box mb={3}>
                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        <Chip
                            icon={<EmailIcon />}
                            label={emailType === 'application' ? 'Job Application' : 'Application Status'}
                            sx={{
                                backgroundColor: emailType === 'application'
                                    ? 'rgba(34, 197, 94, 0.15)'
                                    : 'rgba(239, 68, 68, 0.15)',
                                color: emailType === 'application' ? '#22c55e' : '#ef4444',
                                border: `1px solid ${emailType === 'application' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                fontWeight: 600,
                                '& .MuiChip-icon': {
                                    color: emailType === 'application' ? '#22c55e' : '#ef4444',
                                }
                            }}
                        />
                        <Chip
                            icon={<StarIcon />}
                            label={`Score: ${score}%`}
                            sx={{
                                backgroundColor: score >= 70
                                    ? 'rgba(34, 197, 94, 0.15)'
                                    : 'rgba(251, 146, 60, 0.15)',
                                color: score >= 70 ? '#22c55e' : '#fb923c',
                                border: `1px solid ${score >= 70 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(251, 146, 60, 0.3)'}`,
                                fontWeight: 600,
                                '& .MuiChip-icon': {
                                    color: score >= 70 ? '#22c55e' : '#fb923c',
                                }
                            }}
                        />
                    </Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                        Application for: {companyName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }} gutterBottom>
                        Job Source: {jobSource}
                    </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                        whiteSpace: 'pre-line'
                    }}
                >
                    <Typography variant="body1" sx={{
                        color: 'rgba(255, 255, 255, 0.85)',
                        lineHeight: 1.8,
                        fontSize: '0.95rem'
                    }}>
                        {email}
                    </Typography>
                </Paper>
            </DialogContent>
            <DialogActions sx={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                px: 3,
                py: 2,
                gap: 1
            }}>
                <Button
                    onClick={handleCopyEmail}
                    startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                    sx={{
                        background: copied
                            ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                            : 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                        color: 'white',
                        fontWeight: 600,
                        px: 3,
                        '&:hover': {
                            background: copied
                                ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                                : 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
                        }
                    }}
                >
                    {copied ? 'Copied!' : 'Copy Email'}
                </Button>
                <Button
                    onClick={onClose}
                    sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        fontWeight: 600,
                        px: 3,
                        '&:hover': {
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }
                    }}
                    variant="outlined"
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default CandidateEmailDisplay
