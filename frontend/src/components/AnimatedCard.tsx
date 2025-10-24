import { motion } from 'framer-motion';
import { Paper, PaperProps } from '@mui/material';
import { ReactNode } from 'react';
import { useMode } from '../contexts/ModeContext';

interface AnimatedCardProps extends Omit<PaperProps, 'children'> {
    children: ReactNode;
    delay?: number;
    hover?: boolean;
}

export default function AnimatedCard({
    children,
    delay = 0,
    hover = true,
    ...paperProps
}: AnimatedCardProps) {
    const { mode } = useMode();

    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.7,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94] // Smooth custom easing
            }}
            whileHover={hover ? {
                y: -6,
                scale: 1.01,
                transition: { duration: 0.3, ease: 'easeOut' }
            } : {}}
            whileTap={hover ? {
                scale: 0.98,
                transition: { duration: 0.15 }
            } : {}}
            style={{ width: '100%' }}
        >
            <Paper
                {...paperProps}
                sx={{
                    p: 4,
                    borderRadius: 4,
                    // Modern glassmorphism
                    background: mode === 'recruiter'
                        ? 'rgba(15, 23, 42, 0.6)'
                        : 'rgba(24, 10, 40, 0.6)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid',
                    borderColor: mode === 'recruiter'
                        ? 'rgba(99, 102, 241, 0.2)'
                        : 'rgba(168, 85, 247, 0.2)',
                    boxShadow: mode === 'recruiter'
                        ? '0 8px 32px 0 rgba(99, 102, 241, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
                        : '0 8px 32px 0 rgba(168, 85, 247, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    // Subtle neumorphic hint
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
                    },
                    '&:hover': hover ? {
                        borderColor: mode === 'recruiter'
                            ? 'rgba(99, 102, 241, 0.35)'
                            : 'rgba(168, 85, 247, 0.35)',
                        boxShadow: mode === 'recruiter'
                            ? '0 16px 48px 0 rgba(99, 102, 241, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
                            : '0 16px 48px 0 rgba(168, 85, 247, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
                    } : {},
                    ...paperProps.sx,
                }}
            >
                {children}
            </Paper>
        </motion.div>
    );
}
