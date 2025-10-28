import React, { useState } from 'react';
import {
    Box,
    Fab,
    Paper,
    Typography,
    TextField,
    Button,
    IconButton,
    Collapse,
    Alert,
    Chip,
    Stack,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import {
    ChatBubbleOutline as FeedbackIcon,
    Close as CloseIcon,
    ThumbUp as ThumbUpIcon,
    BugReport as BugIcon,
    Lightbulb as IdeaIcon,
    Error as ErrorIcon,
    Send as SendIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackPopupProps {
    onSubmit?: (feedback: FeedbackData) => void;
}

interface FeedbackData {
    feedback_type: string;
    message: string;
    page?: string;
    feature_name?: string;
}

const feedbackOptions = [
    {
        type: 'feature_liked',
        label: 'I like this feature',
        icon: <ThumbUpIcon />,
        color: '#4caf50',
    },
    {
        type: 'not_working',
        label: 'Something is not working',
        icon: <ErrorIcon />,
        color: '#ff9800',
    },
    {
        type: 'improvement',
        label: 'Suggestion for improvement',
        icon: <IdeaIcon />,
        color: '#2196f3',
    },
    {
        type: 'bug_report',
        label: 'Bug report',
        icon: <BugIcon />,
        color: '#f44336',
    },
];

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ onSubmit }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('');
    const [message, setMessage] = useState('');
    const [featureName, setFeatureName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Reset form when opening
            setSelectedType('');
            setMessage('');
            setFeatureName('');
            setShowSuccess(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedType || !message.trim()) {
            return;
        }

        setIsSubmitting(true);

        const feedbackData: FeedbackData = {
            feedback_type: selectedType,
            message: message.trim(),
            page: window.location.pathname,
            feature_name: featureName.trim() || undefined,
        };

        try {
            if (onSubmit) {
                await onSubmit(feedbackData);
            }

            setShowSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                setSelectedType('');
                setMessage('');
                setFeatureName('');
                setShowSuccess(false);
            }, 2000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedOption = feedbackOptions.find(opt => opt.type === selectedType);

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 9999,
            }}
        >
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Paper
                            elevation={8}
                            sx={{
                                width: 400,
                                maxWidth: '90vw',
                                mb: 2,
                                borderRadius: 3,
                                overflow: 'hidden',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}
                        >
                            {/* Header */}
                            <Box
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    color: 'white',
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1}>
                                    <FeedbackIcon />
                                    <Typography variant="h6" fontWeight={600}>
                                        Share Your Feedback
                                    </Typography>
                                </Box>
                                <IconButton
                                    size="small"
                                    onClick={handleToggle}
                                    sx={{ color: 'white' }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* Content */}
                            <Box sx={{
                                p: 3,
                                bgcolor: 'rgba(15, 23, 42, 0.95)',
                                backdropFilter: 'blur(10px)',
                            }}>
                                {showSuccess ? (
                                    <Alert
                                        severity="success"
                                        sx={{
                                            mb: 2,
                                            bgcolor: 'rgba(16, 185, 129, 0.15)',
                                            color: '#10b981',
                                            '& .MuiAlert-icon': {
                                                color: '#10b981',
                                            },
                                        }}
                                    >
                                        🎉 Thank you for your feedback! We appreciate it.
                                    </Alert>
                                ) : (
                                    <>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                mb: 2,
                                            }}
                                        >
                                            Help us improve by sharing what you think!
                                        </Typography>

                                        {/* Feedback Type Selection */}
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight={600}
                                            mb={1}
                                            sx={{ color: 'rgba(255, 255, 255, 0.95)' }}
                                        >
                                            What's on your mind?
                                        </Typography>
                                        <Stack spacing={1} mb={3}>
                                            {feedbackOptions.map((option) => (
                                                <Chip
                                                    key={option.type}
                                                    label={option.label}
                                                    icon={option.icon}
                                                    onClick={() => setSelectedType(option.type)}
                                                    variant={selectedType === option.type ? 'filled' : 'outlined'}
                                                    sx={{
                                                        justifyContent: 'flex-start',
                                                        py: 2.5,
                                                        px: 1,
                                                        fontSize: '0.9rem',
                                                        borderWidth: 2,
                                                        transition: 'all 0.2s',
                                                        cursor: 'pointer',
                                                        ...(selectedType === option.type && {
                                                            bgcolor: option.color,
                                                            color: 'white',
                                                            borderColor: option.color,
                                                            boxShadow: `0 0 20px ${option.color}60`,
                                                            transform: 'scale(1.02)',
                                                            '& .MuiChip-icon': {
                                                                color: 'white',
                                                            },
                                                        }),
                                                        ...(selectedType !== option.type && {
                                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                            color: 'rgba(255, 255, 255, 0.9)',
                                                            borderColor: 'rgba(255, 255, 255, 0.15)',
                                                            '& .MuiChip-icon': {
                                                                color: 'rgba(255, 255, 255, 0.7)',
                                                            },
                                                            '&:hover': {
                                                                borderColor: option.color,
                                                                bgcolor: `${option.color}20`,
                                                                color: 'white',
                                                                transform: 'translateX(4px)',
                                                                '& .MuiChip-icon': {
                                                                    color: option.color,
                                                                },
                                                            },
                                                        }),
                                                    }}
                                                />
                                            ))}
                                        </Stack>

                                        <Collapse in={!!selectedType}>
                                            {/* Feature Name (Optional) */}
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Feature/Page Name (optional)"
                                                placeholder="e.g., Dashboard, Resume Upload"
                                                value={featureName}
                                                onChange={(e) => setFeatureName(e.target.value)}
                                                sx={{
                                                    mb: 2,
                                                    '& .MuiOutlinedInput-root': {
                                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                        color: 'white',
                                                        '& fieldset': {
                                                            borderColor: 'rgba(255, 255, 255, 0.15)',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: selectedOption?.color || '#667eea',
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: 'rgba(255, 255, 255, 0.6)',
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: selectedOption?.color || '#667eea',
                                                    },
                                                    '& .MuiOutlinedInput-input::placeholder': {
                                                        color: 'rgba(255, 255, 255, 0.4)',
                                                    },
                                                }}
                                            />

                                            {/* Message */}
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                label="Your Feedback"
                                                placeholder="Tell us more..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                sx={{
                                                    mb: 2,
                                                    '& .MuiOutlinedInput-root': {
                                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                        color: 'white',
                                                        '& fieldset': {
                                                            borderColor: 'rgba(255, 255, 255, 0.15)',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: selectedOption?.color || '#667eea',
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: 'rgba(255, 255, 255, 0.6)',
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: selectedOption?.color || '#667eea',
                                                    },
                                                    '& .MuiOutlinedInput-input::placeholder': {
                                                        color: 'rgba(255, 255, 255, 0.4)',
                                                    },
                                                }}
                                                required
                                            />

                                            {/* Submit Button */}
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                size="large"
                                                endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                                onClick={handleSubmit}
                                                disabled={!message.trim() || isSubmitting}
                                                sx={{
                                                    bgcolor: selectedOption?.color || '#667eea',
                                                    py: 1.5,
                                                    fontWeight: 600,
                                                    '&:hover': {
                                                        bgcolor: selectedOption?.color || '#667eea',
                                                        opacity: 0.9,
                                                    },
                                                }}
                                            >
                                                {isSubmitting ? 'Sending...' : 'Send Feedback'}
                                            </Button>
                                        </Collapse>
                                    </>
                                )}
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <Tooltip title="Give Feedback" placement="left">
                <Fab
                    color="primary"
                    onClick={handleToggle}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a4093 100%)',
                            transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s',
                    }}
                >
                    {isOpen ? <CloseIcon /> : <FeedbackIcon />}
                </Fab>
            </Tooltip>
        </Box>
    );
};

export default FeedbackPopup;
