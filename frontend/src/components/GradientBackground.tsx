import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useMode } from '../contexts/ModeContext';

export default function GradientBackground() {
    const { mode } = useMode();

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                overflow: 'hidden',
            }}
        >
            {/* Base gradient */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: mode === 'recruiter'
                        ? 'linear-gradient(135deg, #0a1929 0%, #1a237e 50%, #1565c0 100%)'
                        : 'linear-gradient(135deg, #1a0a29 0%, #4a148c 50%, #7b1fa2 100%)',
                    transition: 'background 0.5s ease-in-out',
                }}
            />

            {/* Animated orbs */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    type: 'tween',
                }}
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: mode === 'recruiter'
                        ? 'radial-gradient(circle, rgba(66, 165, 245, 0.3) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(186, 104, 200, 0.3) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    transition: 'background 0.5s ease-in-out',
                }}
            />

            <motion.div
                animate={{
                    x: [0, -150, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    type: 'tween',
                    delay: 2,
                }}
                style={{
                    position: 'absolute',
                    top: '60%',
                    right: '10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: mode === 'recruiter'
                        ? 'radial-gradient(circle, rgba(25, 118, 210, 0.4) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(156, 39, 176, 0.4) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    transition: 'background 0.5s ease-in-out',
                }}
            />

            <motion.div
                animate={{
                    x: [0, 80, 0],
                    y: [0, -80, 0],
                    scale: [1, 1.08, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    type: 'tween',
                    delay: 1,
                }}
                style={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '30%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: mode === 'recruiter'
                        ? 'radial-gradient(circle, rgba(21, 101, 192, 0.35) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(123, 31, 162, 0.35) 0%, transparent 70%)',
                    filter: 'blur(70px)',
                    transition: 'background 0.5s ease-in-out',
                }}
            />

            {/* Grid overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: mode === 'recruiter'
                        ? 'linear-gradient(rgba(66, 165, 245, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(66, 165, 245, 0.03) 1px, transparent 1px)'
                        : 'linear-gradient(rgba(186, 104, 200, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(186, 104, 200, 0.03) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    opacity: 0.5,
                    transition: 'background-image 0.5s ease-in-out',
                }}
            />

            {/* Noise texture overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.03,
                    background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                }}
            />
        </Box>
    );
}
