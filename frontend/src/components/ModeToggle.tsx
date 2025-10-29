import { motion, AnimatePresence } from 'framer-motion';
import { ToggleButtonGroup, ToggleButton, Box, Typography } from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { useMode } from '../contexts/ModeContext';

export default function ModeToggle() {
    const { mode, setMode } = useMode();

    const handleChange = (
        _event: React.MouseEvent<HTMLElement>,
        newMode: 'recruiter' | 'candidate' | null,
    ) => {
        if (newMode !== null) {
            setMode(newMode);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontWeight: 500,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            fontSize: { xs: '0.6rem', sm: '0.7rem' },
                            display: { xs: 'none', sm: 'block' },
                        }}
                    >
                        {mode === 'recruiter' ? '🎯 Recruiter View' : '🚀 Candidate View'}
                    </Typography>
                </motion.div>
            </AnimatePresence>

            <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={handleChange}
                sx={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: { xs: 2, sm: 3 },
                    p: { xs: 0.25, sm: 0.5 },
                    gap: { xs: 0.25, sm: 0.5 },
                    '& .MuiToggleButtonGroup-grouped': {
                        border: 0,
                        borderRadius: '8px !important',
                        margin: 0,
                        '&:not(:first-of-type)': {
                            borderRadius: '8px',
                        },
                        '&:first-of-type': {
                            borderRadius: '8px',
                        },
                    },
                }}
            >
                <ToggleButton
                    value="recruiter"
                    sx={{
                        px: { xs: 1, sm: 2.5 },
                        py: { xs: 0.5, sm: 1 },
                        minWidth: { xs: 'auto', sm: 'auto' },
                        color: 'rgba(255, 255, 255, 0.6)',
                        background: mode === 'recruiter'
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.4))'
                            : 'transparent',
                        backdropFilter: mode === 'recruiter' ? 'blur(8px)' : 'none',
                        border: mode === 'recruiter'
                            ? '1px solid rgba(99, 102, 241, 0.3) !important'
                            : '1px solid transparent !important',
                        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        '&:hover': {
                            background: mode === 'recruiter'
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(139, 92, 246, 0.5))'
                                : 'rgba(255, 255, 255, 0.05)',
                            color: 'rgba(255, 255, 255, 0.9)',
                        },
                        '&.Mui-selected': {
                            color: '#fff',
                            fontWeight: 600,
                            '&:hover': {
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(139, 92, 246, 0.5))',
                            },
                        },
                    }}
                >
                    <motion.div
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <BusinessCenterIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: mode === 'recruiter' ? 600 : 500
                        }}>
                            Recruiter
                        </span>
                    </motion.div>
                </ToggleButton>

                <ToggleButton
                    value="candidate"
                    sx={{
                        px: { xs: 1, sm: 2.5 },
                        py: { xs: 0.5, sm: 1 },
                        minWidth: { xs: 'auto', sm: 'auto' },
                        color: 'rgba(255, 255, 255, 0.6)',
                        background: mode === 'candidate'
                            ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4))'
                            : 'transparent',
                        backdropFilter: mode === 'candidate' ? 'blur(8px)' : 'none',
                        border: mode === 'candidate'
                            ? '1px solid rgba(168, 85, 247, 0.3) !important'
                            : '1px solid transparent !important',
                        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        '&:hover': {
                            background: mode === 'candidate'
                                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.5))'
                                : 'rgba(255, 255, 255, 0.05)',
                            color: 'rgba(255, 255, 255, 0.9)',
                        },
                        '&.Mui-selected': {
                            color: '#fff',
                            fontWeight: 600,
                            '&:hover': {
                                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.5))',
                            },
                        },
                    }}
                >
                    <motion.div
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <PersonSearchIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: mode === 'candidate' ? 600 : 500
                        }}>
                            Candidate
                        </span>
                    </motion.div>
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}
