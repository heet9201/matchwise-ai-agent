import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useMode } from '../contexts/ModeContext';

export default function AnimatedBackground() {
    const { mode } = useMode();

    // Modern 2025 abstract background with floating orbs
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
                background: mode === 'recruiter'
                    ? 'linear-gradient(180deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)'
                    : 'linear-gradient(180deg, #1a0a2e 0%, #2d1b3d 50%, #0f0a1a 100%)',
                transition: 'background 0.8s ease-in-out',
            }}
        >
            {/* Large blurred orb 1 */}
            <motion.div
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -80, 100, 0],
                    scale: [1, 1.05, 0.95, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    type: 'tween',
                }}
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: '5%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: mode === 'recruiter'
                        ? 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    transition: 'background 0.8s ease-in-out',
                }}
            />

            {/* Large blurred orb 2 */}
            <motion.div
                animate={{
                    x: [0, -120, 80, 0],
                    y: [0, 120, -60, 0],
                    scale: [1, 1.1, 0.9, 1],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    type: 'tween',
                    delay: 2,
                }}
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10%',
                    width: '700px',
                    height: '700px',
                    borderRadius: '50%',
                    background: mode === 'recruiter'
                        ? 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    transition: 'background 0.8s ease-in-out',
                }}
            />

            {/* Large blurred orb 3 */}
            <motion.div
                animate={{
                    x: [0, 60, -80, 0],
                    y: [0, -100, 60, 0],
                    scale: [1, 0.95, 1.05, 1],
                }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    type: 'tween',
                    delay: 4,
                }}
                style={{
                    position: 'absolute',
                    bottom: '15%',
                    left: '30%',
                    width: '550px',
                    height: '550px',
                    borderRadius: '50%',
                    background: mode === 'recruiter'
                        ? 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(217, 70, 239, 0.1) 0%, transparent 70%)',
                    filter: 'blur(90px)',
                    transition: 'background 0.8s ease-in-out',
                }}
            />

            {/* Accent orb 1 - smaller, more vibrant */}
            <motion.div
                animate={{
                    x: [0, -50, 70, 0],
                    y: [0, 80, -40, 0],
                    scale: [1, 1.15, 0.9, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    type: 'tween',
                    delay: 1,
                }}
                style={{
                    position: 'absolute',
                    top: '60%',
                    left: '15%',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: mode === 'recruiter'
                        ? 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(192, 132, 252, 0.08) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    transition: 'background 0.8s ease-in-out',
                }}
            />

            {/* Accent orb 2 */}
            <motion.div
                animate={{
                    x: [0, 90, -30, 0],
                    y: [0, -70, 50, 0],
                    scale: [1, 1.05, 0.98, 1],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    type: 'tween',
                    delay: 3,
                }}
                style={{
                    position: 'absolute',
                    top: '25%',
                    right: '25%',
                    width: '350px',
                    height: '350px',
                    borderRadius: '50%',
                    background: mode === 'recruiter'
                        ? 'radial-gradient(circle, rgba(99, 102, 241, 0.09) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(244, 114, 182, 0.09) 0%, transparent 70%)',
                    filter: 'blur(70px)',
                    transition: 'background 0.8s ease-in-out',
                }}
            />

            {/* Subtle grid overlay for depth */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: mode === 'recruiter'
                        ? 'linear-gradient(rgba(99, 102, 241, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.02) 1px, transparent 1px)'
                        : 'linear-gradient(rgba(168, 85, 247, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.02) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                    opacity: 0.3,
                    transition: 'background-image 0.8s ease-in-out',
                }}
            />

            {/* Noise texture for grain effect */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.015,
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.2\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                    mixBlendMode: 'overlay',
                }}
            />
        </Box>
    );
}
