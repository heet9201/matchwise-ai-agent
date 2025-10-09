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
    emailType: 'acceptance' | 'rejection';
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
                    background: emailType === 'acceptance'
                        ? 'white'
                        : 'white',
                    // background: emailType === 'acceptance'
                    //     ? 'linear-gradient(to bottom, rgba(76, 175, 80, 0.05), transparent)'
                    //     : 'linear-gradient(to bottom, rgba(211, 47, 47, 0.05), transparent)',
                }
            }}
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                        {emailType === 'acceptance' ? (
                            <CheckCircleIcon color="success" />
                        ) : (
                            <CancelIcon color="error" />
                        )}
                        <Typography variant="h6">
                            {emailType === 'acceptance' ? 'Acceptance' : 'Rejection'} Email
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box mb={3}>
                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        <Chip
                            icon={<EmailIcon />}
                            label={emailType === 'acceptance' ? 'Interview Invitation' : 'Application Status'}
                            color={emailType === 'acceptance' ? 'success' : 'error'}
                        />
                        <Chip
                            icon={<StarIcon />}
                            label={`Score: ${score}%`}
                            color={score >= 70 ? 'success' : 'warning'}
                        />
                        {isBestMatch && (
                            <Tooltip title="This candidate is the best match for the position">
                                <Chip
                                    icon={<StarIcon />}
                                    label="Best Match"
                                    color="primary"
                                />
                            </Tooltip>
                        )}
                    </Box>
                    <Typography variant="subtitle1" gutterBottom>
                        To: {candidateName}
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        whiteSpace: 'pre-line'
                    }}
                >
                    <Typography variant="body1">
                        {email}
                    </Typography>
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EmailDisplayDialog;
