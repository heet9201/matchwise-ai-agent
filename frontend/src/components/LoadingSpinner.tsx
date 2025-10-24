import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useMode } from '../contexts/ModeContext';

interface LoadingSpinnerProps {
    message?: string;
}

export default function LoadingSpinner({ message = 'Processing...' }: LoadingSpinnerProps) {
    const { mode } = useMode();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                p: 6,
                minHeight: '300px',
            }}
        >
            {/* Modern 2025 Spinner */}
            <Box sx={{ position: 'relative', width: 80, height: 80 }}>
                {/* Outer ring */}
                <motion.div
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            border: '3px solid transparent',
                            borderTopColor: mode === 'recruiter'
                                ? 'rgba(99, 102, 241, 0.6)'
                                : 'rgba(168, 85, 247, 0.6)',
                            borderRightColor: mode === 'recruiter'
                                ? 'rgba(99, 102, 241, 0.3)'
                                : 'rgba(168, 85, 247, 0.3)',
                            filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.3))',
                        }}
                    />
                </motion.div>

                {/* Inner ring */}
                <motion.div
                    animate={{
                        rotate: -360,
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    style={{
                        position: 'absolute',
                        width: '70%',
                        height: '70%',
                        top: '15%',
                        left: '15%',
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            border: '2px solid transparent',
                            borderTopColor: mode === 'recruiter'
                                ? 'rgba(139, 92, 246, 0.6)'
                                : 'rgba(236, 72, 153, 0.6)',
                            borderLeftColor: mode === 'recruiter'
                                ? 'rgba(139, 92, 246, 0.3)'
                                : 'rgba(236, 72, 153, 0.3)',
                        }}
                    />
                </motion.div>

                {/* Center dot with pulse */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        type: 'tween',
                    }}
                    style={{
                        position: 'absolute',
                        width: '30%',
                        height: '30%',
                        top: '35%',
                        left: '35%',
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: mode === 'recruiter'
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8))'
                                : 'linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8))',
                            filter: 'blur(1px)',
                        }}
                    />
                </motion.div>
            </Box>

            {/* Text with gradient */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        background: mode === 'recruiter'
                            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                            : 'linear-gradient(135deg, #a855f7, #ec4899)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center',
                        letterSpacing: '-0.01em',
                    }}
                >
                    {message}
                </Typography>
            </motion.div>

            {/* Bouncing dots */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -12, 0],
                            scale: [1, 1.15, 1],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                            type: 'tween',
                        }}
                    >
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: mode === 'recruiter'
                                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8))'
                                    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8))',
                                boxShadow: mode === 'recruiter'
                                    ? '0 2px 8px rgba(99, 102, 241, 0.4)'
                                    : '0 2px 8px rgba(168, 85, 247, 0.4)',
                            }}
                        />
                    </motion.div>
                ))}
            </Box>
        </Box>
    );
}

