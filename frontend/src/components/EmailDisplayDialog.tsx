import React from 'react';
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
    Tooltip,
    Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';

interface EmailDisplayDialogProps {
    open: boolean;
    onClose: () => void;
    email: string;
    emailType: 'acceptance' | 'rejection' | 'application' | 'no_application';
    candidateName: string;
    score: number;
    isBestMatch: boolean;
}

const EmailDisplayDialog: React.FC<EmailDisplayDialogProps> = ({
    open,
    onClose,
    email,
    emailType,
    candidateName,
    score,
    isBestMatch,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: emailType === 'acceptance' || emailType === 'application'
                        ? '1px solid rgba(76, 175, 80, 0.3)'
                        : '1px solid rgba(211, 47, 47, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                }
            }}
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                        {(emailType === 'acceptance' || emailType === 'application') ? (
                            <CheckCircleIcon sx={{ color: '#4ade80' }} />
                        ) : (
                            <CancelIcon sx={{ color: '#f87171' }} />
                        )}
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            {emailType === 'acceptance' ? 'Acceptance Email' :
                                emailType === 'rejection' ? 'Rejection Email' :
                                    emailType === 'application' ? 'Cover Letter' :
                                        'Email'}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box mb={3}>
                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        <Chip
                            icon={<EmailIcon />}
                            label={emailType === 'acceptance' ? 'Interview Invitation' :
                                emailType === 'application' ? 'Job Application' :
                                    'Application Status'}
                            sx={{
                                background: (emailType === 'acceptance' || emailType === 'application')
                                    ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                                    : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                                color: '#fff',
                                fontWeight: 600,
                            }}
                        />
                        <Chip
                            icon={<StarIcon />}
                            label={`Score: ${score}%`}
                            sx={{
                                background: score >= 70
                                    ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                                    : 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                                color: '#fff',
                                fontWeight: 600,
                            }}
                        />
                        {isBestMatch && (
                            <Tooltip title="This is the best match">
                                <Chip
                                    icon={<StarIcon />}
                                    label="Best Match"
                                    sx={{
                                        background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                                        color: '#fff',
                                        fontWeight: 600,
                                    }}
                                />
                            </Tooltip>
                        )}
                    </Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        {emailType === 'application' ? 'Application for:' : 'To:'} {candidateName}
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        whiteSpace: 'pre-line'
                    }}
                >
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.95)', lineHeight: 1.8 }}>
                        {email}
                    </Typography>
                </Paper>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', px: 3, py: 2 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                        color: '#fff',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                        }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EmailDisplayDialog;
