import React from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';

interface ProgressOverlayProps {
    progress: number;
    message: string;
}

const ProgressOverlay: React.FC<ProgressOverlayProps> = ({ progress, message }) => {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 9999,
            }}
        >
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 4,
                    minWidth: 300,
                    maxWidth: 500,
                    textAlign: 'center',
                }}
            >
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    {message}
                </Typography>
                <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress variant="determinate" value={progress} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {Math.round(progress)}% Complete
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default ProgressOverlay;
